import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import TeacherLayout from "../components/TeacherLayout";

function TestPreview() {
  const { testId } = useParams();
  const navigate = useNavigate();

  const [test, setTest] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchTest = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await fetch(
          `http://localhost:5000/api/test-creation/${testId}`
        );

        const data = await response.json();

        if (!response.ok || !data.success) {
          throw new Error(
            data.message || "Failed to fetch test"
          );
        }

        setTest(data.test);
      } catch (error) {
        console.error("FETCH TEST ERROR:", error);
        setError(
          error.message || "Failed to load test"
        );
      } finally {
        setLoading(false);
      }
    };

    fetchTest();
  }, [testId]);

  // ==========================================
  // LOADING
  // ==========================================

  if (loading) {
    return (
      <TeacherLayout>
        <div className="min-h-full bg-[#f7f8f5] p-6">
          <div className="bg-white border border-gray-200 rounded-xl p-10 text-center">
            <p className="text-gray-500">
              Loading test preview...
            </p>
          </div>
        </div>
      </TeacherLayout>
    );
  }

  // ==========================================
  // ERROR
  // ==========================================

  if (error || !test) {
    return (
      <TeacherLayout>
        <div className="min-h-full bg-[#f7f8f5] p-6">
          <div className="bg-white border border-red-200 rounded-xl p-10 text-center">
            <div className="w-12 h-12 mx-auto rounded-full bg-red-50 text-red-600 flex items-center justify-center font-bold text-xl">
              !
            </div>

            <h2 className="text-lg font-bold text-gray-900 mt-4">
              Unable to load test
            </h2>

            <p className="text-sm text-red-600 mt-2">
              {error || "Test not found"}
            </p>

            <button
              type="button"
              onClick={() => navigate("/tests")}
              className="mt-5 px-5 py-2.5 bg-yellow-400 hover:bg-yellow-500 rounded-lg font-semibold text-sm"
            >
              Back to My Tests
            </button>
          </div>
        </div>
      </TeacherLayout>
    );
  }

  const questions = test.questions || [];

  return (
    <TeacherLayout>
      <div className="min-h-full bg-[#f7f8f5] p-6">

        {/* ==========================================
            HEADER
        ========================================== */}

        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-6">

          <div className="flex items-center gap-4">

            <button
              type="button"
              onClick={() => navigate("/tests")}
              className="px-3 py-2 bg-white border border-gray-200 rounded-lg hover:bg-gray-50"
            >
              ←
            </button>

            <div>
              <p className="text-xs uppercase tracking-wider text-gray-400 font-semibold">
                Test Preview
              </p>

              <h1 className="text-2xl font-bold text-gray-900 mt-1">
                {test.title}
              </h1>

              <p className="text-sm text-gray-500 mt-1">
                {test.subject || "General"}
              </p>
            </div>

          </div>

          <div className="flex gap-2">

            <button
              type="button"
              onClick={() =>
                navigate(`/tests/${test._id}/edit`)
              }
              className="px-4 py-2.5 bg-white border border-gray-200 rounded-lg text-sm font-semibold hover:bg-gray-50"
            >
              Edit Test
            </button>

            <button
              type="button"
              onClick={() =>
                navigate(`/tests/${test._id}/questions`)
              }
              className="px-4 py-2.5 bg-yellow-400 hover:bg-yellow-500 rounded-lg text-sm font-semibold"
            >
              Manage Questions
            </button>

          </div>

        </div>

        {/* ==========================================
            TEST SUMMARY
        ========================================== */}

        <div className="bg-white border border-gray-200 rounded-xl overflow-hidden mb-6">

          <div className="p-6 border-b border-gray-100">

            <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">

              <div>
                <h2 className="text-xl font-bold text-gray-900">
                  {test.title}
                </h2>

                {test.description && (
                  <p className="text-sm leading-6 text-gray-600 mt-2 max-w-3xl">
                    {test.description}
                  </p>
                )}
              </div>

              <span
                className={`shrink-0 text-xs font-semibold px-3 py-1.5 rounded-full ${
                  test.isPublished
                    ? "bg-green-100 text-green-700"
                    : "bg-yellow-100 text-yellow-700"
                }`}
              >
                {test.isPublished
                  ? "Published"
                  : "Draft"}
              </span>

            </div>

          </div>

          {/* Stats */}

          <div className="grid grid-cols-2 md:grid-cols-4">

            <div className="p-5 border-b md:border-b-0 md:border-r border-gray-100">
              <p className="text-xs text-gray-400">
                Questions
              </p>
              <p className="text-2xl font-bold text-gray-900 mt-1">
                {questions.length}
              </p>
            </div>

            <div className="p-5 border-b md:border-b-0 md:border-r border-gray-100">
              <p className="text-xs text-gray-400">
                Duration
              </p>
              <p className="text-2xl font-bold text-gray-900 mt-1">
                {test.duration} min
              </p>
            </div>

            <div className="p-5 border-b md:border-b-0 md:border-r border-gray-100">
              <p className="text-xs text-gray-400">
                Marks / Question
              </p>
              <p className="text-2xl font-bold text-gray-900 mt-1">
                {test.marksPerQuestion}
              </p>
            </div>

            <div className="p-5">
              <p className="text-xs text-gray-400">
                Negative Marks
              </p>
              <p className="text-2xl font-bold text-gray-900 mt-1">
                {test.negativeMarks}
              </p>
            </div>

          </div>

        </div>

        {/* ==========================================
            QUESTIONS HEADER
        ========================================== */}

        <div className="flex items-center justify-between mb-4">

          <div>
            <h2 className="text-xl font-bold text-gray-900">
              Questions
            </h2>

            <p className="text-sm text-gray-500 mt-1">
              Review all questions before publishing.
            </p>
          </div>

          <span className="text-sm font-semibold text-gray-600">
            {questions.length}{" "}
            {questions.length === 1
              ? "Question"
              : "Questions"}
          </span>

        </div>

        {/* ==========================================
            EMPTY QUESTIONS
        ========================================== */}

        {questions.length === 0 && (
          <div className="bg-white border border-dashed border-gray-300 rounded-xl p-12 text-center">

            <div className="w-14 h-14 mx-auto rounded-xl bg-yellow-100 text-yellow-700 flex items-center justify-center text-2xl font-bold">
              ?
            </div>

            <h3 className="text-lg font-bold text-gray-900 mt-4">
              No questions added
            </h3>

            <p className="text-sm text-gray-500 mt-1">
              Add questions to this test before publishing.
            </p>

            <button
              type="button"
              onClick={() =>
                navigate(`/tests/${test._id}/questions`)
              }
              className="mt-5 px-5 py-2.5 bg-yellow-400 hover:bg-yellow-500 rounded-lg text-sm font-semibold"
            >
              Add Questions
            </button>

          </div>
        )}

        {/* ==========================================
            QUESTIONS LIST
        ========================================== */}

        {questions.length > 0 && (
          <div className="space-y-5">

            {questions.map((question, index) => {

              const correctAnswer =
                typeof question.correctAnswer === "number"
                  ? question.correctAnswer
                  : Number(question.correctAnswer);

              return (
                <div
                  key={question._id || index}
                  className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm"
                >

                  {/* Question Header */}

                  <div className="px-5 py-4 bg-gray-50 border-b border-gray-100 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">

                    <div className="flex items-center gap-3">

                      <div className="w-10 h-10 rounded-lg bg-gray-900 text-yellow-400 flex items-center justify-center font-bold">
                        {index + 1}
                      </div>

                      <div>
                        <p className="text-xs uppercase tracking-wide text-gray-400 font-semibold">
                          Question
                        </p>

                        <p className="text-sm font-bold text-gray-900">
                          Question {index + 1}
                        </p>
                      </div>

                    </div>

                    {question.subject && (
                      <span className="px-3 py-1.5 rounded-full bg-gray-100 text-gray-600 text-xs font-semibold">
                        {question.subject}
                      </span>
                    )}

                  </div>

                  {/* Question Content */}

                  <div className="p-5 lg:p-6">

                    <p className="text-base lg:text-lg font-semibold leading-7 text-gray-800">
                      {question.questionText ||
                        "Image-based question"}
                    </p>

                    {/* Image */}

                    {question.questionImage && (
                      <div className="mt-5">
                        <img
                          src={question.questionImage}
                          alt="Question"
                          className="max-w-lg max-h-72 object-contain rounded-xl border border-gray-200 bg-gray-50"
                        />
                      </div>
                    )}

                    {/* Options */}

                    {question.options?.length > 0 && (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-5">

                        {question.options.map(
                          (option, optionIndex) => {

                            const isCorrect =
                              optionIndex ===
                              correctAnswer;

                            return (
                              <div
                                key={optionIndex}
                                className={`flex items-start gap-3 rounded-xl border px-4 py-3 ${
                                  isCorrect
                                    ? "border-green-300 bg-green-50"
                                    : "border-gray-200 bg-gray-50"
                                }`}
                              >

                                <span
                                  className={`w-8 h-8 shrink-0 rounded-full flex items-center justify-center text-xs font-bold ${
                                    isCorrect
                                      ? "bg-green-600 text-white"
                                      : "bg-white border border-gray-300 text-gray-600"
                                  }`}
                                >
                                  {String.fromCharCode(
                                    65 + optionIndex
                                  )}
                                </span>

                                <span
                                  className={`text-sm leading-6 ${
                                    isCorrect
                                      ? "text-green-700 font-semibold"
                                      : "text-gray-700"
                                  }`}
                                >
                                  {option}
                                </span>

                                {isCorrect && (
                                  <span className="ml-auto text-[10px] uppercase tracking-wide font-bold text-green-700">
                                    Correct
                                  </span>
                                )}

                              </div>
                            );
                          }
                        )}

                      </div>
                    )}

                    {/* Question Info */}

                    <div className="flex flex-wrap gap-3 mt-5">

                      <span className="px-3 py-1.5 rounded-lg bg-gray-50 border border-gray-200 text-xs text-gray-600">
                        <strong className="text-gray-900">
                          Marks:
                        </strong>{" "}
                        {question.marks ??
                          test.marksPerQuestion ??
                          0}
                      </span>

                      <span className="px-3 py-1.5 rounded-lg bg-gray-50 border border-gray-200 text-xs text-gray-600">
                        <strong className="text-gray-900">
                          Negative:
                        </strong>{" "}
                        {question.negativeMarks ??
                          test.negativeMarks ??
                          0}
                      </span>

                      {question.options && (
                        <span className="px-3 py-1.5 rounded-lg bg-gray-50 border border-gray-200 text-xs text-gray-600">
                          <strong className="text-gray-900">
                            Options:
                          </strong>{" "}
                          {question.options.length}
                        </span>
                      )}

                    </div>

                  </div>

                </div>
              );
            })}

          </div>
        )}

      </div>
    </TeacherLayout>
  );
}

export default TestPreview;