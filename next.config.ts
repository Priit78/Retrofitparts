import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Cache Components stays off: the site is fully static, and `dynamicParams = false`
  // (404 for unknown locales and products) is not available with it.
  experimental: {
    globalNotFound: true,
  },
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
  async redirects() {
    return [{ source: "/", destination: "/et", permanent: false }];
  },
};

export default nextConfig;
