/**
 * FAQ Item Component (OOP)
 * Class-based component following SOLID principles
 * Luxury, elegant, UI/UX clean, effective
 */

import React, { Component } from "react";
import "../../styles/FAQItem.css";

interface FAQItemProps {
  question: string;
  answer: string;
  isOpen: boolean;
  onToggle: () => void;
  index?: number;
}

interface FAQItemState {
  isOpen: boolean;
}

/**
 * FAQ Item Component
 * Class-based component for FAQ accordion items
 * Follows Single Responsibility Principle: handles single FAQ item UI
 */
class FAQItem extends Component<FAQItemProps, FAQItemState> {
  private baseClass: string = "faqItem";

  constructor(props: FAQItemProps) {
    super(props);
    this.state = {
      isOpen: props.isOpen,
    };
  }

  componentDidUpdate(prevProps: FAQItemProps): void {
    if (prevProps.isOpen !== this.props.isOpen) {
      this.setState({ isOpen: this.props.isOpen });
    }
  }

  private getClasses(): string {
    const { isOpen } = this.state;
    const openClass = isOpen ? `${this.baseClass}--open` : "";
    return `${this.baseClass} fade-in ${openClass}`.trim();
  }

  private getStyle(): React.CSSProperties {
    const { index = 0 } = this.props;
    return { 
      animationDelay: `${index * 0.05}s`
    };
  }

  private handleToggle = (): void => {
    this.setState({ isOpen: !this.state.isOpen });
    this.props.onToggle();
  };

  private handleKeyDown = (e: React.KeyboardEvent<HTMLButtonElement>): void => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      this.handleToggle();
    }
  };

  private renderChevron(): React.ReactNode {
    const { isOpen } = this.state;

    return (
      <svg
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={`${this.baseClass}__chevron ${isOpen ? `${this.baseClass}__chevron--open` : ""}`}
        aria-hidden="true"
      >
        <path
          d="M6 9l6 6 6-6"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    );
  }

  render(): React.ReactNode {
    const { question, answer } = this.props;
    const { isOpen } = this.state;
    const questionId = `faq-question-${this.props.index ?? 0}`;
    const answerId = `faq-answer-${this.props.index ?? 0}`;

    return (
      <article className={this.getClasses()} style={this.getStyle()}>
        <button
          type="button"
          className={`${this.baseClass}__question`}
          onClick={this.handleToggle}
          onKeyDown={this.handleKeyDown}
          aria-expanded={isOpen}
          aria-controls={answerId}
          id={questionId}
        >
          <span className={`${this.baseClass}__questionText`}>{question}</span>
          {this.renderChevron()}
        </button>
        <div 
          id={answerId}
          className={`${this.baseClass}__answer ${isOpen ? `${this.baseClass}__answer--open` : ""}`}
          role="region"
          aria-labelledby={questionId}
        >
          <div className={`${this.baseClass}__answerContent`}>
            <p>{answer}</p>
          </div>
        </div>
      </article>
    );
  }
}

export default FAQItem;
