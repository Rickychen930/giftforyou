import React from "react";
import { useLocation, useNavigate } from "react-router-dom";

import BouquetCatalogController from "../controllers/bouquet-catalog-page-controller";

const BouquetCatalogRoute: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  return (
    <BouquetCatalogController
      locationSearch={location.search ?? ""}
      navigate={navigate}
    />
  );
};

export default BouquetCatalogRoute;
