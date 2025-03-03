import React, { useState, useEffect, useRef } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { validateToken, confirmAccount, resendVerification } from '../services/authService';
import { ApiError } from '../types/authTypes';

const VerifyAccount: React.FC = () => {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token') || '';
  const navigate = useNavigate();
  const [status, setStatus] = useState('');
  const [error, setError] = useState('');
  const hasRun = useRef(false); // Persistent lock

  useEffect(() => {
    if (!token || hasRun.current) return;

    const verifyToken = async () => {
      hasRun.current = true; // Lock immediately
      try {
        const result = await validateToken(token);
        if (result.status === 'success') {
          const response = await confirmAccount(token);
          navigate('/login', { state: { message: response.message } });
        } else {
          setStatus('expired');
          setError(result.message || 'Token validation failed');
        }
      } catch (err) {
        const apiError = err as ApiError;
        setStatus('expired');
        setError(apiError.message || 'Failed to validate token');
      }
    };

    verifyToken();
  }, [token, navigate]); // Stable deps, no re-run on state change

  const handleResend = async () => {
    try {
      await resendVerification(token);
      setStatus('resent');
      setError('');
    } catch (err) {
      const apiError = err as ApiError;
      setError(apiError.message || 'Failed to resend verification');
    }
  };

  return (
    <div>
      <h1>Verify Account</h1>
      {error && <p style={{ color: 'red' }}>{error}</p>}
      {status === 'expired' && (
        <div>
          <p>Token has expired or is invalid. Request a new one?</p>
          <button onClick={handleResend}>Resend Verification</button>
        </div>
      )}
      {status === 'resent' && <p style={{ color: 'green' }}>New verification email sent, check your inbox</p>}
    </div>
  );
};

export default VerifyAccount;