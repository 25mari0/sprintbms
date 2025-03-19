import { useForm } from 'react-hook-form';
import { emailValidation, passwordValidation } from '../utils/formValidations';
import { FormContainer } from '../components/FormContainer';
import { post } from '../services/api';
import { Button, TextField } from '@mui/material';
import { useAuthStore, UserData } from '../stores/authStore';

interface LoginFormData {
  email: string;
  password: string;
}

export default function Login() {
  const { setUser, setIsAuthenticated } = useAuthStore();
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<LoginFormData>();

  const onSubmit = async (data: LoginFormData) => {
    try {
      const response = await post<{ responseData: UserData }>('/client/login', data);
      if (response.status === 'success') {
        setUser(response.data!.responseData);
        setIsAuthenticated(true);
      }
    } catch (error) {
      // api.ts handles it
    }
  };

  return (
    <FormContainer title="Login">
      <form onSubmit={handleSubmit(onSubmit)}>
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
        <Button type="submit" variant="contained" fullWidth disabled={isSubmitting}>
          Login
        </Button>
      </form>
    </FormContainer>
  );
}