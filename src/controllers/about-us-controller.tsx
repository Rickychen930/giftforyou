// src/controllers/AboutUsController.tsx

import React, { Component } from "react";
import { aboutUsContent } from "../models/about-us-model";
import AboutUsView from "../view/about-us-page";

class AboutUsController extends Component {
  render(): React.ReactNode {
    return <AboutUsView content={aboutUsContent} />;
  }
}

export default AboutUsController;
