/** @type {import('next').NextConfig} */
const withPWA = require('next-pwa')({
  dest: 'public',
  disable: process.env.NODE_ENV === 'development',
});

const nextConfig = {
  reactStrictMode: true,
  transpilePackages: ['lucide-react'], // Prevenção de warnings comuns
  webpack: (config) => config, // Override fake para a config legado
  turbopack: {}, // Explicita suporte default
};

module.exports = withPWA(nextConfig);
