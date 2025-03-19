import { useCallback, useState } from 'react';
import { post } from '../services/api';
import { loadStripe } from '@stripe/stripe-js';
import { Box, Button, Typography, CircularProgress } from '@mui/material';

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY);

export default function BusinessRenew() {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      setIsSubmitting(true);
      try {
        const response = await post<{ sessionId: string }>('/business/create-checkout-session');
        const stripe = await stripePromise;
        if (!stripe) throw new Error('Stripe failed to load');

        const { error } = await stripe.redirectToCheckout({ sessionId: response.data!.sessionId });
        if (error) throw error;
      } finally {
        setIsSubmitting(false);
      }
    },
    []
  );

  return (
    <Box sx={{ maxWidth: 400, mx: 'auto', mt: 4, p: 2 }}>
      <Typography variant="h4" gutterBottom>
        Renew Your Subscription
      </Typography>
      <Typography variant="body1" sx={{ mb: 2 }}>
        Your subscription has expired. Renew it now.
      </Typography>
      <form onSubmit={handleSubmit}>
        <Button
          type="submit"
          variant="contained"
          color="primary"
          fullWidth
          disabled={isSubmitting}
          startIcon={isSubmitting ? <CircularProgress size={20} /> : null}
          sx={{ mb: 2 }}
        >
          Renew Now
        </Button>
      </form>
    </Box>
  );
}