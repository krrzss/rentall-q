/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  async rewrites() {
    return [
      { source: '/dashboard/storage-spaces', destination: '/storage-spaces' },
      { source: '/dashboard/my-payments', destination: '/my-payments' },
      { source: '/dashboard/request', destination: '/request' },
    ];
  },
};

module.exports = nextConfig;
