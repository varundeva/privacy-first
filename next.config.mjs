/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  // Enable Web Workers with Turbopack
  experimental: {
    turbo: {
      rules: {
        '*.worker.ts': {
          loaders: ['worker-loader'],
          as: '*.js',
        },
      },
    },
  },
  // Webpack configuration for Web Workers (production build)
  webpack: (config, { isServer }) => {
    if (!isServer) {
      // Enable web workers
      config.output.globalObject = 'self';
    }
    return config;
  },
}

export default nextConfig
