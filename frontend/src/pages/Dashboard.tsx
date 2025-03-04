import React, { useEffect, useState } from 'react';
import { Button } from '@mui/material';
import { getDashboardData } from '../api/authApi';

const Dashboard: React.FC = () => {
//call the authApi getDashboardData function and store the response in a state variable
  const [message, setMessage] = useState<string>('');
  useEffect(() => {
    getDashboardData().then((response) => setMessage(response.message));
  }, []);

  return (
    <div>
      <h1>Dashboard</h1>
      <p>{message}</p>
      <Button variant="contained" color="primary" onClick={() => {}}>
        Logout
      </Button>
    </div>
  );
}

export default Dashboard;