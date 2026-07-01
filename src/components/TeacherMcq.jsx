import React, { useState, useEffect } from "react";
import { db } from "../config/firebase-config";
import {
  collection,
  query,
  where,
  getDocs,
  doc,
  getDoc,
} from "firebase/firestore";
import Cookies from "js-cookie";
import { Card, Button, Spinner, Alert, Container } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import "./css/TeacherMcq.css";


function TeacherMcq({ setQuestions }) {
  const [quizzes, setQuizzes] = useState([]);
  const [loadingAttempts, setLoadingAttempts] = useState(true);
  const [error, setError] = useState("");
  const [attemptedQuizzes, setAttemptedQuizzes] = useState({});
  const navigate = useNavigate();
  const userId = Cookies.get("userId");
  const role = Cookies.get("role");

  useEffect(() => {
    const fetchQuizzes = async () => {
      try {
        if (!userId || !role) {
          setError("User authentication failed. Please log in.");
          return;
        }

        const userRef = doc(db, role === "teacher" ? "teachers" : "students", userId);
        const userDoc = await getDoc(userRef);

        if (!userDoc.exists()) {
          setError("User not found.");
          return;
        }

        const year = Cookies.get('year')

        if (!year) {
          setError("User's subject or year not defined.");
          return;
        }

        const quizzesRef = collection(db, "quizzes");
        const quizQuery = query(
          quizzesRef,
          where("year", "==", year)
        );

        const querySnapshot = await getDocs(quizQuery);
        const fetchedQuizzes = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));

        if (fetchedQuizzes.length > 0) {
          setQuizzes(fetchedQuizzes);
          checkIfAttempted(fetchedQuizzes);
        } else {
          setError("No quizzes available for your subject and year.");
          setLoadingAttempts(false);
        }
      } catch (err) {
        setError(`Error: ${err.message}`);
        setLoadingAttempts(false);
      }
    };

    fetchQuizzes();
  }, [userId, role]);

  const checkIfAttempted = async (quizzes) => {
    let attempts = {};
    for (const quiz of quizzes) {
      const quizRef = doc(db, "quizzes", quiz.id);
      const quizDoc = await getDoc(quizRef);

      if (quizDoc.exists()) {
        const attemptedBy = quizDoc.data().attemptedBy || [];
        const studentAttempt = attemptedBy.find((attempt) => attempt.userId === userId);

        if (studentAttempt) {
          attempts[quiz.id] = studentAttempt;
        }
      }
    }
    setAttemptedQuizzes(attempts);
    setLoadingAttempts(false);
  };

  const handleTakeQuiz = async (quiz) => {
    try {
      const quizRef = doc(db, "quizzes", quiz.id);
      const quizDoc = await getDoc(quizRef);

      if (quizDoc.exists()) {
        const quizData = quizDoc.data();
        setQuestions(quizData.questions || []);
        navigate(`/quiz/${quiz.id}`);
      } else {
        setError("Quiz not found.");
      }
    } catch (err) {
      setError(`Error: ${err.message}`);
    }
  };

  return (
    <div className="teacher-mcq-page">
      <Container className="py-5">
        <h2 className="text-center mb-4 font-weight-bold">Available Quizzes</h2>

        {error && (
          <Alert variant="danger" className="text-center">
            {error}
          </Alert>
        )}

        <div className="d-flex flex-wrap justify-content-center">
          {loadingAttempts ? (
            <div className="text-center">
              <Spinner animation="border" role="status">
                <span className="visually-hidden">Loading quiz attempts...</span>
              </Spinner>
            </div>
          ) : quizzes.length > 0 ? (
            quizzes.map((quiz) => (
              <Card key={quiz.id} className="m-3 quiz-card">
                <Card.Body className="text-center">
                  <Card.Title className="mb-3">{quiz.title.toUpperCase()}</Card.Title>
                  <p className="text-muted">
                    {quiz.approvedAt ? new Date(quiz.approvedAt.seconds * 1000).toLocaleDateString() : "No date available"}
                  </p>

                  {attemptedQuizzes[quiz.id] ? (
                    <p className="text-success">
                      Score: {attemptedQuizzes[quiz.id].score}/{attemptedQuizzes[quiz.id].totalMarks}
                    </p>
                  ) : (
                    <Button
                      variant="primary"
                      onClick={() => handleTakeQuiz(quiz)}
                      className="w-100"
                    >
                      Take Quiz
                    </Button>
                  )}
                </Card.Body>
              </Card>
            ))
          ) : (
            <p className="text-center text-muted">No quizzes available.</p>
          )}
        </div>
      </Container>
    </div>
  );
}

export default TeacherMcq;
