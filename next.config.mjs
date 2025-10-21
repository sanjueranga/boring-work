/** @type {import('next').NextConfig} */
const nextConfig = {
  // Add this line
  output: "standalone",

  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
};

export default nextConfig;
