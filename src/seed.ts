import type { Config } from 'payload'

export const seed: NonNullable<Config['onInit']> = async (payload) => {
  payload.logger.info('🌱 Starting database seed')

  // 🛑 Anti-doublon
  const existingTenants = await payload.find({
    collection: 'tenants',
    limit: 1,
    overrideAccess: true,
  })

  if (existingTenants.totalDocs > 0) {
    payload.logger.info('⏭️ Seed already executed, skipping')
    return
  }

  // 🏢 Tenants
  const tenant1 = await payload.create({
    collection: 'tenants',
    overrideAccess: true,
    data: {
      name: 'Tenant 1',
      slug: 'gold',
      domain: 'gold.localhost',
    },
  })

  const tenant2 = await payload.create({
    collection: 'tenants',
    overrideAccess: true,
    data: {
      name: 'Tenant 2',
      slug: 'silver',
      domain: 'silver.localhost',
    },
  })

  const tenant3 = await payload.create({
    collection: 'tenants',
    overrideAccess: true,
    data: {
      name: 'Tenant 3',
      slug: 'bronze',
      domain: 'bronze.localhost',
    },
  })

  payload.logger.info('✅ Tenants created')

  // 👤 Super admin
  await payload.create({
    collection: 'users',
    overrideAccess: true,
    data: {
      email: 'demo@payloadcms.com',
      password: 'demo',
      roles: ['super-admin'],
    },
  })

  // 👤 Tenant admins
  await payload.create({
    collection: 'users',
    overrideAccess: true,
    data: {
      email: 'tenant1@payloadcms.com',
      password: 'demo',
      username: 'tenant1',
      tenants: [
        {
          roles: ['tenant-admin'],
          tenant: tenant1.id,
        },
      ],
    },
  })

  await payload.create({
    collection: 'users',
    overrideAccess: true,
    data: {
      email: 'tenant2@payloadcms.com',
      password: 'demo',
      username: 'tenant2',
      tenants: [
        {
          roles: ['tenant-admin'],
          tenant: tenant2.id,
        },
      ],
    },
  })

  await payload.create({
    collection: 'users',
    overrideAccess: true,
    data: {
      email: 'tenant3@payloadcms.com',
      password: 'demo',
      username: 'tenant3',
      tenants: [
        {
          roles: ['tenant-admin'],
          tenant: tenant3.id,
        },
      ],
    },
  })

  // 👤 Multi-tenant admin
  await payload.create({
    collection: 'users',
    overrideAccess: true,
    data: {
      email: 'multi-admin@payloadcms.com',
      password: 'demo',
      username: 'multi-admin',
      tenants: [
        {
          roles: ['tenant-admin'],
          tenant: tenant1.id,
        },
        {
          roles: ['tenant-admin'],
          tenant: tenant2.id,
        },
        {
          roles: ['tenant-admin'],
          tenant: tenant3.id,
        },
      ],
    },
  })

  payload.logger.info('✅ Users created')

  // 📄 Pages
  await payload.create({
    collection: 'pages',
    overrideAccess: true,
    data: {
      slug: 'home',
      tenant: tenant1.id,
      title: 'Page for Tenant 1',
    },
  })

  await payload.create({
    collection: 'pages',
    overrideAccess: true,
    data: {
      slug: 'home',
      tenant: tenant2.id,
      title: 'Page for Tenant 2',
    },
  })

  await payload.create({
    collection: 'pages',
    overrideAccess: true,
    data: {
      slug: 'home',
      tenant: tenant3.id,
      title: 'Page for Tenant 3',
    },
  })

  payload.logger.info('🎉 Seed completed successfully')
}
