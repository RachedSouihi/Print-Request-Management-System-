import React from 'react';
import './Loading.scss';

interface LoadingProps {
  size?: 'sm' | 'md' | 'lg';
  color?: 'primary' | 'secondary' | 'accent';
}

const Loading = ({ size = 'md', color = 'primary' }: LoadingProps) => {
  const sizeMap = {
    sm: '1rem',
    md: '1.5rem',
    lg: '2rem'
  };

  const colorMap = {
    primary: '#4A55A2',
    secondary: '#7895CB',
    accent: '#8A4FFF'
  };

  return (
    <div 
      className="loading-container"
      role="status"
      aria-label="Loading"
    >
      <div className="loading-dots">
        {[...Array(3)].map((_, index) => (
          <div 
            key={index}
            className="dot"
            style={{
              width: sizeMap[size],
              height: sizeMap[size],
              backgroundColor: colorMap[color],
              animationDelay: `${index * 0.2}s`
            }}
          />
        ))}
      </div>
    </div>
  );
};

export default Loading;