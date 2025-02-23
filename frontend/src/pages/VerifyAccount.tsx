import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { validateToken, confirmAccount, resendVerification } from '../services/authService';
import { ApiError } from '../types/authTypes.ts';

const VerifyAccount: React.FC = () => {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token') || '';
  const [status, setStatus] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    const checkToken = async () => {
      try {
        const result = await validateToken(token);
        setStatus(result.status === 'success' ? 'valid' : 'expired');
      } catch (err) {
        const apiError = err as ApiError;
        setError(apiError.message || 'Failed to validate token');
        setStatus('expired');
      }
    };
    if (token) checkToken();
  }, [token]);

  const handleConfirm = async () => {
    try {
      await confirmAccount(token);
      window.location.href = '/login';
    } catch (err) {
      const apiError = err as ApiError;
      setError(apiError.message || 'Confirmation failed');
    }
  };

  const handleResend = async () => {
    try {
      await resendVerification(token);
      setStatus('resent');
    } catch (err) {
      const apiError = err as ApiError;
      setError(apiError.message || 'Failed to resend verification');
    }
  };

  return (
    <div>
      <h1>Verify Account</h1>
      {error && <p style={{ color: 'red' }}>{error}</p>}
      {status === 'valid' && (
        <div>
          <p>Token is valid. Confirm your account:</p>
          <button onClick={handleConfirm}>Confirm Account</button>
        </div>
      )}
      {status === 'expired' && (
        <div>
          <p>Token has expired. Request a new one?</p>
          <button onClick={handleResend}>Resend Verification</button>
        </div>
      )}
      {status === 'resent' && <p style={{ color: 'green' }}>New verification email sent, check your inbox</p>}
    </div>
  );
};

export default VerifyAccount;