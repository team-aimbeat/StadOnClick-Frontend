import { lazy } from "react";
import AppLayout from "@/components/Layout/AppLayout";
import Signup from "@/pages/SignUp";

const Try = lazy(() => import("@/pages/try"));

const routes = [
  // Public route (NO layout, NO skeleton)
  {
    path: "/",
    element: <Signup />,
  },

  // Routes WITH layout + skeleton
  {
    element: <AppLayout />,
    children: [
      {
        path: "/try",
        element: <Try />,
      },
    ],
  },
];

export { routes };
