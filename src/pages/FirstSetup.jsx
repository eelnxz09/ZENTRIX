import React from 'react';
import { FirstLoginSetup } from '../components/auth/FirstLoginSetup';
import { useNavigate } from 'react-router-dom';

export default function FirstSetup() {
  const navigate = useNavigate();

  return (
    <FirstLoginSetup onComplete={() => navigate('/dashboard', { replace: true })} />
  );
}
