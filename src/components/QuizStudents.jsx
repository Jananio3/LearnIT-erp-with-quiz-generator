import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { db, doc, getDoc } from "../config/firebase-config";
import "./css/QuizStudents.css"; // Custom CSS for styling

function QuizStudents() {
  const { quizId } = useParams();
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchQuizData = async () => {
      try {
        const quizDocRef = doc(db, "quizzes", quizId);
        const quizDocSnap = await getDoc(quizDocRef);

        if (quizDocSnap.exists()) {
          const quizData = quizDocSnap.data();
          const attemptedBy = quizData.attemptedBy || [];
          setStudents(attemptedBy);
        } else {
          console.log("No such quiz!");
        }
      } catch (error) {
        console.error("Error fetching quiz data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchQuizData();
  }, [quizId]);

  return (
    <div className="quiz-students-page">
      <div className="quiz-students-container">
        <h1 className="page-title">Students Who Attempted the Quiz</h1>
        {loading ? (
          <div className="loading-spinner">Loading students...</div>
        ) : students.length > 0 ? (
          <div className="students-grid">
            {students.map((student, index) => (
              <div key={index} className="student-card">
                <h3 className="student-name">{student.name}</h3>
                <p className="student-score">Score: {student.score}</p>
              </div>
            ))}
          </div>
        ) : (
          <div className="no-students-message">
            No students have attempted this quiz yet.
          </div>
        )}
      </div>
    </div>
  );
}

export default QuizStudents;