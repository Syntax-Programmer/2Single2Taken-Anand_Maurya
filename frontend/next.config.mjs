/** @type {import('next').NextConfig} */
const nextConfig = {
  // Static export — ships as pre-rendered HTML/CSS/JS to Cloudflare Pages.
  output: "export",
  images: {
    unoptimized: true, // Cloudflare Pages serves static assets directly
  },
  trailingSlash: true,
};

export default nextConfig;
