import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { Box } from '@mui/material';
import { FormContainer } from '../components/FormContainer';
import { post } from '../services/api';
import { nameValidation, emailValidation, passwordValidation } from '../utils/userValidations';
import { TextBox } from '../components/TextBox';
import { CustomButton } from '../components/CustomButton';

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
        <TextBox
          label="Name"
          register={register('name', nameValidation)}
          error={errors.name}
          disabled={isSubmitting}
          fullWidth
          sx={{ mb: 2 }}
        />
        <TextBox
          label="Email"
          type="email"
          register={register('email', emailValidation)}
          error={errors.email}
          disabled={isSubmitting}
          fullWidth
          sx={{ mb: 2 }}
        />
        <TextBox
          label="Password"
          type="password"
          register={register('password', passwordValidation)}
          error={errors.password}
          disabled={isSubmitting}
          fullWidth
          sx={{ mb: 2 }}
        />
        <Box>
          <CustomButton
            type="submit"
            variant="contained"
            fullWidth
            disabled={isSubmitting}
            sx={{ mb: 1, display: 'flex', width: '100%' }}
          >
            Register
          </CustomButton>
          <CustomButton
            customVariant="secondary"
            variant="text"
            fullWidth
            onClick={() => navigate('/login')}
            disabled={isSubmitting}
            sx={{ display: 'flex', width: '100%' }}
          >
            Already have an account? Login
          </CustomButton>
        </Box>
      </form>
    </FormContainer>
  );
}