import React from "react";
import { useLocation } from "react-router-dom";

import BouquetCatalogController from "../controllers/bouquet-catalog-page-controller";

const BouquetCatalogRoute: React.FC = () => {
  const location = useLocation();
  return <BouquetCatalogController locationSearch={location.search ?? ""} />;
};

export default BouquetCatalogRoute;
