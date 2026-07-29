/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: { ignoreDuringBuilds: true },
  typescript: { ignoreBuildErrors: true },
  // Job order/dispatch data changes constantly — the client Router Cache's default 30s
  // staleness window for dynamic routes was showing outdated statuses until a hard reload.
  experimental: {
    staleTimes: {
      dynamic: 0,
    },
  },
};

export default nextConfig;
