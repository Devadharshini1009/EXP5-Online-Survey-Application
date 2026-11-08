
import { useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import "./App.css";

const API_URL = "http://localhost:5000";

const initialForm = {
  name: "",
  department: "",
  sessionTitle: "",
  q1: "",
  q2: "",
  q3: "",
  q4: "",
  q5: "",
  suggestions: "",
};

function App() {
  const [form, setForm] = useState(initialForm);
  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;

    setForm((previousForm) => ({
      ...previousForm,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");

    const answers = [
      {
        question: "How would you rate the overall session?",
        answer: form.q1,
      },
      {
        question: "Was the topic explained clearly?",
        answer: form.q2,
      },
      {
        question: "Was the session useful to you?",
        answer: form.q3,
      },
      {
        question: "Was the session duration sufficient?",
        answer: form.q4,
      },
      {
        question: "Would you recommend this session to others?",
        answer: form.q5,
      },
    ].filter((item) => item.answer.trim() !== "");

    if (
      !form.name.trim() ||
      !form.department.trim() ||
      !form.sessionTitle.trim()
    ) {
      setMessage(
        "Please fill in your name, department and session title."
      );
      return;
    }

    if (answers.length === 0) {
      setMessage("Please submit at least one answer.");
      return;
    }

    setIsSubmitting(true);

    try {
      const payload = {
        name: form.name.trim(),
        department: form.department.trim(),
        sessionTitle: form.sessionTitle.trim(),
        answers,
        suggestions: form.suggestions.trim(),
      };

      console.log("Submitting feedback:", payload);

      const response = await axios.post(
        `${API_URL}/responses`,
        payload
      );

      console.log("Feedback saved successfully:", response.data);

      setMessage(
        response.data.message || "Feedback submitted successfully!"
      );

      setForm({ ...initialForm });
    } catch (error) {
      console.error("Feedback submission failed:", {
        message: error.message,
        status: error.response?.status,
        data: error.response?.data,
      });

      setMessage(
        error.response?.data?.message ||
          "Submission failed. Check the backend and browser console."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="page">
      <header className="topbar">
        <div className="brand">
          Survey<span>Hub</span>
        </div>

        <Link className="nav-link" to="/getAllData">
          View Responses
        </Link>
      </header>

      <main className="survey-layout">
        <section className="intro">
          <span className="eyebrow">YOUR VOICE MATTERS</span>

          <h1>
            Help us make
            <br />
            things <span>better.</span>
          </h1>

          <p>
            Share your thoughts about the session. Your feedback
            helps us improve future learning experiences.
          </p>

          <div className="info-card">
            <strong>5 Simple Questions</strong>
            <p>
              Answer the session feedback questions and help us
              improve future sessions.
            </p>
          </div>
        </section>

        <section className="form-card">
          <h2>Session Feedback</h2>
          <p className="subtitle">
            Please answer the questions below.
          </p>

          <form onSubmit={handleSubmit}>
            <label htmlFor="name">Your Name</label>
            <input
              id="name"
              name="name"
              value={form.name}
              onChange={handleChange}
              placeholder="Enter your name"
              required
            />

            <label htmlFor="department">Department</label>
            <input
              id="department"
              name="department"
              value={form.department}
              onChange={handleChange}
              placeholder="e.g. Information Technology"
              required
            />

            <label htmlFor="sessionTitle">Session Title</label>
            <input
              id="sessionTitle"
              name="sessionTitle"
              value={form.sessionTitle}
              onChange={handleChange}
              placeholder="Enter session title"
              required
            />

            <div className="question">
              <label htmlFor="q1">
                1. How would you rate the overall session?
              </label>
              <select
                id="q1"
                name="q1"
                value={form.q1}
                onChange={handleChange}
                required
              >
                <option value="">Select your answer</option>
                <option value="Excellent">Excellent</option>
                <option value="Very Good">Very Good</option>
                <option value="Good">Good</option>
                <option value="Average">Average</option>
                <option value="Poor">Poor</option>
              </select>
            </div>

            <div className="question">
              <label htmlFor="q2">
                2. Was the topic explained clearly?
              </label>
              <select
                id="q2"
                name="q2"
                value={form.q2}
                onChange={handleChange}
                required
              >
                <option value="">Select your answer</option>
                <option value="Very Clearly">Very Clearly</option>
                <option value="Clearly">Clearly</option>
                <option value="Somewhat Clearly">Somewhat Clearly</option>
                <option value="Not Clearly">Not Clearly</option>
              </select>
            </div>

            <div className="question">
              <label htmlFor="q3">
                3. Was the session useful to you?
              </label>
              <select
                id="q3"
                name="q3"
                value={form.q3}
                onChange={handleChange}
                required
              >
                <option value="">Select your answer</option>
                <option value="Very Useful">Very Useful</option>
                <option value="Useful">Useful</option>
                <option value="Somewhat Useful">Somewhat Useful</option>
                <option value="Not Useful">Not Useful</option>
              </select>
            </div>

            <div className="question">
              <label htmlFor="q4">
                4. Was the session duration sufficient?
              </label>
              <select
                id="q4"
                name="q4"
                value={form.q4}
                onChange={handleChange}
                required
              >
                <option value="">Select your answer</option>
                <option value="Yes">Yes</option>
                <option value="Partially">Partially</option>
                <option value="No">No</option>
              </select>
            </div>

            <div className="question">
              <label htmlFor="q5">
                5. Would you recommend this session to others?
              </label>
              <select
                id="q5"
                name="q5"
                value={form.q5}
                onChange={handleChange}
                required
              >
                <option value="">Select your answer</option>
                <option value="Definitely">Definitely</option>
                <option value="Maybe">Maybe</option>
                <option value="No">No</option>
              </select>
            </div>

            <label htmlFor="suggestions">
              Additional Suggestions (Optional)
            </label>
            <textarea
              id="suggestions"
              name="suggestions"
              value={form.suggestions}
              onChange={handleChange}
              placeholder="Share any suggestions..."
              rows={3}
            />

            <button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Submitting..." : "Submit Feedback →"}
            </button>
          </form>

          {message && (
            <p className="message" role="status">
              {message}
            </p>
          )}

          <p className="privacy">
            Your response will be saved for review.
          </p>
        </section>
      </main>
    </div>
  );
}

export default App;
