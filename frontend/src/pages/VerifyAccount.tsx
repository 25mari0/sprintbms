import { useEffect, useCallback } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { post } from '../services/api';

export default function VerifyAccount() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get('token') || '';

  const verifyToken = useCallback(async () => {
    if (!token) {
      navigate('/login', { replace: true });
      return;
    }

    try {
      const response = await post(`/client/account-verification/verify?token=${token}`);
      if (response.status === 'success') {
        navigate('/login', {
          replace: true,
          state: { verification: 'success', message: response.message || 'Account verified successfully!' },
        });
      }
    } catch (error: any) {
      const status = error.response?.status;
      navigate('/login', {
        replace: true,
        state: {
          verification: status === 400 ? 'expired' : 'error', token, // 400 for expired, 401/other for invalid
          message: status === 400 ? 'Verification token has expired.' : 'Invalid verification token.',
        },
      });
    }
  }, [token, navigate]);

  useEffect(() => {
    verifyToken();
  }, [verifyToken]);

  return null; // No UI, just processes and redirects
}