import React, { useState } from "react";
import { db, auth } from "../config/firebase-config";
import { doc, setDoc } from "firebase/firestore";
import { createUserWithEmailAndPassword } from "firebase/auth";
import "bootstrap/dist/css/bootstrap.min.css";
import "./css/Register.css";
import { Link, useNavigate } from "react-router-dom";
import { Spinner } from "react-bootstrap";
import logo from "./public/logo.png";

// ...imports remain unchanged

const Register = () => {
  const [activeTab, setActiveTab] = useState("student");
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    year: "",
    subjects: [""], // For teachers
  });

  const [errorMessage, setErrorMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubjectChange = (index, value) => {
    const newSubjects = [...formData.subjects];
    newSubjects[index] = value;
    setFormData({ ...formData, subjects: newSubjects });
  };

  const addSubjectField = () => {
    setFormData({ ...formData, subjects: [...formData.subjects, ""] });
  };

  const handleTabSwitch = (tab) => {
    setFormData({
      name: "",
      email: "",
      password: "",
      year: "",
      subjects: [""],
    });
    setActiveTab(tab);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        formData.email,
        formData.password
      );
      const user = userCredential.user;
      const userType = activeTab === "student" ? "students" : "teachers";

      if (user?.uid) {
        const userRef = doc(db, userType, user.uid);

        const userData = {
          name: formData.name,
          email: formData.email,
          role: userType,
        };

        if (userType === "students") {
          userData.year = formData.year;
          userData.quizStats = [];
        } else {
          userData.subjects = formData.subjects.filter((s) => s?.trim?.() !== "");
          userData.myStudents = [];
        }

        await setDoc(userRef, userData);
      }

      setFormData({
        name: "",
        email: "",
        password: "",
        year: "",
        subjects: [""],
      });
      alert("Registration successful!");
      navigate("/login");
    } catch (error) {
      setErrorMessage(error.message.split(":")[1].trim());
      console.error("Error during registration: ", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="register-page d-flex align-items-center justify-content-center">
      <div className="register-container">
        <div className="card register-card shadow-lg">
          <div className="card-body p-5 pt-2 logo-cover">
            <img src={logo} alt="logo" width={100} />
            <h2 className="mb-4 font-weight-bold">Join LearnIT</h2>
            <p className="text-muted mb-4">Create an account to get started.</p>

            <ul className="nav nav-tabs nav-justified mb-4">
              {["student", "teacher"].map((type) => (
                <li className="nav-item" key={type}>
                  <button
                    className={`nav-link ${activeTab === type ? "active" : ""}`}
                    onClick={() => handleTabSwitch(type)}
                  >
                    {type.charAt(0).toUpperCase() + type.slice(1)}
                  </button>
                </li>
              ))}
            </ul>

            <div className="tab-content">
              <div
                className={`tab-pane fade ${
                  activeTab === "student" ? "show active" : ""
                }`}
              >
                <form onSubmit={handleSubmit}>
                  <InputField
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    placeholder="Full Name"
                  />
                  <InputField
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    placeholder="Email"
                  />
                  <InputField
                    name="password"
                    type="password"
                    value={formData.password}
                    onChange={handleInputChange}
                    placeholder="Password"
                  />
                  <SelectYear
                    year={formData.year}
                    onChange={handleInputChange}
                  />

                  {errorMessage && (
                    <div className="alert alert-danger">{errorMessage}</div>
                  )}
                  <SubmitButton
                    loading={isLoading}
                    label="Register as Student"
                  />
                </form>
              </div>

              <div
                className={`tab-pane fade ${
                  activeTab === "teacher" ? "show active" : ""
                }`}
              >
                <form onSubmit={handleSubmit}>
                  <div className="mb-3">
                    <input
                      type="text"
                      name="name"
                      placeholder="Full Name"
                      value={formData.name}
                      onChange={handleInputChange}
                      required
                      className="form-control"
                    />
                  </div>
                  <div className="mb-3">
                    <input
                      type="email"
                      name="email"
                      placeholder="Email"
                      value={formData.email}
                      onChange={handleInputChange}
                      required
                      className="form-control"
                    />
                  </div>
                  <div className="mb-3">
                    <input
                      type="password"
                      name="password"
                      placeholder="Password"
                      value={formData.password}
                      onChange={handleInputChange}
                      required
                      className="form-control"
                    />
                  </div>

                  <label className="mb-1">Subjects You Teach:</label>
                  <label className="mb-1">Subjects You Teach:</label>
                  {formData.subjects.map((subject, index) => (
                    <div
                      key={index}
                      className="mb-2 d-flex gap-2 align-items-center"
                    >
                      <input
                        type="text"
                        placeholder="Subject"
                        value={subject.name || ""}
                        onChange={(e) => {
                          const updatedSubjects = [...formData.subjects];
                          updatedSubjects[index] = {
                            ...updatedSubjects[index],
                            name: e.target.value,
                          };
                          setFormData({
                            ...formData,
                            subjects: updatedSubjects,
                          });
                        }}
                        className="form-control"
                        required
                      />
                      <select
                        className="form-select"
                        value={subject.year || ""}
                        onChange={(e) => {
                          const updatedSubjects = [...formData.subjects];
                          updatedSubjects[index] = {
                            ...updatedSubjects[index],
                            year: e.target.value,
                          };
                          setFormData({
                            ...formData,
                            subjects: updatedSubjects,
                          });
                        }}
                        required
                      >
                        <option value="">Year</option>
                        <option>First Year</option>
                        <option>Second Year</option>
                      </select>
                      {formData.subjects.length > 1 && (
                        <button
                          type="button"
                          className="btn btn-danger btn-sm"
                          onClick={() => {
                            const updatedSubjects = formData.subjects.filter(
                              (_, i) => i !== index
                            );
                            setFormData({
                              ...formData,
                              subjects: updatedSubjects,
                            });
                          }}
                        >
                          ❌
                        </button>
                      )}
                    </div>
                  ))}
                  <button
                    type="button"
                    className="btn btn-secondary btn-sm mb-3"
                    onClick={() =>
                      setFormData({
                        ...formData,
                        subjects: [
                          ...formData.subjects,
                          { name: "", year: "" },
                        ],
                      })
                    }
                  >
                    + Add Another Subject
                  </button>

                  {errorMessage && (
                    <div className="alert alert-danger">{errorMessage}</div>
                  )}
                  <button type="submit" className="btn btn-primary w-100">
                    {isLoading ? <Spinner /> : "Register as Teacher"}
                  </button>
                </form>
              </div>
            </div>

            <p className="text-muted mt-3">
              Already have an account?{" "}
              <Link to={"/login"} className="text-primary">
                Login
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

// Reusable components
const InputField = ({ name, value, onChange, placeholder, type = "text" }) => (
  <div className="mb-3">
    <input
      type={type}
      name={name}
      value={value}
      onChange={onChange}
      required
      className="form-control"
      placeholder={placeholder}
    />
  </div>
);

const SelectYear = ({ year, onChange }) => (
  <div className="mb-3">
    <select
      name="year"
      value={year}
      onChange={onChange}
      required
      className="form-select"
    >
      <option value="">Year</option>
      <option>First Year</option>
      <option>Second Year</option>
    </select>
  </div>
);

const SubmitButton = ({ loading, label }) => (
  <button type="submit" className="btn btn-primary w-100">
    {loading ? <Spinner style={{ alignSelf: "center" }} /> : label}
  </button>
);

export default Register;
