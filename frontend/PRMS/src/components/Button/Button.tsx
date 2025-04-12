import React from 'react';
import './Button.css';

interface ButtonProps {
  text: string;
  type?: 'button' | 'submit' | 'reset';
  disabled?: boolean;
  width?: number;
}

const Button: React.FC<ButtonProps> = ({ text, width, type = 'button', disabled=false }) => {
  return (
    <button type={type} disabled={disabled} className='custom-btn' style={{ width: width }}>
      {text}
    </button>
  );
};

export default Button;
