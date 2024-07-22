import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.tsx";
import { VideoClientProvider } from "./components/VideoClientContext";
const rootElement = document.getElementById("root");
if (rootElement) {
  const root = ReactDOM.createRoot(rootElement);
  root.render(
    <VideoClientProvider>
      <React.StrictMode>
        <App />
      </React.StrictMode>
    </VideoClientProvider>
  );
}
