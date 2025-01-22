/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "http",
        hostname: "localhost",
        port: "3000",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "localhost",
        port: "3000",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "api.flozable.com",
        port: "",
        pathname: "/**",
      },
      {
        protocol: "http",
        hostname: "api.localhost",
        port: "",
        pathname: "/**",
      },
    ],
  },
  async headers() {
    return [
      {
        source: "/profile-images/:path*",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=3600", // Cache for 1 hour
          },
        ],
      },
    ];
  },
};

export default nextConfig;
