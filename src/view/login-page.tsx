import React, { Component } from "react";
import "../styles/LoginPage.css";
import { setSeo } from "../utils/seo";

interface Props {
  username: string;
  password: string;
  error: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onSubmit: (e: React.FormEvent) => void;
  loading?: boolean;
}

class LoginView extends Component<Props> {
  componentDidMount(): void {
    setSeo({
      title: "Admin Login | Giftforyou.idn",
      description: "Administrator login for Giftforyou.idn.",
      path: "/login",
      noIndex: true,
    });
  }

  render(): React.ReactNode {
    const { username, password, error, onChange, onSubmit, loading } =
      this.props;

    return (
      <div className="loginPage">
        <form
          className="loginCard"
          onSubmit={onSubmit}
          aria-busy={loading ? "true" : "false"}
        >
          <header className="loginHeader">
            <img
              src="/images/logo.png"
              alt="Giftforyou.idn"
              className="loginLogo"
              loading="lazy"
            />
            <h1 className="loginTitle">Admin Sign In</h1>
            <p className="loginSubtitle">
              Secure access for store administrators
            </p>
          </header>

          {error && (
            <div className="loginError" role="alert" id="login-error">
              {error}
            </div>
          )}

          <div className="loginField">
            <label htmlFor="username">Username</label>
            <input
              id="username"
              type="text"
              name="username"
              value={username}
              onChange={onChange}
              placeholder="Enter username"
              autoComplete="username"
              required
              disabled={!!loading}
              aria-invalid={!!error}
              aria-describedby={error ? "login-error" : undefined}
            />
          </div>

          <div className="loginField">
            <label htmlFor="password">Password</label>
            <input
              id="password"
              type="password"
              name="password"
              value={password}
              onChange={onChange}
              placeholder="Enter password"
              autoComplete="current-password"
              required
              disabled={!!loading}
              aria-invalid={!!error}
              aria-describedby={error ? "login-error" : undefined}
            />
          </div>

          <button type="submit" className="loginButton" disabled={!!loading}>
            {loading ? "Signing in..." : "Sign In"}
          </button>

          <p className="loginHint">Having trouble? Contact the store owner.</p>
        </form>
      </div>
    );
  }
}

export default LoginView;
