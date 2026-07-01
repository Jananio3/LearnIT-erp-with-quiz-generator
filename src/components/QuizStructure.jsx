import React, { useState, useEffect } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import Cookies from "js-cookie";
import {
  collection,
  db,
  addDoc,
  doc,
  getDoc,
  updateDoc,
  arrayUnion,
} from "../config/firebase-config";
import { useNavigate, useParams } from "react-router-dom";
import "./css/QuizStructure.css"; // Custom CSS for additional styling

const QuizStructure = ({ questions }) => {
  const [selectedAnswers, setSelectedAnswers] = useState({});
  const [showResults, setShowResults] = useState(false);
  const [title, setTitle] = useState("");
  const [score, setScore] = useState(null);
  const role = Cookies.get("role");
  const navigate = useNavigate();
  const { quizId } = useParams();
  const subject = Cookies.get("subject");
  const year = Cookies.get("year");

  

  const handleApprove = async () => {
    if (!title) {
      alert("Please enter a title for the quiz.");
      return;
    }

    const approvedQuiz = {
      title,
      questions,
      subject,
      year,
      approvedAt: new Date(),
      attemptedBy: [],
    };

    try {
      const quizzesCollection = collection(db, "quizzes");
      await addDoc(quizzesCollection, approvedQuiz);

      setTitle("");
      setSelectedAnswers({});
      setShowResults(false);
      alert("Quiz approved and saved to Firestore!");
    } catch (error) {
      console.error("Error saving quiz to Firestore: ", error);
      alert("Error saving quiz to Firestore.");
    } finally {
      navigate("/");
    }
  };

  const handleCancel = () => {
    setTitle("");
    setSelectedAnswers({});
    setShowResults(false);
    alert("Quiz approval has been canceled.");
    navigate("/");
  };

  const handleOptionChange = (questionIndex, option) => {
    const selectedOption = option.split(".")[0];
    setSelectedAnswers((prev) => ({
      ...prev,
      [questionIndex]: selectedOption,
    }));
  };

  const handleSubmit = async () => {
    console.log(quizId);

    let correctCount = 0;
    questions.forEach((q, index) => {
      if (selectedAnswers[index] === q.correctAnswer) {
        correctCount++;
      }
    });

    const totalMarks = questions.length;
    setScore(`${correctCount}/${totalMarks}`);
    setShowResults(true);

    const userId = Cookies.get("userId");
    if (!userId || !quizId) {
      console.error("User ID or Quiz ID is missing.");
      return;
    }

    try {
      const userRef = doc(db, "students", userId);
      const userDoc = await getDoc(userRef);

      if (!userDoc.exists()) {
        console.error("User data not found.");
        return;
      }

      const userData = userDoc.data();
      const quizRef = doc(db, "quizzes", quizId);
      const quizTitle = await getDoc(quizRef);

      // Update the quiz document to store attemptedBy info
      await updateDoc(quizRef, {
        attemptedBy: arrayUnion({
          userId,
          name: userData.name,
          score: correctCount,
          totalMarks,
          year,
          attemptedAt: new Date(), // Store the attempt timestamp
        }),
      });

      // Update student's document to store quizStats
      if (quizTitle) {
        await updateDoc(userRef, {
          quizStats: arrayUnion({
            quizId,
            title: quizTitle.data().title,
            subject,
            quizTakenAt: new Date(),
            score: `${correctCount}/${totalMarks}`,
          }),
        });
      }

      alert("Your score has been recorded!");
      navigate("/");
    } catch (error) {
      console.error("Error updating quiz:", error);
      alert("Error recording your score.");
    }
  };

  const renderOptions = (options, questionIndex) => {
    return options.map((option, i) => (
      <div key={i} className="form-check">
        <input
          className="form-check-input"
          type="radio"
          name={`question-${questionIndex}`}
          value={option}
          onChange={() => handleOptionChange(questionIndex, option)}
          disabled={role === "teacher" || showResults}
        />
        <label className="form-check-label">{option}</label>
      </div>
    ));
  };

  const renderResult = (questionIndex, correctAnswer) => {
    return (
      <p
        className={`result-text ${
          selectedAnswers[questionIndex] === correctAnswer
            ? "correct"
            : "incorrect"
        }`}
      >
        {selectedAnswers[questionIndex] === correctAnswer
          ? "✅ Correct"
          : `❌ Incorrect (Answer: ${correctAnswer})`}
      </p>
    );
  };

  return (
    <div className="quiz-structure-page">
      <div className="quiz-container container py-5">
        <h2 className="text-center mb-4 font-weight-bold">Quiz</h2>
        {role === "teacher" && (
          <div className="mb-4">
            <label htmlFor="quizTitle" className="form-label">
              Title
            </label>
            <input
              id="quizTitle"
              type="text"
              className="form-control"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter quiz title"
            />
          </div>
        )}

        {questions.map((q, index) => (
          <div
            key={index}
            className="quiz-question mb-4 p-4 border rounded shadow-sm"
          >
            <h4>{q.question}</h4>
            <div className="options">{renderOptions(q.options, index)}</div>
            {showResults &&
              role === "student" &&
              renderResult(index, q.correctAnswer)}

            {role === "teacher" && (
              <div className="mt-3">
                <strong>Correct Answer: </strong>
                <p>{q.correctAnswer}</p>
              </div>
            )}
          </div>
        ))}

        {!showResults && role === "student" && (
          <div className="text-center">
            <button className="btn btn-primary" onClick={handleSubmit}>
              Submit
            </button>
          </div>
        )}

        {showResults && role === "student" && (
          <div className="text-center mt-4">
            <h4>Your Score: {score}</h4>
          </div>
        )}

        {role === "teacher" && (
          <div className="text-center mt-4 d-flex flex-column">
            <button
              className="btn btn-success"
              onClick={handleApprove}
              disabled={!title}
            >
              Approve
            </button>
            <button className="btn btn-danger" onClick={handleCancel}>
              Cancel
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default QuizStructure;
