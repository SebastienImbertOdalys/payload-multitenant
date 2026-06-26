import type { Block } from 'payload'

export const CTABlock: Block = {
  slug: 'cta',
  labels: {
    singular: 'CTA',
    plural: 'CTAs',
  },
  fields: [
    {
      name: 'heading',
      type: 'text',
      required: true,
    },
    {
      name: 'description',
      type: 'textarea',
    },
    {
      name: 'buttonLabel',
      type: 'text',
      required: true,
      defaultValue: 'Click here',
    },
    {
      name: 'buttonLink',
      type: 'text',
      required: true,
    },
    {
      name: 'backgroundColor',
      type: 'text',
      defaultValue: '#0066cc',
    },
  ],
}
