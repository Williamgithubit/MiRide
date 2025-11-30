// src/main.tsx

import React, { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "react-hot-toast";
import { Provider } from "react-redux";

import App from "./App";
import { store } from "./store/store";
import "./index.css";
import "./styles/color-overrides.css";
import "leaflet/dist/leaflet.css";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

// Create a wrapper component without PersistGate since persistence is bypassed
export const AppWithStore = () => {
  return (
    <Provider store={store}>
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>
          <App />
          <Toaster position="top-right" />
        </BrowserRouter>
      </QueryClientProvider>
    </Provider>
  );
};

const root = createRoot(document.getElementById("root") as HTMLElement);

root.render(
  <StrictMode>
    <AppWithStore />
  </StrictMode>
);
