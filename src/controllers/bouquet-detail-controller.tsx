import React, { useMemo, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import BouquetDetailPage from "../view/bouquet-detail-page";
import { useBouquet, useAllBouquets } from "../hooks/useBouquets";
import { trackBouquetView } from "../services/analytics.service";
import { useQueryClient } from "@tanstack/react-query";

/**
 * Bouquet Detail Controller
 * Uses React Query for efficient data fetching, caching, and error handling
 * Follows SOLID, DRY, MVP principles
 */
export default function BouquetDetailController() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  // Fetch main bouquet with React Query (cached, optimized)
  const {
    data: bouquet,
    isLoading: loading,
    error: bouquetError,
    refetch: refetchBouquet,
  } = useBouquet(id, {
    retry: 2,
    staleTime: 5 * 60 * 1000, // 5 minutes
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
  });

  // Fetch all bouquets for similar products (cached, shared across app)
  const {
    data: allBouquets = [],
    isLoading: loadingSimilar,
    refetch: refetchSimilar,
  } = useAllBouquets({
    staleTime: 5 * 60 * 1000,
    enabled: !!bouquet, // Only fetch when main bouquet is loaded
  });

  // Retry handler
  const handleRetry = useCallback(() => {
    if (bouquetError) {
      refetchBouquet();
    }
    refetchSimilar();
  }, [bouquetError, refetchBouquet, refetchSimilar]);

  // Calculate similar bouquets
  const similarBouquets = useMemo(() => {
    if (!bouquet || !allBouquets.length) return [];

    return allBouquets
      .filter((b) => b._id !== bouquet._id)
      .filter((b) => 
        b.collectionName === bouquet.collectionName ||
        b.type === bouquet.type ||
        b.size === bouquet.size
      )
      .slice(0, 8); // Show more similar products
  }, [bouquet, allBouquets]);

  // Generate detail URL
  const detailUrl = useMemo(() => {
    if (!id) return "";
    return `${window.location.origin}/bouquet/${id}`;
  }, [id]);

  // Track bouquet view for analytics
  useEffect(() => {
    if (id && bouquet) {
      trackBouquetView(id, `/bouquet/${id}`);
    }
  }, [id, bouquet]);

  // Convert error to string
  const error = bouquetError instanceof Error 
    ? bouquetError.message 
    : bouquetError 
      ? String(bouquetError) 
      : null;

  // Handle 404 - redirect to collection page
  useEffect(() => {
    if (error && error.includes("not found") && !loading) {
      const timer = setTimeout(() => {
        navigate("/collection", { replace: true });
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [error, loading, navigate]);

  // Prefetch similar bouquets for better performance
  useEffect(() => {
    if (bouquet && similarBouquets.length > 0) {
      similarBouquets.forEach((similar) => {
        queryClient.prefetchQuery({
          queryKey: ["bouquets", "detail", similar._id],
          queryFn: async () => {
            const response = await fetch(`${window.location.origin}/api/bouquets/${similar._id}`);
            if (!response.ok) throw new Error("Failed to fetch");
            return response.json();
          },
          staleTime: 5 * 60 * 1000,
        });
      });
    }
  }, [bouquet, similarBouquets, queryClient]);

  return (
    <BouquetDetailPage
      bouquet={bouquet ?? null}
      loading={loading || loadingSimilar}
      error={error}
      detailUrl={detailUrl}
      similarBouquets={similarBouquets}
      onRetry={handleRetry}
    />
  );
}
