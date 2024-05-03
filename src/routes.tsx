import { createBrowserRouter } from "react-router-dom";
import Auth from "./features/AuthLogin/index";
import Dashboard from "./features/Dashboard";
import Timeline from "./features/Timeline";
import CreatePost from "./features/Post/CreatePostForm";
import { ProtectedRoute } from "./utils/ProtectedRoute";

const ProtectedRoutes = (Component) => {
  return (
    <ProtectedRoute>
      <Dashboard>
        <Component />
      </Dashboard>
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
    element: ProtectedRoutes(Timeline),
  },
  {
    path: "/dashboard/create-post",
    element: ProtectedRoutes(CreatePost),
  },
]);

export default router;
