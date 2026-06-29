import configPromise from '@payload-config'
import { headers as getHeaders } from 'next/headers'
import { notFound } from 'next/navigation'
import { getPayload } from 'payload'
import React from 'react'

import { RefreshRouteOnSave } from '@/app/components/LivePreview/RefreshRouteOnSave'
import { RenderPage } from '@/app/components/RenderPage'

export const dynamic = 'force-dynamic'

// eslint-disable-next-line no-restricted-exports
export default async function PreviewPage({
  params: paramsPromise,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await paramsPromise
  const headers = await getHeaders()
  const payload = await getPayload({ config: configPromise })
  const { user } = await payload.auth({ headers })

  try {
    const page = await payload.findByID({
      collection: 'pages',
      depth: 1,
      draft: true,
      id,
      overrideAccess: false,
      user,
    })

    return (
      <React.Fragment>
        <RefreshRouteOnSave />
        <RenderPage data={page} />
      </React.Fragment>
    )
  } catch {
    return notFound()
  }
}