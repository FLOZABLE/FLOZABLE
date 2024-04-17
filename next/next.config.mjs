/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'http',
        hostname: 'localhost',
        port: '3000',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'localhost',
        port: '3000',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'supreme-parakeet-r4495j5pj6v25rp7-3000.app.github.dev',
        pathname: '/**',
      },
    ],
  },
  optimizeFonts: false,
};

export default nextConfig;