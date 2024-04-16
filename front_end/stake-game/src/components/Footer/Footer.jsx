import "./Footer.css";
import { FileEarmarkText, Twitter, Discord } from "react-bootstrap-icons";

const Footer = () => {
  return (
    <div className="footer">
      <div className="container">
        <div className="row justify-content-center">
          <div className="col-md-5">

            <span className="footerLeft">     &copy; Copyright Stake Game 2022</span>
          </div>
          <div className="col-md-5">
            <ul className="footerRight">
              <li>
                <a target={"_blank"} href="https://stakegame.gitbook.io/stake-game/">
                  <FileEarmarkText />
                </a>
              </li>
              <li>
                <a target={"_blank"} href="https://twitter.com/StakeGame1">
                  <Twitter />
                </a>
              </li>
              <li>
                <a target={"_blank"} href="https://discord.gg/RFYx3ytEw5">
                  <Discord />
                </a>
              </li>
              <span >Created by Justin Kline</span>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Footer;
