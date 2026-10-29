/** @type {import('next').NextConfig} */
const nextConfig = {
  images: { unoptimized: true },
  async headers() {
    return [
      {
        source: '/admin/:path*',
        headers: [{ key: 'X-Robots-Tag', value: 'noindex, nofollow' }],
      },
    ];
  },
};

export default nextConfig;
