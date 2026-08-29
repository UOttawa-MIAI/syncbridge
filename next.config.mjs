/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  env: {
    SUPPORT_EMAIL: process.env.SUPPORT_EMAIL || 'tchen117@uottawa.ca',
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'www.uottawa.ca',
      },
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
    ],
  },
};

export default nextConfig;
