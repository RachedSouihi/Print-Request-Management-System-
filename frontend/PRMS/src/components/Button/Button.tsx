import React from 'react'

import './Button.css'

const  Button: React.FC<{text: string, type:string}> = ({text, type="button"}: any): React.ReactNode =>  {
  return (
    <button type={type} className='custom-btn'>{text}</button>
  )
}

export default Button;
