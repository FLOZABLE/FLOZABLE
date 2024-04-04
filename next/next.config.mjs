/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'supreme-parakeet-r4495j5pj6v25rp7-3000.app.github.dev',
        port: '',
        pathname: '/**',
      },
    ],
  },
  optimizeFonts: false,
};

export default nextConfig;
