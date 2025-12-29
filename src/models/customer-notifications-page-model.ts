/**
 * Customer Notifications Page Model
 * Defines data structures and types for the customer notifications page
 */

/**
 * Notification Settings
 */
export interface NotificationSettings {
  email: {
    orders: boolean;
    promotions: boolean;
    updates: boolean;
  };
  push: {
    orders: boolean;
    promotions: boolean;
    updates: boolean;
  };
  sms: {
    orders: boolean;
    promotions: boolean;
  };
}

/**
 * Notifications Page State
 */
export interface NotificationsPageState {
  settings: NotificationSettings;
  isLoading: boolean;
  isSaving: boolean;
  isAuthenticated: boolean;
  showSuccess: boolean;
}

/**
 * Initial Notification Settings
 */
export const INITIAL_NOTIFICATION_SETTINGS: NotificationSettings = {
  email: {
    orders: true,
    promotions: true,
    updates: true,
  },
  push: {
    orders: true,
    promotions: false,
    updates: true,
  },
  sms: {
    orders: true,
    promotions: false,
  },
};

/**
 * Initial Notifications Page State
 */
export const INITIAL_NOTIFICATIONS_PAGE_STATE: NotificationsPageState = {
  settings: INITIAL_NOTIFICATION_SETTINGS,
  isLoading: true,
  isSaving: false,
  isAuthenticated: false,
  showSuccess: false,
};

/**
 * Notifications Page SEO Data
 */
export interface NotificationsPageSeoData {
  title: string;
  description: string;
  path: string;
}

/**
 * Default SEO data for notifications page
 */
export const DEFAULT_NOTIFICATIONS_PAGE_SEO: NotificationsPageSeoData = {
  title: "Pengaturan Notifikasi | Giftforyou.idn",
  description: "Kelola preferensi notifikasi Anda.",
  path: "/customer/notifications",
};

