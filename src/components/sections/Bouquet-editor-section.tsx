import React, { Component } from "react";
import type { Bouquet } from "../../models/domain/bouquet";
import type { Collection } from "../../models/domain/collection";
import "../../styles/BouquetEditorSection.css";
import CollectionListView from "./collection-list-view";
import CollectionDetailView from "./collection-detail-view";
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
}

export default class BouquetEditorSection extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      currentView: "collections",
      selectedCollectionId: null,
      selectedBouquet: null,
      collections: [],
      bouquets: props.bouquets ?? [],
    };
  }

  componentDidMount(): void {
    this.loadCollections();
  }

  componentDidUpdate(prevProps: Props): void {
    if (prevProps.collections !== this.props.collections || prevProps.bouquets !== this.props.bouquets) {
      this.loadCollections();
    }
  }

  private loadCollections = async (): Promise<void> => {
    // If collections is already Collection[], use it
    if (this.props.collections.length > 0 && typeof this.props.collections[0] === "object") {
      this.setState({
        collections: this.normalizeCollections(this.props.collections as Collection[]),
      });
      return;
    }

    // Otherwise, fetch from API
    try {
      const { getAuthHeaders } = require("../../utils/auth-utils");
      const res = await fetch(`${API_BASE}/api/collections`, {
        headers: {
          "Content-Type": "application/json",
          ...getAuthHeaders(),
        },
      });

      if (res.ok) {
        const collections = await res.json();
        this.setState({
          collections: this.normalizeCollections(collections),
        });
      } else {
        // Fallback: create collections from bouquets
        this.setState({
          collections: this.createCollectionsFromBouquets(),
        });
      }
    } catch (err) {
      console.error("Failed to load collections:", err);
      // Fallback: create collections from bouquets
      this.setState({
        collections: this.createCollectionsFromBouquets(),
      });
    }
  };

  private createCollectionsFromBouquets(): Collection[] {
    const collectionMap = new Map<string, Bouquet[]>();
    
    this.props.bouquets.forEach((bouquet) => {
      const collectionName = bouquet.collectionName || "Uncategorized";
      if (!collectionMap.has(collectionName)) {
        collectionMap.set(collectionName, []);
      }
      collectionMap.get(collectionName)!.push(bouquet);
    });

    return Array.from(collectionMap.entries()).map(([name, bouquets], index) => ({
      _id: `collection-${index}`,
      name,
      description: "",
      bouquets,
    }));
  }

  private normalizeCollections(collections: Collection[]): Collection[] {
    return collections.map((c) => {
      let bouquets: Bouquet[] = [];
      
      if (Array.isArray(c.bouquets)) {
        // Check if first item is a string (ObjectId) or object (Bouquet)
        if (c.bouquets.length > 0 && typeof c.bouquets[0] === "string") {
          // It's string[], need to find matching bouquets
          const bouquetIds = c.bouquets as string[];
          bouquets = this.props.bouquets.filter((b) =>
            bouquetIds.includes(b._id)
          );
        } else {
          // It's Bouquet[]
          bouquets = (c.bouquets as unknown[]).filter(
            (b): b is Bouquet =>
              typeof b === "object" && b !== null && "_id" in b
          ) as Bouquet[];
        }
      }
      
      return {
        ...c,
        bouquets,
      };
    });
  }

  private handleCollectionSelect = (collectionId: string): void => {
    this.setState({
      currentView: "collection-detail",
      selectedCollectionId: collectionId,
      selectedBouquet: null,
    });
  };

  private handleBouquetSelect = (bouquet: Bouquet): void => {
    this.setState({
      currentView: "bouquet-edit",
      selectedBouquet: bouquet,
    });
  };

  private handleBackToCollections = (): void => {
    this.setState({
      currentView: "collections",
      selectedCollectionId: null,
      selectedBouquet: null,
    });
  };

  private handleBackToCollectionDetail = (): void => {
    this.setState({
      currentView: "collection-detail",
      selectedBouquet: null,
    });
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
        this.setState((prev) => ({
          ...prev,
          collections: prev.collections.filter((c) => c._id !== collectionId),
          // If deleted collection was selected, go back to collections view
          selectedCollectionId: prev.selectedCollectionId === collectionId ? null : prev.selectedCollectionId,
          currentView: prev.selectedCollectionId === collectionId ? "collections" : prev.currentView,
        }));
      }
      return success;
    }
    return false;
  };

  private handleBouquetMove = async (
    bouquetId: string,
    targetCollectionId: string
  ): Promise<boolean> => {
    if (this.props.onMoveBouquet) {
      const success = await this.props.onMoveBouquet(
        bouquetId,
        targetCollectionId
      );
      if (success) {
        // Update local state
        this.setState((prev) => {
          const bouquet = prev.bouquets.find((b) => b._id === bouquetId);
          if (!bouquet) return prev;

          const targetCollection = prev.collections.find(
            (c) => c._id === targetCollectionId
          );
          const oldCollection = prev.collections.find(
            (c) => (c.bouquets as Bouquet[]).some((b) => b._id === bouquetId)
          );

          const updatedBouquet = {
            ...bouquet,
            collectionName: targetCollection?.name || "",
          };

          return {
            ...prev,
            bouquets: prev.bouquets.map((b) =>
              b._id === bouquetId ? updatedBouquet : b
            ),
            collections: prev.collections.map((c) => {
              if (c._id === targetCollectionId) {
                // Add to target collection
                const existing = (c.bouquets as Bouquet[]).find(
                  (b) => b._id === bouquetId
                );
                if (existing) return c;
                return {
                  ...c,
                  bouquets: [...(c.bouquets as Bouquet[]), updatedBouquet],
                };
              }
              if (c._id === oldCollection?._id) {
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
      }
      return success;
    }

    // Fallback: call API directly
    try {
      const { getAuthHeaders } = require("../../utils/auth-utils");
      const targetCollection = this.state.collections.find(
        (c) => c._id === targetCollectionId
      );
      if (!targetCollection) return false;

      // Find old collection
      const oldCollection = this.state.collections.find((c) =>
        (c.bouquets as Bouquet[]).some((b) => b._id === bouquetId)
      );

      // Remove from old collection
      if (oldCollection && oldCollection._id !== targetCollectionId) {
        const removeRes = await fetch(
          `${API_BASE}/api/collections/${oldCollection._id}/bouquets/${bouquetId}`,
          {
            method: "DELETE",
            headers: {
              "Content-Type": "application/json",
              ...getAuthHeaders(),
            },
          }
        );
        if (!removeRes.ok) {
          console.error("Failed to remove bouquet from old collection");
        }
      }

      // Add to target collection
      const addRes = await fetch(
        `${API_BASE}/api/collections/${targetCollectionId}/bouquets`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            ...getAuthHeaders(),
          },
          body: JSON.stringify({ bouquetId }),
        }
      );

      if (addRes.ok) {
        // Update bouquet's collectionName
        const bouquet = this.state.bouquets.find((b) => b._id === bouquetId);
        if (bouquet) {
          const updateRes = await fetch(
            `${API_BASE}/api/bouquets/${bouquetId}`,
            {
              method: "PUT",
              headers: {
                "Content-Type": "application/json",
                ...getAuthHeaders(),
              },
              body: JSON.stringify({
                collectionName: targetCollection.name,
              }),
            }
          );
          if (updateRes.ok) {
            // Update local state
            this.setState((prev) => {
              const updatedBouquet = {
                ...prev.bouquets.find((b) => b._id === bouquetId)!,
                collectionName: targetCollection.name,
              };
              return {
                ...prev,
                bouquets: prev.bouquets.map((b) =>
                  b._id === bouquetId ? updatedBouquet : b
                ),
                collections: prev.collections.map((c) => {
                  if (c._id === targetCollectionId) {
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
                  if (c._id === oldCollection?._id) {
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
            return true;
          }
        }
      }
      return false;
    } catch (err) {
      console.error("Failed to move bouquet:", err);
      return false;
    }
  };

  private handleBouquetDelete = async (bouquetId: string): Promise<void> => {
    if (this.props.onDelete) {
      try {
        await this.props.onDelete(bouquetId);
        // Update local state
        this.setState((prev) => ({
          ...prev,
          bouquets: prev.bouquets.filter((b) => b._id !== bouquetId),
          collections: prev.collections.map((c) => ({
            ...c,
            bouquets: (c.bouquets as Bouquet[]).filter(
              (b) => b._id !== bouquetId
            ),
          })),
        }));
        // If we're in collection detail view and the collection is now empty, go back
        if (this.state.currentView === "collection-detail") {
          const collection = this.state.collections.find(
            (c) => c._id === this.state.selectedCollectionId
          );
          if (collection && (collection.bouquets as Bouquet[]).length === 0) {
            setTimeout(() => {
              this.handleBackToCollections();
            }, 500);
          }
        }
      } catch (err) {
        console.error("Failed to delete bouquet:", err);
        // Error handling is done in the delete handler
      }
    }
  };

  private handleBouquetDuplicate = async (bouquetId: string): Promise<void> => {
    if (this.props.onDuplicate) {
      try {
        await this.props.onDuplicate(bouquetId);
        // Reload collections to get the new duplicated bouquet
        await this.loadCollections();
      } catch (err) {
        console.error("Failed to duplicate bouquet:", err);
        // Error handling is done in the duplicate handler
      }
    }
  };

  private handleBouquetSave = async (
    formData: FormData
  ): Promise<boolean> => {
    try {
      const success = await this.props.onSave(formData);
      if (success) {
        // Update local state with saved data
        const bouquetId = String(formData.get("_id") ?? "");
        const updatedBouquet = this.state.bouquets.find(
          (b) => b._id === bouquetId
        );
        if (updatedBouquet) {
          // Update from form data
          const name = String(formData.get("name") ?? "");
          const collectionName = String(formData.get("collectionName") ?? "");
          const updated = {
            ...updatedBouquet,
            name,
            collectionName,
          };
          this.setState((prev) => ({
            ...prev,
            bouquets: prev.bouquets.map((b) =>
              b._id === bouquetId ? updated : b
            ),
            collections: prev.collections.map((c) => {
              // Update bouquet in collection if it exists
              const bouquetIndex = (c.bouquets as Bouquet[]).findIndex(
                (b) => b._id === bouquetId
              );
              if (bouquetIndex >= 0) {
                const updatedBouquets = [...(c.bouquets as Bouquet[])];
                updatedBouquets[bouquetIndex] = updated;
                return { ...c, bouquets: updatedBouquets };
              }
              return c;
            }),
          }));
        }
        // Go back to collection detail after successful save
        setTimeout(() => {
          this.handleBackToCollectionDetail();
        }, 500); // Small delay to show success message
      }
      return success;
    } catch (err) {
      console.error("Failed to save bouquet:", err);
      return false;
    }
  };

  render(): React.ReactNode {
    const { currentView, selectedCollectionId, selectedBouquet, collections } =
      this.state;

    const selectedCollection = collections.find(
      (c) => c._id === selectedCollectionId
    );

    switch (currentView) {
      case "collections":
        return (
          <CollectionListView
            collections={collections}
            onCollectionSelect={this.handleCollectionSelect}
            onCollectionUpdate={this.handleCollectionUpdate}
            onCollectionDelete={this.handleCollectionDelete}
          />
        );

      case "collection-detail":
        if (!selectedCollection) {
          this.handleBackToCollections();
          return null;
        }
        return (
          <CollectionDetailView
            collection={selectedCollection}
            bouquets={selectedCollection.bouquets as Bouquet[]}
            allCollections={collections}
            onBack={this.handleBackToCollections}
            onBouquetSelect={this.handleBouquetSelect}
            onBouquetMove={this.handleBouquetMove}
            onBouquetDelete={this.handleBouquetDelete}
            onBouquetDuplicate={this.handleBouquetDuplicate}
          />
        );

      case "bouquet-edit":
        if (!selectedBouquet) {
          this.handleBackToCollectionDetail();
          return null;
        }
        return (
          <BouquetEditForm
            bouquet={selectedBouquet}
            collections={collections}
            onSave={this.handleBouquetSave}
            onBack={this.handleBackToCollectionDetail}
          />
        );

      default:
        return null;
    }
  }
}
