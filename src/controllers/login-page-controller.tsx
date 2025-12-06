import React, { Component } from "react";
import { LoginState } from "../models/login-page-model";
import LoginView from "../view/login-page";

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
    this.setState((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const { username, password } = this.state;

    if (!username || !password) {
      this.setState({ error: "Please enter both username and password." });
      return;
    }

    this.setState({ loading: true, error: "" });

    try {
      const response = await fetch(
        `${
          process.env.REACT_APP_API_URL || "http://localhost:4000"
        }/api/users/login`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ username, password }),
        }
      );

      let data;
      try {
        data = await response.json();
      } catch {
        this.setState({ error: "Invalid server response.", loading: false });
        return;
      }

      if (!response.ok) {
        this.setState({ error: data.error || "Login failed", loading: false });
      } else {
        console.log("✅ Login successful:", data);

        if (data.token) {
          localStorage.setItem("authToken", data.token);
          localStorage.setItem("lastActivity", Date.now().toString());
        }

        this.setState({ error: "", loading: false });
        window.location.href = "/dashboard";
      }
    } catch (err) {
      this.setState({
        error: "Server error. Please try again later.",
        loading: false,
      });
    }
  };

  handleLogout = () => {
    localStorage.removeItem("authToken");
    localStorage.removeItem("lastActivity");
    window.location.href = "/login";
  };

  render(): React.ReactNode {
    return (
      <LoginView
        username={this.state.username}
        password={this.state.password}
        error={this.state.error}
        onChange={this.handleChange}
        onSubmit={this.handleSubmit}
        onLogout={this.handleLogout}
        loading={this.state.loading}
      />
    );
  }
}

export default LoginController;
