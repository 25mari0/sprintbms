import { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useVerifyAccount } from '../hooks/useAuth';
import { toast } from 'react-toastify';
import { Button } from '@mui/material';
import { FormContainer } from '../components/FormContainer';

const VerifyAccount = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get('token') || '';
  const { verifyToken, resend, error: verifyError } = useVerifyAccount(token);
  const [verifySuccess, setVerifySuccess] = useState(false);
  const [resentSuccess, setResentSuccess] = useState(false);
  const [hasVerified, setHasVerified] = useState(false); // Prevent duplicate calls

  useEffect(() => {
    if (localStorage.getItem('accessToken')) {
      navigate('/'); // Redirect if logged in
    } else if (token && !hasVerified) {
      setHasVerified(true); // Mark as attempted
      verifyToken()
        .then((response) => {
          setVerifySuccess(true);
          if (response?.redirect) navigate(response.redirect); // Use backend redirect
        })
        .catch(() => {}); // Error handled via verifyError
    }
  }, [token, verifyToken, navigate, hasVerified]);

  useEffect(() => {
    const alertMap = {
      error: [{ trigger: verifyError && !verifySuccess && !resentSuccess, message: verifyError }],
      success: [
        { trigger: verifySuccess && !verifyError, message: 'Account verified successfully! Please log in with your password.' },
        { trigger: resentSuccess && !verifyError, message: 'New verification email sent, check your inbox.' },
      ],
    };

    Object.entries(alertMap).forEach(([type, alerts]) => {
      alerts
        .filter(alert => alert.trigger)
        .forEach(alert => toast[type as 'error' | 'success'](alert.message));
    });
  }, [verifyError, verifySuccess, resentSuccess]);

  const handleResend = async () => {
    await resend();
    setResentSuccess(true);
  };

  return (
    <FormContainer title="Verify Account">
      {verifyError && !resentSuccess && (
        <Button variant="contained" color="primary" fullWidth sx={{ mt: 2 }} onClick={handleResend}>
          Resend Verification Email
        </Button>
      )}
    </FormContainer>
  );
};

export default VerifyAccount;