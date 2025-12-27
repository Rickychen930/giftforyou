import React, { useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import type { Bouquet } from "../models/domain/bouquet";
import BouquetDetailPage from "../view/bouquet-detail-page";

import { API_BASE } from "../config/api";
import { trackBouquetView } from "../services/analytics.service";
import { normalizeBouquet, normalizeBouquets } from "../utils/bouquet-normalizer";

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

        let data: unknown;
        try {
          const text = await res.text();
          if (!text.trim()) {
            throw new Error("Empty response body");
          }
          data = JSON.parse(text);
        } catch (parseErr) {
          throw new Error(`Failed to parse response: ${parseErr instanceof Error ? parseErr.message : "Invalid JSON"}`);
        }

               const normalizedBouquet = normalizeBouquet(data);
               if (!normalizedBouquet) {
                 if (process.env.NODE_ENV === "development") {
                   console.error("[Detail] Bouquet normalization failed. Raw data:", data);
                 }
                 throw new Error("Bouquet data is invalid (missing _id or name)");
               }
               
               if (process.env.NODE_ENV === "development") {
                 console.log("[Detail] Bouquet loaded:", {
                   _id: normalizedBouquet._id,
                   name: normalizedBouquet.name,
                   price: normalizedBouquet.price,
                   hasImage: !!normalizedBouquet.image,
                 });
               }
               
               setBouquet(normalizedBouquet);

               // Fetch similar bouquets
               try {
                 const allRes = await fetch(`${API_BASE}/api/bouquets`, {
                   signal: ac.signal,
                 });
                 if (allRes.ok) {
                   let allData: unknown;
                   try {
                     const allText = await allRes.text();
                     allData = allText.trim() ? JSON.parse(allText) : [];
                   } catch {
                     allData = [];
                   }
                   const allBouquets = Array.isArray(allData) ? normalizeBouquets(allData) : [];
                   
                   // Find similar bouquets (same collection, type, or size, excluding current)
                   if (!ac.signal.aborted && normalizedBouquet) {
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
                 }
               } catch {
                 // Silently fail for similar bouquets
               }
      } catch (e: unknown) {
        // Check if error is AbortError (request was cancelled)
        if (e instanceof Error && e.name === "AbortError") {
          return; // Don't update state if request was aborted
        }

        // Only update state if component is still mounted
        if (!ac.signal.aborted) {
          setBouquet(null);
          setError(e instanceof Error ? e.message : "Gagal memuat bouquet.");
        }
      } finally {
        if (!ac.signal.aborted) {
          setLoading(false);
        }
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
