import "./Footer.css";
import { FileEarmarkText, Twitter, Discord } from "react-bootstrap-icons";

const Footer = () => {
  return (
    <div className="footer">
      <div className="container">
        <div className="row justify-content-center">
          <div className="col-md-5">
            <span className="footerLeft">&copy; Copyright Stake Game 2022</span>
          </div>
          <div className="col-md-5">
            <ul className="footerRight">
              <li>
                <a href="#">
                  <FileEarmarkText />
                </a>
              </li>
              <li>
                <a href="#">
                  <Twitter />
                </a>
              </li>
              <li>
                <a href="#">
                  <Discord />
                </a>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Footer;
