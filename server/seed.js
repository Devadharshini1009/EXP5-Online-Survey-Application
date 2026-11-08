
const dns = require("node:dns");
dns.setServers(["8.8.8.8", "1.1.1.1"]);

require("dotenv").config();

const mongoose = require("mongoose");

const questionSchema = new mongoose.Schema({
  question: {
    type: String,
    required: true
  },
  options: {
    type: [String],
    required: true
  }
});

const Question = mongoose.model("Question", questionSchema);

const sessionFeedbackQuestions = [
  {
    question: "How engaging was the session?",
    options: [
      "Very engaging",
      "Engaging",
      "Neutral",
      "Not engaging"
    ]
  },
  {
    question: "How useful was the session for you?",
    options: [
      "Extremely useful",
      "Useful",
      "Somewhat useful",
      "Not useful"
    ]
  },
  {
    question: "Was the topic explained clearly?",
    options: [
      "Very clearly",
      "Clearly",
      "Somewhat clearly",
      "Not clearly"
    ]
  },
  {
    question: "How would you rate the speaker's presentation?",
    options: [
      "Excellent",
      "Good",
      "Average",
      "Needs improvement"
    ]
  },
  {
    question: "Was the session duration appropriate?",
    options: [
      "Just right",
      "Too short",
      "Too long"
    ]
  },
  {
    question: "Did the session meet your expectations?",
    options: [
      "Exceeded expectations",
      "Met expectations",
      "Partially met expectations",
      "Did not meet expectations"
    ]
  },
  {
    question: "How interactive was the session?",
    options: [
      "Highly interactive",
      "Interactive",
      "Somewhat interactive",
      "Not interactive"
    ]
  },
  {
    question: "Was the session content easy to understand?",
    options: [
      "Very easy",
      "Easy",
      "Somewhat difficult",
      "Very difficult"
    ]
  },
  {
    question: "Would you recommend a similar session to others?",
    options: [
      "Definitely",
      "Probably",
      "Not sure",
      "No"
    ]
  },
  {
    question: "Did the session help you learn something new?",
    options: [
      "Learned a lot",
      "Learned something",
      "Learned very little",
      "Did not learn anything new"
    ]
  }
];

async function seedQuestions() {
  try {
    if (!process.env.MONGO_URI) {
      throw new Error("MONGO_URI is missing from the .env file");
    }

    await mongoose.connect(process.env.MONGO_URI);

    console.log("MongoDB Atlas Connected Successfully");

    // Replace the old question bank with session feedback questions
    await Question.deleteMany({});

    await Question.insertMany(sessionFeedbackQuestions);

    console.log(
      "Session feedback questions inserted successfully!"
    );
    console.log(`Total questions added: ${sessionFeedbackQuestions.length}`);
  } catch (error) {
    console.error("Error inserting questions:", error.message);
  } finally {
    await mongoose.disconnect();
    console.log("MongoDB connection closed");
  }
}

seedQuestions();
