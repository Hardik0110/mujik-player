import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import fs from "fs";

export default defineConfig(({ mode }) => ({
  server: {
    host: "192.168.1.16",
    port: 5174,
    https: {
      key: fs.readFileSync("./.certificates/key.pem"),
      cert: fs.readFileSync("./.certificates/cert.pem"),
    },
    strictPort: true, // This ensures Vite uses exactly port 5174
  },
  preview: {
    port: 5174,
    https: {
      key: fs.readFileSync("./.certificates/key.pem"),
      cert: fs.readFileSync("./.certificates/cert.pem"),
    },
  },
  plugins: [
    react(),
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
}));
