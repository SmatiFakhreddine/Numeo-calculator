import React, {useState} from 'react';
import './Button.css';

const Button = ({ className, value, onClick }) => {

  const [style, setStyle] = useState(false);
  
  return (
    <button 
    className={className} 
    style={ style ? {background: "rgb(27, 26, 26)", color: "#eee"} : {}}
    onClick={onClick}
    onClickCapture={() => {
      className == "" && 
      setStyle(true)
        const styleFlash = setTimeout(() => {
        setStyle(false);
        }, 250);
    }}>{value}</button>
  );
};

export default Button;
