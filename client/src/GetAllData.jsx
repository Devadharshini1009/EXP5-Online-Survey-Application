
import { useEffect, useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import "./App.css";

const API_URL = "https://exp5-online-survey-application.onrender.com/responses";

function GetAllData() {
  const [responses, setResponses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchResponses = async () => {
      try {
        setLoading(true);
        setError("");

        const result = await axios.get(API_URL);

        console.log("Responses API data:", result.data);

        if (result.data.success && Array.isArray(result.data.responses)) {
          setResponses(result.data.responses);
        } else {
          setError("Unexpected response format from backend.");
        }
      } catch (err) {
        console.error(
          "Unable to fetch responses:",
          err.response?.data || err.message
        );

        setError(
          "Unable to load responses. Please check the backend."
        );
      } finally {
        setLoading(false);
      }
    };

    fetchResponses();
  }, []);

  return (
    <div className="page">
      <header className="topbar">
        <div className="brand">
          Survey<span>Hub</span>
        </div>

        <Link className="nav-link" to="/">
          Back to Survey
        </Link>
      </header>

      <main className="responses-page">
        <div className="responses-heading">
          <span className="eyebrow">FEEDBACK DASHBOARD</span>
          <h1>Survey Responses</h1>
          <p>Feedback submitted by participants</p>
        </div>

        {loading && (
          <p className="response-message">Loading responses...</p>
        )}

        {!loading && error && (
          <div className="response-error">
            <p>{error}</p>
            <button onClick={() => window.location.reload()}>
              Try Again
            </button>
          </div>
        )}

        {!loading && !error && (
          <>
            <div className="response-summary">
              <div className="response-summary-card">
                <span>Total Submissions</span>
                <strong>{responses.length}</strong>
              </div>
            </div>

            {responses.length === 0 ? (
              <div className="empty-responses">
                <h2>No responses yet</h2>
                <p>Submitted feedback will appear here.</p>
              </div>
            ) : (
              <div className="responses-list">
                {responses.map((item) => (
                  <article
                    className="response-card"
                    key={item._id}
                  >
                    <div className="response-card-header">
                      <div>
                        <h2>{item.sessionTitle || "Untitled Session"}</h2>
                        <p className="participant-name">
                          {item.name || "Anonymous"}
                        </p>
                        <p className="participant-department">
                          {item.department || "Department not provided"}
                        </p>
                      </div>

                      <span className="response-badge">Submitted</span>
                    </div>

                    <p className="submitted-date">
                      Submitted:{" "}
                      {item.createdAt
                        ? new Date(item.createdAt).toLocaleString()
                        : "Date unavailable"}
                    </p>

                    <div className="answers-list">
                      <h3>Feedback Answers</h3>

                      {Array.isArray(item.answers) &&
                      item.answers.length > 0 ? (
                        item.answers.map((answer, index) => (
                          <div
                            className="answer-item"
                            key={answer._id || index}
                          >
                            <p className="answer-question">
                              {index + 1}. {answer.question}
                            </p>
                            <p className="answer-value">
                              {answer.answer}
                            </p>
                          </div>
                        ))
                      ) : (
                        <p>No answers available.</p>
                      )}
                    </div>

                    {item.suggestions && (
                      <div className="suggestions-box">
                        <h3>Additional Suggestions</h3>
                        <p>{item.suggestions}</p>
                      </div>
                    )}
                  </article>
                ))}
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
}

export default GetAllData;
