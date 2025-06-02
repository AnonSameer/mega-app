// client/src/components/features/PinAuth.tsx
import React, { useState } from 'react';
import { AuthService } from '@/services/authService';
import { useUser } from '@/contexts/UserContext';
import { Button } from '@/components/common/Button';
import './PinAuth.less';

export const PinAuth: React.FC = () => {
  const [pin, setPin] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [isRegisterMode, setIsRegisterMode] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { login } = useUser();

  const handleLogin = async () => {
    try {
      setLoading(true);
      setError('');
      
      const response = await AuthService.login({ pin });
      login(response.userId, response.displayName);
    } catch (err: any) {
      setError(err.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async () => {
    try {
      setLoading(true);
      setError('');
      
      const response = await AuthService.register({ 
        pin, 
        displayName: displayName || `User ${pin}` 
      });
      login(response.userId, response.displayName);
    } catch (err: any) {
      setError(err.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (pin.length < 4) {
      setError('PIN must be at least 4 digits');
      return;
    }

    if (isRegisterMode) {
      handleRegister();
    } else {
      handleLogin();
    }
  };

  const handlePinChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, ''); // Only digits
    if (value.length <= 6) {
      setPin(value);
      setError('');
    }
  };

  return (
    <div className="pin-auth">
      <div className="pin-auth__container">
        <div className="pin-auth__header">
          <h1>Mega Drive Organizer</h1>
          <p>{isRegisterMode ? 'Create a PIN to get started' : 'Enter your PIN to continue'}</p>
        </div>

        <form onSubmit={handleSubmit} className="pin-auth__form">
          <div className="pin-auth__field">
            <label htmlFor="pin">PIN (4-6 digits)</label>
            <input
              type="text"
              id="pin"
              value={pin}
              onChange={handlePinChange}
              placeholder="Enter PIN"
              className="pin-auth__pin-input"
              maxLength={6}
              disabled={loading}
            />
          </div>

          {isRegisterMode && (
            <div className="pin-auth__field">
              <label htmlFor="displayName">Display Name (Optional)</label>
              <input
                type="text"
                id="displayName"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                placeholder="How should we call you?"
                className="pin-auth__input"
                disabled={loading}
              />
            </div>
          )}

          {error && (
            <div className="pin-auth__error">
              {error}
            </div>
          )}

          <Button
            type="submit"
            variant="primary"
            loading={loading}
            disabled={loading || pin.length < 4}
            className="pin-auth__submit"
          >
            {isRegisterMode ? 'Create Account' : 'Sign In'}
          </Button>
        </form>

        <div className="pin-auth__toggle">
          <button
            type="button"
            onClick={() => {
              setIsRegisterMode(!isRegisterMode);
              setError('');
            }}
            className="pin-auth__toggle-button"
          >
            {isRegisterMode ? 'Already have a PIN? Sign in' : "Don't have a PIN? Create one"}
          </button>
        </div>
      </div>
    </div>
  );
};