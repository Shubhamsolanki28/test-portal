import { BrowserRouter, Routes, Route } from "react-router-dom";

import TestCreatorDashboard from "./TestCreatorDashboard";

// My Exams
import MyExams from "./My Exams/Preview/MyExams";
import AddQuestions from "./My Exams/Preview/AddQuestions";

// Questions
import AllQuestions from "./Questions/AllQuestions/AllQuestions";
import AddQuestion from "./Questions/Add Question/AddQuestion";
import QuestionPreview from "./Questions/Preview/QuestionPreview";
import EditQuestion from "./Questions/Edit/EditQuestion";
import CreateExam from "./Create Exam/CreateExam";
import ExamPreview from "./My Exams/Preview/ExamPreview";
import EditExam from "./My Exams/Edit/EditExam";
import TeacherProfile from "./TeacherProfile";
import StudentsReport from "./Questions/ReportPage/StudentsReport";
import MyTests from "./Tests/MyTests";
import TestPreview from "./Tests/TestPreview";
import EditTest from "./Tests/EditTest";
import AddTestQuestions from "./Tests/AddTestQuestions";

function App() {
  return (
    <BrowserRouter>
      <Routes>

        <Route path="/" element={<TestCreatorDashboard />} />

        <Route path="/profile" element={<TeacherProfile />} />

        <Route path="/create-test" element={<CreateExam />} />

        <Route path="/exams" element={<MyExams />} />

        <Route
          path="/exams/:examId/questions"
          element={<AddQuestions />}
        />

        <Route
          path="/exams/:examId/preview"
          element={<ExamPreview />}
        />

        <Route
          path="/exams/:examId/edit"
          element={<EditExam />}
        />

        <Route path="/questions" element={<AllQuestions />} />

        <Route path="/questions/add" element={<AddQuestion />} />

        <Route
          path="/questions/:id/preview"
          element={<QuestionPreview />}
        />

        <Route
          path="/questions/:id/edit"
          element={<EditQuestion />}
        />

        <Route
          path="/students-report"
          element={<StudentsReport />}
        />

        {/* Dedicated Task 3 Test Creator Routes */}
        <Route path="/test-creator" element={<TestCreatorDashboard />} />
        <Route path="/test-creator/tests" element={<MyTests />} />
        <Route path="/test-creator/tests/create" element={<CreateExam />} />
        <Route path="/test-creator/tests/:testId/edit" element={<EditTest />} />
        <Route path="/test-creator/tests/:testId/questions" element={<AddTestQuestions />} />
        <Route path="/test-creator/tests/:testId/preview" element={<TestPreview />} />
        <Route path="/test-creator/tests/:testId/results" element={<StudentsReport />} />
        <Route path="/test-creator/results" element={<StudentsReport />} />
        <Route path="/test-creator/questions" element={<AllQuestions />} />
        <Route path="/test-creator/questions/add" element={<AddQuestion />} />

        {/* Legacy / Direct Aliases */}
        <Route path="/tests" element={<MyTests />} />
        <Route path="/create-exam" element={<CreateExam />} />
        <Route
          path="/tests/:testId/preview"
          element={<TestPreview />}
        />
        <Route
          path="/tests/:testId/edit"
          element={<EditTest />}
        />
        <Route
          path="/tests/:testId/questions"
          element={<AddTestQuestions />}
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;