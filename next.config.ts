import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: false, // Swagger UI 경고 방지
  // Allow dev requests from local network (useful when accessing the dev server
  // from another device on the LAN). Update the origin/port as needed.
};

export default nextConfig;
