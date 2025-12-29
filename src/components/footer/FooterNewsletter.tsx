import React, { useState, FormEvent } from "react";
import "../../styles/footer/FooterNewsletter.css";

const FooterNewsletter: React.FC = () => {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "success" | "error">("idle");

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (email && email.includes("@")) {
      setStatus("success");
      setEmail("");
      setTimeout(() => setStatus("idle"), 3000);
    } else {
      setStatus("error");
      setTimeout(() => setStatus("idle"), 3000);
    }
  };

  return (
    <div className="footer-newsletter">
      <form onSubmit={handleSubmit} className="footer-newsletter__form">
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Langganan newsletter"
          className="footer-newsletter__input"
          aria-label="Alamat email untuk newsletter"
          required
        />
        <button
          type="submit"
          className="footer-newsletter__button"
          aria-label="Langganan"
        >
          Langganan
        </button>
      </form>
      {status === "success" && (
        <p
          className="footer-newsletter__message footer-newsletter__message--success"
          role="status"
          aria-live="polite"
        >
          Berhasil berlangganan!
        </p>
      )}
      {status === "error" && (
        <p
          className="footer-newsletter__message footer-newsletter__message--error"
          role="alert"
        >
          Email tidak valid
        </p>
      )}
    </div>
  );
};

export default FooterNewsletter;

