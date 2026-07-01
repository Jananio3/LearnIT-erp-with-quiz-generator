import React, { useEffect, useState } from "react";
import { db, collection, getDocs, getDoc,doc } from "../config/firebase-config";
import { Link } from "react-router-dom";
import "./css/ViewQuizzes.css"; // Custom CSS for styling
import { useNavigate } from "react-router-dom";
function ViewQuizzes({setQuestions}) {
  const [quizzes, setQuizzes] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchQuizzes = async () => {
      try {
        const quizzesCollection = collection(db, "quizzes");
        const quizzesSnapshot = await getDocs(quizzesCollection);
        const quizzesData = quizzesSnapshot.docs.map((doc) => ({
          id: doc.id,
          title: doc.data().title,
          approvedAt: doc.data().approvedAt?.toDate().toLocaleDateString(),
        }));
        setQuizzes(quizzesData);
      } catch (error) {
        console.error("Error fetching quizzes:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchQuizzes();
  }, []);
  const handleTakeQuiz = async (quiz) => {
      try {
        const quizRef = doc(db, "quizzes", quiz.id);
        const quizDoc = await getDoc(quizRef);
  
        if (quizDoc.exists()) {
          const quizData = quizDoc.data();
          setQuestions(quizData.questions || []);
          navigate(`/quiz/${quiz.id}`);
        } else {
        }
      } catch (err) {
        console.log(err);
        
      }
    };

  return (
    <div className="view-quizzes-page">
      <div className="view-quizzes-container">
        <h1 className="page-title">View Quizzes</h1>
        {loading ? (
          <div className="loading-spinner">Loading quizzes...</div>
        ) : quizzes.length > 0 ? (
          <div className="quiz-grid">
            {quizzes.map((quiz) => (

                <div className="quiz-card d-flex  justify-content-center">
                  <h3 className="quiz-title">{quiz.title}</h3>
                  <p className="quiz-date">Approved on: {quiz.approvedAt}</p>
                  <button className="quiz-button" onClick={()=>handleTakeQuiz(quiz)}>View Quiz</button>
                  <Link className="quiz-button text-center" to={`/student-quiz-details/${quiz.id}`}>View Student Details</Link>
                </div>
            ))}
          </div>
        ) : (
          <div className="no-quizzes-message">
            No quizzes available at the moment.
          </div>
        )}
      </div>
    </div>
  );
}

export default ViewQuizzes;