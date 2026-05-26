import React, { useState } from 'react';
import Wrapper from './components/Wrapper.jsx';
import Screen from './components/Screen.jsx';
import ButtonBox from './components/ButtonBox.jsx';
import Button from './components/Button.jsx';
import './App.css';
import { typeOf, create, all} from 'mathjs';
const math = create(all);
const { sin, cos, tan, asin, acos, atan, unit, evaluate, import: mathImport } = math;

mathImport({
  'deg_asin': (x) => unit(asin(x), 'rad').toNumber('deg'),
  'deg_acos': (x) => unit(acos(x), 'rad').toNumber('deg'),
  'deg_atan': (x) => unit(atan(x), 'rad').toNumber('deg'),
  'grad_asin': (x) => unit(asin(x), 'rad').toNumber('grad'),
  'grad_acos': (x) => unit(acos(x), 'rad').toNumber('grad'),
  'grad_atan': (x) => unit(atan(x), 'rad').toNumber('grad'),
  'deg_sin': (x) => sin(unit(x, 'deg')),
  'deg_cos': (x) => cos(unit(x, 'deg')),
  'deg_tan': (x) => tan(unit(x, 'deg')),
  'grad_sin': (x) => sin(unit(x, 'grad')),
  'grad_cos': (x) => cos(unit(x, 'grad')),
  'grad_tan': (x) => tan(unit(x, 'grad'))
});

let btnValues = [
  ["shift", "π", "(", ")", "%", "Eff"],
  ["Tan", "√", 7, 8, 9, "÷"],
  ["Sin", "xʸ", 4, 5, 6, "×"],
  ["Cos", "10ˣ", 1, 2, 3, "-"],
  ["C", "+-", 0, ".", "=", "+"]
];

const superscripts = {
  '0': '⁰', '1': '¹', '2': '²', '3': '³', '4': '⁴',
  '5': '⁵', '6': '⁶', '7': '⁷', '8': '⁸', '9': '⁹',
  '-': '⁻', '+': '⁺', '(': '⁽', ')': '⁾','.': '·',
  '×': '*','÷' : 'ᐟ','%' : '﹪', 'π' : 'ⁿ', '√' : 'ʳ'
};

function exposantToSuperscript(num) {
  return superscripts[num];
}

function exposantToNumber(expo){
  return Object.entries(superscripts).find(([key, val]) => val === expo)?.[0]
}

const toLocaleString = (x, sep = " ") => 
  String(x).replace(/(?<!\..*)(\d)(?=(?:\d{3})+(?:\.|$))/g, "$1" + sep);

const removeSpaces = (num) => num.toString().replace(/\s/g, "");

const App = () => {
  const [calc, setCalc] = useState({
    num: 0,
    res: "",
    operation: "",
    waitingForNumber: true,
    isResult: false
  });
  const [isScriptio, setScriptio] = useState(false);
  const [isPower, setIsPower] = useState(false);
  const [isShift, setIsShift] = useState(false);
  const [isBtn, setBtn] = useState(btnValues);
  const [mood, setMood] = useState("RAD");
  
  const numClickHandler = (e) => {
    e.preventDefault();
    const value = e.target.innerHTML;
    if (calc.num === "0" && value === "0") return;
    
    let newNum;
    if (calc.waitingForNumber || calc.num == 0) {
      newNum = value;
    } else {
      newNum = calc.num.toString() + value;
    }
    if(!calc.isResult) {
      if (newNum.length <= 16) {
        setCalc({
          ...calc,
          num: Number(newNum) == 0 ? newNum : Number(newNum),
          waitingForNumber: false,
          operation: calc.operation.slice(-1) !== ")" && calc.operation.slice(-1) !== "⁾" ? calc.num !== 0
          ? (calc.num == "0" ? calc.operation.slice(0, -1) : calc.operation) + (isPower ? exposantToSuperscript(value) : value)
          : calc.operation != "" 
          ? calc.operation + (isPower ? exposantToSuperscript(value) : isScriptio ? value : " " + value) 
          : value 
          : calc.operation
        });
      }
    } else {
      setCalc({
        ...calc,
        num: newNum == "0" ? "0" : Number(newNum),
        waitingForNumber: false,
        res: calc.res + calc.operation,
        operation: newNum,
        isResult: false
      });
    }
  };
  
  const commaClickHandler = (e) => {
    e.preventDefault();
    const value = e.target.innerHTML;
    
    if (!calc.num.toString().includes('.') && !calc.isResult) {
      const newNum = calc.num == 0 ? "0" + value : calc.num.toString() + value;
      setCalc({
        ...calc,
        num: newNum, 
        waitingForNumber: false, 
        operation: calc.operation != "" ? 
        isPower ? calc.operation + (calc.num === 0 ? "⁰·" : "·")
        : isScriptio ? calc.num === 0 ? calc.operation + newNum : calc.operation + "."
        : calc.num === 0 ? calc.operation + " " + newNum : calc.operation + "."
        : newNum
      });
    }
  };

  const signClickHandler = (e) => {
    e.preventDefault();
    const value = e.target.innerHTML;
    if ((calc.num === 0 && calc.operation === "") || isPower) {
      return;
    };
    
    let newOperation;
    const array = calc.operation.toString();
    if ((calc.operation && calc.num !== 0 && array.slice(-1) != ".") 
      || array[array.length -1] == ")" || array[array.length -1] == "⁾" 
      || calc.isResult) {
      newOperation = calc.operation + (isScriptio ? value : " " + value);
    } else if (calc.operation && array[array.length -1] !== "(") {
      if (array.slice(-1) == ".") {
        newOperation = calc.operation.slice(0, -1) + (isScriptio ? value : " " + value);
      } else {
        newOperation = calc.operation.slice(0, -1) + value;
      }
    } else {
      newOperation = calc.operation;
    }

    setCalc({
      ...calc,
      num: 0,
      operation: newOperation,
      waitingForNumber: true,
      isResult: false
    });
  };

  const equalsClickHandler = () => {
    if (!calc.isResult && calc.operation) {
    const openLength = calc.operation.split('').filter((item) => item === "(").length;
    const closeLength = calc.operation.split('').filter((item) => item === ")").length;
    if(!isPower && !isScriptio && calc.operation.slice(-1) != "(" && openLength == closeLength) {
      let operation = calc.operation;
      const array = !calc.waitingForNumber ? operation.split('') : operation.toString().split('').slice(0 ,-1);
      const transExpression = array.map(
      (item) => item === "×" ? "*" 
      : item === "÷" ? "/"
      : item === "π" ? "pi"
      : item === "ⁿ" ? "pi"
      : item === "√" ? "sqrt"
      : item === "C" ? mood == "RAD" ? "c" : mood == "DEG" ? "deg_c" : "grad_c"
      : item === "S" ? mood == "RAD" ? "s" : mood == "DEG" ? "deg_s" : "grad_s"
      : item === "T" ? mood == "RAD" ? "t" : mood == "DEG" ? "deg_t" : "grad_t"
      : item === "⁽" ? "^("
      : item === "⁾" ? ")"
      : superscripts[item] ? item 
      : exposantToNumber(item) ? exposantToNumber(item) : item).join('')
      const resultBrut = evaluate(transExpression.replace(/\bdeg_sin-1\b/g, 'deg_asin')
        .replace(/deg_cos-1/g, 'deg_acos')
        .replace(/deg_tan-1/g, 'deg_atan')
        .replace(/grad_sin-1/g, 'grad_asin')
        .replace(/grad_cos-1/g, 'grad_acos')
        .replace(/grad_tan-1/g, 'grad_atan')
        .replace(/sin-1/g, 'asin')
        .replace(/cos-1/g, 'acos')
        .replace(/tan-1/g, 'atan'))
      let result = math.round(resultBrut, 5);

      let finalExpression;
      if (calc.operation) {
        finalExpression = !calc.waitingForNumber ? calc.operation + " = " : calc.operation.slice(0, -1) + " = ";
      } else if (calc.num !== 0) {
        finalExpression = calc.num + " = ";
        result = Number(removeSpaces(calc.num));
      } else {
        finalExpression = result.toString();
      }

      if (isShift) { 
      setIsShift(() => {
        setBtn((prevValue) => {
          const next = prevValue.map((row) => [...row]);
            next[1][0] = "Tan";
            next[2][0] = "Sin";
            next[3][0] = "Cos";
            next[0][4] = "%";
          return next });
        return false;
      })};
      
      setCalc({
        num: result,
        res: finalExpression,
        operation: result,
        waitingForNumber: true,
        isResult: true
      })
      }}
  };
  
  const lastItem = calc.operation.toString().slice(-1);
  const notOper = lastItem != ")" && lastItem != "⁾" ? true : false;

  const invertClickHandler = () => {
    if (calc.num !== 0) {
      let inverted = Number(removeSpaces(calc.num)) * -1;
      let length = calc.num.toString().length;
      const operation = calc.operation.toString().split(' ');
      setCalc({
        ...calc,
        num: inverted,
        operation: calc.operation != "" ?
        isPower ? operation.slice(0, -1).join(' ') + " " + operation.slice(-1)[0].replace(
          calc.num.toString().split('').map((item) => exposantToSuperscript(item)).join(''),
          inverted.toString().split('').map((item) => exposantToSuperscript(item)).join(''))
        : isScriptio ? calc.operation.slice(0, - length) + inverted
        : operation.slice(0, -1).join(' ') + " " + inverted
        : inverted.toString(),
        waitingForNumber: false,
        isResult: false
      });
    }
  };

  const percentClickHandler = () => {
    if (calc.num !== 0) {
      const percentValue = Number(removeSpaces(calc.num)) / 100;
      let length = calc.num.toString().length;
      const operation = calc.operation.toString().split(' ');
      setCalc({
        ...calc,
        num: percentValue,
        operation: calc.operation != "" ? 
        isPower ? operation.slice(0, -1).join(' ') + " " + operation.slice(-1)[0].replace(
        calc.num.toString().split('').map((item) => exposantToSuperscript(item)).join(''), 
        percentValue.toString().split('').map((item) => exposantToSuperscript(item)).join(''))
        : isScriptio ? calc.operation.slice(0, - length) + percentValue 
        : operation.slice(0, -1).join(' ') + " " + percentValue
        : percentValue.toString(),
        waitingForNumber: false,
        isResult: false
      });
    }
  };
  
  const mathPiClickHandler = () => {
    if (calc.isResult){
      setCalc({
        ...calc,
        num: Math.PI,
        res: calc.res + calc.operation,
        operation: "π",
        waitingForNumber: false,
        isResult: false
      });
    } else if (calc.num == 0 && notOper) {
      setCalc({
        ...calc,
        num: Math.PI,
        operation: calc.operation != "" ? isPower 
        ? calc.operation + exposantToSuperscript("π") 
        : isScriptio ? calc.operation + "π"
        : calc.operation + " " + "π" : "π",
        waitingForNumber: false
      });
    }
  };
  
  const squareRootHandler = () => {
    if (calc.isResult){
      setScriptio(true);
      setCalc({
        ...calc,
        num: 0,
        res: calc.res + calc.operation,
        operation: "√(",
        isResult: false
      });
    } else if (calc.num == 0 && !isPower && !isScriptio && notOper) {
      setScriptio(true);
      setCalc({
        ...calc,
        num: 0,
        operation: calc.operation != "" ? calc.operation + " " + "√(" : "√(",
        waitingForNumber: true
      });
    }
  };

  const powerClickHandler = () => {
    if (calc.num !== 0 && !isPower && calc.operation.slice(-1) != "." && !isScriptio) {
      setIsPower(true);
      setCalc({
        ...calc,
        num: 0,
        operation: calc.operation + "⁽",
        waitingForNumber: true,
        isResult: false
      });
    }
  };

  const shiftClickHandler = () => {
      setIsShift((prevValue) => {
        const nextShift = !prevValue;
        setBtn((prevValue) => {
          const next = prevValue.map((row) => [...row]);
          if (nextShift) { 
            next[1][0] = "Tan⁻¹";
            next[2][0] = "Sin⁻¹";
            next[3][0] = "Cos⁻¹";
            next[0][4] = mood;
          } else {
            next[1][0] = "Tan";
            next[2][0] = "Sin";
            next[3][0] = "Cos";
            next[0][4] = "%";
          }
          return next });
        return nextShift;
      });
  };

  const tenPowerClickHandler = () => {
    if (calc.isResult){
      setIsPower(true);
      setCalc({
        ...calc,
        num: 0,
        res: calc.res + calc.operation,
        operation: "10⁽",
        isResult: false
      });
    } else if (calc.num == 0 && !isPower && !isScriptio && notOper) {
      setIsPower(true);
      setCalc({
        ...calc,
        num: 0,
        operation: calc.operation + " " + "10⁽",
        waitingForNumber: true
      });
    }
  };

  const trigonometryClickHandler = (e) => {
    e.preventDefault();
    const value = e.target.innerHTML;
    if (calc.isResult){
      setScriptio(true);
      setCalc({
        ...calc,
        num: 0,
        res: calc.res + calc.operation,
        operation: value + "(",
        isResult: false
      });
    } else if (calc.num == 0 && !isPower && !isScriptio && notOper) {
      setScriptio(true);
      setCalc({
        ...calc,
        num: 0,
        operation: calc.operation != "" 
        ? calc.operation + " " + value + "(" : value + "(",
        waitingForNumber: true
      });
    }
  };
  
  const parenthesisClickHandler = (e) => {
    e.preventDefault();
    const value = e.target.innerHTML;
    const lastItem = calc.operation.slice(-1);
    const openLength = calc.operation.split('').filter((item) => item === "(").length;
    const closeLength = calc.operation.split('').filter((item) => item === ")").length;
    if (calc.isResult && value === "("){
      setCalc({
        ...calc,
        num: 0,
        res: calc.res + calc.operation,
        operation: value,
        isResult: false
      });
    } else if (value === "(" && lastItem != ")" 
        && lastItem != "⁾" && calc.num == 0 && !isPower && !isScriptio 
        || value === ")" && (lastItem  == ")" || lastItem == "⁾" || calc.num !== 0) 
        && ((openLength > closeLength) || isPower)) {
        isPower && setIsPower(false);
        setScriptio(false);
      setCalc({
        ...calc,
        num: 0,
        operation: calc.operation != "" ? 
        isPower ? calc.operation + exposantToSuperscript(value)
        : isScriptio ? calc.operation + value
        : calc.operation + " " + value : value
      });
    }
  };
  
  const moodClickHandler = (e) => {
    e.preventDefault();
    const value = e.target.innerHTML;
    const array = ["DEG", "RAD", "GRD"];
    const index = array.findIndex((item) => item == value && item);
    const newValue = index != 2 ? array[index + 1] : array[0];
    setMood(newValue);
    isShift && setBtn((prevValue) => {
      const next = prevValue.map((row) => [...row]);
      next[0][4] = newValue;
      return next;
    })
  };

  const resetClickHandler = () => {
    setIsPower(false);
    setScriptio(false);
    setCalc({
      num: 0,
      res: "",
      operation: "",
      waitingForNumber: true,
      isResult: false
    });
    setMood("RAD");
    if (isShift) { 
      setIsShift(() => {
        setBtn((prevValue) => {
          const next = prevValue.map((row) => [...row]);
            next[1][0] = "Tan";
            next[2][0] = "Sin";
            next[3][0] = "Cos";
            next[0][4] = "%";
          return next });
        return false;
      })};
  };
  
  const deleteClickHandler = (e) => {
    e.preventDefault();
    if(calc.operation == "") return;
    if(!calc.isResult) {
      
      if (calc.num !== 0 && calc.num.toString().length > 1 && calc.num !== Math.PI) {
        const newNum = calc.num.toString().slice(0, -1);
        const newOperation = isPower || isScriptio ? 
        calc.operation.slice(0, -1) : calc.operation.split(' ').slice(0, -1).join(' ') + " " + newNum
        setCalc({
          ...calc,
          num: newNum,
          waitingForNumber: false,
          operation: newOperation
        });
      } else if (calc.num !== 0) {
        setCalc({
          ...calc,
          num: 0,
          operation: isPower || isScriptio ? calc.operation.slice(0, -1)
          : calc.operation.split(' ').slice(0, -1).join(' '),
          waitingForNumber: true
        });
      } else {

        const newOperation = calc.operation;
        const newArray = isPower && newOperation.slice(-1) != '⁽' || newOperation.slice(-1) == '⁾' 
        ? newOperation.split('') 
        : newOperation.split(' ');

        let expoPart = [];
        let expoNum = 0;
        if(newOperation.slice(-1) == '⁾'){
          expoPart = newOperation.split('⁾') ;
          expoPart.pop();
          expoNum = expoPart[expoPart.length -1].split('⁽')[1];
          expoNum = expoNum.split('').map((item) => exposantToNumber(item)).join('');
        }
        
        let trigArray = [];
        let trigNum = 0;
        const trigCondition = newArray.slice(-1)[0].includes('s') 
        || newArray.slice(-1)[0].includes('n') || newArray.slice(-1)[0].includes('√');
        if(trigCondition){
          trigArray = newOperation.split('(').slice(-1)[0].slice(0, -1);
          trigNum = trigArray.split(/([-×+÷])/).slice(-1)[0];
        }
        
        const newNum = 
        newOperation.slice(-1) == '⁽' ? newArray[newArray.length - 1].slice(0, -1) 
        : newOperation.slice(-1) == '⁾' ? expoNum
        : trigCondition ? trigNum
        : newOperation.includes(' ') 
        ? newArray[newArray.length - 2].slice(-1) == '⁾' ? 0
        : newArray[newArray.length - 2].slice(-1) == ')' ? 0
        : newArray[newArray.length - 2]
        : 0;
        
        !isPower && (newOperation.slice(-1) == '⁾' 
        || newNum[newNum.length -1] == '⁾') && setIsPower(true);
        isPower && newOperation.slice(-1) == '⁽' && setIsPower(false);

        isScriptio && newOperation.slice(-1) == "(" && setScriptio(false);
        trigCondition && newArray[newArray.length - 1].slice(-1) == ')' && setScriptio(true);

        const isString =  newNum == "(" || 
              newNum == ")" || 
              newNum == "+" || 
              newNum == "-" || 
              newNum == "×" || 
              newNum == "÷" || 
              newNum == "√(" ? true : false;
        setCalc({
          ...calc,
          num: isString ? 0 : newNum === "0" ? newNum : (newNum == "π" || newNum == "ⁿ") ? Math.PI : Number(newNum),
          operation: 
          newOperation.slice(-1) != '⁽' ?
           isPower || newOperation.slice(-1) == "⁾" 
          ? newArray.slice(0, -1).join('') 
          : trigCondition && newArray[newArray.length - 1].slice(-1) != '(' ? newOperation.slice(0, -1)
          : newArray.slice(0, -1).join(' ')
          : newOperation.slice(0, -1),
          waitingForNumber: isString
        });
      }
    } else {
      setCalc({
        ...calc,
        num: 0,
        res: calc.res + calc.operation,
        operation: "",
        isResult: false
      });
    }
  };

  return (
    <Wrapper>
      <Screen 
        cursor={isPower}
        operation={calc.operation} 
        mood={mood}
        moodClick={moodClickHandler}
        value={toLocaleString(calc.res)}
      />
      <ButtonBox className={"buttonBox"}
      value={isBtn.flat().map((btn, index) => (
          <Button
            key={index}
            className={
              btn === "=" ? "equals" 
              : btn === "C" || btn === "+-" || btn === "Eff" || btn === "(" || btn === ")" || btn === "%" ? "clear" 
              : btn === "+" || btn === "-" || btn === "÷" || btn === "×" ? "operation" 
              : btn === "DEG" || btn === "RAD" || btn === "GRD" ? "mood"
              : btn === "Sin"|| btn === "Cos" || btn === "Tan" 
              || btn === "π" || btn === "xʸ" || btn === "10ˣ" || btn === "√" ? "sign" 
              : btn === "Cos⁻¹" || btn === "Sin⁻¹" || btn === "Tan⁻¹" ? "trig" 
              : btn === "shift" ? "shift" :""}
            value={btn}
            onClick={
              btn === "C" 
                ? resetClickHandler 
                : btn === "+-" 
                ? invertClickHandler 
                : btn === "Eff" 
                ? deleteClickHandler 
                : btn === "=" 
                ? equalsClickHandler 
                : btn === "÷" || btn === "-" || btn === "+" || btn === "×" 
                ? signClickHandler 
                : btn === "." 
                ? commaClickHandler 
                : btn === "%" 
                ? percentClickHandler
                : btn === "(" || btn === ")" 
                ? parenthesisClickHandler
                : btn === "π" 
                ? mathPiClickHandler
                : btn === "√" 
                ? squareRootHandler
                : btn === "xʸ" 
                ? powerClickHandler
                : btn === "10ˣ"
                ? tenPowerClickHandler
                : btn === "Cos" || btn === "Sin" || btn === "Tan"
                || btn === "Cos⁻¹" || btn === "Sin⁻¹" || btn === "Tan⁻¹"
                ? trigonometryClickHandler
                : btn === "DEG" || btn === "RAD" || btn === "GRD"
                ? moodClickHandler
                : btn === "shift"
                ? shiftClickHandler
                : numClickHandler
            }
          />
        ))}
      >
      </ButtonBox>
    </Wrapper>
  );
};

export default App;