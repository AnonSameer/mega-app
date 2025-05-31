// src/components/common/Button.tsx
import React from 'react';
import './Button.less';

interface ButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  type?: 'button' | 'submit' | 'reset';
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost';
  size?: 'small' | 'medium' | 'large';
  disabled?: boolean;
  loading?: boolean;
  className?: string;
}

export const Button: React.FC<ButtonProps> = ({
  children,
  onClick,
  type = 'button',
  variant = 'primary',
  size = 'medium',
  disabled = false,
  loading = false,
  className = '',
}) => {
  const handleClick = () => {
    if (!disabled && !loading && onClick) {
      onClick();
    }
  };

  return (
    <button
      type={type}
      className={`btn btn--${variant} btn--${size} ${className} ${loading ? 'btn--loading' : ''}`}
      onClick={handleClick}
      disabled={disabled || loading}
    >
      {loading ? (
        <span className="btn__spinner">Loading...</span>
      ) : (
        children
      )}
    </button>
  );
};