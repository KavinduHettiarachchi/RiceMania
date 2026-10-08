import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  images: {
    // Uploads are served from /public/uploads (same origin, no config needed).
    // These allow an admin to paste a hosted image URL instead of uploading.
    remotePatterns: [
      { protocol: "https", hostname: "**" },
    ],
  },
};

export default nextConfig;
