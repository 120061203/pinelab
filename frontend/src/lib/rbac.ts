import { useAdminAuth } from './admin-auth';

export type Role = 'admin' | 'editor' | 'analyst';

export type Permission =
  | 'manage_users'
  | 'content_write'
  | 'content_read'
  | 'view_analytics';

const rolePermissions: Record<Role, Permission[]> = {
  admin: ['manage_users', 'content_write', 'content_read', 'view_analytics'],
  editor: ['content_write', 'content_read', 'view_analytics'],
  analyst: ['content_read', 'view_analytics'],
};

export function hasPermission(role: Role | undefined, permission: Permission) {
  if (!role) return false;
  return rolePermissions[role]?.includes(permission) ?? false;
}

export function canAccessRoute(role: Role | undefined, path: string) {
  // 高階路由保護：
  if (path.startsWith('/admin-portal')) {
    // Admin portal 至少需要 content_read
    return hasPermission(role, 'content_read');
  }
  return true;
}

export function navVisible(role: Role | undefined, item: 'products' | 'categories' | 'tags' | 'contacts' | 'dashboard') {
  switch (item) {
    case 'products':
    case 'categories':
    case 'tags':
      // 僅對具備寫入權限（管理員、編輯者）顯示；分析師不顯示
      return hasPermission(role, 'content_write');
    case 'contacts':
      // 僅管理員/編輯者可見
      return hasPermission(role, 'content_write');
    case 'dashboard':
      return hasPermission(role, 'view_analytics');
    default:
      return false;
  }
}

/**
 * React Hook for RBAC
 */
export function useRBAC() {
  const { user } = useAdminAuth();
  const role = (user?.role as Role) || undefined;

  const hasRole = (roles: Role[]) => {
    if (!role) return false;
    return roles.includes(role);
  };

  const hasPermissionCheck = (permission: Permission) => {
    return hasPermission(role, permission);
  };

  return {
    role,
    hasRole,
    hasPermission: hasPermissionCheck,
  };
}


