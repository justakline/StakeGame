import "./Input.css";

const Input = ({ bntText, btnId, ...rest }) => {
  return (
    <div className="cusInput">
      <input type="number" min="0" {...rest} />
      {bntText && <button id={btnId}>{bntText}</button>}
    </div>
  );
};

export default Input;
