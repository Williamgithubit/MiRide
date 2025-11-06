import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

// https://vitejs.dev/config/
export default defineConfig({
  base: "/",
  plugins: [
    react({
      // Enable the new JSX transform
      jsxImportSource: "react",
      // Fast Refresh is enabled by default in Vite
    }),
    tailwindcss(),
  ],
  resolve: {
    extensions: [".mjs", ".js", ".ts", ".jsx", ".tsx", ".json"],
    alias: [{ find: "@", replacement: "/src" }],
  },
  optimizeDeps: {
    exclude: ["lucide-react"],
    include: ["react", "react-dom", "react-router-dom"],
    esbuildOptions: {
      // Enable esbuild's automatic JSX handling
      jsx: "automatic",
    },
  },
  build: {
    outDir: "dist",
    chunkSizeWarningLimit: 2000, // Set chunk size warning limit to 2000 kB
    rollupOptions: {
      output: {
        manualChunks: {
          // Put React and related packages in a separate chunk
          "react-vendor": [
            "react",
            "react-dom",
            "react-router-dom",
            "react-router",
          ],
          // UI libraries in a separate chunk
          "ui-vendor": [
            "react-hot-toast",
            "react-toastify",
            "react-modal",
            "@headlessui/react",
            "@mui/material",
            "@mui/icons-material",
            "@emotion/react",
            "@emotion/styled",
          ],
          // Data fetching and state management
          "data-vendor": ["axios", "@tanstack/react-query"],
        },
      },
    },
  },
  server: {
    port: Number(process.env.PORT) || 4000,
    host: true,
    // only fail if the specified port is occupied when strictPort is true
    strictPort: false,
    proxy: {
      "/api": {
        target: "http://localhost:3000",
        changeOrigin: true,
        secure: false,
      },
      "/uploads": {
        target: "http://localhost:3000",
        changeOrigin: true,
        secure: false,
      },
    },
  },
});
