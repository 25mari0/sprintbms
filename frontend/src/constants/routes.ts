export const PUBLIC_ROUTES = ['/login', '/register', '/'] as const;
export const PROTECTED_ROUTES = ['/dashboard', '/success', '/business/create'] as const;
export const SESSION_EXPIRED_MESSAGE = 'Session expired. Please log in again.';
export const LOGOUT_SUCCESS_MESSAGE = 'Logged out successfully';
export const LOGOUT_FAILURE_MESSAGE = 'Logout failed. Please try again.';