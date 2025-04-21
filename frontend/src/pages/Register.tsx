import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { Button, Box } from '@mui/material';
import { FormContainer } from '../components/FormContainer';
import { FormField } from '../components/FormField'; 
import { post } from '../services/api';
import { nameValidation, emailValidation, passwordValidation } from '../utils/userValidations';

interface RegisterFormData {
  name: string;
  email: string;
  password: string;
}

export default function Register() {
  const navigate = useNavigate();
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<RegisterFormData>({ mode: 'onBlur' });

  const onSubmit = async (data: RegisterFormData) => {
    await post('/client/register', data);
  };

  return (
    <FormContainer title="Register">
      <form onSubmit={handleSubmit(onSubmit)}>
        <FormField
          register={register('name', nameValidation)}
          error={errors.name}
          label="Name"
          disabled={isSubmitting}
        />
        <FormField
          register={register('email', emailValidation)}
          error={errors.email}
          label="Email"
          disabled={isSubmitting}
        />
        <FormField
          register={register('password', passwordValidation)}
          error={errors.password}
          label="Password"
          type="password"
          disabled={isSubmitting}
        />
        <Box sx={{ mt: 2 }}>
          <Button
            type="submit"
            variant="contained"
            fullWidth
            disabled={isSubmitting}
          >
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