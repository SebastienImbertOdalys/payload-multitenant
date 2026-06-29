import { mongooseAdapter } from '@payloadcms/db-mongodb'
import { postgresAdapter } from '@payloadcms/db-postgres'
import { lexicalEditor } from '@payloadcms/richtext-lexical'
// import { vercelBlobStorage } from '@payloadcms/storage-vercel-blob' // Temporarily disabled due to version constraints
import path from 'path'
import { buildConfig } from 'payload'
import { fileURLToPath } from 'url'

import { Pages } from './collections/Pages'
import { Tenants } from './collections/Tenants'
import Users from './collections/Users'
import { multiTenantPlugin } from '@payloadcms/plugin-multi-tenant'
import { isSuperAdmin } from './access/isSuperAdmin'
import type { Config } from './payload-types'
import { getUserTenantIDs } from './utilities/getUserTenantIDs'
import { seed } from './seed'

const filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(filename)

const getDatabaseURL = (): string => {
  const databaseURL = process.env.DATABASE_URL as string

  if (!databaseURL || process.env.DATABASE_ADAPTER !== 'postgres') {
    return databaseURL
  }

  try {
    const parsedURL = new URL(databaseURL)
    const sslMode = parsedURL.searchParams.get('sslmode')

    if (sslMode === 'require' || sslMode === 'prefer' || sslMode === 'verify-ca') {
      parsedURL.searchParams.set('sslmode', 'verify-full')
      return parsedURL.toString()
    }

    if (!sslMode) {
      parsedURL.searchParams.set('sslmode', 'verify-full')
      return parsedURL.toString()
    }

    return databaseURL
  } catch {
    return databaseURL
  }
}
// eslint-disable-next-line no-restricted-exports
export default buildConfig({
  admin: {
    user: 'users',
  },
  collections: [Pages, Users, Tenants],
  // Use Postgres for Vercel deployment (recommended)
  // MongoDB works too, but Postgres is more stable on serverless platforms
  db: process.env.DATABASE_ADAPTER === 'postgres'
    ? postgresAdapter({
        pool: {
          connectionString: getDatabaseURL(),
        },
      })
    : mongooseAdapter({
        url: process.env.DATABASE_URL as string,
      }),
  onInit: async (payload) => {
    payload.logger.info('🚀 Payload onInit called')

    if (process.env.SEED_DB === 'true') {
      payload.logger.info('🌱 Running seed')
      await seed(payload)
    } else {
      payload.logger.info('⏭️ PAYLOAD_SEED is false, skipping seed')
    }
  },
  editor: lexicalEditor({}),
  graphQL: {
    schemaOutputFile: path.resolve(dirname, 'generated-schema.graphql'),
  },
  secret: process.env.PAYLOAD_SECRET as string,
  typescript: {
    outputFile: path.resolve(dirname, 'payload-types.ts'),
  },
  plugins: [
    // Optional: Vercel Blob storage for file uploads
    // Temporarily disabled due to version incompatibility between storage-vercel-blob@3.85.1 and payload@3.73.0
    // To enable in the future: upgrade packages when versions align, uncomment import and plugin below
    // ...(process.env.BLOB_READ_WRITE_TOKEN
    //   ? [
    //       vercelBlobStorage({
    //         token: process.env.BLOB_READ_WRITE_TOKEN,
    //         folder: 'payload-uploads',
    //       }),
    //     ]
    //   : []),
    
    multiTenantPlugin<Config>({
      collections: {
        pages: {},
      },
      tenantField: {
        access: {
          read: () => true,
          update: ({ req }) => {
            if (isSuperAdmin(req.user)) {
              return true
            }
            return getUserTenantIDs(req.user).length > 0
          },
        },
      },
      tenantsArrayField: {
        includeDefaultField: false,
      },
      userHasAccessToAllTenants: (user) => isSuperAdmin(user),
    }),
  ],
})
