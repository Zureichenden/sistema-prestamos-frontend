export const getRoles = () => {
  try {
    return JSON.parse(localStorage.getItem('roles')) || [];
  } catch {
    return [];
  }
};

export const hasRole = (role) => getRoles().includes(role);

export const hasAnyRole = (...roles) => roles.some(r => hasRole(r));

export const isAdmin = () => hasRole('ADMIN');
export const isGestor = () => hasAnyRole('ADMIN', 'GESTOR');
export const isAuditor = () => hasAnyRole('ADMIN', 'AUDITOR');
export const isViewer = () => hasAnyRole('ADMIN', 'GESTOR', 'AUDITOR', 'VIEWER');