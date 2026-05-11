/** @type {import('next').NextConfig} */
const nextConfig = {
  allowedDevOrigins: ["facial-surgery-startling.ngrok-free.dev"],
  images: {
    formats: ["image/avif", "image/webp"],
    remotePatterns: [
      {
        protocol: "https",
        hostname: "pub-7d8385c441654af4b81cde95bb10edae.r2.dev",
        pathname: "/**"
      },
      {
        protocol: "https",
        hostname: "*.r2.dev",
        pathname: "/**"
      },
      {
        protocol: "https",
        hostname: "lh3.googleusercontent.com",
        pathname: "/**"
      },
      {
        protocol: "https",
        hostname: "*.googleusercontent.com",
        pathname: "/**"
      }
    ]
  }
};

export default nextConfig;
