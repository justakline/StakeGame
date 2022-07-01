import "./Card.css";

const Card = (props) => {
  const { heading, text } = props;
  return (

    <div className="cCard" >
      <h2 className="cHeading">{heading}</h2>
      <p className="cText">{text}</p>
    </div>

  );
};

export default Card;
