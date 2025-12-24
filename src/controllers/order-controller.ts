import type { Request, Response } from "express";
import { OrderModel } from "../models/order-model";
import type { OrderProgressStatus, PaymentMethod, PaymentStatus } from "../models/order-model";
import { BouquetModel } from "../models/bouquet-model";
import { CustomerModel } from "../models/customer-model";

const escapeRegex = (s: string): string => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

const normalize = (v: unknown, maxLen: number): string => {
  if (typeof v !== "string") return "";
  return v.trim().slice(0, maxLen);
};

const parseNonNegativeNumber = (v: unknown): number => {
  const n = typeof v === "number" ? v : typeof v === "string" ? Number(v) : NaN;
  if (!Number.isFinite(n)) return 0;
  return Math.max(0, Math.round(n));
};

const isOrderStatus = (v: string): v is OrderProgressStatus =>
  v === "bertanya" ||
  v === "memesan" ||
  v === "sedang_diproses" ||
  v === "menunggu_driver" ||
  v === "pengantaran" ||
  v === "terkirim";

const isPaymentMethod = (v: string): v is PaymentMethod =>
  v === "" ||
  v === "cash" ||
  v === "transfer_bank" ||
  v === "ewallet" ||
  v === "qris" ||
  v === "lainnya";

const derivePaymentStatus = (
  totalAmount: number,
  downPaymentAmount: number,
  additionalPayment: number
): PaymentStatus => {
  const total = Math.max(0, Math.round(totalAmount));
  const paid = Math.max(0, Math.round(downPaymentAmount)) + Math.max(0, Math.round(additionalPayment));
  if (total <= 0) return "sudah_bayar";
  if (paid <= 0) return "belum_bayar";
  if (paid >= total) return "sudah_bayar";
  return "dp";
};

const resolveBouquetSnapshot = async (
  bouquetId: string,
  fallbackName: string,
  fallbackPrice: number
): Promise<{ bouquetName: string; bouquetPrice: number }> => {
  try {
    const b = await BouquetModel.findById(bouquetId)
      .select({ name: 1, price: 1 })
      .lean()
      .exec();

    if (b && typeof b.name === "string") {
      return {
        bouquetName: b.name.trim().slice(0, 200),
        bouquetPrice: parseNonNegativeNumber((b as any).price),
      };
    }
  } catch {
    // ignore lookup failures; fall back to request payload
  }

  return {
    bouquetName: fallbackName,
    bouquetPrice: fallbackPrice,
  };
};

export async function createOrder(req: Request, res: Response): Promise<void> {
  try {
    const customerId = normalize(req.body?.customerId, 64);

    let buyerName = normalize(req.body?.buyerName, 120);
    let phoneNumber = normalize(req.body?.phoneNumber, 40);
    let address = normalize(req.body?.address, 500);

    if (customerId) {
      const customer = await CustomerModel.findById(customerId).lean().exec();
      if (!customer) {
        res.status(400).json({ message: "Invalid customerId" });
        return;
      }
      buyerName = normalize((customer as any).buyerName, 120);
      phoneNumber = normalize((customer as any).phoneNumber, 40);
      address = normalize((customer as any).address, 500);
    }

    const bouquetId = normalize(req.body?.bouquetId, 64);
    const bouquetNameRaw = normalize(req.body?.bouquetName, 200);

    const bouquetPriceFromBody = parseNonNegativeNumber(req.body?.bouquetPrice);
    const { bouquetName, bouquetPrice } = await resolveBouquetSnapshot(
      bouquetId,
      bouquetNameRaw,
      bouquetPriceFromBody
    );

    const orderStatusRaw = normalize(req.body?.orderStatus, 32);
    const paymentMethodRaw = normalize(req.body?.paymentMethod, 32);

    const orderStatus: OrderProgressStatus = isOrderStatus(orderStatusRaw)
      ? orderStatusRaw
      : "bertanya";
    const paymentMethod: PaymentMethod = isPaymentMethod(paymentMethodRaw)
      ? paymentMethodRaw
      : "";

    const downPaymentAmount = parseNonNegativeNumber(req.body?.downPaymentAmount);
    const additionalPayment = parseNonNegativeNumber(req.body?.additionalPayment);
    const deliveryPrice = parseNonNegativeNumber(req.body?.deliveryPrice);

    const totalAmount = parseNonNegativeNumber(bouquetPrice + deliveryPrice);
    const paymentStatus: PaymentStatus = derivePaymentStatus(
      totalAmount,
      downPaymentAmount,
      additionalPayment
    );

    const deliveryAtRaw = normalize(req.body?.deliveryAt, 40);
    const deliveryAt = deliveryAtRaw ? new Date(deliveryAtRaw) : undefined;

    if (!buyerName || !phoneNumber || !address || !bouquetId || !bouquetName) {
      res.status(400).json({ message: "Missing required fields" });
      return;
    }

    if (deliveryAtRaw && !Number.isFinite(deliveryAt?.getTime())) {
      res.status(400).json({ message: "Invalid deliveryAt" });
      return;
    }

    const created = await OrderModel.create({
      ...(customerId ? { customerId } : {}),
      buyerName,
      phoneNumber,
      address,
      bouquetId,
      bouquetName,
      bouquetPrice,
      orderStatus,
      paymentStatus,
      paymentMethod,
      downPaymentAmount,
      additionalPayment,
      deliveryPrice,
      totalAmount,
      deliveryAt,
      activity: [
        {
          at: new Date(),
          kind: "created",
          message: `Order dibuat • status: ${orderStatus.replace(/_/g, " ")} • bayar: ${paymentStatus.replace(/_/g, " ")}`,
        },
      ],
    });

    res.status(201).json(created);
  } catch (err) {
    console.error("createOrder failed:", err);
    res.status(500).json({ message: "Failed to create order" });
  }
}

export async function updateOrder(req: Request, res: Response): Promise<void> {
  try {
    const id = normalize(req.params?.id, 64);
    if (!id) {
      res.status(400).json({ message: "Missing id" });
      return;
    }

    const existing = await OrderModel.findById(id).lean().exec();
    if (!existing) {
      res.status(404).json({ message: "Order not found" });
      return;
    }

    const existingCustomerId =
      typeof (existing as any).customerId === "string" ? ((existing as any).customerId as string).trim() : "";

    const setPatch: any = {};
    const unsetPatch: any = {};

    const customerId = normalize(req.body?.customerId, 64);
    const customerIdProvided = req.body?.customerId !== undefined;
    let willHaveCustomerId = Boolean(existingCustomerId);

    if (customerIdProvided) {
      willHaveCustomerId = Boolean(customerId);

      if (!customerId) {
        unsetPatch.customerId = 1;
      } else {
        const customer = await CustomerModel.findById(customerId).lean().exec();
        if (!customer) {
          res.status(400).json({ message: "Invalid customerId" });
          return;
        }

        setPatch.customerId = customerId;
        setPatch.buyerName = normalize((customer as any).buyerName, 120);
        setPatch.phoneNumber = normalize((customer as any).phoneNumber, 40);
        setPatch.address = normalize((customer as any).address, 500);
      }
    }

    const buyerName = normalize(req.body?.buyerName, 120);
    const phoneNumber = normalize(req.body?.phoneNumber, 40);
    const address = normalize(req.body?.address, 500);
    const bouquetId = normalize(req.body?.bouquetId, 64);
    const bouquetName = normalize(req.body?.bouquetName, 200);

    // Keep buyer snapshot consistent with the linked customer.
    // To manually edit buyer fields, first unlink customerId (send customerId: "").
    if (!willHaveCustomerId) {
      if (buyerName) setPatch.buyerName = buyerName;
      if (phoneNumber) setPatch.phoneNumber = phoneNumber;
      if (address) setPatch.address = address;
    }
    if (bouquetId) setPatch.bouquetId = bouquetId;
    if (bouquetName) setPatch.bouquetName = bouquetName;

    const orderStatusRaw = normalize(req.body?.orderStatus, 32);
    if (orderStatusRaw && isOrderStatus(orderStatusRaw)) setPatch.orderStatus = orderStatusRaw;

    if (req.body?.paymentMethod !== undefined) {
      if (typeof req.body.paymentMethod !== "string") {
        res.status(400).json({ message: "Invalid paymentMethod" });
        return;
      }

      const paymentMethodRaw = normalize(req.body.paymentMethod, 32);
      if (!isPaymentMethod(paymentMethodRaw)) {
        res.status(400).json({ message: "Invalid paymentMethod" });
        return;
      }

      setPatch.paymentMethod = paymentMethodRaw;
    }

    if (req.body?.downPaymentAmount !== undefined) {
      setPatch.downPaymentAmount = parseNonNegativeNumber(req.body.downPaymentAmount);
    }
    if (req.body?.additionalPayment !== undefined) {
      setPatch.additionalPayment = parseNonNegativeNumber(req.body.additionalPayment);
    }
    if (req.body?.deliveryPrice !== undefined) {
      setPatch.deliveryPrice = parseNonNegativeNumber(req.body.deliveryPrice);
    }

    if (req.body?.bouquetPrice !== undefined) {
      setPatch.bouquetPrice = parseNonNegativeNumber(req.body.bouquetPrice);
    }

    const hasDeliveryAt = req.body?.deliveryAt !== undefined;
    if (hasDeliveryAt) {
      if (typeof req.body.deliveryAt !== "string") {
        res.status(400).json({ message: "Invalid deliveryAt" });
        return;
      }

      const deliveryAtRaw = normalize(req.body.deliveryAt, 40);
      if (!deliveryAtRaw) {
        unsetPatch.deliveryAt = 1;
      } else {
        const d = new Date(deliveryAtRaw);
        if (!Number.isFinite(d.getTime())) {
          res.status(400).json({ message: "Invalid deliveryAt" });
          return;
        }
        setPatch.deliveryAt = d;
      }
    }

    const nextBouquetId = (setPatch.bouquetId ?? existing.bouquetId) as string;

    let nextBouquetName = (setPatch.bouquetName ?? existing.bouquetName ?? "") as string;
    let nextBouquetPrice = parseNonNegativeNumber(
      setPatch.bouquetPrice !== undefined ? setPatch.bouquetPrice : (existing as any).bouquetPrice
    );

    if (nextBouquetId && setPatch.bouquetId) {
      const fallbackName = nextBouquetName;
      const fallbackPrice = nextBouquetPrice;
      const snap = await resolveBouquetSnapshot(nextBouquetId, fallbackName, fallbackPrice);
      nextBouquetName = snap.bouquetName;
      nextBouquetPrice = snap.bouquetPrice;
      setPatch.bouquetName = snap.bouquetName;
      setPatch.bouquetPrice = snap.bouquetPrice;
    }

    const nextDownPayment = parseNonNegativeNumber(
      setPatch.downPaymentAmount !== undefined
        ? setPatch.downPaymentAmount
        : (existing as any).downPaymentAmount
    );
    const nextAdditional = parseNonNegativeNumber(
      setPatch.additionalPayment !== undefined
        ? setPatch.additionalPayment
        : (existing as any).additionalPayment
    );
    const nextDelivery = parseNonNegativeNumber(
      setPatch.deliveryPrice !== undefined ? setPatch.deliveryPrice : (existing as any).deliveryPrice
    );

    const nextTotalAmount = parseNonNegativeNumber(nextBouquetPrice + nextDelivery);
    setPatch.totalAmount = nextTotalAmount;
    setPatch.paymentStatus = derivePaymentStatus(nextTotalAmount, nextDownPayment, nextAdditional);

    const nextOrderStatus = (setPatch.orderStatus ?? (existing as any).orderStatus) as OrderProgressStatus;
    const nextPaymentStatus = setPatch.paymentStatus as PaymentStatus;
    const nextPaymentMethod = (setPatch.paymentMethod ?? (existing as any).paymentMethod ?? "") as PaymentMethod;

    const prevOrderStatus = ((existing as any).orderStatus ?? "bertanya") as OrderProgressStatus;
    const prevPaymentStatus = ((existing as any).paymentStatus ?? "belum_bayar") as PaymentStatus;
    const prevPaymentMethod = ((existing as any).paymentMethod ?? "") as PaymentMethod;
    const prevDeliveryAt = (existing as any).deliveryAt ? new Date((existing as any).deliveryAt) : null;
    const nextDeliveryAt = unsetPatch.deliveryAt
      ? null
      : setPatch.deliveryAt
        ? new Date(setPatch.deliveryAt)
        : prevDeliveryAt;

    const activity: any[] = Array.isArray((existing as any).activity) ? (existing as any).activity.slice(0) : [];
    const push = (kind: string, message: string) => {
      activity.push({ at: new Date(), kind, message });
    };

    if (prevOrderStatus !== nextOrderStatus) {
      push(
        "status",
        `Status order: ${prevOrderStatus.replace(/_/g, " ")} → ${nextOrderStatus.replace(/_/g, " ")}`
      );
    }

    if (prevPaymentStatus !== nextPaymentStatus) {
      push(
        "payment",
        `Status bayar: ${prevPaymentStatus.replace(/_/g, " ")} → ${nextPaymentStatus.replace(/_/g, " ")}`
      );
    }

    if (prevPaymentMethod !== nextPaymentMethod) {
      push(
        "payment",
        `Metode bayar: ${(prevPaymentMethod || "—").replace(/_/g, " ")} → ${(nextPaymentMethod || "—").replace(/_/g, " ")}`
      );
    }

    if (hasDeliveryAt) {
      const prevT = prevDeliveryAt?.getTime() ?? 0;
      const nextT = nextDeliveryAt?.getTime() ?? 0;
      if (prevT !== nextT) {
        push("delivery", nextDeliveryAt ? "Waktu deliver diperbarui" : "Waktu deliver dihapus");
      }
    }

    if (setPatch.bouquetId) {
      push("bouquet", "Bouquet diperbarui");
    }

    if (
      setPatch.downPaymentAmount !== undefined ||
      setPatch.additionalPayment !== undefined ||
      setPatch.deliveryPrice !== undefined
    ) {
      push("payment", "Nominal pembayaran/ongkir diperbarui");
    }

    if (!activity.length) {
      push("edit", "Order diperbarui");
    }

    setPatch.activity = activity.slice(-50);

    const updateOps: any = {};
    if (Object.keys(setPatch).length > 0) updateOps.$set = setPatch;
    if (Object.keys(unsetPatch).length > 0) updateOps.$unset = unsetPatch;

    const updated = await OrderModel.findByIdAndUpdate(id, updateOps, { new: true, runValidators: true })
      .lean()
      .exec();

    if (!updated) {
      res.status(404).json({ message: "Order not found" });
      return;
    }

    res.status(200).json(updated);
  } catch (err) {
    console.error("updateOrder failed:", err);
    res.status(500).json({ message: "Failed to update order" });
  }
}

export async function getOrders(req: Request, res: Response): Promise<void> {
  try {
    const limitRaw = typeof req.query.limit === "string" ? req.query.limit : "100";
    const limitParsed = Number.parseInt(limitRaw, 10);
    const limit = Number.isFinite(limitParsed) ? Math.min(Math.max(limitParsed, 1), 500) : 100;

    const qRaw = typeof req.query.q === "string" ? req.query.q.trim() : "";
    const q = qRaw.slice(0, 120);

    const filter: any = {};
    if (q) {
      const re = new RegExp(escapeRegex(q), "i");
      filter.$or = [{ buyerName: re }, { phoneNumber: re }];
    }

    const orders = await OrderModel.find(filter)
      .sort({ createdAt: -1 })
      .limit(limit)
      .lean()
      .exec();

    res.status(200).json(orders);
  } catch (err) {
    console.error("getOrders failed:", err);
    res.status(500).json({ message: "Failed to get orders" });
  }
}

export async function deleteOrder(req: Request, res: Response): Promise<void> {
  try {
    const id = normalize(req.params?.id, 64);
    if (!id) {
      res.status(400).json({ message: "Missing id" });
      return;
    }

    const deleted = await OrderModel.findByIdAndDelete(id).lean().exec();
    if (!deleted) {
      res.status(404).json({ message: "Order not found" });
      return;
    }

    res.status(200).json({ ok: true });
  } catch (err) {
    console.error("deleteOrder failed:", err);
    res.status(500).json({ message: "Failed to delete order" });
  }
}
