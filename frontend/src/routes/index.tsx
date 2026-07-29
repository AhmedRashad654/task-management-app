import AuthLayout from "@/layouts/AuthLayout";
import DashboardLayout from "@/layouts/DashboardLayout";
import { lazy } from "react";
import {
  createBrowserRouter,
  Navigate,
  RouterProvider,
} from "react-router-dom";
import { GuestRoute, ProtectedRoute } from "./guards";

const SignUp = lazy(() => import("@/features/auth/pages/SignUp"));
const SignIn = lazy(() => import("@/features/auth/pages/SignIn"));
const ForgotPassword = lazy(
  () => import("@/features/auth/pages/ForgotPassword"),
);
const ResetPassword = lazy(() => import("@/features/auth/pages/ResetPassword"));
const ProjectsPage = lazy(() => import("@/features/projects/pages/ProjectsPage"));
const ProjectDetailPage = lazy(() => import("@/features/projects/pages/ProjectDetailPage"));

const Routes = () => {
  const AuthRoutes = [
    {
      path: "/auth",
      element: <GuestRoute />,
      children: [
        {
          element: <AuthLayout />,
          children: [
            {
              index: true,
              element: <Navigate to="sign-in" replace />,
            },
            {
              path: "sign-in",
              element: <SignIn />,
            },
            {
              path: "sign-up",
              element: <SignUp />,
            },
            {
              path: "forgot-password",
              element: <ForgotPassword />,
            },
            {
              path: "reset-password",
              element: <ResetPassword />,
            },
          ],
        },
      ],
    },
  ];

  const ProtectedRoutes = [
    {
      element: <ProtectedRoute />,
      children: [
        {
          element: <DashboardLayout />,
          children: [
            {
              path: "/",
              element: <Navigate to="/projects" replace />,
            },
            {
              path: "/projects",
              element: <ProjectsPage />,
            },
            {
              path: "/projects/:projectId",
              element: <ProjectDetailPage />,
            },
          ],
        },
      ],
    },
  ];

  const errorRoute = {
    path: "*",
    element: <div>Not found</div>,
  };

  const router = createBrowserRouter([
    ...AuthRoutes,
    ...ProtectedRoutes,
    errorRoute,
  ]);

  return <RouterProvider router={router} />;
};

export default Routes;
