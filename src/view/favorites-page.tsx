import React, { Component } from "react";
import { Link } from "react-router-dom";
import "../styles/FavoritesPage.css";
import { formatIDR } from "../utils/money";
import { getFavorites, removeFromFavorites, type FavoriteItem } from "../utils/favorites";
import { buildImageUrl } from "../utils/image-utils";

const FALLBACK_IMAGE = "/images/placeholder-bouquet.jpg";

interface FavoritesState {
  favorites: FavoriteItem[];
  isLoading: boolean;
}

class FavoritesPage extends Component<{}, FavoritesState> {
  state: FavoritesState = {
    favorites: [],
    isLoading: true,
  };

  componentDidMount(): void {
    this.loadFavorites();
    window.scrollTo({ top: 0, behavior: "smooth" });

    // Listen for favorites updates
    window.addEventListener("favoritesUpdated", this.loadFavorites);
  }

  componentWillUnmount(): void {
    window.removeEventListener("favoritesUpdated", this.loadFavorites);
  }

  private loadFavorites = (): void => {
    const favorites = getFavorites();
    this.setState({ favorites, isLoading: false });
  };

  private handleRemove = (bouquetId: string): void => {
    removeFromFavorites(bouquetId);
    this.loadFavorites();
  };

  private formatDate = (timestamp: number): string => {
    try {
      const date = new Date(timestamp);
      return date.toLocaleDateString("id-ID", {
        year: "numeric",
        month: "long",
        day: "numeric",
      });
    } catch {
      return "";
    }
  };

  render(): React.ReactNode {
    const { favorites, isLoading } = this.state;

    if (isLoading) {
      return (
        <section className="favPage favPage--loading">
          <div className="favContainer">
            <div className="favLoading">
              <div className="favSpinner"></div>
              <p>Memuat favorit Anda...</p>
            </div>
          </div>
        </section>
      );
    }

    if (favorites.length === 0) {
      return (
        <section className="favPage">
          <div className="favContainer">
            <div className="favEmpty">
              <div className="favEmpty__icon">❤️</div>
              <h1 className="favEmpty__title">Belum Ada Favorit</h1>
              <p className="favEmpty__text">
                Simpan bouquet favorit Anda untuk akses cepat nanti.
              </p>
              <Link to="/collection" className="favEmpty__link btn-luxury">
                Jelajahi Katalog
              </Link>
            </div>
          </div>
        </section>
      );
    }

    return (
      <section className="favPage" aria-labelledby="fav-title">
        <div className="favContainer">
          <div className="favHeader">
            <h1 id="fav-title" className="favHeader__title">
              Favorit Saya
            </h1>
            <p className="favHeader__subtitle">
              {favorites.length} {favorites.length === 1 ? "bouquet" : "bouquets"} tersimpan
            </p>
          </div>

          <div className="favGrid">
            {favorites.map((favorite) => {
              const imageUrl = favorite.bouquetImage
                ? buildImageUrl(favorite.bouquetImage)
                : FALLBACK_IMAGE;

              return (
                <div key={favorite.bouquetId} className="favCard reveal-on-scroll">
                  <Link
                    to={`/bouquet/${favorite.bouquetId}`}
                    className="favCard__link"
                  >
                    <div className="favCard__imageWrapper">
                      <img
                        src={imageUrl}
                        alt={favorite.bouquetName}
                        className="favCard__image"
                        loading="lazy"
                      />
                      <div className="favCard__overlay">
                        <span className="favCard__view">Lihat Detail</span>
                      </div>
                    </div>
                  </Link>

                  <div className="favCard__content">
                    <h3 className="favCard__title">{favorite.bouquetName}</h3>
                    <p className="favCard__price">{formatIDR(favorite.bouquetPrice)}</p>
                    <p className="favCard__date">
                      Ditambahkan {this.formatDate(favorite.addedAt)}
                    </p>
                  </div>

                  <div className="favCard__actions">
                    <Link
                      to={`/bouquet/${favorite.bouquetId}`}
                      className="favCard__btn favCard__btn--primary btn-luxury"
                    >
                      Pesan Sekarang
                    </Link>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.preventDefault();
                        this.handleRemove(favorite.bouquetId);
                      }}
                      className="favCard__btn favCard__btn--remove"
                      aria-label={`Hapus ${favorite.bouquetName} dari favorit`}
                    >
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                        <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="favFooter">
            <Link to="/collection" className="favFooter__link">
              ← Kembali ke Katalog
            </Link>
          </div>
        </div>
      </section>
    );
  }
}

export default FavoritesPage;

