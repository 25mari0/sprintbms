import React, { useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useVerifyAccount } from '../hooks/useAuth';

const VerifyAccount: React.FC = () => {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token') || '';
  const { verifyToken } = useVerifyAccount(token);

  useEffect(() => {
    verifyToken();
  }, [verifyToken]);

  return null; 
};

export default VerifyAccount;