

// Dashboards

// const Analytics = lazy(() => import("../pages/Analytics"));

// // Apps
// const Orders = lazy(() => import("../pages/Apps/Orders"));
// const Users = lazy(() => import("../pages/Apps/Users"));
// const Calendar = lazy(() => import("../pages/Apps/Calendar"));

// // Components
// const Cards = lazy(() => import("../pages/Components/Cards"));
// const Tables = lazy(() => import("../pages/Tables"));

// // Auth
// const Login = lazy(() => import("../pages/Authentication/Login"));

// // Others
// const Settings = lazy(() => import("../pages/Settings"));
// const Error404 = lazy(() => import("../pages/Error404"));

const routes = [
  // Dashboard
  {
    path: "/",
    element: <Dashboard />,
  },
//   {
//     path: "/analytics",
//     element: <Analytics />,
//   },

//   // Apps
//   {
//     path: "/orders",
//     element: <Orders />,
//   },
//   {
//     path: "/users",
//     element: <Users />,
//   },
//   {
//     path: "/calendar",
//     element: <Calendar />,
//   },

//   // UI
//   {
//     path: "/cards",
//     element: <Cards />,
//   },
//   {
//     path: "/tables",
//     element: <Tables />,
//   },

//   // Auth
//   {
//     path: "/auth/login",
//     element: <Login />,
//     layout: "blank",
//   },

//   // Settings
//   {
//     path: "/settings",
//     element: <Settings />,
//   },

//   // Error
//   {
//     path: "*",
//     element: <Error404 />,
//     layout: "blank",
//   },
];

export { routes };
