import React, { Component } from "react";
import "../styles/LoginPage.css";

interface Props {
  username: string;
  password: string;
  error: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onSubmit: (e: React.FormEvent) => void;
  onLogout?: () => void;
  loading?: boolean; // ✅ added
}

class LoginView extends Component<Props> {
  render(): React.ReactNode {
    const { username, password, error, onChange, onSubmit, loading } =
      this.props;

    return (
      <div className="login-page">
        <form className="login-form" onSubmit={onSubmit}>
          <h2>Admin Login 🔒</h2>
          <p className="login-subtitle">For administrators only</p>

          {error && (
            <div className="error-message" role="alert">
              {error}
            </div>
          )}

          <label htmlFor="username">Username</label>
          <input
            id="username"
            type="text"
            name="username"
            value={username}
            onChange={onChange}
            placeholder="adminusername"
            autoComplete="username"
            required
          />

          <label htmlFor="password">Password</label>
          <input
            id="password"
            type="password"
            name="password"
            value={password}
            onChange={onChange}
            placeholder="••••••••"
            autoComplete="current-password"
            required
          />

          <button type="submit" className="login-button" disabled={loading}>
            {loading ? "Logging in…" : "Login"}
          </button>
        </form>
      </div>
    );
  }
}

export default LoginView;
