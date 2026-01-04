/**
 * Header Model
 * Defines data structures and types for header component
 * Following SOLID, OOP, DRY principles
 */

export interface NavItem {
  label: string;
  path: string;
  icon?: string;
  isDropdown?: boolean;
  children?: NavItem[];
}

export interface HeaderState {
  mobileOpen: boolean;
  searchOpen: boolean;
  collectionsOpen: boolean;
  collectionsAnimate: boolean;
  query: string;
  scrolled: boolean;
  collectionNames: string[];
  typeNames: string[];
  cartCount: number;
}

export interface HeaderProps {
  navLinks: NavItem[];
  logoSrc?: string;
}

export interface SearchSuggestion {
  label: string;
  value: string;
  type: 'collection' | 'type' | 'popular';
}

export interface CollectionDropdownData {
  collections: string[];
  types: string[];
}

export const DEFAULT_HEADER_STATE: HeaderState = {
  mobileOpen: false,
  searchOpen: false,
  collectionsOpen: false,
  collectionsAnimate: false,
  query: '',
  scrolled: false,
  collectionNames: [],
  typeNames: [],
  cartCount: 0,
};

