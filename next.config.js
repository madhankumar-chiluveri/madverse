/** @type {import('next').NextConfig} */
const nextConfig = {
  serverExternalPackages: [
    "@blocknote/core",
    "@blocknote/react",
    "@blocknote/mantine",
  ],
  webpack: (config) => {
    config.resolve.fallback = { ...config.resolve.fallback, fs: false };
    return config;
  },
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "**" },
    ],
  },
  // Performance: enable experimental optimizations
  experimental: {
    optimizePackageImports: [
      "lucide-react",
      "recharts",
      "date-fns",
      "@radix-ui/react-dialog",
      "@radix-ui/react-dropdown-menu",
      "@radix-ui/react-select",
      "@radix-ui/react-popover",
      "framer-motion",
    ],
  },
  // Compress responses
  compress: true,
  // Reduce powered-by header
  poweredByHeader: false,
};

module.exports = nextConfig;
