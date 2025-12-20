// src/controllers/login-controller.tsx

import React, { Component } from "react";
import type { LoginState } from "../models/login-page-model";
import LoginView from "../view/login-page";

import { API_BASE } from "../config/api"; // adjust path depending on folder depth

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
      // ✅ FIXED ENDPOINT
      const response = await fetch(`${API_BASE}/api/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });

      const data = await response
        .json()
        .catch(() => ({ error: "Invalid server response." }));

      if (!response.ok) {
        this.setState({
          error: data?.error || "Login failed. Please check your credentials.",
          loading: false,
        });
        return;
      }

      if (data?.token) {
        localStorage.setItem("authToken", data.token);
        localStorage.setItem("lastActivity", Date.now().toString());
      } else {
        this.setState({
          error: "Login failed: token not returned by server.",
          loading: false,
        });
        return;
      }

      this.setState({ loading: false, error: "" });
      window.location.assign("/dashboard");
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Unknown error";
      this.setState({
        error: `Server error. Please try again later. (${message})`,
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
