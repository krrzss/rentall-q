/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    // Already checked by tsc in CI pipeline
    ignoreBuildErrors: false,
  },
  async rewrites() {
    return [
      { source: '/dashboard/ai-space-advisor', destination: '/ai-space-advisor' },
      { source: '/dashboard/my-bookings', destination: '/my-bookings' },
      { source: '/dashboard/storage-spaces', destination: '/storage-spaces' },
      { source: '/dashboard/my-payments', destination: '/my-payments' },
      { source: '/dashboard/request', destination: '/request' },
    ];
  },
};

module.exports = nextConfig;
