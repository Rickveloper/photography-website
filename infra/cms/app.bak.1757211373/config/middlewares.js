"use strict";

module.exports = [
  "strapi::errors",
  {
    name: "strapi::cors",
    config: {
      origin: (
        process.env.CMS_CORS_ORIGINS ||
        "http://localhost:3000,http://localhost:5500"
      ).split(","),
      headers: ["Content-Type", "Authorization", "Origin", "Accept"],
      keepHeaderOnError: true,
      credentials: false,
      methods: ["GET", "HEAD", "OPTIONS"],
    },
  },
  "strapi::security",
  "strapi::poweredBy",
  "strapi::logger",
  "strapi::query",
  "strapi::body",
  "strapi::session",
  "strapi::favicon",
  "strapi::public",
];
