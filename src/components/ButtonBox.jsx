import React from 'react';
import './ButtonBox.css';

const ButtonBox = ({ className, value, onClick }) => (
  <div className={className} onClick={onClick}>
    {value}
  </div>
);

export default ButtonBox;
