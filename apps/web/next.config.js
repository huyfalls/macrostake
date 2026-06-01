/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  transpilePackages: ["@macrostake/db", "@macrostake/types"],
  images: {
    domains: ["lh3.googleusercontent.com", "avatars.githubusercontent.com"],
  },
  experimental: {
    serverComponentsExternalPackages: ["@prisma/client"],
  },
};

module.exports = nextConfig;
