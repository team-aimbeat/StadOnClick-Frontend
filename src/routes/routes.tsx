import { lazy } from "react";
import AppLayout from "@/components/Layout/AppLayout";
import SignUp from "@/pages/user-onboarding/SignUp";

const Try = lazy(() => import("@/pages/try"));

const routes = [
  // Public route (NO layout, NO skeleton)
  {
    path: "/",
    element: <SignUp />,
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
