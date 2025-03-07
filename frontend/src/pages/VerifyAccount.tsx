import { useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

const VerifyAccount = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get('token') || '';
  const { verifyAccount } = useAuth();

  useEffect(() => {
    if (localStorage.getItem('accessToken')) {
      navigate('/');
    } else if (token) {
      verifyAccount(token).catch((error) => {
        navigate('/login', { state: { error: error.message } }); // api.ts toasts, page redirects
      });
    }
  }, [token, verifyAccount, navigate]);

  return null;
};

export default VerifyAccount;