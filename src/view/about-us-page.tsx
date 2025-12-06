import React, { Component } from "react";
import "../styles/AboutUsPage.css";
import { AboutUsContent } from "../models/about-us-model";

interface AboutUsViewProps {
  content: AboutUsContent;
}

class AboutUsView extends Component<AboutUsViewProps> {
  renderIntro(): React.ReactNode {
    return <p className="intro">{this.props.content.intro}</p>;
  }

  renderSection(title: string, content: React.ReactNode): React.ReactNode {
    return (
      <section className="about-section">
        <h2>{title}</h2>
        {content}
      </section>
    );
  }

  renderStory(): React.ReactNode {
    return this.renderSection(
      "🌸 Our Story",
      <p>{this.props.content.story}</p>
    );
  }

  renderValues(): React.ReactNode {
    const { title, items } = this.props.content.values;
    return this.renderSection(
      title,
      <ul>
        {items.map((item, index) => (
          <li key={index} dangerouslySetInnerHTML={{ __html: item }} />
        ))}
      </ul>
    );
  }

  renderClosing(): React.ReactNode {
    return this.renderSection(
      "🤝 Let's Grow Together",
      <p>{this.props.content.closing}</p>
    );
  }

  render(): React.ReactNode {
    return (
      <main className="about-page">
        <div className="about-container">
          <h1>About Us</h1>
          {this.renderIntro()}
          {this.renderStory()}
          {this.renderValues()}
          {this.renderClosing()}
        </div>
      </main>
    );
  }
}

export default AboutUsView;
