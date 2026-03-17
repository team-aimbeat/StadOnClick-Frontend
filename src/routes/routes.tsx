import { lazy } from "react";
import AppLayout from "@/components/Layout/AppLayout";
import SignIn from "@/pages/user-onboarding/SignIn";
import SignUp from "@/pages/user-onboarding/SignUp";

const Try = lazy(() => import("@/pages/try"));

const routes = [
  // Public route (NO layout, NO skeleton)
  {
    path: "/",
    element: <SignUp />,
  },
  {
    path: "/sign-in",
    element: <SignIn />,
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
