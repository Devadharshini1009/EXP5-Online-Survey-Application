const dns = require("node:dns");
dns.setServers(["8.8.8.8", "1.1.1.1"]);



require("dotenv").config();

const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

const app = express();

app.use(cors());
app.use(express.json());

const MONGO_URI = process.env.MONGO_URI;
const PORT = process.env.PORT || 5000;

if (!MONGO_URI) {
  console.error("MONGO_URI missing. Please check your .env file.");
  process.exit(1);
}

// Survey Question Schema
const questionSchema = new mongoose.Schema(
  {
    question: {
      type: String,
      required: true,
      trim: true,
    },
    options: {
      type: [String],
      required: true,
    },
  },
  { timestamps: true }
);

// Survey Response Schema
const responseSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      trim: true,
      default: "",
    },
    department: {
      type: String,
      trim: true,
      default: "",
    },
    sessionTitle: {
      type: String,
      trim: true,
      default: "",
    },
    answers: [
      {
        questionId: {
          type: mongoose.Schema.Types.ObjectId,
          required: false,
        },
        question: {
          type: String,
          required: true,
        },
        answer: {
          type: String,
          required: true,
        },
      },
    ],
    suggestions: {
      type: String,
      trim: true,
      default: "",
    },
  },
  { timestamps: true }
);

const Question = mongoose.model("Question", questionSchema);
const Response = mongoose.model("Response", responseSchema);

// Home API
app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "EXP5 Survey API is running",
  });
});

// Get all survey questions
app.get("/questions", async (req, res) => {
  try {
    const questions = await Question.find().sort({ createdAt: 1 });

    console.log(`Questions requested. Total: ${questions.length}`);

    res.json({
      success: true,
      count: questions.length,
      questions,
    });
  } catch (error) {
    console.error("Fetch questions error:", error.message);

    res.status(500).json({
      success: false,
      message: "Unable to fetch questions",
      error: error.message,
    });
  }
});

// Add a survey question
app.post("/questions", async (req, res) => {
  try {
    const { question, options } = req.body;

    if (
      !question ||
      !Array.isArray(options) ||
      options.length < 2
    ) {
      return res.status(400).json({
        success: false,
        message: "Provide a question and at least two options",
      });
    }

    const newQuestion = await Question.create({
      question,
      options,
    });

    console.log("\n========== NEW QUESTION ADDED ==========");
    console.log("Question:", newQuestion.question);
    console.log("Options:", newQuestion.options);
    console.log("========================================\n");

    res.status(201).json({
      success: true,
      question: newQuestion,
    });
  } catch (error) {
    console.error("Add question error:", error.message);

    res.status(400).json({
      success: false,
      message: "Unable to add question",
      error: error.message,
    });
  }
});

// Submit survey answers
app.post("/responses", async (req, res) => {
  console.log("\n========== SURVEY SUBMISSION RECEIVED ==========");

  try {
    const {
      name,
      department,
      sessionTitle,
      answers,
      suggestions,
    } = req.body;

    if (!Array.isArray(answers) || answers.length === 0) {
      console.log("Submission rejected: No answers received.");

      return res.status(400).json({
        success: false,
        message: "Please submit at least one answer",
      });
    }

    // Validate every answer
    const validAnswers = answers.every(
      (item) =>
        item &&
        typeof item.question === "string" &&
        item.question.trim() !== "" &&
        typeof item.answer === "string" &&
        item.answer.trim() !== ""
    );

    if (!validAnswers) {
      console.log("Submission rejected: Invalid question or answer.");

      return res.status(400).json({
        success: false,
        message: "Each answer must include a question and an answer.",
      });
    }

    // Validate optional question IDs
    for (const item of answers) {
      if (
        item.questionId &&
        !mongoose.isValidObjectId(item.questionId)
      ) {
        console.log("Submission rejected: Invalid question ID.");

        return res.status(400).json({
          success: false,
          message: "An answer contains an invalid question ID.",
        });
      }
    }

    // Save response to MongoDB
    const savedResponse = await Response.create({
      name: name || "",
      department: department || "",
      sessionTitle: sessionTitle || "",
      answers: answers.map((item) => ({
        ...(item.questionId
          ? { questionId: item.questionId }
          : {}),
        question: item.question.trim(),
        answer: item.answer.trim(),
      })),
      suggestions: suggestions || "",
    });

    // Display submitted information in backend terminal
    console.log("Status: SAVED SUCCESSFULLY");
    console.log("Response ID:", savedResponse._id.toString());
    console.log("Name:", savedResponse.name || "Not provided");
    console.log("Department:", savedResponse.department || "Not provided");
    console.log("Session:", savedResponse.sessionTitle || "Not provided");
    console.log("\nSubmitted Answers:");

    savedResponse.answers.forEach((item, index) => {
      console.log(`${index + 1}. ${item.question}`);
      console.log(`   Answer: ${item.answer}`);
    });

    console.log(
      "\nSuggestions:",
      savedResponse.suggestions || "No suggestions"
    );
    console.log("Submitted At:", savedResponse.createdAt);
    console.log("================================================\n");

    res.status(201).json({
      success: true,
      message: "Session feedback submitted successfully!",
      response: savedResponse,
    });
  } catch (error) {
    console.error("\n========== SURVEY SUBMISSION FAILED ==========");
    console.error("Error:", error.message);
    console.error("==============================================\n");

    res.status(400).json({
      success: false,
      message: "Unable to submit survey",
      error: error.message,
    });
  }
});

// View submitted survey responses
app.get("/responses", async (req, res) => {
  try {
    const responses = await Response.find().sort({ createdAt: -1 });

    console.log(`Responses requested. Total submissions: ${responses.length}`);

    res.json({
      success: true,
      count: responses.length,
      responses,
    });
  } catch (error) {
    console.error("Fetch responses error:", error.message);

    res.status(500).json({
      success: false,
      message: "Unable to fetch responses",
      error: error.message,
    });
  }
});

// Connect to MongoDB Atlas and start server
async function startServer() {
  try {
    await mongoose.connect(MONGO_URI);

    console.log("MongoDB Atlas Connected Successfully");

    app.listen(PORT, () => {
      console.log(`Server running at http://localhost:${PORT}`);
      console.log(`Questions API: http://localhost:${PORT}/questions`);
      console.log(`Responses API: http://localhost:${PORT}/responses`);
      console.log("Waiting for survey submissions...\n");
    });
  } catch (error) {
    console.error("MongoDB connection failed:", error.message);
    process.exit(1);
  }
}

startServer();
