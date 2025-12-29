import React, { useState, useEffect, useRef } from "react";
import "../styles/DashboardSearch.css";

interface SearchResult {
  id: string;
  type: "order" | "customer" | "bouquet" | "collection";
  title: string;
  subtitle?: string;
  onClick: () => void;
}

interface DashboardSearchProps {
  isOpen: boolean;
  onClose: () => void;
  onResultClick: (result: SearchResult) => void;
}

const DashboardSearch: React.FC<DashboardSearchProps> = ({ isOpen, onClose, onResultClick }) => {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      return;
    }

    setIsLoading(true);
    // Simulate search - replace with actual API calls
    const searchResults: SearchResult[] = [];
    
    // TODO: Implement actual search API calls
    // For now, return empty results
    
    setTimeout(() => {
      setResults(searchResults);
      setIsLoading(false);
    }, 300);
  }, [query]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "k") {
        e.preventDefault();
        if (isOpen) {
          onClose();
        }
      }
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <>
      <div className="dashboardSearchOverlay" onClick={onClose} aria-hidden="true" />
      <div className="dashboardSearch">
        <div className="dashboardSearch__header">
          <div className="dashboardSearch__inputWrapper">
            <svg className="dashboardSearch__icon" width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M21 21l-6-6m2-5a7 7 0 1 1-14 0 7 7 0 0 1 14 0z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            <input
              ref={inputRef}
              type="text"
              className="dashboardSearch__input"
              placeholder="Cari orders, customers, bouquets..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              autoComplete="off"
            />
            {query && (
              <button
                type="button"
                className="dashboardSearch__clear"
                onClick={() => setQuery("")}
                aria-label="Hapus pencarian"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M18 6L6 18M6 6l12 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </button>
            )}
          </div>
          <button
            type="button"
            className="dashboardSearch__close"
            onClick={onClose}
            aria-label="Tutup pencarian"
          >
            ESC
          </button>
        </div>
        <div className="dashboardSearch__results">
          {isLoading ? (
            <div className="dashboardSearch__loading">
              <svg className="dashboardSearch__spinner" width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" strokeDasharray="31.416" strokeDashoffset="31.416" opacity="0.3">
                  <animate attributeName="stroke-dasharray" dur="2s" values="0 31.416;15.708 15.708;0 31.416;0 31.416" repeatCount="indefinite"/>
                  <animate attributeName="stroke-dashoffset" dur="2s" values="0;-15.708;-31.416;-31.416" repeatCount="indefinite"/>
                </circle>
              </svg>
              <span>Mencari...</span>
            </div>
          ) : results.length > 0 ? (
            <div className="dashboardSearch__resultsList">
              {results.map((result) => (
                <button
                  key={result.id}
                  type="button"
                  className="dashboardSearch__result"
                  onClick={() => {
                    onResultClick(result);
                    onClose();
                  }}
                >
                  <span className={`dashboardSearch__resultIcon dashboardSearch__resultIcon--${result.type}`}>
                    {result.type === "order" && "📦"}
                    {result.type === "customer" && "👤"}
                    {result.type === "bouquet" && "🌸"}
                    {result.type === "collection" && "📚"}
                  </span>
                  <div className="dashboardSearch__resultContent">
                    <span className="dashboardSearch__resultTitle">{result.title}</span>
                    {result.subtitle && (
                      <span className="dashboardSearch__resultSubtitle">{result.subtitle}</span>
                    )}
                  </div>
                </button>
              ))}
            </div>
          ) : query ? (
            <div className="dashboardSearch__empty">
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" opacity="0.3">
                <path d="M21 21l-6-6m2-5a7 7 0 1 1-14 0 7 7 0 0 1 14 0z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              <p>Tidak ada hasil untuk "{query}"</p>
            </div>
          ) : (
            <div className="dashboardSearch__empty">
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" opacity="0.3">
                <path d="M21 21l-6-6m2-5a7 7 0 1 1-14 0 7 7 0 0 1 14 0z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              <p>Mulai mengetik untuk mencari...</p>
              <div className="dashboardSearch__hints">
                <span>💡 Tips: Gunakan Ctrl+K untuk membuka pencarian</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default DashboardSearch;

