import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { nameValidation, emailValidation, passwordValidation } from '../utils/formValidations';
import { FormContainer } from '../components/FormContainer';
import { TextField, Button, Box } from '@mui/material';
import { post } from '../services/api';

interface RegisterFormData {
  name: string;
  email: string;
  password: string;
}

export default function Register() {
  const navigate = useNavigate();
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<RegisterFormData>();

  const onSubmit = async (data: RegisterFormData) => {
    try {
      await post('/client/register', data);
      // Assuming api.ts handles redirects if provided in the response
    } catch (error) {
      // api.ts is expected to show toast errors
    }
  };

  return (
    <FormContainer title="Register">
      <form onSubmit={handleSubmit(onSubmit)}>
        <TextField
          label="Name"
          {...register('name', nameValidation)}
          error={!!errors.name}
          helperText={errors.name?.message}
          fullWidth
          margin="normal"
          disabled={isSubmitting}
        />
        <TextField
          label="Email"
          {...register('email', emailValidation)}
          error={!!errors.email}
          helperText={errors.email?.message}
          fullWidth
          margin="normal"
          disabled={isSubmitting}
        />
        <TextField
          label="Password"
          type="password"
          {...register('password', passwordValidation)}
          error={!!errors.password}
          helperText={errors.password?.message}
          fullWidth
          margin="normal"
          disabled={isSubmitting}
        />
        <Box sx={{ mt: 2 }}>
          <Button type="submit" variant="contained" fullWidth disabled={isSubmitting}>
            Register
          </Button>
          <Button
            variant="text"
            fullWidth
            onClick={() => navigate('/login')}
            disabled={isSubmitting}
            sx={{ mt: 1 }}
          >
            Already have an account? Login
          </Button>
        </Box>
      </form>
    </FormContainer>
  );
}