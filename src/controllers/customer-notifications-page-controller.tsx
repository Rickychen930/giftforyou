/**
 * Customer Notifications Page Controller
 * OOP-based controller for managing customer notifications page state and operations
 */

import React, { Component } from "react";
import { getAccessToken } from "../utils/auth-utils";
import { setSeo } from "../utils/seo";
import {
  type NotificationsPageState,
  type NotificationSettings,
  INITIAL_NOTIFICATIONS_PAGE_STATE,
  INITIAL_NOTIFICATION_SETTINGS,
  DEFAULT_NOTIFICATIONS_PAGE_SEO,
} from "../models/customer-notifications-page-model";
import CustomerNotificationsPageView from "../view/customer-notifications-page";

interface CustomerNotificationsPageControllerProps {
  // Add any props if needed in the future
}

/**
 * Customer Notifications Page Controller Class
 * Manages all business logic and notification settings operations
 */
export class CustomerNotificationsPageController extends Component<
  CustomerNotificationsPageControllerProps,
  NotificationsPageState
> {
  private successTimeout: NodeJS.Timeout | null = null;

  constructor(props: CustomerNotificationsPageControllerProps) {
    super(props);
    this.state = { ...INITIAL_NOTIFICATIONS_PAGE_STATE };
  }

  /**
   * Initialize SEO
   */
  private initializeSeo(): void {
    setSeo(DEFAULT_NOTIFICATIONS_PAGE_SEO);
  }

  /**
   * Load notification settings
   */
  private loadSettings = (): void => {
    try {
      const saved = localStorage.getItem("notificationSettings");
      if (saved) {
        const settings = JSON.parse(saved) as NotificationSettings;
        this.setState({ settings, isLoading: false });
      } else {
        this.setState({ isLoading: false });
      }
    } catch (error) {
      if (process.env.NODE_ENV === "development") {
        console.error("Failed to load notification settings:", error);
      }
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
   */
  componentDidMount(): void {
    this.initializeSeo();
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
   */
  componentWillUnmount(): void {
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

