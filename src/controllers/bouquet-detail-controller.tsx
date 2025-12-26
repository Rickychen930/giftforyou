import React, { useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import type { Bouquet } from "../models/domain/bouquet";
import BouquetDetailPage from "../view/bouquet-detail-page";

import { API_BASE } from "../config/api"; // adjust path depending on folder depth
import { trackBouquetView } from "../services/analytics.service";

const isNonEmptyString = (v: unknown): v is string =>
  typeof v === "string" && v.trim().length > 0;

const normalizeBouquet = (b: any): Bouquet => ({
  _id: String(b?._id ?? ""),
  name: isNonEmptyString(b?.name) ? b.name : "",
  description: isNonEmptyString(b?.description) ? b.description : "",
  price: Number(b?.price ?? 0),

  type: isNonEmptyString(b?.type) ? b.type : "",
  size: isNonEmptyString(b?.size) ? b.size : "",

  image: isNonEmptyString(b?.image) ? b.image : "",
  status: b?.status === "preorder" ? "preorder" : "ready",
  collectionName: isNonEmptyString(b?.collectionName) ? b.collectionName : "",

  occasions: Array.isArray(b?.occasions) ? b.occasions : [],
  flowers: Array.isArray(b?.flowers) ? b.flowers : [],
  isNewEdition: Boolean(b?.isNewEdition),
  isFeatured: Boolean(b?.isFeatured),

  quantity: typeof b?.quantity === "number" ? b.quantity : 0,

  /* ✅ FIXED */
  careInstructions: isNonEmptyString(b?.careInstructions)
    ? b.careInstructions
    : undefined,

  createdAt: isNonEmptyString(b?.createdAt) ? b.createdAt : undefined,
  updatedAt: isNonEmptyString(b?.updatedAt) ? b.updatedAt : undefined,
});

export default function BouquetDetailController() {
  const { id } = useParams<{ id: string }>();

  const [bouquet, setBouquet] = useState<Bouquet | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [similarBouquets, setSimilarBouquets] = useState<Bouquet[]>([]);

  const detailUrl = useMemo(() => {
    if (!id) return "";
    return `${window.location.origin}/bouquet/${id}`;
  }, [id]);

  useEffect(() => {
    if (!id) {
      setBouquet(null);
      setError("ID bouquet tidak ditemukan.");
      setLoading(false);
      return;
    }

    trackBouquetView(id, `/bouquet/${id}`);

    const ac = new AbortController();

    (async () => {
      try {
        setLoading(true);
        setError(null);

        const res = await fetch(`${API_BASE}/api/bouquets/${id}`, {
          signal: ac.signal,
        });

        if (!res.ok) {
          const text = await res.text();
          throw new Error(`Gagal memuat bouquet (${res.status}): ${text}`);
        }

        const data = await res.json();
        const normalizedBouquet = normalizeBouquet(data);
        setBouquet(normalizedBouquet);

        // Fetch similar bouquets
        try {
          const allRes = await fetch(`${API_BASE}/api/bouquets`, {
            signal: ac.signal,
          });
          if (allRes.ok) {
            const allData = await allRes.json();
            const allBouquets = Array.isArray(allData) ? allData.map(normalizeBouquet) : [];
            
            // Find similar bouquets (same collection, type, or size, excluding current)
            const similar = allBouquets
              .filter((b) => b._id !== normalizedBouquet._id)
              .filter((b) => 
                b.collectionName === normalizedBouquet.collectionName ||
                b.type === normalizedBouquet.type ||
                b.size === normalizedBouquet.size
              )
              .slice(0, 4);
            
            setSimilarBouquets(similar);
          }
        } catch {
          // Silently fail for similar bouquets
        }
      } catch (e: unknown) {
        const anyErr = e as any;
        if (anyErr?.name === "AbortError") return;

        setBouquet(null);
        setError(e instanceof Error ? e.message : "Gagal memuat bouquet.");
      } finally {
        setLoading(false);
      }
    })();

    return () => ac.abort();
  }, [id]);

  return (
    <BouquetDetailPage
      bouquet={bouquet}
      loading={loading}
      error={error}
      detailUrl={detailUrl}
      similarBouquets={similarBouquets}
    />
  );
}
