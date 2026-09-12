/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ['lucide-react', '@supabase/supabase-js', '@supabase/ssr'],
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**.supabase.co',
      },
    ],
  },
};

module.exports = nextConfig;
