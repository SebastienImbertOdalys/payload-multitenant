import { getUserTenantIDs } from '@/utilities/getUserTenantIDs'
import { isSuperAdmin } from '../../../access/isSuperAdmin'
import { Access } from 'payload'

/**
 * Tenant admins and super admins can create pages
 * For create, we just check the role — the multi-tenant plugin handles tenant scoping
 */
export const createPageAccess: Access = ({ req }) => {
  if (!req.user) {
    return false
  }

  if (isSuperAdmin(req.user)) {
    return true
  }

  return getUserTenantIDs(req.user, 'tenant-admin').length > 0
}

/**
 * Tenant admins and super admins can read/update/delete pages
 * Returns a Where clause so Payload filters by the user's tenants
 */
export const superAdminOrTenantAdminAccess: Access = ({ req }) => {
  if (!req.user) {
    return false
  }

  if (isSuperAdmin(req.user)) {
    return true
  }

  const adminTenantAccessIDs = getUserTenantIDs(req.user, 'tenant-admin')

  if (adminTenantAccessIDs.length === 0) {
    return false
  }

  return {
    tenant: {
      in: adminTenantAccessIDs,
    },
  }
}
