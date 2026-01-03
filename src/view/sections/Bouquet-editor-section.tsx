/**
 * Bouquet Editor Section Component
 * Luxury, Elegant, Clean UI/UX
 * Follows SOLID, MVP, OOP, DRY principles
 * Fully responsive and optimized for all devices
 * Enhanced with better error handling, edge cases, and performance
 */

import React, { Component } from "react";
import type { Bouquet } from "../../models/domain/bouquet";
import type { Collection } from "../../models/domain/collection";
import "../../styles/BouquetEditorSection.css";
import CollectionListView from "./CollectionListView";
import CollectionDetailView from "./CollectionDetailView";
import BouquetEditForm from "./bouquet-edit-form";
import { API_BASE } from "../../config/api";

interface Props {
  bouquets: Bouquet[];
  collections: string[] | Collection[]; // Support both string[] (legacy) and Collection[]
  onSave: (formData: FormData) => Promise<boolean>;
  onDuplicate?: (bouquetId: string) => Promise<void>;
  onDelete?: (bouquetId: string) => Promise<void>;
  onUpdateCollection?: (collectionId: string, name: string) => Promise<boolean>;
  onMoveBouquet?: (bouquetId: string, targetCollectionId: string) => Promise<boolean>;
  onDeleteCollection?: (collectionId: string) => Promise<boolean>;
}

type ViewState = "collections" | "collection-detail" | "bouquet-edit";

interface State {
  currentView: ViewState;
  selectedCollectionId: string | null;
  selectedBouquet: Bouquet | null;
  collections: Collection[];
  bouquets: Bouquet[];
  // Enhanced: Track operations to prevent race conditions
  isOperationInProgress: boolean;
}

export default class BouquetEditorSection extends Component<Props, State> {
  // Performance: Cache expensive computations
  private collectionsCache: Collection[] | null = null;
  private bouquetsCache: Bouquet[] | null = null;
  private lastPropsHash: string = "";
  // Performance: Memoize normalized collections
  private normalizedCollectionsCache: Collection[] | null = null;
  private lastNormalizedHash: string = "";
  // Performance: Debounce timers
  private debounceTimers: Map<string, NodeJS.Timeout> = new Map();

  constructor(props: Props) {
    super(props);
    this.state = {
      currentView: "collections",
      selectedCollectionId: null,
      selectedBouquet: null,
      collections: [],
      bouquets: props.bouquets ?? [],
      isOperationInProgress: false,
    };
  }

  // Performance: Prevent unnecessary re-renders with deep comparison for arrays
  shouldComponentUpdate(nextProps: Props, nextState: State): boolean {
    // Only update if props or state actually changed
    const propsChanged = 
      nextProps.bouquets !== this.props.bouquets ||
      nextProps.collections !== this.props.collections ||
      nextProps.onSave !== this.props.onSave ||
      nextProps.onDelete !== this.props.onDelete ||
      nextProps.onDuplicate !== this.props.onDuplicate ||
      nextProps.onMoveBouquet !== this.props.onMoveBouquet ||
      nextProps.onUpdateCollection !== this.props.onUpdateCollection ||
      nextProps.onDeleteCollection !== this.props.onDeleteCollection;

    // Performance: Deep comparison for collections and bouquets arrays
    const collectionsChanged = 
      nextState.collections !== this.state.collections &&
      (nextState.collections.length !== this.state.collections.length ||
       nextState.collections.some((c, i) => {
         const prevC = this.state.collections[i];
         return !prevC || c._id !== prevC._id || c.name !== prevC.name ||
                (c.bouquets as Bouquet[]).length !== (prevC.bouquets as Bouquet[]).length;
       }));

    const bouquetsChanged = 
      nextState.bouquets !== this.state.bouquets &&
      (nextState.bouquets.length !== this.state.bouquets.length ||
       nextState.bouquets.some((b, i) => {
         const prevB = this.state.bouquets[i];
         return !prevB || b._id !== prevB._id;
       }));

    const stateChanged = 
      nextState.currentView !== this.state.currentView ||
      nextState.selectedCollectionId !== this.state.selectedCollectionId ||
      nextState.selectedBouquet !== this.state.selectedBouquet ||
      collectionsChanged ||
      bouquetsChanged ||
      nextState.isOperationInProgress !== this.state.isOperationInProgress;

    return propsChanged || stateChanged;
  }

  componentDidMount(): void {
    // Enhanced: Load collections and sync bouquets on mount
    const initializeData = async () => {
      // Load collections first
      await this.loadCollections();
      // Then sync bouquets to ensure collections are properly populated
      if (this.props.bouquets && this.props.bouquets.length > 0) {
        this.syncBouquetsFromProps();
      }
    };

    // Performance: Use requestIdleCallback for non-critical initialization
    if (typeof requestIdleCallback !== "undefined") {
      requestIdleCallback(() => {
        void initializeData();
      }, { timeout: 1000 });
    } else {
      // Fallback for browsers without requestIdleCallback
      setTimeout(() => {
        void initializeData();
      }, 0);
    }
  }

  // Performance: Cleanup on unmount
  componentWillUnmount(): void {
    // Clear all caches
    this.collectionsCache = null;
    this.bouquetsCache = null;
    this.normalizedCollectionsCache = null;
    this.lastPropsHash = "";
    this.lastNormalizedHash = "";
    
    // Clear all debounce timers
    this.debounceTimers.forEach(timer => clearTimeout(timer));
    this.debounceTimers.clear();
  }

  componentDidUpdate(prevProps: Props): void {
    // Performance: Debounce collections reload to prevent excessive API calls
    const prevCollectionsLength = Array.isArray(prevProps.collections) ? prevProps.collections.length : 0;
    const currentCollectionsLength = Array.isArray(this.props.collections) ? this.props.collections.length : 0;
    
    // Only reload if:
    // 1. Collections count changed (new collection added/deleted)
    // 2. Collections structure changed (from string[] to Collection[] or vice versa)
    // 3. Initial load (collections was empty before)
    const collectionsStructureChanged = 
      (prevCollectionsLength === 0 && currentCollectionsLength > 0) ||
      (prevCollectionsLength !== currentCollectionsLength) ||
      (prevProps.collections.length > 0 && this.props.collections.length > 0 && 
       typeof prevProps.collections[0] !== typeof this.props.collections[0]);
    
    if (collectionsStructureChanged) {
      // Performance: Debounce collections reload
      const timerKey = "loadCollections";
      const existingTimer = this.debounceTimers.get(timerKey);
      if (existingTimer) {
        clearTimeout(existingTimer);
      }
      const timer = setTimeout(() => {
        // Preserve current view state when reloading
        const currentView = this.state.currentView;
        const selectedCollectionId = this.state.selectedCollectionId;
        const selectedBouquet = this.state.selectedBouquet;
        
        this.loadCollections().then(() => {
          // Enhanced: Sync bouquets after loading collections
          this.syncBouquetsFromProps();
          // Restore view state after reload - preserve current view
          if (currentView !== "collections") {
            this.setState({
              currentView,
              selectedCollectionId,
              selectedBouquet,
            });
          }
        }).catch((err) => {
          // Enhanced error handling
          console.error("Failed to reload collections:", err);
          // Fallback: create collections from bouquets
          this.setState({
            collections: this.createCollectionsFromBouquets(),
          });
        });
        this.debounceTimers.delete(timerKey);
      }, 100);
      this.debounceTimers.set(timerKey, timer);
    }
    
    // Performance: Sync bouquets if they changed, but don't reset view
    // This is critical for keeping editor in sync with parent controller
    if (prevProps.bouquets !== this.props.bouquets) {
        // Optimized: Sync bouquets immediately for better responsiveness
        // Use debounce to batch rapid updates
        const timerKey = "syncBouquets";
        const existingTimer = this.debounceTimers.get(timerKey);
        if (existingTimer) {
          clearTimeout(existingTimer);
        }
        
        const timer = setTimeout(() => {
          this.syncBouquetsFromProps();
          this.debounceTimers.delete(timerKey);
        }, 50); // Short debounce for better UX
        
        this.debounceTimers.set(timerKey, timer);
      }
  }

  // Optimized: Extract bouquets sync logic to reduce duplication
  private syncBouquetsFromProps = (): void => {
    this.setState((prev) => {
      const updatedBouquets = this.props.bouquets ?? prev.bouquets;
      if (!Array.isArray(updatedBouquets)) {
        console.warn("Invalid bouquets data");
        return prev;
      }
      
      // Performance: Only update if bouquets actually changed - use Set for O(1) comparison
      if (updatedBouquets.length === prev.bouquets.length) {
        const prevIds = new Set(prev.bouquets.map(b => b._id));
        const currentIds = new Set(updatedBouquets.map(b => b._id));
        // Check if IDs are the same
        if (prevIds.size === currentIds.size && 
            Array.from(prevIds).every(id => currentIds.has(id))) {
          // Check if any bouquet data changed
          const hasDataChanges = updatedBouquets.some((b, i) => {
            const prevB = prev.bouquets[i];
            return !prevB || 
              b.name !== prevB.name || 
              b.price !== prevB.price || 
              b.collectionName !== prevB.collectionName ||
              b.description !== prevB.description;
          });
          if (!hasDataChanges) {
            return prev; // No changes, prevent re-render
          }
        }
      }

      // Enhanced: Check if selectedBouquet still exists in the new bouquets list
      // IMPORTANT: Preserve current view state - don't navigate away during sync
      let selectedBouquet = prev.selectedBouquet;
      let currentView: ViewState = prev.currentView; // Preserve current view
      
      if (selectedBouquet) {
        const stillExists = updatedBouquets.some((b) => b._id === selectedBouquet?._id);
        if (!stillExists) {
          // Selected bouquet was deleted, clear selection and navigate back
          // Only navigate if we're actually in edit view and bouquet was deleted
          selectedBouquet = null;
          // Auto-navigate back to collection detail if in edit view
          if (prev.currentView === "bouquet-edit") {
            currentView = prev.selectedCollectionId ? "collection-detail" : "collections";
          }
        } else {
          // Update selectedBouquet with latest data from props
          // This ensures edited data is reflected in the UI
          const updatedBouquet = updatedBouquets.find((b) => b._id === selectedBouquet?._id);
          if (updatedBouquet) {
            selectedBouquet = updatedBouquet;
          }
        }
      }

      // Performance: Use Map for O(1) operations
      // Enhanced: Normalize collection names to handle case-insensitive matching
      const collectionMap = new Map<string, Bouquet[]>();
      for (const b of updatedBouquets) {
        const name = (b.collectionName || "Uncategorized").trim();
        const existing = collectionMap.get(name);
        if (existing) {
          existing.push(b);
        } else {
          collectionMap.set(name, [b]);
        }
      }

      // Update collections with new bouquets
      // Enhanced: Always update collections to ensure bouquet count is accurate
      const updatedCollections = prev.collections.map((c) => {
        const collectionName = (c.name || "").trim();
        // Try exact match first
        let collectionBouquets = collectionMap.get(collectionName) ?? [];
        
        // If no exact match, try case-insensitive match
        if (collectionBouquets.length === 0 && collectionName) {
          const normalizedCollectionName = collectionName.toLowerCase();
          for (const [bouquetCollectionName, bouquetList] of collectionMap.entries()) {
            if (bouquetCollectionName.toLowerCase() === normalizedCollectionName) {
              collectionBouquets = bouquetList;
              break;
            }
          }
        }
        
        // Always update to ensure count is accurate, even if length is the same
        // This handles cases where bouquets might have been updated
        return {
          ...c,
          bouquets: collectionBouquets,
        };
      });

      // Check if we need to add new collections that don't exist yet
      // Use case-insensitive matching to avoid duplicates
      const existingCollectionNames = new Set(prev.collections.map(c => (c.name || "").trim().toLowerCase()));
      for (const [name, bouquets] of collectionMap.entries()) {
        const normalizedName = name.toLowerCase();
        if (!existingCollectionNames.has(normalizedName)) {
          updatedCollections.push({
            _id: `collection-${updatedCollections.length}`,
            name,
            description: "",
            bouquets,
          });
        }
      }

      return {
        ...prev,
        bouquets: updatedBouquets,
        selectedBouquet,
        currentView,
        collections: updatedCollections,
      };
    });
  };

  private loadCollections = async (): Promise<void> => {
    // Enhanced: If collections is already Collection[], use it directly
    if (this.props.collections.length > 0 && typeof this.props.collections[0] === "object") {
      try {
        const normalized = this.normalizeCollections(this.props.collections as Collection[]);
        this.setState({
          collections: normalized,
        });
        // Enhanced: Sync bouquets after normalizing collections from props
        if (this.props.bouquets && this.props.bouquets.length > 0) {
          this.syncBouquetsFromProps();
        }
        return;
      } catch (err) {
        console.error("Failed to normalize collections:", err);
        // Fallback to API fetch
      }
    }

    // Otherwise, fetch from API with enhanced error handling
    try {
      const { getAuthHeaders } = require("../../utils/auth-utils");
      
      // Add timeout for better UX
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000); // 10s timeout
      
      const res = await fetch(`${API_BASE}/api/collections`, {
        headers: {
          "Content-Type": "application/json",
          ...getAuthHeaders(),
        },
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (res.ok) {
        const collections = await res.json();
        // Enhanced: Validate collections data
        if (Array.isArray(collections)) {
          const normalized = this.normalizeCollections(collections);
          this.setState({
            collections: normalized,
          });
          // Enhanced: Sync bouquets after loading collections to ensure data is in sync
          if (this.props.bouquets && this.props.bouquets.length > 0) {
            this.syncBouquetsFromProps();
          }
        } else {
          throw new Error("Invalid collections data format");
        }
      } else {
        // Enhanced: Handle different error statuses
        if (res.status === 401 || res.status === 403) {
          console.error("Authentication error loading collections");
        }
        // Fallback: create collections from bouquets
        const fallbackCollections = this.createCollectionsFromBouquets();
        this.setState({
          collections: fallbackCollections,
        });
      }
    } catch (err) {
      // Enhanced error handling
      if (err instanceof Error && err.name === "AbortError") {
        console.warn("Collections fetch timeout, using fallback");
      } else {
        console.error("Failed to load collections:", err);
      }
      // Fallback: create collections from bouquets
      const fallbackCollections = this.createCollectionsFromBouquets();
      this.setState({
        collections: fallbackCollections,
      });
      // Enhanced: Sync bouquets even in fallback case
      if (this.props.bouquets && this.props.bouquets.length > 0) {
        this.syncBouquetsFromProps();
      }
    }
  };

  // Performance: Memoize createCollectionsFromBouquets with improved caching
  private createCollectionsFromBouquets(): Collection[] {
    // Performance: Use cache if bouquets haven't changed
    const bouquetsHash = this.props.bouquets.length > 0 
      ? this.props.bouquets.map(b => `${b._id}:${b.collectionName || ""}`).join("|")
      : "";
    
    if (this.bouquetsCache && this.bouquetsCache.length === this.props.bouquets.length && bouquetsHash) {
      const cachedHash = this.bouquetsCache.map(b => `${b._id}:${b.collectionName || ""}`).join("|");
      if (cachedHash === bouquetsHash && this.normalizedCollectionsCache) {
        return this.normalizedCollectionsCache;
      }
    }

    // Performance: Use Map for O(1) operations
    // Enhanced: Normalize collection names (trim) for consistency
    const collectionMap = new Map<string, Bouquet[]>();
    
    // Performance: Single pass through bouquets
    for (const bouquet of this.props.bouquets) {
      const collectionName = (bouquet.collectionName || "Uncategorized").trim();
      const existing = collectionMap.get(collectionName);
      if (existing) {
        existing.push(bouquet);
      } else {
        collectionMap.set(collectionName, [bouquet]);
      }
    }

    const result = Array.from(collectionMap.entries()).map(([name, bouquets], index) => ({
      _id: `collection-${index}`,
      name,
      description: "",
      bouquets,
    }));

    // Cache bouquets and result for next time
    this.bouquetsCache = [...this.props.bouquets];
    this.normalizedCollectionsCache = result;
    
    return result;
  }

  // Performance: Memoize normalizeCollections with improved caching
  private normalizeCollections(collections: Collection[]): Collection[] {
    // Performance: Create more accurate hash including collection IDs and bouquet IDs
    const collectionsHash = collections.map(c => `${c._id}:${c.name}`).join("|");
    const bouquetsHash = this.props.bouquets.map(b => b._id).join(",");
    const propsHash = `${collections.length}-${collectionsHash}-${this.props.bouquets.length}-${bouquetsHash}`;
    
    if (this.collectionsCache && this.lastPropsHash === propsHash) {
      return this.collectionsCache;
    }

    // Performance: Pre-create Set of all bouquet IDs for O(1) lookups
    const allBouquetIdsSet = new Set(this.props.bouquets.map(b => b._id));
    const bouquetMap = new Map<string, Bouquet>();
    this.props.bouquets.forEach(b => bouquetMap.set(b._id, b));

    // Enhanced: Also create a map of bouquets by collectionName for fallback matching
    // Normalize collection names (trim and handle case-insensitive matching)
    const bouquetsByCollectionName = new Map<string, Bouquet[]>();
    const normalizedNameMap = new Map<string, string>(); // Map normalized name to original name
    
    this.props.bouquets.forEach(b => {
      const collectionName = (b.collectionName || "Uncategorized").trim();
      const normalizedName = collectionName.toLowerCase();
      
      // Store mapping from normalized to original name
      if (!normalizedNameMap.has(normalizedName)) {
        normalizedNameMap.set(normalizedName, collectionName);
      }
      
      const existing = bouquetsByCollectionName.get(collectionName);
      if (existing) {
        existing.push(b);
      } else {
        bouquetsByCollectionName.set(collectionName, [b]);
      }
    });

    const normalized = collections.map((c) => {
      let bouquets: Bouquet[] = [];
      
      // Enhanced: Always use collectionName matching as primary method for accuracy
      // This ensures bouquet count is always correct regardless of API response format
      if (c.name) {
        const collectionName = c.name.trim();
        // Try exact match first
        let matchedByCollectionName = bouquetsByCollectionName.get(collectionName);
        
        // If no exact match, try case-insensitive match
        if (!matchedByCollectionName || matchedByCollectionName.length === 0) {
          const normalizedCollectionName = collectionName.toLowerCase();
          // Find matching bouquets by checking all collection names
          for (const [bouquetCollectionName, bouquetList] of bouquetsByCollectionName.entries()) {
            if (bouquetCollectionName.toLowerCase() === normalizedCollectionName) {
              matchedByCollectionName = bouquetList;
              break;
            }
          }
        }
        
        if (matchedByCollectionName && matchedByCollectionName.length > 0) {
          bouquets = matchedByCollectionName;
        }
      }
      
      // Also try to get bouquets from collection references if available
      // This helps with cases where API returns proper references
      if (Array.isArray(c.bouquets)) {
        // Check if first item is a string (ObjectId) or object (Bouquet)
        if (c.bouquets.length > 0 && typeof c.bouquets[0] === "string") {
          // Performance: Use Set for O(1) lookup and Map for O(1) retrieval
          const bouquetIds = c.bouquets as string[];
          const bouquetsFromIds = bouquetIds
            .filter(id => bouquetMap.has(id))
            .map(id => bouquetMap.get(id)!)
            .filter((b): b is Bouquet => b !== undefined);
          
          // Merge with collectionName-matched bouquets, avoiding duplicates
          if (bouquetsFromIds.length > 0) {
            const existingIds = new Set(bouquets.map(b => b._id));
            const additionalBouquets = bouquetsFromIds.filter(b => !existingIds.has(b._id));
            if (additionalBouquets.length > 0) {
              bouquets = [...bouquets, ...additionalBouquets];
            }
          }
        } else {
          // It's Bouquet[] - validate and filter
          const bouquetsFromArray = (c.bouquets as unknown[]).filter(
            (b): b is Bouquet =>
              typeof b === "object" && b !== null && "_id" in b && allBouquetIdsSet.has((b as Bouquet)._id)
          ) as Bouquet[];
          
          // Merge with collectionName-matched bouquets, avoiding duplicates
          if (bouquetsFromArray.length > 0) {
            const existingIds = new Set(bouquets.map(b => b._id));
            const additionalBouquets = bouquetsFromArray.filter(b => !existingIds.has(b._id));
            if (additionalBouquets.length > 0) {
              bouquets = [...bouquets, ...additionalBouquets];
            }
          }
        }
      }
      
      // Final fallback: if still no bouquets and collection name exists, try matching again
      // This handles edge cases where collection name might have slight variations
      if (bouquets.length === 0 && c.name) {
        const matchedByCollectionName = bouquetsByCollectionName.get(c.name);
        if (matchedByCollectionName && matchedByCollectionName.length > 0) {
          bouquets = matchedByCollectionName;
        }
      }
      
      return {
        ...c,
        bouquets,
      };
    });

    // Cache the result
    this.collectionsCache = normalized;
    this.lastPropsHash = propsHash;
    this.normalizedCollectionsCache = normalized;
    
    return normalized;
  }

  // Performance: Batch state updates using requestAnimationFrame for smoother UI
  private handleCollectionSelect = (collectionId: string): void => {
    if (typeof requestAnimationFrame !== "undefined") {
      requestAnimationFrame(() => {
        this.setState({
          currentView: "collection-detail",
          selectedCollectionId: collectionId,
          selectedBouquet: null,
        });
      });
    } else {
      this.setState({
        currentView: "collection-detail",
        selectedCollectionId: collectionId,
        selectedBouquet: null,
      });
    }
  };

  private handleBouquetSelect = (bouquet: Bouquet): void => {
    if (typeof requestAnimationFrame !== "undefined") {
      requestAnimationFrame(() => {
        this.setState({
          currentView: "bouquet-edit",
          selectedBouquet: bouquet,
        });
      });
    } else {
      this.setState({
        currentView: "bouquet-edit",
        selectedBouquet: bouquet,
      });
    }
  };

  private handleBackToCollections = (): void => {
    if (typeof requestAnimationFrame !== "undefined") {
      requestAnimationFrame(() => {
        this.setState({
          currentView: "collections",
          selectedCollectionId: null,
          selectedBouquet: null,
        });
      });
    } else {
      this.setState({
        currentView: "collections",
        selectedCollectionId: null,
        selectedBouquet: null,
      });
    }
  };

  private handleBackToCollectionDetail = (): void => {
    if (typeof requestAnimationFrame !== "undefined") {
      requestAnimationFrame(() => {
        this.setState({
          currentView: "collection-detail",
          selectedBouquet: null,
        });
      });
    } else {
      this.setState({
        currentView: "collection-detail",
        selectedBouquet: null,
      });
    }
  };

  private handleCollectionUpdate = async (
    collectionId: string,
    newName: string
  ): Promise<boolean> => {
    if (this.props.onUpdateCollection) {
      const success = await this.props.onUpdateCollection(collectionId, newName);
      if (success) {
        // Update local state
        this.setState((prev) => ({
          ...prev,
          collections: prev.collections.map((c) =>
            c._id === collectionId ? { ...c, name: newName } : c
          ),
        }));
      }
      return success;
    }

    // Fallback: call API directly
    try {
      const { getAuthHeaders } = require("../../utils/auth-utils");
      const res = await fetch(`${API_BASE}/api/collections/${collectionId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          ...getAuthHeaders(),
        },
        body: JSON.stringify({ name: newName }),
      });

      if (res.ok) {
        await res.json(); // Read response but don't use it
        this.setState((prev) => ({
          ...prev,
          collections: prev.collections.map((c) =>
            c._id === collectionId ? { ...c, name: newName } : c
          ),
        }));
        return true;
      }
      return false;
      } catch (err) {
        // eslint-disable-next-line no-console
        console.error("Failed to update collection:", err);
        return false;
      }
  };

  private handleCollectionDelete = async (
    collectionId: string
  ): Promise<boolean> => {
    if (this.props.onDeleteCollection) {
      const success = await this.props.onDeleteCollection(collectionId);
      if (success) {
        // Update local state - remove deleted collection
        this.setState((prev) => {
          const wasSelected = prev.selectedCollectionId === collectionId;
          return {
            ...prev,
            collections: prev.collections.filter((c) => c._id !== collectionId),
            // If deleted collection was selected, go back to collections view
            selectedCollectionId: wasSelected ? null : prev.selectedCollectionId,
            currentView: wasSelected ? "collections" : prev.currentView,
            // If we were editing a bouquet from deleted collection, go back to collections
            selectedBouquet: wasSelected ? null : prev.selectedBouquet,
          };
        });
        // No need to reload - state is already updated
      }
      return success;
    }
    return false;
  };

  private handleBouquetMove = async (
    bouquetId: string,
    targetCollectionId: string
  ): Promise<boolean> => {
    // Enhanced: Prevent concurrent operations
    if (this.state.isOperationInProgress) {
      console.warn("Another operation is in progress, please wait");
      return false;
    }

    // Enhanced: Validate inputs before proceeding
    if (!bouquetId || !targetCollectionId) {
      console.error("Invalid bouquet or collection ID for move operation");
      return false;
    }

    // Enhanced: Check if bouquet exists
    const bouquet = this.state.bouquets.find((b) => b._id === bouquetId);
    if (!bouquet) {
      console.error("Bouquet not found for move operation");
      return false;
    }

    // Enhanced: Check if target collection exists
    const targetCollection = this.state.collections.find(
      (c) => c._id === targetCollectionId
    );
    if (!targetCollection) {
      console.error("Target collection not found for move operation");
      return false;
    }

    // Enhanced: Check if bouquet is already in target collection (prevent unnecessary operation)
    const oldCollection = this.state.collections.find((c) =>
      (c.bouquets as Bouquet[]).some((b) => b._id === bouquetId)
    );
    if (oldCollection?._id === targetCollectionId) {
      // Already in target collection, no need to move
      return true;
    }

    // Set operation in progress
    this.setState({ isOperationInProgress: true });

    if (this.props.onMoveBouquet) {
      try {
        const success = await this.props.onMoveBouquet(
          bouquetId,
          targetCollectionId
        );
        if (success) {
          // Optimized: Update local state immediately (optimistic update)
          this.setState((prev) => {
            const currentBouquet = prev.bouquets.find((b) => b._id === bouquetId);
            if (!currentBouquet) {
              console.warn("Bouquet not found in state during move update");
              return prev;
            }

            const currentTargetCollection = prev.collections.find(
              (c) => c._id === targetCollectionId
            );
            if (!currentTargetCollection) {
              console.warn("Target collection not found in state during move update");
              return prev;
            }

            const currentOldCollection = prev.collections.find((c) =>
              (c.bouquets as Bouquet[]).some((b) => b._id === bouquetId)
            );

            const updatedBouquet = {
              ...currentBouquet,
              collectionName: currentTargetCollection.name,
            };

            // Enhanced: Update selectedBouquet if it's the moved bouquet
            const updatedSelectedBouquet = prev.selectedBouquet?._id === bouquetId
              ? updatedBouquet
              : prev.selectedBouquet;

            return {
              ...prev,
              bouquets: prev.bouquets.map((b) =>
                b._id === bouquetId ? updatedBouquet : b
              ),
              selectedBouquet: updatedSelectedBouquet,
              collections: prev.collections.map((c) => {
                if (c._id === targetCollectionId) {
                  // Add to target collection (prevent duplicates)
                  const existing = (c.bouquets as Bouquet[]).find(
                    (b) => b._id === bouquetId
                  );
                  if (existing) return c;
                  return {
                    ...c,
                    bouquets: [...(c.bouquets as Bouquet[]), updatedBouquet],
                  };
                }
                if (c._id === currentOldCollection?._id) {
                  // Remove from old collection
                  return {
                    ...c,
                    bouquets: (c.bouquets as Bouquet[]).filter(
                      (b) => b._id !== bouquetId
                    ),
                  };
                }
                return c;
              }),
            };
          });

          // Optimized: Sync with props after operation completes
          // Use debounced sync to batch updates
          const timerKey = "syncAfterMove";
          const existingTimer = this.debounceTimers.get(timerKey);
          if (existingTimer) {
            clearTimeout(existingTimer);
          }
          const timer = setTimeout(() => {
            this.syncBouquetsFromProps();
            this.debounceTimers.delete(timerKey);
          }, 100);
          this.debounceTimers.set(timerKey, timer);

          this.setState({ isOperationInProgress: false });
          return true;
        } else {
          console.error("Move bouquet operation failed");
          this.setState({ isOperationInProgress: false });
          return false;
        }
      } catch (err) {
        console.error("Error during move bouquet operation:", err);
        this.setState({ isOperationInProgress: false });
        return false;
      }
    }
    
    // Enhanced: Fallback: call API directly with better error handling
    // Only execute if onMoveBouquet prop is not available
    if (!this.props.onMoveBouquet) {
      try {
      const { getAuthHeaders } = require("../../utils/auth-utils");
      const currentTargetCollection = this.state.collections.find(
        (c) => c._id === targetCollectionId
      );
      if (!currentTargetCollection) {
        console.error("Target collection not found in fallback API call");
        return false;
      }

      // Enhanced: Find old collection with validation
      const currentOldCollection = this.state.collections.find((c) =>
        (c.bouquets as Bouquet[]).some((b) => b._id === bouquetId)
      );

      // Enhanced: Remove from old collection with timeout and error handling
      const oldCollectionId = currentOldCollection?._id;
      if (currentOldCollection && oldCollectionId && oldCollectionId !== targetCollectionId) {
        try {
          const removeController = new AbortController();
          const removeTimeout = setTimeout(() => removeController.abort(), 10000);
          
          const removeRes = await fetch(
            `${API_BASE}/api/collections/${oldCollectionId}/bouquets/${bouquetId}`,
            {
              method: "DELETE",
              headers: {
                "Content-Type": "application/json",
                ...getAuthHeaders(),
              },
              signal: removeController.signal,
            }
          );
          clearTimeout(removeTimeout);
          
          if (!removeRes.ok) {
            console.error(`Failed to remove bouquet from old collection: ${removeRes.status}`);
            // Continue anyway - might already be removed
          }
        } catch (removeErr: unknown) {
          if (removeErr instanceof Error) {
            const error = removeErr as Error;
            const errorName: string = error.name;
            if (errorName !== "AbortError") {
              console.error("Error removing bouquet from old collection:", removeErr);
              // Continue anyway - might already be removed
            }
          }
        }
      }

      // Enhanced: Add to target collection with timeout
      const addController = new AbortController();
      const addTimeout = setTimeout(() => addController.abort(), 10000);
      
      const addRes = await fetch(
        `${API_BASE}/api/collections/${targetCollectionId}/bouquets`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            ...getAuthHeaders(),
          },
          body: JSON.stringify({ bouquetId }),
          signal: addController.signal,
        }
      );
      clearTimeout(addTimeout);

      if (addRes.ok) {
          // Enhanced: Update bouquet's collectionName with timeout
          const currentBouquet = this.state.bouquets.find((b) => b._id === bouquetId);
          const targetCollectionName = currentTargetCollection?.name;
          if (currentBouquet && currentTargetCollection && targetCollectionName) {
            const updateController = new AbortController();
            const updateTimeout = setTimeout(() => updateController.abort(), 10000);
            
            const updateRes = await fetch(
              `${API_BASE}/api/bouquets/${bouquetId}`,
              {
                method: "PUT",
                headers: {
                  "Content-Type": "application/json",
                  ...getAuthHeaders(),
                },
                body: JSON.stringify({
                  collectionName: targetCollectionName,
                }),
                signal: updateController.signal,
              }
            );
            clearTimeout(updateTimeout);
            
            if (updateRes.ok) {
              // Enhanced: Update local state with validation
              this.setState((prev) => {
                const currentBouquetInState = prev.bouquets.find((b) => b._id === bouquetId);
                if (!currentBouquetInState || !currentTargetCollection) {
                  console.warn("Bouquet or target collection not found in state during fallback move update");
                  return prev;
                }

                const updatedBouquet = {
                  ...currentBouquetInState,
                  collectionName: currentTargetCollection.name,
                };

              // Enhanced: Update selectedBouquet if it's the moved bouquet
              const updatedSelectedBouquet = prev.selectedBouquet?._id === bouquetId
                ? updatedBouquet
                : prev.selectedBouquet;

              return {
                ...prev,
                bouquets: prev.bouquets.map((b) =>
                  b._id === bouquetId ? updatedBouquet : b
                ),
                selectedBouquet: updatedSelectedBouquet,
                collections: prev.collections.map((c) => {
                  if (c._id === targetCollectionId) {
                    // Prevent duplicates
                    const existing = (c.bouquets as Bouquet[]).find(
                      (b) => b._id === bouquetId
                    );
                    if (existing) return c;
                    return {
                      ...c,
                      bouquets: [
                        ...(c.bouquets as Bouquet[]).filter(
                          (b) => b._id !== bouquetId
                        ),
                        updatedBouquet,
                      ],
                    };
                  }
                  if (currentOldCollection && c._id === currentOldCollection._id) {
                    return {
                      ...c,
                      bouquets: (c.bouquets as Bouquet[]).filter(
                        (b) => b._id !== bouquetId
                      ),
                    };
                  }
                  return c;
                }),
              };
            });
            this.setState({ isOperationInProgress: false });
            return true;
          } else {
            console.error(`Failed to update bouquet collectionName: ${updateRes.status}`);
            this.setState({ isOperationInProgress: false });
            return false;
          }
        } else {
          console.error("Bouquet not found for collectionName update");
          this.setState({ isOperationInProgress: false });
          return false;
        }
      } else {
        console.error(`Failed to add bouquet to collection: ${addRes.status}`);
        this.setState({ isOperationInProgress: false });
        return false;
      }
    } catch (err: unknown) {
      // Enhanced: Better error handling
      if (err instanceof Error) {
        const error = err as Error;
        const errorName: string = error.name;
        if (errorName === "AbortError") {
          console.error("Move bouquet operation timeout");
        } else {
          console.error("Failed to move bouquet:", err);
        }
      } else {
        console.error("Failed to move bouquet:", err);
      }
      this.setState({ isOperationInProgress: false });
      return false;
      }
    }
    
    // If we reach here, onMoveBouquet was not available and fallback failed
    this.setState({ isOperationInProgress: false });
    return false;
  };

  private handleBouquetDelete = async (bouquetId: string): Promise<void> => {
    // Enhanced: Prevent concurrent operations
    if (this.state.isOperationInProgress) {
      console.warn("Another operation is in progress, please wait");
      return;
    }

    // Enhanced: Validate input
    if (!bouquetId) {
      console.error("Invalid bouquet ID for delete operation");
      return;
    }

    // Enhanced: Check if bouquet exists before attempting delete
    const bouquet = this.state.bouquets.find((b) => b._id === bouquetId);
    if (!bouquet) {
      console.warn("Bouquet not found for delete operation");
      return;
    }

    if (this.props.onDelete) {
      // Set operation in progress
      this.setState({ isOperationInProgress: true });
      
      try {
        // Enhanced: Check if we're deleting the currently selected bouquet
        const isDeletingSelected = this.state.selectedBouquet?._id === bouquetId;
        const wasInEditView = this.state.currentView === "bouquet-edit";
        const wasInCollectionDetail = this.state.currentView === "collection-detail";
        
        // Enhanced: Find collection before deletion for navigation
        const deletedBouquetCollection = this.state.collections.find((c) =>
          (c.bouquets as Bouquet[]).some((b) => b._id === bouquetId)
        );
        
        // Optimized: Call delete - this will refresh bouquets in parent controller
        await this.props.onDelete(bouquetId);
        
        // Performance: Optimistic update with batched state updates
        // Use functional setState to batch updates efficiently
        this.setState((prev) => {
          // Performance: Use filter with early return for better performance
          const updatedBouquets = prev.bouquets.filter((b) => b._id !== bouquetId);
          
          // Performance: Only update collections that contain the deleted bouquet
          const updatedCollections = prev.collections.map((c) => {
            const hasBouquet = (c.bouquets as Bouquet[]).some((b) => b._id === bouquetId);
            if (!hasBouquet) {
              return c; // Return same reference if no change (prevents re-render)
            }
            return {
              ...c,
              bouquets: (c.bouquets as Bouquet[]).filter((b) => b._id !== bouquetId),
            };
          });
          
          // Enhanced: If we deleted the selected bouquet, navigate back appropriately
          if (isDeletingSelected) {
            if (wasInEditView) {
              // Was editing the deleted bouquet - go back to collection detail or collections
              return {
                ...prev,
                bouquets: updatedBouquets,
                collections: updatedCollections,
                currentView: deletedBouquetCollection ? "collection-detail" : "collections",
                selectedCollectionId: deletedBouquetCollection?._id ?? null,
                selectedBouquet: null,
              };
            } else if (wasInCollectionDetail) {
              // Was viewing collection detail - stay in collection detail but clear selection
              return {
                ...prev,
                bouquets: updatedBouquets,
                collections: updatedCollections,
                selectedBouquet: null,
              };
            }
          }
          
          // Enhanced: If we're in collection detail view and the collection is now empty, go back to collections
          if (prev.currentView === "collection-detail") {
            const collection = updatedCollections.find(
              (c) => c._id === prev.selectedCollectionId
            );
            if (collection && (collection.bouquets as Bouquet[]).length === 0) {
              return {
                ...prev,
                bouquets: updatedBouquets,
                collections: updatedCollections,
                currentView: "collections",
                selectedCollectionId: null,
                selectedBouquet: null,
              };
            }
          }
          
          // Enhanced: Clear selectedBouquet if it was deleted
          const selectedBouquet = prev.selectedBouquet && 
            updatedBouquets.some((b) => b._id === prev.selectedBouquet?._id)
            ? prev.selectedBouquet
            : null;
          
          return {
            ...prev,
            bouquets: updatedBouquets,
            collections: updatedCollections,
            selectedBouquet,
          };
        });

        // Optimized: Sync with props after delete operation
        // Use debounced sync to batch updates
        const timerKey = "syncAfterDelete";
        const existingTimer = this.debounceTimers.get(timerKey);
        if (existingTimer) {
          clearTimeout(existingTimer);
        }
        const timer = setTimeout(() => {
          this.syncBouquetsFromProps();
          this.debounceTimers.delete(timerKey);
        }, 100);
        this.debounceTimers.set(timerKey, timer);
        
        // Clear operation in progress after sync
        this.setState({ isOperationInProgress: false });
      } catch (err) {
        // Enhanced: Better error handling with state rollback
        console.error("Failed to delete bouquet:", err);
        const errorMessage = err instanceof Error ? err.message : "Gagal menghapus bouquet";
        alert(`Error: ${errorMessage}. Silakan refresh halaman dan coba lagi.`);
        
        // Optimized: Rollback optimistic update on error
        // Reload bouquets from props to restore correct state
        this.setState((prev) => {
          const propsBouquets = this.props.bouquets ?? prev.bouquets;
          return {
            ...prev,
            bouquets: propsBouquets,
            collections: prev.collections.map((c) => {
              const collectionBouquets = propsBouquets.filter(
                (b) => b.collectionName === c.name
              );
              return {
                ...c,
                bouquets: collectionBouquets,
              };
            }),
            isOperationInProgress: false,
          };
        });
      }
    }
  };

  private handleBouquetDuplicate = async (bouquetId: string): Promise<void> => {
    // Enhanced: Prevent concurrent operations
    if (this.state.isOperationInProgress) {
      console.warn("Another operation is in progress, please wait");
      return;
    }

    // Enhanced: Validate input
    if (!bouquetId) {
      console.error("Invalid bouquet ID for duplicate operation");
      return;
    }

    // Enhanced: Check if bouquet exists before attempting duplicate
    const bouquet = this.state.bouquets.find((b) => b._id === bouquetId);
    if (!bouquet) {
      console.warn("Bouquet not found for duplicate operation");
      alert("Bouquet tidak ditemukan. Silakan refresh halaman dan coba lagi.");
      return;
    }

    if (this.props.onDuplicate) {
      // Set operation in progress
      this.setState({ isOperationInProgress: true });
      
      try {
        // Optimized: Wait for duplicate operation with timeout protection
        await Promise.race([
          this.props.onDuplicate(bouquetId),
          new Promise((_, reject) => 
            setTimeout(() => reject(new Error("Duplicate operation timeout")), 30000)
          )
        ]);

        // Optimized: Sync with props after duplicate operation
        // Use debounced sync to batch updates
        const timerKey = "syncAfterDuplicate";
        const existingTimer = this.debounceTimers.get(timerKey);
        if (existingTimer) {
          clearTimeout(existingTimer);
        }
        const timer = setTimeout(() => {
          this.syncBouquetsFromProps();
          this.debounceTimers.delete(timerKey);
        }, 100);
        this.debounceTimers.set(timerKey, timer);
        
        // Clear operation in progress after sync
        this.setState({ isOperationInProgress: false });
      } catch (err) {
        // Enhanced: Better error handling
        console.error("Failed to duplicate bouquet:", err);
        const errorMessage = err instanceof Error 
          ? err.message 
          : "Gagal menduplikasi bouquet";
        
        if (errorMessage.includes("timeout")) {
          alert("Operasi duplikasi timeout. Silakan coba lagi.");
        } else {
          alert(`Error: ${errorMessage}. Silakan refresh halaman dan coba lagi.`);
        }
        
        // Clear operation in progress on error
        this.setState({ isOperationInProgress: false });
        // Don't update state on error - keep current state
      }
    }
  };

  private handleBouquetSave = async (
    formData: FormData
  ): Promise<boolean> => {
    try {
      const bouquetId = String(formData.get("_id") ?? "");
      const existingBouquet = this.state.bouquets.find(
        (b) => b._id === bouquetId
      );

      // Optimized: Call save operation
      const success = await this.props.onSave(formData);
      
      // Optimized: Sync with props after save operation
      if (success) {
        // Enhanced: Immediately update selectedBouquet with latest data from props
        // This ensures the edit form shows updated data right away
        const timerKey = "syncAfterSave";
        const existingTimer = this.debounceTimers.get(timerKey);
        if (existingTimer) {
          clearTimeout(existingTimer);
        }
        const timer = setTimeout(async () => {
          // Enhanced: Reload collections from API to ensure they're in sync
          await this.loadCollections();
          // Then sync bouquets to update collections with latest bouquet data
          this.syncBouquetsFromProps();
          
          // Enhanced: Update selectedBouquet with latest data from props after sync
          // This ensures edited data appears in the UI
          this.setState((prev) => {
            if (prev.selectedBouquet) {
              const updatedBouquet = this.props.bouquets.find(
                (b) => b._id === prev.selectedBouquet?._id
              );
              if (updatedBouquet) {
                return {
                  ...prev,
                  selectedBouquet: updatedBouquet,
                };
              }
            }
            return prev;
          });
          
          this.debounceTimers.delete(timerKey);
        }, 100);
        this.debounceTimers.set(timerKey, timer);
      }
      
      if (success && existingBouquet) {
        // Optimized: Update state immediately (optimistic update)
        // Extract all fields from formData to update state completely
          // Extract all fields from formData with proper type handling
          const name = String(formData.get("name") ?? existingBouquet.name ?? "").trim();
          const description = String(formData.get("description") ?? existingBouquet.description ?? "").trim();
          const price = Number(formData.get("price")) || existingBouquet.price || 0;
          const type = String(formData.get("type") ?? existingBouquet.type ?? "").trim();
          const size = String(formData.get("size") ?? existingBouquet.size ?? "Medium");
          const status = String(formData.get("status") ?? existingBouquet.status ?? "ready");
          const collectionName = String(formData.get("collectionName") ?? existingBouquet.collectionName ?? "").trim();
          const quantity = Number(formData.get("quantity")) || existingBouquet.quantity || 0;
          const occasionsText = String(formData.get("occasions") ?? "");
          const flowersText = String(formData.get("flowers") ?? "");
          const isNewEdition = String(formData.get("isNewEdition") ?? "false") === "true";
          const isFeatured = String(formData.get("isFeatured") ?? "false") === "true";
          const customPenandaText = String(formData.get("customPenanda") ?? "");
          const careInstructions = String(formData.get("careInstructions") ?? existingBouquet.careInstructions ?? "").trim();

          // Parse arrays from comma-separated strings with proper validation
          const occasions = occasionsText 
            ? occasionsText.split(",").map(s => s.trim()).filter(Boolean) 
            : (Array.isArray(existingBouquet.occasions) ? existingBouquet.occasions : []);
          const flowers = flowersText 
            ? flowersText.split(",").map(s => s.trim()).filter(Boolean) 
            : (Array.isArray(existingBouquet.flowers) ? existingBouquet.flowers : []);
          const customPenanda = customPenandaText 
            ? customPenandaText.split(",").map(s => s.trim()).filter(Boolean) 
            : (Array.isArray(existingBouquet.customPenanda) ? existingBouquet.customPenanda : []);

          // Image URL - keep existing unless server updates it (handled by parent refresh)
          // For now, keep existing image URL
          const image = existingBouquet.image ?? "";

          const updated: Bouquet = {
            ...existingBouquet,
            name,
            description,
            price,
            type,
            size: size as Bouquet["size"],
            status: status as Bouquet["status"],
            collectionName,
            quantity,
            occasions,
            flowers,
            isNewEdition,
            isFeatured,
            customPenanda,
            careInstructions,
            image, // Keep existing image URL - server will update if new image uploaded
          };

          // Update state WITHOUT navigating back - stay in edit view for better UX
          this.setState((prev) => {
            const updatedBouquets = prev.bouquets.map((b) =>
              b._id === bouquetId ? updated : b
            );

            // Update collections - handle bouquet movement between collections
            const oldCollection = prev.collections.find((c) =>
              (c.bouquets as Bouquet[]).some((b) => b._id === bouquetId)
            );

            const updatedCollections = prev.collections.map((c) => {
              // Remove from old collection if moved to different collection
              if (oldCollection && c._id === oldCollection._id && oldCollection.name !== collectionName) {
                return {
                  ...c,
                  bouquets: (c.bouquets as Bouquet[]).filter((b) => b._id !== bouquetId),
                };
              }
              // Add/update in new collection
              if (c.name === collectionName) {
                const existingIndex = (c.bouquets as Bouquet[]).findIndex(
                  (b) => b._id === bouquetId
                );
                if (existingIndex >= 0) {
                  // Update existing bouquet in collection
                  const collectionBouquets = [...(c.bouquets as Bouquet[])];
                  collectionBouquets[existingIndex] = updated;
                  return { ...c, bouquets: collectionBouquets };
                } else {
                  // Add to collection (bouquet moved here)
                  return {
                    ...c,
                    bouquets: [...(c.bouquets as Bouquet[]), updated],
                  };
                }
              }
              // Update bouquet in any collection where it exists
              const bouquetIndex = (c.bouquets as Bouquet[]).findIndex(
                (b) => b._id === bouquetId
              );
              if (bouquetIndex >= 0) {
                const collectionBouquets = [...(c.bouquets as Bouquet[])];
                collectionBouquets[bouquetIndex] = updated;
                return { ...c, bouquets: collectionBouquets };
              }
              return c;
            });

            return {
              ...prev,
              bouquets: updatedBouquets,
              collections: updatedCollections,
              // Update selected bouquet to reflect changes - STAY IN EDIT VIEW
              selectedBouquet: prev.selectedBouquet?._id === bouquetId ? updated : prev.selectedBouquet,
              // DO NOT navigate back - let user continue editing or manually go back
            };
          });

          // DO NOT auto-navigate back - let user decide when to go back
          // This provides better UX and prevents accidental navigation
        }
      
      return success;
    } catch (err: unknown) {
      // Enhanced: Better error handling
      console.error("Failed to save bouquet:", err);
      const errorMessage = err instanceof Error ? err.message : "Gagal menyimpan bouquet";
      alert(`Error: ${errorMessage}. Silakan coba lagi.`);
      return false;
    }
  };

  render(): React.ReactNode {
    const { currentView, selectedCollectionId, selectedBouquet, collections, bouquets } =
      this.state;

    // Enhanced: Find selected collection and ensure it has the latest bouquets
    let selectedCollection = collections.find(
      (c) => c._id === selectedCollectionId
    );
    
    // Enhanced: If collection found, ensure it has bouquets assigned
    // ALWAYS re-sync bouquets from state (which should be synced from props) to ensure data is up-to-date
    // Use both state.bouquets (synced) and props.bouquets (source of truth) for maximum accuracy
    if (selectedCollection && selectedCollection.name) {
      const collectionName = selectedCollection.name.trim();
      
      // Use props.bouquets as primary source (most up-to-date), fallback to state.bouquets
      const sourceBouquets = this.props.bouquets && this.props.bouquets.length > 0 
        ? this.props.bouquets 
        : bouquets;
      
      // Always find bouquets by collectionName to ensure accuracy
      // This handles cases where bouquets might not be properly assigned
      const collectionBouquets = sourceBouquets.filter(b => {
        const bouquetCollectionName = (b.collectionName || "Uncategorized").trim();
        // Try exact match first
        if (bouquetCollectionName === collectionName) {
          return true;
        }
        // Try case-insensitive match
        return bouquetCollectionName.toLowerCase() === collectionName.toLowerCase();
      });
      
      // Update selectedCollection with found bouquets (always update to ensure accuracy)
      selectedCollection = {
        ...selectedCollection,
        bouquets: collectionBouquets,
      };
    }

    // Enhanced: Add loading state handling
    if (collections.length === 0 && this.props.collections.length === 0) {
      return (
        <div className="bouquetEditorSection bouquetEditorSection--loading" aria-label="Loading collections">
          <div className="bouquetEditorSection__spinner" aria-hidden="true"></div>
          <p className="bouquetEditorSection__loadingText">Memuat koleksi...</p>
        </div>
      );
    }

    // Note: Don't block UI for operations - show loading indicator in CollectionDetailView instead
    // This allows user to see the UI while operations are in progress

    switch (currentView) {
      case "collections":
        return (
          <div className="bouquetEditorSection">
            <CollectionListView
              collections={collections}
              onCollectionSelect={this.handleCollectionSelect}
              onCollectionUpdate={this.handleCollectionUpdate}
              onCollectionDelete={this.handleCollectionDelete}
            />
          </div>
        );

      case "collection-detail":
        if (!selectedCollection) {
          // Enhanced: Handle missing collection gracefully with auto-redirect
          // Use setTimeout to allow render cycle to complete
          setTimeout(() => {
            this.handleBackToCollections();
          }, 0);
          return (
            <div className="bouquetEditorSection bouquetEditorSection--loading" aria-label="Redirecting">
              <div className="bouquetEditorSection__spinner" aria-hidden="true"></div>
              <p className="bouquetEditorSection__loadingText">Koleksi tidak ditemukan. Mengalihkan...</p>
            </div>
          );
        }
        
        // Enhanced: Ensure bouquets are properly assigned to selected collection
        // Always get bouquets from the updated selectedCollection (which should be normalized in render)
        const collectionBouquets = (selectedCollection.bouquets as Bouquet[]) || [];
        
        return (
          <div className="bouquetEditorSection">
            <CollectionDetailView
              collection={selectedCollection}
              bouquets={collectionBouquets}
              allCollections={collections}
              onBack={this.handleBackToCollections}
              onBouquetSelect={this.handleBouquetSelect}
              onBouquetMove={this.handleBouquetMove}
              onBouquetDelete={this.handleBouquetDelete}
              onBouquetDuplicate={this.handleBouquetDuplicate}
            />
          </div>
        );

      case "bouquet-edit":
        if (!selectedBouquet) {
          // Enhanced: Handle missing bouquet gracefully with auto-redirect
          // Use setTimeout to allow render cycle to complete
          setTimeout(() => {
            this.handleBackToCollectionDetail();
          }, 0);
          return (
            <div className="bouquetEditorSection bouquetEditorSection--loading" aria-label="Redirecting">
              <div className="bouquetEditorSection__spinner" aria-hidden="true"></div>
              <p className="bouquetEditorSection__loadingText">Bouquet tidak ditemukan. Mengalihkan...</p>
            </div>
          );
        }
        return (
          <div className="bouquetEditorSection">
            <BouquetEditForm
              bouquet={selectedBouquet}
              collections={collections}
              onSave={this.handleBouquetSave}
              onBack={this.handleBackToCollectionDetail}
            />
          </div>
        );

      default:
        // Enhanced: Handle unknown view state gracefully with auto-redirect
        setTimeout(() => {
          this.setState({
            currentView: "collections",
            selectedCollectionId: null,
            selectedBouquet: null,
          });
        }, 0);
        return (
          <div className="bouquetEditorSection bouquetEditorSection--loading" aria-label="Redirecting">
            <div className="bouquetEditorSection__spinner" aria-hidden="true"></div>
            <p className="bouquetEditorSection__loadingText">View tidak dikenal. Mengalihkan ke daftar koleksi...</p>
          </div>
        );
    }
  }
}
