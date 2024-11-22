import ReactDOM from "react-dom/client";
import "bootstrap/dist/css/bootstrap.min.css";

import App from "./App.jsx";

// This is a workaround to allow Cypress to interact with the app state
declare global {
  interface Window {
    __APP_STATE__?: any;
  }
}

if (window.Cypress) {
  // Attach app state to window for testing purposes
  window.__APP_STATE__ = window.__APP_STATE__ || {}; // Initialize a test-only state holder
}

ReactDOM.createRoot(document.getElementById("root")!).render(<App />);
