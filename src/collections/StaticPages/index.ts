import type { CollectionConfig } from 'payload'

import { CTABlock } from '@/blocks/CTA'

export const StaticPages: CollectionConfig = {
  slug: 'static-pages',
  labels: {
    singular: 'Page statique',
    plural: 'Pages statiques',
  },
  access: {
    create: ({ req }) => Boolean(req.user),
    delete: ({ req }) => Boolean(req.user),
    read: ({ req }) => Boolean(req.user),
    update: ({ req }) => Boolean(req.user),
  },
  admin: {
    livePreview: {
      url: ({ data }) => {
        if (!data?.id) {
          return null
        }

        return `/preview/static-pages/${data.id}`
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
      required: true,
    },
    {
      name: 'slug',
      type: 'text',
      required: true,
      index: true,
    },
    {
      name: 'content',
      type: 'blocks',
      blocks: [CTABlock],
    },
  ],
}
