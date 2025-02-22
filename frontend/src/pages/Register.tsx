import React, { useState } from 'react';
import { register } from '../services/authService';
import type { ApiError } from '../types/authTypes';

const Register: React.FC = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/; // Basic email check
    return emailRegex.test(email);
  };

  const validatePassword = (password: string) => {
    return (
      password.length >= 8 &&
      /[A-Z]/.test(password) &&
      /[0-9]/.test(password)
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    // Client-side validation
    if (!name) {
      setError('Name is required');
      return;
    }
    if (!validateEmail(email)) {
      setError('Must be a valid email address');
      return;
    }
    if (!validatePassword(password)) {
      setError('Password must be at least 8 characters long, with one uppercase letter and one number');
      return;
    }

    try {
      await register(name, email, password);
      setSuccess('Verification email sent, please check your inbox');
      setName('');
      setEmail('');
      setPassword('');
    } catch (err: ApiError) { // Fixed: Use ApiError instead of any
        setError(err.message || 'Registration failed');
    }
  };

  return (
    <div>
      <h1>Register</h1>
      {error && <p style={{ color: 'red' }}>{error}</p>}
      {success && <p style={{ color: 'green' }}>{success}</p>}
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Name"
        />
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Email"
        />
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Password"
        />
        <button type="submit">Register</button>
      </form>
    </div>
  );
};

export default Register;