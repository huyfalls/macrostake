/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ["@macrostake/db", "@macrostake/types"],
  images: {
    domains: ["lh3.googleusercontent.com", "avatars.githubusercontent.com"],
  },
  experimental: {
    serverComponentsExternalPackages: ["@prisma/client"],
  },
};

module.exports = nextConfig;
