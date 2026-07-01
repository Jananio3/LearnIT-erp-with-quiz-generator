import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { db } from "../config/firebase-config";
import { collection, query, where, getDocs } from "firebase/firestore";
import { Container, Table, Spinner, Alert } from "react-bootstrap";

function StudentDetails() {
  const { studentId } = useParams(); // Get student ID from URL
  const [quizAttempts, setQuizAttempts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchStudentQuizAttempts = async () => {
      try {
        if (!studentId) {
          setError("Student ID not found.");
          setLoading(false);
          return;
        }

        // Query quizzes where attemptedBy contains this student ID
        const quizzesQuery = query(collection(db, "quizzes"));
        const quizzesSnapshot = await getDocs(quizzesQuery);

        let studentQuizAttempts = [];

        quizzesSnapshot.forEach((doc) => {
          const quizData = doc.data();
          const attemptedBy = quizData.attemptedBy || [];

          // Find the student's attempt in this quiz
          const studentAttempt = attemptedBy.find((attempt) => attempt.userId === studentId);

          if (studentAttempt) {
            studentQuizAttempts.push({
              quizTitle: quizData.title,
              score: studentAttempt.score,
              totalMarks: studentAttempt.totalMarks,
              attemptedAt: studentAttempt.attemptedAt?.toDate().toLocaleString() || "N/A",
            });
          }
        });

        if (studentQuizAttempts.length === 0) {
          setError("No quiz attempts found for this student.");
        } else {
          setQuizAttempts(studentQuizAttempts);
        }
      } catch (err) {
        setError(`Error: ${err.message}`);
      } finally {
        setLoading(false);
      }
    };

    fetchStudentQuizAttempts();
  }, [studentId]);

  return (
    <Container className="py-5 bodycont">
      <h2 className="text-center mb-4">Student Quiz Attempts</h2>

      {loading && (
        <div className="text-center">
          <Spinner animation="border" role="status">
            <span className="visually-hidden">Loading...</span>
          </Spinner>
        </div>
      )}

      {error && <Alert variant="danger" className="text-center">{error}</Alert>}

      {!loading && !error && (
        <Table striped bordered hover className="shadow-lg">
          <thead>
            <tr>
              <th>Sr. No.</th>
              <th>Quiz Title</th>
              <th>Score</th>
              <th>Total Marks</th>
              <th>Attempted At</th>
            </tr>
          </thead>
          <tbody>
            {quizAttempts.map((attempt, index) => (
              <tr key={index}>
                <td>{index + 1}</td>
                <td>{attempt.quizTitle}</td>
                <td>{attempt.score}</td>
                <td>{attempt.totalMarks}</td>
                <td>{attempt.attemptedAt}</td>
              </tr>
            ))}
          </tbody>
        </Table>
      )}
    </Container>
  );
}

export default StudentDetails;
