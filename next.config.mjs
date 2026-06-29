import { withPayload } from '@payloadcms/next/withPayload'

/** @type {import('next').NextConfig} */
const nextConfig = {
  // Note: 'standalone' output is only needed for Docker deployments.
  // Vercel handles the build output automatically.
  // Uncomment the line below only for Docker:
  // output: 'standalone',

  async rewrites() {
    if (process.env.PAYLOAD_ENABLE_FRONTEND !== 'true') {
      return []
    }

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
