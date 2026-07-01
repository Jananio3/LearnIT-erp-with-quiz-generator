import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  auth,
  db,
  collection,
  query,
  where,
  getDocs,
} from "../config/firebase-config";
import { signInWithEmailAndPassword } from "firebase/auth";
import "bootstrap/dist/css/bootstrap.min.css";
import Cookies from "js-cookie";
import { Spinner } from "react-bootstrap";
import "./css/Login.css"; // Custom CSS for additional styling
import logo from "./public/logo.png";

const Login = ({ setIsLogin, setUserName }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      console.log("Attempting to login with email:", email);
      const userCredential = await signInWithEmailAndPassword(
        auth,
        email,
        password
      );
      const user = userCredential.user;
      const token = await user.getIdToken();

      console.log("User logged in successfully:", user);
      
      // Store the authentication token, user ID, and other necessary details in cookies
      Cookies.set("authToken", token, { expires: 7 });
      Cookies.set("userId", user.uid, { expires: 7 }); // Storing the user ID

      let userName = "";
      let role = "";

      const studentQuery = query(
        collection(db, "students"),
        where("email", "==", email)
      );
      const studentSnapshot = await getDocs(studentQuery);

      if (!studentSnapshot.empty) {
        const studentData = studentSnapshot.docs[0].data();
        userName = studentData.name;
        role = "student";
      }

      const teacherQuery = query(
        collection(db, "teachers"),
        where("email", "==", email)
      );
      const teacherSnapshot = await getDocs(teacherQuery);

      if (!teacherSnapshot.empty) {
        const teacherData = teacherSnapshot.docs[0].data();
        userName = teacherData.name;
        role = "teacher";
      }

      if (role) {
        // Storing additional information like role, username, and login status in cookies
        Cookies.set("role", role, { expires: 7 });
        Cookies.set("userName", userName, { expires: 7 });
        Cookies.set("isLogin", "true", { expires: 7 });
        
        // Update state to reflect the successful login
        setIsLogin(true);
        setUserName(userName);

        console.log(`Login successful as ${role} - User Name: ${userName}`);
        navigate("/"); // Redirect to the home page or dashboard
      } else {
        setError("User not found.");
      }
    } catch (error) {
      console.error("Login Error:", error);
      setError("Invalid email or password.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    console.log(window.location.pathname);
  }, []);

  return (
    <div className="login-page d-flex align-items-center justify-content-center">
      <div className="login-container">
        <div className="card login-card shadow-lg">
          <div className="card-body p-5 pt-2 pl-0 ml-0 logo-cover">
            <img src={logo} alt="logo" width={100} />
            <h2 className="mb-4 font-weight-bold">Nice to see you back</h2>
            <p className="text-muted mb-4">
              Please log in to access your account.
            </p>
            {error && <div className="alert alert-danger">{error}</div>}
            <form onSubmit={handleLogin}>
              <div className="mb-3">
                <label htmlFor="email" className="form-label">
                  Email address
                </label>
                <input
                  type="email"
                  className="form-control"
                  id="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              <div className="mb-4">
                <label htmlFor="password" className="form-label">
                  Password
                </label>
                <input
                  type="password"
                  className="form-control"
                  id="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
              <button type="submit" className="btn btn-primary w-100 mb-3">
                {isLoading ? (
                  <Spinner style={{ alignSelf: "center" }} />
                ) : (
                  "Login"
                )}
              </button>
              <p className="text-muted mt-3">
                Forgot password?{" "}
                <Link to="/forgot-pass" className="text-primary">
                  Click here
                </Link>
              </p>
              <p className="text-muted mt-3">
                Don't have an account?{" "}
                <Link to="/register" className="text-primary">
                  Sign up
                </Link>
              </p>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
