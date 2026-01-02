/**
 * Customer Notifications Page Controller
 * OOP-based controller for managing customer notifications page state and operations
 * Extends BaseController for common functionality (SOLID, DRY)
 */

import React from "react";
import { getAccessToken } from "../utils/auth-utils";
import {
  type NotificationsPageState,
  type NotificationSettings,
  INITIAL_NOTIFICATIONS_PAGE_STATE,
  DEFAULT_NOTIFICATIONS_PAGE_SEO,
} from "../models/customer-notifications-page-model";
import { BaseController, type BaseControllerProps, type BaseControllerState, type SeoConfig } from "./base/BaseController";
import CustomerNotificationsPageView from "../view/customer-notifications-page";

interface CustomerNotificationsPageControllerProps extends BaseControllerProps {
  // Add any props if needed in the future
}

/**
 * Customer Notifications Page Controller Class
 * Manages all business logic and notification settings operations
 * Extends BaseController to avoid code duplication
 */
export class CustomerNotificationsPageController extends BaseController<
  CustomerNotificationsPageControllerProps,
  NotificationsPageState & BaseControllerState
> {
  private successTimeout: NodeJS.Timeout | null = null;

  constructor(props: CustomerNotificationsPageControllerProps) {
    const seoConfig: SeoConfig = {
      defaultSeo: DEFAULT_NOTIFICATIONS_PAGE_SEO,
    };

    super(props, seoConfig);

    this.state = {
      ...this.state,
      ...INITIAL_NOTIFICATIONS_PAGE_STATE,
    };
  }

  /**
   * Load notification settings
   */
  private loadSettings = (): void => {
    try {
      const saved = localStorage.getItem("notificationSettings");
      if (saved) {
        const settings = this.safeJsonParse<NotificationSettings>(saved, {} as NotificationSettings);
        this.setState({ settings, isLoading: false });
      } else {
        this.setState({ isLoading: false });
      }
    } catch (error) {
      this.setError(error, "Terjadi kesalahan saat memuat pengaturan notifikasi");
      this.setState({ isLoading: false });
    }
  };

  /**
   * Save notification settings
   */
  private saveSettings = (): void => {
    try {
      localStorage.setItem("notificationSettings", JSON.stringify(this.state.settings));
      this.setState({ showSuccess: true, isSaving: false });
      
      if (this.successTimeout) {
        clearTimeout(this.successTimeout);
      }
      this.successTimeout = setTimeout(() => {
        this.setState({ showSuccess: false });
        this.successTimeout = null;
      }, 3000);
    } catch (error) {
      if (process.env.NODE_ENV === "development") {
        console.error("Failed to save notification settings:", error);
      }
      this.setState({ isSaving: false });
    }
  };

  /**
   * Handle setting change
   */
  handleChange = (category: keyof NotificationSettings, type: string, value: boolean): void => {
    this.setState((prevState) => ({
      settings: {
        ...prevState.settings,
        [category]: {
          ...prevState.settings[category],
          [type]: value,
        },
      },
      showSuccess: false,
      isSaving: true,
    }), () => {
      this.saveSettings();
    });
  };

  /**
   * Component lifecycle: Mount
   * BaseController handles SEO initialization
   */
  componentDidMount(): void {
    super.componentDidMount();
    window.scrollTo({ top: 0, behavior: "smooth" });

    const token = getAccessToken();
    if (!token) {
      this.setState({ isAuthenticated: false, isLoading: false });
      return;
    }

    this.setState({ isAuthenticated: true });
    this.loadSettings();
  }

  /**
   * Component lifecycle: Unmount
   * BaseController handles cleanup
   */
  componentWillUnmount(): void {
    super.componentWillUnmount();
    if (this.successTimeout) {
      clearTimeout(this.successTimeout);
    }
  }

  /**
   * Render view
   */
  render(): React.ReactNode {
    return (
      <CustomerNotificationsPageView
        settings={this.state.settings}
        isLoading={this.state.isLoading}
        isSaving={this.state.isSaving}
        isAuthenticated={this.state.isAuthenticated}
        showSuccess={this.state.showSuccess}
        onSettingChange={this.handleChange}
      />
    );
  }
}

export default CustomerNotificationsPageController;

