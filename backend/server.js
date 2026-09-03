import "dotenv/config";

import express from "express";
import cors from "cors";

import connectDB from "./config/db.js";
import Question from "./models/Question.js";
import questionRoutes from "./routes/questionRoutes.js";
import examRoutes from "./routes/examRoutes.js";
import questionReportRoutes from "./routes/questionReportRoutes.js";
import testRoutes from "./routes/testRoutes.js";
import testSubmissionRoutes from "./routes/testSubmissionRoutes.js";
import swaggerUi from "swagger-ui-express";
import { swaggerDocs } from "./swagger.js";

const app = express();

app.use(cors());
app.use(express.json());
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocs));

connectDB();

app.use("/api/questions", questionRoutes);
app.use("/api/exams", examRoutes);
app.use("/api/question-reports", questionReportRoutes);

// Isolated Test Creation API
app.use("/api/test-creation", testRoutes);
app.use("/api/test-submissions", testSubmissionRoutes);

app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "Test Portal Backend is running",
  });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
