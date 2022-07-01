import "./Timer.css";

const Timer = ({ data, text }) => {
  return (
    <div className="TimerBox">
      <h2 className="gradientText timerText">{data}</h2>
      <h4>{text}</h4>
    </div>
  );
};

export default Timer;
