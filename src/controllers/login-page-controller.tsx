// src/controllers/login-controller.tsx

import React, { Component } from "react";
import type { LoginState } from "../models/login-page-model";
import LoginView from "../view/login-page";
import { API_BASE } from "../config/api";
import { setTokens } from "../utils/auth-utils";

type LoginField = "username" | "password";

class LoginController extends Component<{}, LoginState> {
  constructor(props: {}) {
    super(props);
    this.state = {
      username: "",
      password: "",
      error: "",
      loading: false,
    };
  }

  handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;

    if (name === "username" || name === "password") {
      const field = name as LoginField;
      this.setState({ [field]: value } as Pick<LoginState, LoginField>);
    }
  };

  handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const username = this.state.username.trim();
    const password = this.state.password;

    if (!username || !password) {
      this.setState({ error: "Please enter both username and password." });
      return;
    }

    this.setState({ loading: true, error: "" });

    try {
      const response = await fetch(`${API_BASE}/api/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });

      // Parse response first (before checking status)
      let data: any;
      try {
        const text = await response.text();
        data = text ? JSON.parse(text) : {};
      } catch (parseErr) {
        console.error("Failed to parse response:", parseErr);
        this.setState({
          error: "Invalid server response. Please try again.",
          loading: false,
        });
        return;
      }

      // Check response status
      if (!response.ok) {
        const errorMessage = data?.error || response.statusText || "Login failed. Please check your credentials.";
        this.setState({
          error: errorMessage,
          loading: false,
        });
        return;
      }

      // Extract tokens - support multiple formats
      const accessToken = data?.token || data?.accessToken;
      const refreshToken = data?.refreshToken;

      if (!accessToken) {
        // Log full response for debugging
        console.error("Login response missing token. Full response:", {
          status: response.status,
          statusText: response.statusText,
          data,
          headers: Object.fromEntries(response.headers.entries()),
        });
        this.setState({
          error: data?.error || "Login failed: token not returned by server. Please contact support.",
          loading: false,
        });
        return;
      }

      // Store tokens (refreshToken is optional for backward compatibility)
      setTokens(accessToken, refreshToken || "");

      // Success - redirect to dashboard
      this.setState({ loading: false, error: "" });
      
      // Use replace instead of assign to prevent back button issues
      window.location.replace("/dashboard");
    } catch (err: unknown) {
      console.error("Login error:", err);
      const message = err instanceof Error ? err.message : "Unknown error";
      this.setState({
        error: `Network error. Please check your connection and try again.`,
        loading: false,
      });
    }
  };

  render(): React.ReactNode {
    return (
      <LoginView
        username={this.state.username}
        password={this.state.password}
        error={this.state.error}
        loading={this.state.loading}
        onChange={this.handleChange}
        onSubmit={this.handleSubmit}
      />
    );
  }
}

export default LoginController;
