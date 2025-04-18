import { useState, useCallback } from 'react';
import { post } from '../services/api';
import { loadStripe } from '@stripe/stripe-js';
import { Box, Button, TextField, Typography, CircularProgress } from '@mui/material';

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY);

export default function BusinessCreate() {
  const [businessName, setBusinessName] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      setIsSubmitting(true);
      try {
        const response = await post<{ sessionId: string }>('/business/create-checkout-session', { businessName });
        const stripe = await stripePromise;
        if (!stripe) throw new Error('Stripe failed to load');

        const { error } = await stripe.redirectToCheckout({ sessionId: response.data!.sessionId });
        if (error) throw error;
      } finally {
        setIsSubmitting(false);
      }
    },
    [businessName]
  );

  return (
    <Box sx={{ maxWidth: 400, mx: 'auto', mt: 4, p: 2 }}>
      <Typography variant="h4" gutterBottom>
        Create Your Business
      </Typography>
      <form onSubmit={handleSubmit}>
        <TextField
          label="Business Name"
          value={businessName}
          onChange={(e) => setBusinessName(e.target.value)}
          fullWidth
          required
          disabled={isSubmitting}
          sx={{ mb: 2 }}
        />
        <Button
          type="submit"
          variant="contained"
          color="primary"
          fullWidth
          disabled={isSubmitting}
          startIcon={isSubmitting ? <CircularProgress size={20} /> : null}
          sx={{ mb: 2 }}
        >
          Proceed to Payment
        </Button>
      </form>
    </Box>
  );
}