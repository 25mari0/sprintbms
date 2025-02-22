export const login = async (email: string, password: string) => {
    const response = await fetch('http://localhost:5000/client/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    if (!response.ok) throw new Error('Login failed');
    return response.json();
  };

export const register = async (name: string, email: string, password: string) => {
  const response = await fetch('http://localhost:5000/client/register', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name, email, password }),
  });
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message);
  }
  return response.json();
};

export const validateToken = async (token: string) => {
  const response = await fetch(`http://localhost:5000/client/account-verification/token?token=${token}`);
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message);
  }
  const data = await response.json();
  return data; // Backend should return { valid: true } or similar
};

export const confirmAccount = async (token: string) => {
  const response = await fetch('http://localhost:5000/client/account-verification/confirm', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ token }),
  });
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message);
  }
  return response.json();
};

export const resendVerification = async (token: string) => {
  const response = await fetch('http://localhost:5000/client/account-verification/resend', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ token }),
  });
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message);
  }
  return response.json();
};