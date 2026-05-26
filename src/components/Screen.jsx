import React, {useState, useEffect, useRef} from 'react';
import Textfit from 'react-textfit';
import './Screen.css';

const Screen = ({ cursor, value, mood, moodClick, operation}) => {

  const [isVisible, setIsVisible] = useState(true);
  const intervalRef = useRef(0);

  const styleCursor = "hidden";
   useEffect(() => {
    intervalRef.current = setInterval(() => {
      setIsVisible(prev => !prev);
    }, 700);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);
  
return(
  <Textfit className="screen" mode="single" max={60}>
    <div className="hightpart">
      <div className="mood" onClick={moodClick}>{mood}</div>
      <div className="display">{value}</div>
    </div>
    <div className="operation">
      <span className={isVisible ? styleCursor : ""}>{cursor ? "'" : "|"}</span>
      {operation} 
    </div>
  </Textfit>
)
};

export default Screen;
