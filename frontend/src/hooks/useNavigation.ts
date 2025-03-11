import { useCallback } from 'react';
import { useNavigate, NavigateOptions } from 'react-router-dom';
import { NavigationState } from '../types';

// centralized navigation with toast support
export const useNavigation = () => {
 const navigate = useNavigate();

 const navigateWithToast = useCallback(
 (to: string, message: string, options: NavigateOptions = {}) => {
 navigate(to, { ...options, state: { toast: message } as NavigationState });
 },
 [navigate]
 );

 return { navigate, navigateWithToast };
};