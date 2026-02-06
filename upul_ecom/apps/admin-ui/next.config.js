//@ts-check

// eslint-disable-next-line @typescript-eslint/no-var-requires
const { composePlugins, withNx } = require("@nx/next");

/**
 * @type {import('@nx/next/plugins/with-nx').WithNxOptions}
 **/
const nextConfig = {
  // Use this to set Nx-specific options
  // See: https://nx.dev/recipes/next/next-config-setup
  nx: {},
  output: "standalone",
  // Configure external image domains
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "ik.imagekit.io",
      },
    ],
  },
  // Reduce bundle size - tree shake large packages
  experimental: {
    optimizePackageImports: [
      "lucide-react",
      "framer-motion",
      "@tanstack/react-query",
      "@tanstack/react-query-devtools",
      "react-hook-form",
      "@hookform/resolvers",
      "swiper",
      "@dnd-kit/core",
      "@dnd-kit/sortable",
      "@dnd-kit/utilities",
      "zod",
      "zustand",
      "clsx",
      "tailwind-merge",
      "axios",
      "imagekitio-react",
    ],
  },
  // Disable source maps in production
  productionBrowserSourceMaps: false,
  // Compress output
  compress: true,
  // Minimize server output
  poweredByHeader: false,
  // Skip type checking during build (faster builds, we check separately)
  typescript: {
    ignoreBuildErrors: false,
  },
};

const plugins = [
  // Add more Next.js plugins to this list if needed.
  withNx,
];

module.exports = composePlugins(...plugins)(nextConfig);
