import type { CollectionConfig } from 'payload'

import { ensureUniqueSlug } from './hooks/ensureUniqueSlug'
import { createPageAccess, superAdminOrTenantAdminAccess } from '@/collections/Pages/access/superAdminOrTenantAdmin'
import { CTABlock } from '@/blocks/CTA'

export const Pages: CollectionConfig = {
  slug: 'pages',
  access: {
    create: createPageAccess,
    delete: superAdminOrTenantAdminAccess,
    read: () => true,
    update: superAdminOrTenantAdminAccess,
  },
  admin: {
    useAsTitle: 'title',
  },
  fields: [
    {
      name: 'title',
      type: 'text',
    },
    {
      name: 'slug',
      type: 'text',
      defaultValue: 'home',
      hooks: {
        beforeValidate: [ensureUniqueSlug],
      },
      index: true,
    },
    {
      name: 'content',
      type: 'blocks',
      blocks: [CTABlock],
    },
  ],
}
