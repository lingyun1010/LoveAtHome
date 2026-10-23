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
            ? html.replace("index,follow,max-image-preview:large", "noindex,nofollow")
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
