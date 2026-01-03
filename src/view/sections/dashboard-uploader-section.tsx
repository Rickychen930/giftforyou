import React, { Component } from "react";
import { BouquetUploaderController } from "../../controllers/bouquet-uploader-controller";

interface Props {
  onUpload: (formData: FormData) => Promise<boolean>;
}

/**
 * Dashboard Uploader Section (Main Entry Point)
 * Follows OOP and SOLID principles:
 * - Single Responsibility: Only connects Controller and View
 * - Open/Closed: Extensible through props
 * - Dependency Inversion: Depends on Controller abstraction
 * Enhanced with performance optimizations and proper integration
 */
class DashboardUploaderSection extends Component<Props> {
  // Performance: Prevent unnecessary re-renders
  shouldComponentUpdate(nextProps: Props): boolean {
    // Only update if onUpload handler changed
    return nextProps.onUpload !== this.props.onUpload;
  }

  render(): React.ReactNode {
    return (
      <BouquetUploaderController onUpload={this.props.onUpload} />
    );
  }
}

export default DashboardUploaderSection;
