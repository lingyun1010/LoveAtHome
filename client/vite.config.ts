import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig(({ mode }) => {
  const isPagesPreview = mode === "pages";

  return {
    base: isPagesPreview ? "/LoveAtHome/" : "/",
    plugins: [
      react(),
      {
        name: "pages-preview-noindex",
        transformIndexHtml(html) {
          return isPagesPreview
            ? html.replace("<meta name=\"theme-color\"", "<meta name=\"robots\" content=\"noindex,nofollow\" />\n    <meta name=\"theme-color\"")
            : html;
        },
      },
    ],
    server: {
      port: 5173,
      proxy: { "/api": "http://localhost:3001" },
    },
  };
});
