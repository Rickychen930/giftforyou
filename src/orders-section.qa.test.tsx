import React from "react";
import "@testing-library/jest-dom";
import { render, screen, within, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import OrdersSection from "./components/sections/orders-section";

type MockResponse = {
  ok: boolean;
  status: number;
  json: () => Promise<unknown>;
  text: () => Promise<string>;
};

const jsonResp = (data: unknown, status = 200): MockResponse => ({
  ok: status >= 200 && status < 300,
  status,
  json: async () => data,
  text: async () => JSON.stringify(data),
});

const textResp = (text: string, status = 200): MockResponse => ({
  ok: status >= 200 && status < 300,
  status,
  json: async () => {
    throw new Error("not json");
  },
  text: async () => text,
});

describe("OrdersSection QA smoke", () => {
  let consoleErrorSpy: jest.SpyInstance | undefined;
  let originalConsoleError: typeof console.error;

  beforeEach(() => {
    jest.restoreAllMocks();
    (global as any).fetch = jest.fn();
    localStorage.clear();

    // Keep CI output readable: OrdersSection triggers async state updates from effects,
    // which can produce noisy act() warnings in JSDOM even when behavior is correct.
    originalConsoleError = console.error;
    consoleErrorSpy = jest.spyOn(console, "error").mockImplementation((...args: unknown[]) => {
      const msg = args.map((a) => String(a)).join(" ");
      if (msg.includes("not wrapped in act")) return;
      originalConsoleError(...(args as any[]));
    });
  });

  afterEach(() => {
    consoleErrorSpy?.mockRestore();
    consoleErrorSpy = undefined;
  });

  test("drawer open/close + add user auto-select then show order details", async () => {
    const user = userEvent.setup();

    // 1) initial loadOrders
    (global.fetch as jest.Mock)
      .mockResolvedValueOnce(jsonResp([]))
      // 2) loadCustomers() on entering add_order
      .mockResolvedValueOnce(jsonResp([]))
      // 3) POST /api/customers
      .mockResolvedValueOnce(
        jsonResp({ _id: "c1", buyerName: "Ayu", phoneNumber: "081234", address: "Jl. Mawar" }, 201)
      )
      // 4) loadCustomers(ph) after save
      .mockResolvedValueOnce(jsonResp([{ _id: "c1", buyerName: "Ayu", phoneNumber: "081234", address: "Jl. Mawar" }]))
      // anything else
      .mockResolvedValue(textResp("unexpected fetch", 500));

    render(
      <OrdersSection
        bouquets={[{ _id: "b1", name: "Rose", price: 100000 } as any]}
      />
    );

    // Wait initial orders fetch
    await waitFor(() => expect(global.fetch).toHaveBeenCalled());

    // Open drawer
    const addBtns = await screen.findAllByRole("button", { name: /add order card/i });
    await user.click(addBtns[0]);

    const dialog = await screen.findByRole("dialog", { name: /form order/i });
    expect(dialog).toBeInTheDocument();

    // Open inline add user
    const tambahUserBtn = await screen.findByRole("button", { name: /tambah user/i });
    await user.click(tambahUserBtn);

    await user.type(screen.getByPlaceholderText(/nama pembeli/i), "Ayu");
    await user.type(screen.getByPlaceholderText(/08/i), "081234");
    await user.type(screen.getByPlaceholderText(/alamat lengkap/i), "Jl. Mawar");

    await user.click(screen.getByRole("button", { name: /simpan user/i }));

    // Ensure customer dropdown has the created customer selected
    const userSelect = (await screen.findByRole("combobox", { name: /pilih user/i })) as HTMLSelectElement;

    await waitFor(() => expect(userSelect.value).toBe("c1"));

    // Now order details section should be visible (user chosen)
    const selectedNotice = await screen.findByText(/user terpilih/i);
    expect(selectedNotice).toBeInTheDocument();
    expect(within(selectedNotice).getByText(/081234/)).toBeInTheDocument();
    expect(within(selectedNotice).getByText(/jl\. mawar/i)).toBeInTheDocument();

    // Close via Escape (open/close sanity)
    await user.keyboard("{Escape}");
    await waitFor(() => expect(screen.queryByRole("dialog", { name: /form order/i })).not.toBeInTheDocument());
  });

  test("update order loads linked customer by id when not in list", async () => {
    const user = userEvent.setup();

    const order = {
      _id: "o1",
      customerId: "c9",
      buyerName: "(snapshot) Budi",
      phoneNumber: "0800",
      address: "Somewhere",
      bouquetId: "b1",
      bouquetName: "Rose",
      bouquetPrice: 100000,
      deliveryPrice: 5000,
      totalAmount: undefined,
      orderStatus: "memesan",
      paymentStatus: "belum_bayar",
      paymentMethod: "cash",
      downPaymentAmount: 0,
      additionalPayment: 0,
    };

    (global.fetch as jest.Mock)
      // loadOrders
      .mockResolvedValueOnce(jsonResp([order]))
      // loadCustomers() in update mode (empty list)
      .mockResolvedValueOnce(jsonResp([]))
      // loadCustomerById
      .mockResolvedValueOnce(jsonResp({ _id: "c9", buyerName: "Budi", phoneNumber: "0800", address: "Somewhere" }))
      // anything else
      .mockResolvedValue(textResp("unexpected fetch", 500));

    render(<OrdersSection bouquets={[{ _id: "b1", name: "Rose", price: 100000 } as any]} />);

    // Click the order card (listitem)
    const card = await screen.findByRole("listitem");
    await user.click(card);

    // Drawer open in update mode
    const dialog = await screen.findByRole("dialog", { name: /form order/i });

    // Ensure we actually tried fetching the customer by id
    await waitFor(() => {
      const calls = (global.fetch as jest.Mock).mock.calls.map((c) => String(c[0]));
      expect(calls.some((u) => u.includes("/api/customers/c9"))).toBe(true);
    });

    // Ensure dropdown contains Budi
    const userSelect = (await screen.findByRole("combobox", { name: /pilih user/i })) as HTMLSelectElement;

    await waitFor(() => expect(userSelect).toHaveTextContent(/budi/i));
    await waitFor(() => expect(userSelect.value).toBe("c9"));

    const buyerNameInput = within(dialog).getByRole("textbox", { name: /nama pembeli/i });
    const phoneInput = within(dialog).getByRole("textbox", { name: /no\. hp/i });
    const addressInput = within(dialog).getByRole("textbox", { name: /^alamat$/i });

    await waitFor(() => expect(buyerNameInput).toHaveValue("Budi"));
    await waitFor(() => expect(phoneInput).toHaveValue("0800"));
    await waitFor(() => expect(addressInput).toHaveValue("Somewhere"));
  });
});
