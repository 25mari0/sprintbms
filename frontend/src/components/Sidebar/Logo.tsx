// src/components/Sidebar/Logo.tsx
import React from 'react';
import AppLogo from '../../assets/trace.svg';
import { useTheme } from '@mui/material';
import styles from './Sidebar.module.css';

interface LogoProps {
  collapsed: boolean;
}

const Logo: React.FC<LogoProps> = ({ collapsed }) => {
  const theme = useTheme();

  return (
    <div className={styles.logoContainer}>
      <img src={AppLogo} alt="App Logo" className={styles.logoImage} />
      {!collapsed && (
        <span style={{ color: theme.palette.text.primary}} 
          className={styles.logoText}>
          <span className={styles.logoTextLight}>sprint</span>
          <span className={styles.logoTextBold}>BMS</span>
        </span>
      )}
    </div>
  );
};

export default Logo;