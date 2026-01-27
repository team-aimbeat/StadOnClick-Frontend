import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import "react-perfect-scrollbar/dist/css/styles.css";
import App from "./App";
import { Provider } from "react-redux";
import { store } from "./app/store";
import "leaflet/dist/leaflet.css";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <Provider store={store}>
      <App />
    </Provider>
  </StrictMode>
);
