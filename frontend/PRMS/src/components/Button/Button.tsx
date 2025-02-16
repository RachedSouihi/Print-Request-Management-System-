import React from 'react'

import './Button.css'

const  Button: React.FC<{text: string, type:string,width:number}> = ({text, type="button",width }: any): React.ReactNode =>  {
  return (
    <button  style={{width :`${width }px`}}  type={type} className='custom-btn'>{text}</button>
  )
}

export default Button;
