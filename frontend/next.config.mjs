/** @type {import('next').NextConfig} */
const config = {
  output: 'standalone',
  transpilePackages: [
    'three',
    '@react-three/fiber',
    '@react-three/drei',
    'three-stdlib',
    'lucide-react',
  ],
  images: { unoptimized: true },
  typedRoutes: false,
  webpack: (webpackConfig, { isServer }) => {
    if (!isServer) {
      webpackConfig.resolve.fallback = {
        ...webpackConfig.resolve.fallback,
        fs: false,
        path: false,
      };
    }
    return webpackConfig;
  },
};

export default config;
