/**
 * withRouter HOC for class components
 * Provides navigate function similar to useNavigate hook
 */

import React from "react";
import {
  useLocation,
  useNavigate,
  useParams,
  Location,
  NavigateFunction,
  Params,
} from "react-router-dom";

export interface WithRouterProps {
  location: Location;
  navigate: NavigateFunction;
  params: Readonly<Params<string>>;
}

export function withRouter<P extends object>(
  Component: React.ComponentType<P & WithRouterProps>
): React.ComponentType<P> {
  const ComponentWithRouter = (props: P) => {
    const location = useLocation();
    const navigate = useNavigate();
    const params = useParams();

    return (
      <Component
        {...props}
        location={location}
        navigate={navigate}
        params={params}
      />
    );
  };
  ComponentWithRouter.displayName = `withRouter(${
    Component.displayName || Component.name || "Component"
  })`;
  return ComponentWithRouter;
}

