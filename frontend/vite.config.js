import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { VitePWA } from "vite-plugin-pwa";

export default defineConfig({

  plugins: [

    react(),

    VitePWA({

      registerType: "autoUpdate",

      includeAssets: [
        "pwa-192x192.png",
        "pwa-512x512.png"
      ],

      manifest: {

        name: "Prescripto - Doctor Appointment",

        short_name: "Prescripto",

        description:
          "Book doctor appointments, manage schedules, make payments and get AI-assisted healthcare guidance.",

        theme_color: "#5f6FFF",

        background_color: "#ffffff",

        display: "standalone",

        orientation: "portrait",

        start_url: "/",

        scope: "/",

        icons: [

          {
            src: "/pwa-192x192.png",
            sizes: "192x192",
            type: "image/png"
          },

          {
            src: "/pwa-512x512.png",
            sizes: "512x512",
            type: "image/png"
          },

          {
            src: "/pwa-512x512.png",
            sizes: "512x512",
            type: "image/png",
            purpose: "maskable"
          }

        ]

      },

      workbox: {

        navigateFallback: "/index.html",

        globPatterns: [
          "**/*.{js,css,html,ico,png,svg,jpg,jpeg,webp}"
        ]

      }

    })

  ],

  server: {
    port: 5173
  }

});