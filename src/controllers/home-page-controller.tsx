import React, { Component } from "react";
import {
  aboutUsContent,
  storeData,
  welcomeContent,
} from "../models/home-page-model";
import WelcomeSection from "../view/sections/welcome-section";
import AboutUsSection from "../view/sections/about-us-section";
import StoreLocationSection from "../view/sections/store-location-section";
import OurCollectionSection from "../view/sections/our-collection-section";
import { ICollection } from "../models/collection-model";

// ✅ Welcome Controller
class WelcomeController extends Component {
  public render(): React.ReactNode {
    return <WelcomeSection content={welcomeContent} />;
  }
}

// ✅ About Us Controller
class AboutUsController extends Component {
  public render(): React.ReactNode {
    return <AboutUsSection content={aboutUsContent} />;
  }
}

// ✅ Store Location Controller
class StoreLocationController extends Component {
  public render(): React.ReactNode {
    return <StoreLocationSection data={storeData} />;
  }
}

// ✅ Our Collection Controller
interface OurCollectionControllerState {
  collections: ICollection[];
}

class OurCollectionController extends Component<
  {},
  OurCollectionControllerState
> {
  constructor(props: {}) {
    super(props);
    this.state = {
      collections: [],
    };
  }

  componentDidMount() {
    fetch("http://localhost:4000/api/collections")
      .then((res) => res.json())
      .then((data: ICollection[]) => {
        this.setState({ collections: data });
      })
      .catch((err) => console.error("Failed to fetch collections", err));
  }

  public render(): React.ReactNode {
    console.log("collection: ", this.state.collections);
    return <OurCollectionSection items={this.state.collections} />;
  }
}

export default {
  AboutUsController,
  WelcomeController,
  StoreLocationController,
  OurCollectionController,
};
