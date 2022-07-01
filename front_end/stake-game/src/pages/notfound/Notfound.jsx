import { Link } from "react-router-dom";
import "./notfound.css";
import { EmojiNeutral } from "react-bootstrap-icons";

/*
    dependencies: react-bootstrap-icons,
*/

export default function Notfound() {
  return (
    <div className="notFoundPage">
      <h2>
        404 &nbsp; <EmojiNeutral />
      </h2>
      <h5>PAGE NOT FOUND !</h5>
      <Link to="/">Back</Link>
    </div>
  );
}
