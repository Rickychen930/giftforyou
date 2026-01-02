/**
 * Footer Newsletter Component (OOP)
 * Class-based component following SOLID principles
 */

import React, { Component, FormEvent } from "react";
import "../../styles/footer/FooterNewsletter.css";

interface FooterNewsletterState {
  email: string;
  status: "idle" | "success" | "error";
  timeoutId: NodeJS.Timeout | null;
}

/**
 * Footer Newsletter Component
 * Class-based component for newsletter subscription
 */
class FooterNewsletter extends Component<{}, FooterNewsletterState> {
  private baseClass: string = "footer-newsletter";

  constructor(props: {}) {
    super(props);
    this.state = {
      email: "",
      status: "idle",
      timeoutId: null,
    };
  }

  componentWillUnmount(): void {
    if (this.state.timeoutId) {
      clearTimeout(this.state.timeoutId);
    }
  }

  private handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    this.setState({ email: e.target.value });
  };

  private handleSubmit = (e: FormEvent): void => {
    e.preventDefault();
    const { email, timeoutId } = this.state;

    // Clear existing timeout if any
    if (timeoutId) {
      clearTimeout(timeoutId);
    }

    if (email && email.includes("@")) {
      const newTimeoutId = setTimeout(() => {
        this.setState({ status: "idle", timeoutId: null });
      }, 3000);
      this.setState({ status: "success", email: "", timeoutId: newTimeoutId });
    } else {
      const newTimeoutId = setTimeout(() => {
        this.setState({ status: "idle", timeoutId: null });
      }, 3000);
      this.setState({ status: "error", timeoutId: newTimeoutId });
    }
  };

  render(): React.ReactNode {
    const { email, status } = this.state;

    return (
      <div className={this.baseClass}>
        <form onSubmit={this.handleSubmit} className={`${this.baseClass}__form`}>
          <input
            type="email"
            value={email}
            onChange={this.handleEmailChange}
            placeholder="Langganan newsletter"
            className={`${this.baseClass}__input`}
            aria-label="Alamat email untuk newsletter"
            required
          />
          <button
            type="submit"
            className={`${this.baseClass}__button`}
            aria-label="Langganan"
          >
            Langganan
          </button>
        </form>
        {status === "success" && (
          <p
            className={`${this.baseClass}__message ${this.baseClass}__message--success`}
            role="status"
            aria-live="polite"
          >
            Berhasil berlangganan!
          </p>
        )}
        {status === "error" && (
          <p
            className={`${this.baseClass}__message ${this.baseClass}__message--error`}
            role="alert"
          >
            Email tidak valid
          </p>
        )}
      </div>
    );
  }
}

export default FooterNewsletter;
