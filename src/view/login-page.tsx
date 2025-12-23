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
      title: "Login Admin | Giftforyou.idn",
      description: "Halaman login administrator untuk Giftforyou.idn.",
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
            <h1 className="loginTitle">Login Admin</h1>
            <p className="loginSubtitle">
              Akses aman untuk administrator toko
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
              placeholder="Masukkan username"
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
              placeholder="Masukkan password"
              autoComplete="current-password"
              required
              disabled={!!loading}
              aria-invalid={!!error}
              aria-describedby={error ? "login-error" : undefined}
            />
          </div>

          <button type="submit" className="loginButton" disabled={!!loading}>
            {loading ? "Sedang masuk..." : "Masuk"}
          </button>

          <p className="loginHint">Ada kendala? Hubungi pemilik toko.</p>
        </form>
      </div>
    );
  }
}

export default LoginView;
