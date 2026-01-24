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
  // Webpack configuration for Web Workers and WebAssembly
  webpack: (config, { isServer }) => {
    if (!isServer) {
      // Enable web workers
      config.output.globalObject = 'self';
    }

    // Enable WebAssembly support for qpdf-wasm
    config.experiments = {
      ...config.experiments,
      asyncWebAssembly: true,
    };

    return config;
  },
}

export default nextConfig
