"use client";

const config = {
  server: process.env.NEXT_PUBLIC_SERVER,
  static_server: process.env.NEXT_PUBLIC_STATIC_SERVER,
  location: process.env.NEXT_APP_LOCATION,
  spotify_client_id: process.env.NEXT_PUBLIC_SPOTIFY_CLIENT_ID,
};

export default config;