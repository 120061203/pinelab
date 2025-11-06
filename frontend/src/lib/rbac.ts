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
      return hasPermission(role, 'content_read');
    case 'contacts':
      return hasPermission(role, 'content_read');
    case 'dashboard':
      return hasPermission(role, 'view_analytics');
    default:
      return false;
  }
}


