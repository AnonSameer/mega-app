// client/src/components/features/PinAuth.tsx
import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext'; // ✅ Use context instead of hook directly
import { Button } from '@/components/common/Button';
import './PinAuth.less';

export const PinAuth: React.FC = () => {
  const [pin, setPin] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [isRegisterMode, setIsRegisterMode] = useState(false);
  const [localError, setLocalError] = useState('');
  
  // ✅ Use the new auth hook
  const { login, register, loading, error, clearError } = useAuth();

  const handleLogin = async () => {
    try {
      setLocalError('');
      clearError();
      
      // ✅ The login function now handles everything (session creation, etc.)
      await login({ pin });
      // No need to manually call login() - the hook handles state updates
    } catch (err: any) {
      setLocalError(err.message || 'Login failed');
    }
  };

  const handleRegister = async () => {
    try {
      setLocalError('');
      clearError();
      
      // ✅ Register with the new hook
      await register({ 
        pin, 
        displayName: displayName || `User ${pin}` 
      });
      
      // After successful registration, switch to login mode
      setIsRegisterMode(false);
      setLocalError('Registration successful! You can now sign in.');
      setDisplayName('');
    } catch (err: any) {
      setLocalError(err.message || 'Registration failed');
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (pin.length < 4) {
      setLocalError('PIN must be at least 4 digits');
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
      setLocalError('');
      clearError();
    }
  };

  // ✅ Show either local error or auth hook error
  const displayError = localError || error?.message;

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

          {displayError && (
            <div className="pin-auth__error">
              {displayError}
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
              setLocalError('');
              clearError();
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