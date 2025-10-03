/** @type {import('next').nextConfig} */
const nextConfig = {
  experimental: {
    turbopack: {
      root: '.'
    }
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
}

export default nextConfig

