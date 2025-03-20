import React from 'react';
import './Button.css';

interface ButtonProps {
  text: string;
  type?: 'button' | 'submit' | 'reset';
  disabled?: boolean;
}

const Button: React.FC<ButtonProps> = ({ text, type = 'button', disabled=false }) => {
  return (
    <button type={type} disabled={disabled} className='custom-btn'>
      {text}
    </button>
  );
};

export default Button;
