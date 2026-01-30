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
  // Headers for caching static assets (images, fonts, etc.)
  async headers() {
    return [
      {
        // Apply caching to static images
        source: '/:all*(svg|jpg|jpeg|png|gif|ico|webp|avif)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
      {
        // Apply caching to static fonts
        source: '/:all*(woff|woff2|ttf|otf|eot)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
      {
        // Apply caching to JS/CSS
        source: '/_next/static/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
    ];
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
