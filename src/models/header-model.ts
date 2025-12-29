/**
 * Header Model
 * Defines state interfaces and initial values for the Header component
 */

export interface HeaderState {
  mobileOpen: boolean;
  searchOpen: boolean;
  collectionsOpen: boolean;
  collectionsAnimate: boolean;
  scrolled: boolean;
  collectionNames: string[];
  typeNames: string[];
}

/**
 * Initial state for Header
 */
export const INITIAL_HEADER_STATE: HeaderState = {
  mobileOpen: false,
  searchOpen: false,
  collectionsOpen: false,
  collectionsAnimate: false,
  scrolled: false,
  collectionNames: [],
  typeNames: [],
};

