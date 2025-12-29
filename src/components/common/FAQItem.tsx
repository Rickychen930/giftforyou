/**
 * FAQ Item Component
 * Luxury and responsive FAQ accordion item
 */

import React from "react";
import "../../styles/FAQItem.css";

interface FAQItemProps {
  question: string;
  answer: string;
  isOpen: boolean;
  onToggle: () => void;
  index?: number;
}

/**
 * FAQ Item Component
 * Luxury styled FAQ accordion item
 */
const FAQItem: React.FC<FAQItemProps> = ({
  question,
  answer,
  isOpen,
  onToggle,
  index = 0,
}) => {
  return (
    <div
      className={`faqItem fade-in ${isOpen ? "faqItem--open" : ""}`}
      style={{ animationDelay: `${index * 0.05}s` }}
    >
      <button
        className="faqItem__question"
        onClick={onToggle}
        aria-expanded={isOpen}
      >
        <span className="faqItem__questionText">{question}</span>
        <svg
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className={`faqItem__chevron ${isOpen ? "faqItem__chevron--open" : ""}`}
        >
          <path
            d="M6 9l6 6 6-6"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </button>
      <div className={`faqItem__answer ${isOpen ? "faqItem__answer--open" : ""}`}>
        <div className="faqItem__answerContent">
          <p>{answer}</p>
        </div>
      </div>
    </div>
  );
};

export default FAQItem;

