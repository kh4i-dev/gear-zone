export function getAdminPanelPrefix(): string {
  return process.env.NEXT_PUBLIC_ADMIN_PANEL_PREFIX || 'system-control'
}

export function getAdminLoginPath(): string {
  return process.env.NEXT_PUBLIC_ADMIN_LOGIN_PATH || 'auth-login'
}

export function getAdminPath(subPath: string): string {
  const prefix = getAdminPanelPrefix()
  const loginPath = getAdminLoginPath()
  
  const formattedSubPath = subPath.startsWith('/') ? subPath : `/${subPath}`
  
  if (formattedSubPath === '/login' || formattedSubPath === '/admin/login') {
    return `/${prefix}/${loginPath}`
  }
  
  // Strip starting '/admin' if it exists to prevent duplication
  const cleanSubPath = formattedSubPath.startsWith('/admin') 
    ? formattedSubPath.substring(6) 
    : formattedSubPath
    
  return `/${prefix}${cleanSubPath}`
}
