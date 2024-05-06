import { createBrowserRouter } from "react-router-dom";
import Auth from "./features/AuthLogin/index";
import Dashboard from "./features/Dashboard";
import Timeline from "./features/Timeline";
import CreatePost from "./features/Post/CreatePostForm";
import { ProtectedRoute } from "./utils/ProtectedRoute";

const ProtectedRoutes = (element) => {
  return (
    <ProtectedRoute>
      <Dashboard>
        {element}
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
    element: ProtectedRoutes(
      <Timeline>
        <CreatePost />
      </Timeline>
    ),
  },
]);

export default router;
