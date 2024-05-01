import { createBrowserRouter } from "react-router-dom";
import Auth from "./features/AuthLogin/index";
import Dashboard from "./features/Dashboard";
import { ProtectedRoute } from "./utils/ProtectedRoute";

const ProtectedRoutes = (Component) => {
  return (
    <ProtectedRoute>
      <Component />
    </ProtectedRoute>
  );
};

const router = createBrowserRouter([
  {
    path: "/",
    element: <Auth />,
  },
  {
    path: "/dashboard",
    element: ProtectedRoutes(Dashboard),
  },
]);

export default router;
