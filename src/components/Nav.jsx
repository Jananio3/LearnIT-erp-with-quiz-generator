import React from "react";
import { Link } from "react-router-dom";
import Cookies from "js-cookie";
import { useNavigate } from "react-router-dom";
import "./css/Nav.css"; // Import the updated CSS file
import logo from "./public/logo.png";

function Nav({ isLogin, setIsLogin }) {
  const navigate = useNavigate();

  const handleLogout = () => {
    Cookies.remove("role");
    Cookies.remove("userId");
    Cookies.remove("isLogin");
    setIsLogin(false);
    navigate("/login");
  };

  return (
    <nav className="navbar-this">
  <div className="nav-cover">
    <Link to={"/"}>
      <img src={logo} alt="logo" width={100} />
    </Link>
    <ul className="navbar-nav-this">
      {isLogin && (
        <>
          <li className="nav-item">
            <Link className="nav-link" to="/profile">
              Profile
            </Link>
          </li>
          <li className="nav-item">
            <button className="btn" onClick={handleLogout}>
              Logout
            </button>
          </li>
        </>
      )}
    </ul>
  </div>
</nav>

  );
}

export default Nav;
