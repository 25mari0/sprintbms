
import { useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { post } from '../services/api';
import { loadStripe } from '@stripe/stripe-js';
import { toast } from 'react-toastify';
import { Box, Button, TextField, Typography, CircularProgress } from '@mui/material';

const stripePromise = loadStripe('pk_test_51QubPo7GwWoprFHLbGyPkvCuZUFMMmQhUiIQrOWILqrdeRI7PM87pHiBr71IRmLrLEztejzZmmeIAuiPEOGMTXRn007EThIOvB');

export function BusinessCreate() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const mode = searchParams.get('mode') || 'create';
  const [businessName, setBusinessName] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const body = mode === 'create' ? { businessName } : undefined;
      const response = await post<{ sessionId: string }>('/business/create-checkout-session', body);
      const stripe = await stripePromise;

      if (!stripe) throw new Error('Stripe fucked up loading');
      const sessionId = response.data?.sessionId;
      if (!sessionId) throw new Error('No session ID');

      const { error } = await stripe.redirectToCheckout({ sessionId });
      if (error) toast.error(error.message || 'Checkout’s fucked');
    } catch (error) {
      // api.ts handles toasts
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Box sx={{ maxWidth: 400, mx: 'auto', mt: 4, p: 2 }}>
      <Typography variant="h4" gutterBottom>
        {mode === 'create' ? 'Create Your Business' : 'Renew Your Subscription'}
      </Typography>
      <form onSubmit={handleSubmit}>
        {mode === 'create' && (
          <TextField
            label="Business Name"
            value={businessName}
            onChange={(e) => setBusinessName(e.target.value)}
            fullWidth
            required
            disabled={submitting}
            sx={{ mb: 2 }}
          />
        )}
        {mode === 'renew' && (
          <Typography variant="body1" sx={{ mb: 2 }}>
            Your subscription’s dead. Renew it.
          </Typography>
        )}
        <Button
          type="submit"
          variant="contained"
          color="primary"
          fullWidth
          disabled={submitting}
          startIcon={submitting ? <CircularProgress size={20} /> : null}
          sx={{ mb: 2 }}
        >
          {mode === 'create' ? 'Pay Up' : 'Renew Now'}
        </Button>
        <Button
          variant="outlined"
          fullWidth
          onClick={() => navigate('/dashboard')}
          disabled={submitting}
        >
          Fuck Off to Dashboard
        </Button>
      </form>
    </Box>
  );
}

export default BusinessCreate;