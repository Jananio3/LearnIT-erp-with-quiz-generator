import React, { useEffect, useState } from "react";
import { db } from "../config/firebase-config";
import { collection, getDocs } from "firebase/firestore";
import Cookies from "js-cookie";
import { Spinner, Alert, Card, Container, Row, Col } from "react-bootstrap";
import { Pie } from "react-chartjs-2";
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement } from "chart.js";

// Register chart elements
ChartJS.register(CategoryScale, LinearScale, BarElement, ArcElement, Title, Tooltip, Legend);

function MyStats() {
  const [stats, setStats] = useState({
    totalQuizzes: 0,
    averageScore: 0,
    highestScore: 0,
    lowestScore: 0,
    highestScoreTitle: "",
    lowestScoreTitle: "",
    scores: [],
    quizTitles: [],
    timestamps: [],
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const userId = Cookies.get("userId");

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, "quizzes"));
        const userQuizzes = [];

        querySnapshot.forEach((doc) => {
          const data = doc.data();
          const attemptedByUser = data.attemptedBy?.find((user) => user.userId === userId);

          if (attemptedByUser) {
            userQuizzes.push({
              title: data.title,
              userScore: attemptedByUser.score,
              timestamp: data.timestamp || new Date().toISOString(), // Ensure there's a timestamp
            });
          }
        });

        if (userQuizzes.length === 0) {
          setError("No quizzes attempted yet.");
          setLoading(false);
          return;
        }

        let totalScore = 0;
        let highestScore = 0;
        let lowestScore = 100;
        let highestScoreTitle = "";
        let lowestScoreTitle = "";

        userQuizzes.forEach((quiz) => {
          totalScore += quiz.userScore;

          if (quiz.userScore > highestScore) {
            highestScore = quiz.userScore;
            highestScoreTitle = quiz.title;
          }

          if (quiz.userScore < lowestScore) {
            lowestScore = quiz.userScore;
            lowestScoreTitle = quiz.title;
          }
        });

        setStats({
          totalQuizzes: userQuizzes.length,
          averageScore: (totalScore / userQuizzes.length).toFixed(2),
          highestScore,
          lowestScore,
          highestScoreTitle,
          lowestScoreTitle,
          scores: userQuizzes.map((quiz) => quiz.userScore),
          quizTitles: userQuizzes.map((quiz) => quiz.title),
          timestamps: userQuizzes.map((quiz) => new Date(quiz.timestamp).toLocaleDateString()),
        });

      } catch (err) {
        setError(`Error fetching stats: ${err.message}`);
      } finally {
        setLoading(false);
      }
    };

    if (userId) fetchStats();
  }, [userId]);

  return (
    <Container className="py-5">
      <h2 className="text-center mb-4">My Statistics</h2>

      {loading && (
        <div className="text-center">
          <Spinner animation="border" role="status">
            <span className="visually-hidden">Loading...</span>
          </Spinner>
        </div>
      )}

      {error && <Alert variant="danger">{error}</Alert>}

      {!loading && !error && (
        <>
          <Row className="mb-4 text-center">
            <Col md={3}>
              <Card className="p-3" style={{height:150}}>
                <h5>Total Quizzes Attempted</h5>
                <p className="display-6">{stats.totalQuizzes}</p>
              </Card>
            </Col>
            <Col md={3}>
              <Card className="p-3" style={{height:150}}>
                <h5>Average Score</h5>
                <p className="display-6">{stats.averageScore}</p>
              </Card>
            </Col>
            <Col md={3}>
              <Card className="p-3" style={{height:150}}>
                <h5>Highest Score</h5>
                <p className="display-6">{stats.highestScore}</p>
                <p className="text-muted">Quiz: {stats.highestScoreTitle || "N/A"}</p>
              </Card>
            </Col>
            <Col md={3}>
              <Card className="p-3" style={{height:150}}>
                <h5>Lowest Score</h5>
                <p className="display-6">{stats.lowestScore}</p>
                <p className="text-muted">Quiz: {stats.lowestScoreTitle || "N/A"}</p>
              </Card>
            </Col>
          </Row>

          {/* Pie Chart - Score Distribution */}
          <Card className="p-3 mb-4 " style={{width:'100%', height:600,justifyContent:'center',alignItems:'center'}}>
            <h5 className="text-center">Score Distribution Across Quizzes</h5>
            <Pie
              data={{
                labels: stats.quizTitles,
                datasets: [
                  {
                    label: "Scores",
                    data: stats.scores,
                    backgroundColor: ["#FF6384", "#36A2EB", "#FFCE56", "#4BC0C0", "#FF5733"],
                    borderColor: "#fff",
                    borderWidth: 1,
                  },
                ],
              }}
              options={{
                responsive: true,
                plugins: {
                  legend: {
                    position: "top",
                  },
                  tooltip: {
                    callbacks: {
                      label: (tooltipItem) => `${tooltipItem.label}: ${tooltipItem.raw}%`,
                    },
                  },
                },
              }}
            />
          </Card>
        </>
      )}
    </Container>
  );
}

export default MyStats;
