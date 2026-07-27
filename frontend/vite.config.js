// // vite.config.js
// import { defineConfig, loadEnv  } from "vite";
// import react from "@vitejs/plugin-react";

// export default defineConfig({
//   plugins: [react()],
//   server: {
//     proxy: {
//       "/api": {
//         target: "http://localhost:5000",
//         changeOrigin: true,
//         secure: false,
//         host: "0.0.0.0",
//         port: 5173,
//       },
//     },
//   },
// });
import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd());

  return {
    plugins: [react()],
    server: {
      host: "0.0.0.0",
      port: 5173,
      cors: true,
      proxy: {
        "/api": {
          target: env.VITE_API_TARGET || "http://localhost:5000",
          changeOrigin: true,
          secure: false,
        },
        "/uploads": {
          target: env.VITE_API_TARGET || "http://localhost:5000",
          changeOrigin: true,
          secure: false,
        },
      },
    },
  };
});
