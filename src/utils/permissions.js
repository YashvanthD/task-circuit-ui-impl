// Small helper to centralize admin detection across the app
export function is_admin(u) {
  if (!u) return false;
  const user = u.user || u;
  if (typeof user.permissions === 'string' && user.permissions.toLowerCase().includes('admin')) return true;
  if (typeof user.role === 'string' && user.role.toLowerCase().includes('admin')) return true;
  if (Array.isArray(user.roles) && user.roles.some(r => String(r).toLowerCase().includes('admin'))) return true;
  if (user.permission && typeof user.permission === 'object') {
    if (typeof user.permission.name === 'string' && user.permission.name.toLowerCase().includes('admin')) return true;
    if (user.permission.level === 'admin' || String(user.permission.level).toLowerCase() === 'admin') return true;
  }
  return false;
}

