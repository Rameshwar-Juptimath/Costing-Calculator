/** @type {import('next').NextConfig} */
const config = {
  output: 'standalone',
  transpilePackages: ['three'],
  images: { domains: [] },
  typedRoutes: false,
};
export default config;
