import { withPayload } from '@payloadcms/next/withPayload'

/** @type {import('next').NextConfig} */
const nextConfig = {
  // Required for Docker: produces a self-contained .next/standalone output
  output: 'standalone',
  async rewrites() {
    return [
      {
        source: '/((?!admin|api))tenant-domains/:path*',
        destination: '/tenant-domains/:tenant/:path*',
        has: [
          {
            type: 'host',
            value: '(?<tenant>.*)',
          },
        ],
      },
    ]
  },
}

export default withPayload(nextConfig)
