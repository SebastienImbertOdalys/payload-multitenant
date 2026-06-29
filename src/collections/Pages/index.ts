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
    livePreview: {
      url: ({ data }) => {
        if (!data?.id) {
          return null
        }

        return `/preview/pages/${data.id}`
      },
      breakpoints: [
        {
          name: 'mobile',
          label: 'Mobile',
          width: 390,
          height: 844,
        },
        {
          name: 'desktop',
          label: 'Desktop',
          width: 1440,
          height: 900,
        },
      ],
    },
    useAsTitle: 'title',
  },
  versions: {
    drafts: {
      autosave: {
        interval: 500,
      },
    },
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
