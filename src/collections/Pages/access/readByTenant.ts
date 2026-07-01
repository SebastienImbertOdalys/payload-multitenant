import type { Access, Where } from 'payload'

import { isSuperAdmin } from '@/access/isSuperAdmin'
import { getCollectionIDType } from '@/utilities/getCollectionIDType'
import { getUserTenantIDs } from '@/utilities/getUserTenantIDs'
import { getTenantFromCookie } from '@payloadcms/plugin-multi-tenant/utilities'

const normalize = (value: null | string): null | string => {
  const clean = value?.trim()
  return clean ? clean : null
}

const normalizeHost = (value: null | string): null | string => {
  const clean = normalize(value)

  if (!clean) {
    return null
  }

  return clean.split(':')[0]?.toLowerCase() || null
}

const getTenantContext = (req: Parameters<Access>[0]['req']) => {
  const host = normalizeHost(req.headers.get('host'))

  const tenantFromHeader = normalize(req.headers.get('x-tenant-id'))
  const tenantSlugFromHeader = normalize(req.headers.get('x-tenant-slug'))?.toLowerCase() || null
  const tenantDomainFromHeader = normalizeHost(req.headers.get('x-tenant-domain'))

  let tenantFromQuery: null | string = null
  let tenantSlugFromQuery: null | string = null
  let tenantDomainFromQuery: null | string = null

  try {
    if (req.url) {
      const url = new URL(req.url)
      tenantFromQuery = normalize(url.searchParams.get('tenant') || url.searchParams.get('tenantId'))
      tenantSlugFromQuery = normalize(url.searchParams.get('tenantSlug'))?.toLowerCase() || null
      tenantDomainFromQuery = normalizeHost(url.searchParams.get('tenantDomain'))
    }
  } catch {
    // noop: URL parsing is best effort only
  }

  return {
    tenant: tenantFromHeader || tenantFromQuery,
    tenantDomain: tenantDomainFromHeader || tenantDomainFromQuery || host,
    tenantSlug: tenantSlugFromHeader || tenantSlugFromQuery,
  }
}

const buildPublicTenantScope = ({
  tenant,
  tenantDomain,
  tenantSlug,
}: {
  tenant: null | string
  tenantDomain: null | string
  tenantSlug: null | string
}): null | Where => {
  if (tenant) {
    return {
      tenant: {
        equals: tenant,
      },
    }
  }

  if (tenantSlug) {
    return {
      'tenant.slug': {
        equals: tenantSlug,
      },
    }
  }

  if (tenantDomain) {
    return {
      'tenant.domain': {
        equals: tenantDomain,
      },
    }
  }

  return null
}

export const readPageAccess: Access = ({ req }) => {
  const { user } = req

  if (!user) {
    const tenantContext = getTenantContext(req)
    const tenantScope = buildPublicTenantScope(tenantContext)

    if (!tenantScope) {
      return false
    }

    return {
      and: [
        tenantScope,
        {
          'tenant.allowPublicRead': {
            equals: true,
          },
        },
      ],
    } as Where
  }

  if (isSuperAdmin(user)) {
    return true
  }

  const userTenantIDs = getUserTenantIDs(user)

  if (userTenantIDs.length === 0) {
    return false
  }

  const tenantFromCookie = getTenantFromCookie(
    req.headers,
    getCollectionIDType({ collectionSlug: 'tenants', payload: req.payload }),
  )

  const selectedTenantID = userTenantIDs.find((tenantID) => String(tenantID) === String(tenantFromCookie))

  if (selectedTenantID) {
    return {
      or: [
        {
          tenant: {
            equals: selectedTenantID,
          },
        },
        {
          tenant: {
            exists: false,
          },
        },
      ],
    } as Where
  }

  return {
    or: [
      {
        tenant: {
          in: userTenantIDs,
        },
      },
      {
        tenant: {
          exists: false,
        },
      },
    ],
  } as Where
}