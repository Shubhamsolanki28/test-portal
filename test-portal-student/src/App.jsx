import { useEffect, useMemo, useState } from "react";

// =====================================================
// DEFAULT VALUES
// =====================================================

const DEFAULT_DURATION = 2 * 60 * 60;

// =====================================================
// SAMPLE QUESTIONS
// Fallback only - API load hone tak
// =====================================================

const sampleQuestions = Array.from(
  { length: 50 },
  (_, index) => {
    const questionNumber = index + 1;

    return {
      id: questionNumber,
      question:
        questionNumber === 1
          ? "Which of the following is the capital of India?"
          : `This is sample question ${questionNumber}. Which of the following is the correct answer?`,
      difficulty: "Medium",
      questionType: "MCQ",
      subject: "General Awareness",
      marks: {
        correct: 1,
        incorrect: 0,
      },
      options:
        questionNumber === 1
          ? [
            "New Delhi",
            "Mumbai",
            "Kolkata",
            "Chennai",
          ]
          : [
            `Option A for Question ${questionNumber}`,
            `Option B for Question ${questionNumber}`,
            `Option C for Question ${questionNumber}`,
            `Option D for Question ${questionNumber}`,
          ],
      media: null,
    };
  }
);

function App() {
  // =====================================================
  // TEST DATA
  // =====================================================

  const [publishedTest, setPublishedTest] = useState(null);
  const [loadingTest, setLoadingTest] = useState(true);
  const [testError, setTestError] = useState("");

  const handleSubmitReport = async () => {
    if (!reportReason) {
      setReportError("Please select an issue.");
      return;
    }

    try {
      setReportSubmitting(true);
      setReportError("");

      const response = await fetch(
        "http://localhost:5000/api/question-reports",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            examId:
              publishedTest?._id ||
              "test-exam-001",

            questionId:
              currentQuestionData?._id ||
              currentQuestionData?.id ||
              currentQuestion,

            examTitle:
              publishedTest?.title ||
              "Test",

            questionText:
              currentQuestionData?.question ||
              currentQuestionData?.questionText ||
              "",

            reason: reportReason,

            description:
              reportDescription.trim(),
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message ||
          "Failed to submit question report"
        );
      }

      console.log(
        "Report submitted:",
        data
      );

      setReportReason("");
      setReportDescription("");
      setReportError("");

      setShowReport(false);
      setShowReportSuccess(true);

    } catch (error) {
      console.error(
        "Submit report error:",
        error
      );

      setReportError(
        error.message ||
        "Something went wrong"
      );
    } finally {
      setReportSubmitting(false);
    }
  };

  // =====================================================
  // MODALS
  // =====================================================

  const [showReport, setShowReport] = useState(false);
  const [showCalculator, setShowCalculator] = useState(false);
  const [showReportSuccess, setShowReportSuccess] = useState(false);
  const [showSubmitConfirm, setShowSubmitConfirm] = useState(false);

  // =====================================================
  // REPORT
  // =====================================================

  const [reportReason, setReportReason] = useState("");
  const [reportDescription, setReportDescription] = useState("");
  const [reportSubmitting, setReportSubmitting] = useState(false);
  const [reportError, setReportError] = useState("");

  // =====================================================
  // CURRENT QUESTION
  // =====================================================

  const [currentQuestion, setCurrentQuestion] = useState(1);

  // =====================================================
  // TEMPORARY ANSWER
  // =====================================================

  const [temporaryAnswer, setTemporaryAnswer] = useState(null);

  // =====================================================
  // FONT SIZE
  // =====================================================

  const [questionFontSize, setQuestionFontSize] = useState(18);

  const decreaseFontSize = () => {
    setQuestionFontSize((size) => Math.max(14, size - 2));
  };

  const increaseFontSize = () => {
    setQuestionFontSize((size) => Math.min(28, size + 2));
  };

  // =====================================================
  // QUESTION DATA
  // =====================================================

  const actualQuestions =
    publishedTest?.questions?.length > 0
      ? publishedTest.questions
      : sampleQuestions;

  const totalQuestions = actualQuestions.length;

  // =====================================================
  // QUESTION STATES
  // =====================================================

  const [questionStates, setQuestionStates] = useState([]);

  // =====================================================
  // TIMER
  // =====================================================
  const [timeLeft, setTimeLeft] = useState(null);

  const [isSubmitted, setIsSubmitted] = useState(false);

  const [submittedTime, setSubmittedTime] = useState(null);
  const [testResult, setTestResult] = useState(null);
  const [showDetailedResult, setShowDetailedResult] = useState(false);
  // =====================================================
  // FETCH PUBLISHED TEST
  // =====================================================

  useEffect(() => {
    const fetchPublishedTest = async () => {
      try {
        setLoadingTest(true);
        setTestError("");

        const response = await fetch(
          "http://localhost:5000/api/test-creation/published"
        );

        const data = await response.json();

        if (!response.ok) {
          throw new Error(
            data.message || "Failed to fetch published test"
          );
        }

        if (!data.tests || data.tests.length === 0) {
          throw new Error("No published test available.");
        }

        // Latest published test
        setPublishedTest(data.tests[0]);

        console.log(
          "Published Test:",
          data.tests[0]
        );
      } catch (error) {
        console.error(
          "FETCH PUBLISHED TEST ERROR:",
          error
        );

        setTestError(
          error.message ||
          "Failed to load published test."
        );
      } finally {
        setLoadingTest(false);
      }
    };

    fetchPublishedTest();
  }, []);

  useEffect(() => {
    if (publishedTest?.duration) {
      setTimeLeft(Number(publishedTest.duration) * 60);
    }
  }, [publishedTest]);

  // =====================================================
  // INITIALIZE QUESTION STATES
  // =====================================================

  useEffect(() => {
    if (!publishedTest) return;

    const questionsCount =
      publishedTest.questions?.length || 0;

    if (questionsCount === 0) {
      return;
    }

    setQuestionStates(
      Array.from(
        { length: questionsCount },
        () => ({
          visited: false,
          savedAnswer: null,
          review: false,
        })
      )
    );

    setCurrentQuestion(1);
    setTemporaryAnswer(null);
  }, [publishedTest]);

  // =====================================================
  // SET TIMER FROM TEST DURATION
  // =====================================================

  useEffect(() => {
    if (!publishedTest) return;

    const durationInMinutes =
      Number(publishedTest.duration) || 120;

    setTimeLeft(durationInMinutes * 60);
  }, [publishedTest]);

  // =====================================================
  // CURRENT QUESTION DATA
  // =====================================================

  const currentQuestionData =
    actualQuestions[currentQuestion - 1];

  const currentState =
    questionStates[currentQuestion - 1] || {
      visited: false,
      savedAnswer: null,
      review: false,
    };

  // =====================================================
  // TIMER EFFECT
  // =====================================================

  useEffect(() => {
    if (isSubmitted || timeLeft === null) return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          submitExam();
          return 0;
        }

        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isSubmitted, timeLeft]);


  useEffect(() => {
    if (timeLeft === 0 && !isSubmitted) {
      submitExam();
    }
  }, [timeLeft, isSubmitted]);
  // =====================================================
  // FORMAT TIMER
  // =====================================================

  const formatTime = (seconds) => {
    const hours = Math.floor(seconds / 3600);

    const minutes = Math.floor(
      (seconds % 3600) / 60
    );

    const remainingSeconds = seconds % 60;

    return `${String(hours).padStart(
      2,
      "0"
    )}:${String(minutes).padStart(
      2,
      "0"
    )}:${String(remainingSeconds).padStart(
      2,
      "0"
    )}`;
  };

  // =====================================================
  // QUESTION STATUS
  // =====================================================

  const getQuestionStatus = (state) => {
    if (
      state.review &&
      state.savedAnswer !== null
    ) {
      return "reviewAttempted";
    }

    if (state.review) {
      return "review";
    }

    if (state.savedAnswer !== null) {
      return "answered";
    }

    if (state.visited) {
      return "notAnswered";
    }

    return "notViewed";
  };

  // =====================================================
  // COUNTERS
  // =====================================================

  const counters = useMemo(() => {
    let answered = 0;
    let notAnswered = 0;
    let marked = 0;
    let notViewed = 0;
    let reviewAttempted = 0;

    questionStates.forEach((state) => {
      const status =
        getQuestionStatus(state);

      if (status === "answered")
        answered++;

      if (status === "notAnswered")
        notAnswered++;

      if (status === "review")
        marked++;

      if (status === "notViewed")
        notViewed++;

      if (
        status === "reviewAttempted"
      ) {
        reviewAttempted++;
      }
    });

    return {
      answered,
      notAnswered,
      marked,
      notViewed,
      reviewAttempted,
    };
  }, [questionStates]);

  // =====================================================
  // OPEN QUESTION
  // =====================================================

  const openQuestion = (questionNumber) => {
    if (isSubmitted) return;

    const savedAnswer =
      questionStates[
        questionNumber - 1
      ]?.savedAnswer ?? null;

    setTemporaryAnswer(savedAnswer);

    setQuestionStates((previous) =>
      previous.map((state, index) =>
        index === questionNumber - 1
          ? {
            ...state,
            visited: true,
          }
          : state
      )
    );

    setCurrentQuestion(questionNumber);
  };

  // =====================================================
  // ANSWER
  // =====================================================

  const handleAnswer = (optionIndex) => {
    if (isSubmitted) return;

    setTemporaryAnswer(optionIndex);
  };

  // =====================================================
  // SAVE CURRENT ANSWER
  // =====================================================

  const saveCurrentAnswer = () => {
    if (!currentQuestionData) return;

    setQuestionStates((previous) =>
      previous.map((state, index) =>
        index === currentQuestion - 1
          ? {
            ...state,
            visited: true,
            savedAnswer: temporaryAnswer,
          }
          : state
      )
    );
  };

  // =====================================================
  // SAVE & NEXT
  // =====================================================

  const saveAndNext = () => {
    if (isSubmitted) return;

    if (!currentQuestionData) return;

    saveCurrentAnswer();

    const nextQuestion =
      currentQuestion === totalQuestions
        ? 1
        : currentQuestion + 1;

    const nextSavedAnswer =
      questionStates[
        nextQuestion - 1
      ]?.savedAnswer ?? null;

    setTemporaryAnswer(
      nextSavedAnswer
    );

    setQuestionStates((previous) =>
      previous.map((state, index) =>
        index === nextQuestion - 1
          ? {
            ...state,
            visited: true,
          }
          : state
      )
    );

    setCurrentQuestion(nextQuestion);
  };

  // =====================================================
  // PREVIOUS
  // =====================================================

  const goPrevious = () => {
    if (isSubmitted) return;

    if (currentQuestion <= 1) return;

    saveCurrentAnswer();

    const previousQuestion =
      currentQuestion - 1;

    setTemporaryAnswer(
      questionStates[
        previousQuestion - 1
      ]?.savedAnswer ?? null
    );

    setQuestionStates((previous) =>
      previous.map((state, index) =>
        index === previousQuestion - 1
          ? {
            ...state,
            visited: true,
          }
          : state
      )
    );

    setCurrentQuestion(
      previousQuestion
    );
  };

  // =====================================================
  // CLEAR RESPONSE
  // =====================================================

  const clearResponse = () => {
    if (isSubmitted) return;

    setTemporaryAnswer(null);

    setQuestionStates((previous) =>
      previous.map((state, index) =>
        index === currentQuestion - 1
          ? {
            ...state,
            savedAnswer: null,
          }
          : state
      )
    );
  };

  // =====================================================
  // MARK FOR REVIEW & NEXT
  // =====================================================

  const markForReviewAndNext = () => {
    if (isSubmitted) return;

    const answerToSave =
      temporaryAnswer;

    setQuestionStates((previous) =>
      previous.map((state, index) =>
        index === currentQuestion - 1
          ? {
            ...state,
            visited: true,
            savedAnswer: answerToSave,
            review: !state.review,
          }
          : state
      )
    );

    const nextQuestion =
      currentQuestion === totalQuestions
        ? 1
        : currentQuestion + 1;

    setTemporaryAnswer(
      questionStates[
        nextQuestion - 1
      ]?.savedAnswer ?? null
    );

    setCurrentQuestion(nextQuestion);
  };

  // =====================================================
  // PALETTE STYLE
  // =====================================================

  const getPaletteClass = (
    questionNumber
  ) => {
    const state =
      questionStates[
      questionNumber - 1
      ];

    if (!state) {
      return "";
    }

    const status =
      getQuestionStatus(state);

    const base =
      "relative w-10 h-10 flex items-center justify-center text-sm font-medium transition-all duration-200 cursor-pointer";

    const current =
      questionNumber === currentQuestion
        ? " ring-2 ring-[#e31b23] ring-offset-2"
        : "";

    if (status === "answered") {
      return `${base} ${current} rounded-full bg-[#e31b23] text-white`;
    }

    if (
      status === "reviewAttempted"
    ) {
      return `${base} ${current} rounded-full bg-[#ea580c] text-white`;
    }

    if (status === "review") {
      return `${base} ${current} rounded-full bg-[#7c3aed] text-white`;
    }

    if (status === "notAnswered") {
      return `${base} ${current} rounded-lg bg-[#e5e7eb] text-[#172033]`;
    }

    return `${base} ${current} rounded-lg bg-[#eef0f3] text-[#172033]`;
  };

  // =====================================================
  // SUBMIT
  // =====================================================

  const submitExam = () => {
    if (isSubmitted) return;

    setShowSubmitConfirm(true);
  };

  const confirmSubmitTest = async () => {
    if (isSubmitted) return;

    try {
      const answers = questionStates.map((item, index) => ({
        questionId: actualQuestions[index]?._id,
        selectedAnswer: item.savedAnswer,
      }));

      const response = await fetch(
        "http://localhost:5000/api/test-submissions",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            testId: publishedTest?._id,
            answers,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || "Failed to submit test"
        );
      }

      console.log("Test Result:", data);

      setTestResult(data.result);

      setShowSubmitConfirm(false);
      setIsSubmitted(true);
      setSubmittedTime(timeLeft);

    } catch (error) {
      console.error("SUBMIT TEST ERROR:", error);
      alert(error.message || "Failed to submit test");
    }
  };

  // =====================================================
  // MEDIA RENDER
  // =====================================================

  const renderQuestionMedia = () => {
    if (!currentQuestionData) {
      return null;
    }

    const media =
      currentQuestionData.media;

    if (!media) return null;

    if (typeof media === "string") {
      return (
        <div className="mt-6 flex justify-center">
          <img
            src={media}
            alt="Question media"
            className="max-w-full max-h-[430px] object-contain rounded-xl border border-[#dfe4ea]"
          />
        </div>
      );
    }

    const {
      type,
      url,
      alt,
    } = media;

    if (
      (type === "image" ||
        type === "graph" ||
        type === "chart") &&
      url
    ) {
      return (
        <div className="mt-6 flex justify-center">
          <img
            src={url}
            alt={
              alt ||
              "Question media"
            }
            className="max-w-full max-h-[430px] object-contain rounded-xl border border-[#dfe4ea]"
          />
        </div>
      );
    }

    return null;
  };

  // =====================================================
  // LOADING SCREEN
  // =====================================================

  if (loadingTest) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="mx-auto mb-4 h-10 w-10 rounded-full border-4 border-[#fecaca] border-t-[#e31b23] animate-spin" />

          <h2 className="text-xl font-bold text-[#111827]">
            Loading Test...
          </h2>

          <p className="mt-1 text-sm text-[#6b7280]">
            Please wait while we load your test.
          </p>
        </div>
      </div>
    );
  }

  // =====================================================
  // ERROR SCREEN
  // =====================================================

  if (
    testError ||
    !publishedTest ||
    !publishedTest.questions ||
    publishedTest.questions.length === 0
  ) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center p-6">
        <div className="w-full max-w-lg rounded-2xl border border-[#fecaca] bg-[#fffafa] p-8 text-center shadow-sm">

          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-[#fef2f2] text-2xl text-[#e31b23]">
            !
          </div>

          <h1 className="mt-4 text-2xl font-bold text-[#111827]">
            Test Not Available
          </h1>

          <p className="mt-2 text-sm leading-6 text-[#6b7280]">
            {testError ||
              "There are no questions available in this test yet."}
          </p>

          <button
            type="button"
            onClick={() =>
              window.location.reload()
            }
            className="mt-6 rounded-lg bg-[#e31b23] px-6 py-3 text-sm font-bold text-white transition hover:bg-[#b91c1c]"
          >
            Refresh
          </button>

        </div>
      </div>
    );
  }



  if (isSubmitted) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center p-4 sm:p-6">

        <div className="w-full max-w-5xl overflow-hidden rounded-2xl border border-[#e5e7eb] bg-white shadow-2xl">

          {/* =====================================================
            RESULT HEADER
        ===================================================== */}

          <div className="relative overflow-hidden bg-[#e31b23] px-6 py-7 sm:px-8 sm:py-8">

            <div className="relative flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">

              <div>
                <p className="mb-2 text-xs font-bold uppercase tracking-[0.2em] text-white/80">
                  Test Complete
                </p>

                <h1 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
                  Test Submitted Successfully
                </h1>

                <p className="mt-2 text-sm text-white/80 sm:text-base">
                  Your test has been submitted successfully.
                </p>
              </div>

              {/* Remaining Time */}

              <div className="relative rounded-xl border border-white/20 bg-white/10 px-6 py-4 text-left sm:min-w-[190px] sm:text-right">

                <p className="text-xs font-semibold uppercase tracking-wider text-white/70">
                  Remaining Time
                </p>

                <p className="mt-1 text-2xl font-bold text-white">
                  {formatTime(submittedTime ?? 0)}
                </p>

              </div>

            </div>

          </div>

          {/* =====================================================
            RESULT BODY
        ===================================================== */}

          <div className="p-5 sm:p-8">

            {/* Success Message */}

            <div className="mb-7 flex items-center gap-4 rounded-xl border border-[#fecaca] bg-[#fef2f2] p-4">

              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[#e31b23] text-xl text-white">
                ✓
              </div>

              <div>
                <p className="font-semibold text-[#111827]">
                  Your response has been recorded
                </p>

                <p className="mt-1 text-sm text-[#6b7280]">
                  Here is a quick summary of your test attempt.
                </p>
              </div>

            </div>

            {/* =====================================================
              ACTUAL RESULT SUMMARY
          ===================================================== */}

            {testResult && (
              <div className="mb-7">

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">

                  {/* Score */}

                  <div className="group rounded-xl border border-[#fecaca] bg-[#fffafa] p-5 transition-all duration-200 hover:-translate-y-1 hover:shadow-md">

                    <p className="text-sm font-medium text-[#6b7280]">
                      Score
                    </p>

                    <p className="mt-3 text-3xl font-bold text-[#dc2626]">
                      {testResult.obtainedMarks} / {testResult.totalMarks}
                    </p>

                  </div>

                  {/* Answered */}

                  <div className="group rounded-xl border border-[#fecaca] bg-[#fffafa] p-5 transition-all duration-200 hover:-translate-y-1 hover:shadow-md">

                    <div className="flex items-center justify-between">

                      <p className="text-sm font-medium text-[#6b7280]">
                        Answered
                      </p>

                      <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[#e31b23] text-sm font-bold text-white">
                        ✓
                      </span>

                    </div>

                    <p className="mt-3 text-3xl font-bold text-[#dc2626]">
                      {testResult.answered}
                    </p>

                  </div>

                  {/* Correct */}

                  <div className="group rounded-xl border border-[#bbf7d0] bg-[#f0fdf4] p-5 transition-all duration-200 hover:-translate-y-1 hover:shadow-md">

                    <div className="flex items-center justify-between">

                      <p className="text-sm font-medium text-[#6b7280]">
                        Correct
                      </p>

                      <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[#16a34a] text-sm font-bold text-white">
                        ✓
                      </span>

                    </div>

                    <p className="mt-3 text-3xl font-bold text-[#16a34a]">
                      {testResult.correct}
                    </p>

                  </div>

                  {/* Incorrect */}

                  <div className="group rounded-xl border border-[#fecaca] bg-[#fef2f2] p-5 transition-all duration-200 hover:-translate-y-1 hover:shadow-md">

                    <div className="flex items-center justify-between">

                      <p className="text-sm font-medium text-[#6b7280]">
                        Incorrect
                      </p>

                      <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[#dc2626] text-sm font-bold text-white">
                        !
                      </span>

                    </div>

                    <p className="mt-3 text-3xl font-bold text-[#dc2626]">
                      {testResult.incorrect}
                    </p>

                  </div>

                  {/* Percentage */}

                  <div className="group rounded-xl border border-[#fecaca] bg-[#fffafa] p-5 transition-all duration-200 hover:-translate-y-1 hover:shadow-md">

                    <div className="flex items-center justify-between">

                      <p className="text-sm font-medium text-[#6b7280]">
                        Percentage
                      </p>

                      <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[#e31b23] text-sm font-bold text-white">
                        %
                      </span>

                    </div>

                    <p className="mt-3 text-3xl font-bold text-[#dc2626]">
                      {testResult.percentage}%
                    </p>

                  </div>

                </div>

              </div>
            )}

            {/* =====================================================
              OLD COUNTERS
          ===================================================== */}

            {!testResult && (
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">

                {/* Answered */}

                <div className="group rounded-xl border border-[#fecaca] bg-[#fffafa] p-5">

                  <div className="flex items-center justify-between">

                    <p className="text-sm font-medium text-[#6b7280]">
                      Answered
                    </p>

                    <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[#e31b23] text-sm font-bold text-white">
                      ✓
                    </span>

                  </div>

                  <p className="mt-3 text-3xl font-bold text-[#dc2626]">
                    {counters.answered}
                  </p>

                </div>

                {/* Not Answered */}

                <div className="group rounded-xl border border-[#fecaca] bg-[#fffafa] p-5">

                  <div className="flex items-center justify-between">

                    <p className="text-sm font-medium text-[#6b7280]">
                      Not Answered
                    </p>

                    <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[#ef4444] text-sm font-bold text-white">
                      !
                    </span>

                  </div>

                  <p className="mt-3 text-3xl font-bold text-[#dc2626]">
                    {counters.notAnswered}
                  </p>

                </div>

                {/* Marked */}

                <div className="group rounded-xl border border-[#dfcdfa] bg-[#faf5ff] p-5">

                  <div className="flex items-center justify-between">

                    <p className="text-sm font-medium text-[#6b7280]">
                      Marked
                    </p>

                    <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[#7c3aed] text-sm font-bold text-white">
                      ★
                    </span>

                  </div>

                  <p className="mt-3 text-3xl font-bold text-[#7c3aed]">
                    {counters.marked}
                  </p>

                </div>

                {/* Not Viewed */}

                <div className="group rounded-xl border border-[#e5e7eb] bg-[#f9fafb] p-5">

                  <div className="flex items-center justify-between">

                    <p className="text-sm font-medium text-[#6b7280]">
                      Not Viewed
                    </p>

                    <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[#e5e7eb] text-sm font-bold text-[#6b7280]">
                      ○
                    </span>

                  </div>

                  <p className="mt-3 text-3xl font-bold text-[#374151]">
                    {counters.notViewed}
                  </p>

                </div>

                {/* Review & Attempted */}

                <div className="group rounded-xl border border-[#fed7aa] bg-[#fff7ed] p-5">

                  <div className="flex items-center justify-between">

                    <p className="text-sm font-medium text-[#6b7280]">
                      Review &amp; Attempted
                    </p>

                    <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[#ea580c] text-sm font-bold text-white">
                      !
                    </span>

                  </div>

                  <p className="mt-3 text-3xl font-bold text-[#ea580c]">
                    {counters.reviewAttempted}
                  </p>

                </div>

              </div>
            )}

            {/* =====================================================
              FOOTER
          ===================================================== */}

            <div className="mt-8 flex flex-col gap-3 border-t border-[#e5e7eb] pt-6 sm:flex-row sm:items-center sm:justify-between">

              <div>

                <p className="text-sm font-semibold text-[#111827]">
                  Test submission complete
                </p>

                <p className="mt-1 text-xs text-[#6b7280]">
                  You can review your performance from the results section.
                </p>

              </div>

              <button
                type="button"
                onClick={() => setShowDetailedResult(true)}
                className="px-5 py-3 rounded-lg bg-[#e31b23] text-white font-bold transition hover:bg-[#c8171e]"
              >
                View Results →
              </button>

            </div>

          </div>

        </div>

        {/* =====================================================
          DETAILED RESULT OVERLAY
      ===================================================== */}

        {/* =====================================================
    DETAILED RESULT PAGE
===================================================== */}

        {showDetailedResult && testResult && (
          <div className="fixed inset-0 z-[100] overflow-y-auto bg-[#f8fafc]">

            {/* TOP HEADER */}

            <div className="sticky top-0 z-20 border-b border-gray-200 bg-white shadow-sm">

              <div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-4 sm:px-8">

                <div>
                  <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#e31b23]">
                    Test Result
                  </p>

                  <h1 className="mt-1 text-xl font-bold text-[#111827] sm:text-2xl">
                    {testResult.testTitle}
                  </h1>
                </div>

                <button
                  type="button"
                  onClick={() => setShowDetailedResult(false)}
                  className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-semibold text-gray-700 transition hover:border-[#e31b23] hover:bg-red-50 hover:text-[#e31b23]"
                >
                  ← Back
                </button>

              </div>

            </div>


            {/* MAIN CONTENT */}

            <div className="mx-auto max-w-6xl px-5 py-7 sm:px-8 sm:py-10">


              {/* RESULT OVERVIEW */}

              <div className="mb-8">

                <div className="mb-5">

                  <h2 className="text-2xl font-bold text-[#111827] sm:text-3xl">
                    Your Performance
                  </h2>

                  <p className="mt-1 text-sm text-gray-500">
                    Here is your detailed performance report for this test.
                  </p>

                </div>


                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">


                  {/* SCORE */}

                  <div className="rounded-xl border border-red-100 bg-white p-5 shadow-sm">

                    <div className="flex items-center justify-between">

                      <p className="text-sm font-semibold text-gray-500">
                        Score
                      </p>

                      <div className="flex h-9 w-9 items-center justify-center rounded-full bg-red-50 text-[#e31b23]">
                        ★
                      </div>

                    </div>

                    <p className="mt-3 text-3xl font-bold text-[#e31b23]">
                      {testResult.obtainedMarks}
                      <span className="text-lg font-semibold text-gray-400">
                        {" "} / {testResult.totalMarks}
                      </span>
                    </p>

                  </div>


                  {/* CORRECT */}

                  <div className="rounded-xl border border-green-100 bg-white p-5 shadow-sm">

                    <div className="flex items-center justify-between">

                      <p className="text-sm font-semibold text-gray-500">
                        Correct
                      </p>

                      <div className="flex h-9 w-9 items-center justify-center rounded-full bg-green-100 text-green-600">
                        ✓
                      </div>

                    </div>

                    <p className="mt-3 text-3xl font-bold text-green-600">
                      {testResult.correct}
                    </p>

                  </div>


                  {/* INCORRECT */}

                  <div className="rounded-xl border border-red-100 bg-white p-5 shadow-sm">

                    <div className="flex items-center justify-between">

                      <p className="text-sm font-semibold text-gray-500">
                        Incorrect
                      </p>

                      <div className="flex h-9 w-9 items-center justify-center rounded-full bg-red-100 text-red-600">
                        ✕
                      </div>

                    </div>

                    <p className="mt-3 text-3xl font-bold text-red-600">
                      {testResult.incorrect}
                    </p>

                  </div>


                  {/* PERCENTAGE */}

                  <div className="rounded-xl border border-red-100 bg-white p-5 shadow-sm">

                    <div className="flex items-center justify-between">

                      <p className="text-sm font-semibold text-gray-500">
                        Percentage
                      </p>

                      <div className="flex h-9 w-9 items-center justify-center rounded-full bg-red-50 font-bold text-[#e31b23]">
                        %
                      </div>

                    </div>

                    <p className="mt-3 text-3xl font-bold text-[#e31b23]">
                      {testResult.percentage}%
                    </p>

                  </div>

                </div>

              </div>


              {/* TEST STATISTICS */}

              <div className="mb-8 rounded-xl border border-gray-200 bg-white p-5 shadow-sm sm:p-6">

                <h3 className="text-lg font-bold text-[#111827]">
                  Test Statistics
                </h3>

                <div className="mt-5 grid grid-cols-2 gap-4 md:grid-cols-4">

                  <div className="rounded-lg bg-red-50 p-4">
                    <p className="text-xs font-medium text-gray-500">
                      Total Questions
                    </p>

                    <p className="mt-1 text-2xl font-bold text-[#e31b23]">
                      {testResult.totalQuestions}
                    </p>
                  </div>

                  <div className="rounded-lg bg-green-50 p-4">
                    <p className="text-xs font-medium text-gray-500">
                      Answered
                    </p>

                    <p className="mt-1 text-2xl font-bold text-green-600">
                      {testResult.answered}
                    </p>
                  </div>

                  <div className="rounded-lg bg-red-50 p-4">
                    <p className="text-xs font-medium text-gray-500">
                      Incorrect
                    </p>

                    <p className="mt-1 text-2xl font-bold text-red-600">
                      {testResult.incorrect}
                    </p>
                  </div>

                  <div className="rounded-lg bg-gray-50 p-4">
                    <p className="text-xs font-medium text-gray-500">
                      Not Answered
                    </p>

                    <p className="mt-1 text-2xl font-bold text-gray-700">
                      {testResult.notAnswered}
                    </p>
                  </div>

                </div>

              </div>


              {/* QUESTION WISE RESULT */}

              <div>

                <div className="mb-5">

                  <h2 className="text-2xl font-bold text-[#111827]">
                    Question-wise Result
                  </h2>

                  <p className="mt-1 text-sm text-gray-500">
                    Review your answers and compare them with the correct answers.
                  </p>

                </div>


                <div className="space-y-5">

                  {testResult.answers?.map((answer, index) => {

                    const isNotAnswered =
                      answer.selectedAnswer === null ||
                      answer.selectedAnswer === undefined;

                    const questionText =
                      answer.question?.questionText ||
                      answer.question?.question ||
                      "Question not available";

                    const yourAnswer =
                      !isNotAnswered &&
                        answer.question?.options?.[answer.selectedAnswer]
                        ? answer.question.options[answer.selectedAnswer]
                        : "Not Answered";

                    const correctAnswer =
                      answer.question?.options?.[
                      answer.question?.correctAnswer
                      ] || "Not available";

                    return (
                      <div
                        key={answer._id || index}
                        className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm"
                      >

                        {/* QUESTION HEADER */}

                        <div className="flex flex-col gap-3 border-b border-gray-100 px-5 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">

                          <div className="flex items-center gap-3">

                            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-red-50 text-sm font-bold text-[#e31b23]">
                              {index + 1}
                            </div>

                            <h3 className="text-base font-bold text-[#111827]">
                              Question {index + 1}
                            </h3>

                          </div>


                          {/* STATUS */}

                          <span
                            className={`w-fit rounded-full px-3 py-1 text-xs font-bold ${answer.isCorrect
                                ? "bg-green-100 text-green-700"
                                : isNotAnswered
                                  ? "bg-gray-100 text-gray-600"
                                  : "bg-red-100 text-red-700"
                              }`}
                          >
                            {answer.isCorrect
                              ? "✓ Correct"
                              : isNotAnswered
                                ? "Not Answered"
                                : "✕ Incorrect"}
                          </span>

                        </div>


                        {/* QUESTION BODY */}

                        <div className="p-5 sm:p-6">

                          {/* QUESTION */}

                          <div className="mb-6">

                            <p className="text-base font-semibold leading-7 text-[#111827] sm:text-lg">
                              {questionText}
                            </p>

                          </div>


                          {/* ANSWERS */}

                          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">


                            {/* YOUR ANSWER */}

                            <div
                              className={`rounded-xl border p-4 ${answer.isCorrect
                                  ? "border-green-200 bg-green-50"
                                  : isNotAnswered
                                    ? "border-gray-200 bg-gray-50"
                                    : "border-red-200 bg-red-50"
                                }`}
                            >

                              <div className="flex items-center justify-between">

                                <p className="text-xs font-bold uppercase tracking-wider text-gray-500">
                                  Your Answer
                                </p>

                                <span
                                  className={`text-sm font-bold ${answer.isCorrect
                                      ? "text-green-600"
                                      : isNotAnswered
                                        ? "text-gray-500"
                                        : "text-red-600"
                                    }`}
                                >
                                  {answer.isCorrect
                                    ? "Correct"
                                    : isNotAnswered
                                      ? "—"
                                      : "Wrong"}
                                </span>

                              </div>

                              <p className="mt-2 text-sm font-semibold text-[#111827]">
                                {yourAnswer}
                              </p>

                            </div>


                            {/* CORRECT ANSWER */}

                            <div className="rounded-xl border border-green-200 bg-green-50 p-4">

                              <p className="text-xs font-bold uppercase tracking-wider text-gray-500">
                                Correct Answer
                              </p>

                              <p className="mt-2 text-sm font-semibold text-green-700">
                                {correctAnswer}
                              </p>

                            </div>

                          </div>


                          {/* MARKS */}

                          <div className="mt-5 flex items-center justify-between border-t border-gray-100 pt-4">

                            <p className="text-sm font-medium text-gray-500">
                              Marks Obtained
                            </p>

                            <p
                              className={`text-base font-bold ${answer.marksObtained < 0
                                  ? "text-red-600"
                                  : answer.isCorrect
                                    ? "text-green-600"
                                    : "text-gray-600"
                                }`}
                            >
                              {answer.marksObtained > 0
                                ? `+${answer.marksObtained}`
                                : answer.marksObtained}
                            </p>

                          </div>

                        </div>

                      </div>
                    );
                  })}

                </div>

              </div>


              {/* BOTTOM */}

              <div className="mt-10 flex justify-center border-t border-gray-200 pt-7">

                <button
                  type="button"
                  onClick={() => setShowDetailedResult(false)}
                  className="rounded-lg bg-[#e31b23] px-7 py-3 text-sm font-bold text-white shadow-sm transition hover:bg-[#c8171e]"
                >
                  ← Back to Submission
                </button>

              </div>

            </div>

          </div>
        )}

      </div>
    );
  }

  // =====================================================
  // MAIN UI
  // =====================================================

  return (
    <div className="h-screen bg-white flex flex-col overflow-hidden">

      {/* =================================================
          TOP HEADER
      ================================================= */}

      <header className="h-20 shrink-0 bg-white border-b border-[#e5e7eb] flex items-center justify-between px-6 shadow-sm">

        {/* LEFT */}

        <div className="min-w-0">

          <h1 className="text-2xl font-bold text-[#111827] tracking-tight">
            {publishedTest.title}
          </h1>

          <p className="text-sm text-[#e31b23] mt-0.5">
            {publishedTest.subject ||
              "General Awareness"}
          </p>

        </div>

        {/* RIGHT */}

        <div className="flex items-center gap-3">

          {/* TIMER */}

          <div className="hidden sm:flex items-center gap-2 bg-[#fef2f2] border border-[#fecaca] rounded-lg px-4 py-2.5">

            <span className="text-[#e31b23] text-[16px]">
              ◷
            </span>

            <span className="text-sm text-[#4b5563]">
              Time:
            </span>

            <span
              className={`font-semibold ${timeLeft <= 300
                ? "text-[#dc2626] animate-pulse"
                : "text-[#111827]"
                }`}
            >
              {formatTime(timeLeft)}
            </span>

          </div>

          {/* REPORT */}

          <button
            type="button"
            onClick={() =>
              setShowReport(true)
            }
            className="px-5 py-2.5 rounded-lg bg-white border border-[#e5e7eb] text-[#374151] font-medium hover:bg-[#fef2f2] hover:border-[#e31b23] hover:text-[#e31b23] transition"
          >
            ⚠ Report
          </button>

          {/* CALCULATOR */}

          <button
            type="button"
            onClick={() =>
              setShowCalculator(true)
            }
            className="px-5 py-2.5 rounded-lg bg-white border border-[#e5e7eb] text-[#374151] font-medium hover:bg-[#fef2f2] hover:border-[#e31b23] hover:text-[#e31b23] transition"
          >
            ▣ Calculator
          </button>

          {/* SUBMIT */}

          <button
            onClick={submitExam}
            className="bg-[#e31b23] hover:bg-[#b91c1c] text-white font-bold px-6 py-2.5 rounded-lg transition shadow-sm"
          >
            Submit Test
          </button>

        </div>

      </header>

      {/* =================================================
          MAIN THREE COLUMN LAYOUT
      ================================================= */}

      <main className="flex-1 min-h-0 flex bg-white text-[#111827]">

        {/* =================================================
            LEFT QUESTION NAVIGATION
        ================================================= */}

        <aside className="w-[17%] min-w-[260px] bg-white border-r border-[#e5e7eb] flex flex-col min-h-0">

          {/* NAVIGATION HEADER */}

          <div className="shrink-0 px-5 pt-5 pb-4">

            <div className="flex items-center gap-2 mb-1">

              <span className="w-1.5 h-6 rounded-full bg-[#e31b23]" />

              <h2 className="text-[18px] font-bold text-[#111827]">
                Question Navigation
              </h2>

            </div>

            <p className="text-[12px] text-[#6b7280] ml-3.5 mt-1">
              Navigate through your questions
            </p>

            {/* SECTION DROPDOWN */}

            <select
              className="
                mt-4 w-full h-11 px-3
                rounded-xl
                border border-[#e5e7eb]
                bg-white
                text-[14px] font-medium
                text-[#111827]
                outline-none
                cursor-pointer
                transition-all duration-200
                hover:border-[#e31b23]
                focus:border-[#e31b23]
                focus:ring-2 focus:ring-[#e31b23]/10
              "
            >
              <option>
                {publishedTest.subject ||
                  "Section 1"}
              </option>
            </select>

          </div>

          {/* QUESTION NUMBERS */}

          <div className="flex-1 overflow-y-auto px-5 pb-5">

            <div className="grid grid-cols-5 gap-2.5">

              {actualQuestions.map(
                (_, index) => {

                  const questionNumber =
                    index + 1;

                  const state =
                    questionStates[
                    index
                    ];

                  const status = state
                    ? getQuestionStatus(
                      state
                    )
                    : "notViewed";

                  const isCurrent =
                    currentQuestion ===
                    questionNumber;

                  let buttonClass =
                    "h-10 rounded-lg flex items-center justify-center text-[14px] font-semibold transition-all duration-200 cursor-pointer ";

                  // CURRENT

                  if (isCurrent) {
                    buttonClass +=
                      "bg-[#e31b23] text-white border border-[#e31b23] shadow-[0_3px_10px_rgba(227,27,35,0.20)] ring-2 ring-[#e31b23]/20 ";
                  }

                  // ANSWERED

                  else if (
                    status ===
                    "answered"
                  ) {
                    buttonClass +=
                      "bg-[#e31b23] text-white border border-[#e31b23] hover:bg-[#b91c1c] hover:border-[#b91c1c] hover:-translate-y-[1px] ";
                  }

                  // REVIEW

                  else if (
                    status === "review"
                  ) {
                    buttonClass +=
                      "bg-[#7c3aed] text-white border border-[#7c3aed] hover:bg-[#6d28d9] hover:-translate-y-[1px] ";
                  }

                  // REVIEW + ATTEMPTED

                  else if (
                    status ===
                    "reviewAttempted"
                  ) {
                    buttonClass +=
                      "bg-[#ea580c] text-white border border-[#ea580c] hover:bg-[#c2410c] hover:-translate-y-[1px] ";
                  }

                  // NOT ANSWERED

                  else if (
                    status ===
                    "notAnswered"
                  ) {
                    buttonClass +=
                      "bg-[#f3f4f6] text-[#374151] border border-[#e5e7eb] hover:bg-[#fef2f2] hover:border-[#e31b23] hover:text-[#b91c1c] ";
                  }

                  // NOT VIEWED

                  else {
                    buttonClass +=
                      "bg-white text-[#374151] border border-[#e5e7eb] hover:bg-[#fef2f2] hover:border-[#e31b23] hover:text-[#b91c1c] ";
                  }

                  return (
                    <button
                      key={
                        actualQuestions[
                          index
                        ]?._id ||
                        questionNumber
                      }
                      onClick={() =>
                        openQuestion(
                          questionNumber
                        )
                      }
                      className={
                        buttonClass
                      }
                    >
                      {questionNumber}
                    </button>
                  );
                }
              )}

            </div>

          </div>

          {/* =================================================
              LEGEND
          ================================================= */}

          <div className="shrink-0 border-t border-[#e5e7eb] bg-white px-5 py-4">

            <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-[#e31b23] mb-3">
              Question Status
            </p>

            <div className="space-y-2.5 text-[13px]">

              {/* ANSWERED */}

              <div className="flex items-center justify-between">

                <div className="flex items-center gap-2.5">

                  <span className="w-3.5 h-3.5 rounded-full bg-[#e31b23] shadow-sm" />

                  <span className="text-[#374151]">
                    Answered
                  </span>

                </div>

                <span className="font-bold text-[#111827]">
                  = {counters.answered}
                </span>

              </div>

              {/* NOT ANSWERED */}

              <div className="flex items-center justify-between">

                <div className="flex items-center gap-2.5">

                  <span className="w-3.5 h-3.5 rounded-full bg-[#f3f4f6] border border-[#d1d5db]" />

                  <span className="text-[#374151]">
                    Not Answered
                  </span>

                </div>

                <span className="font-bold text-[#111827]">
                  = {counters.notAnswered}
                </span>

              </div>

              {/* MARKED */}

              <div className="flex items-center justify-between">

                <div className="flex items-center gap-2.5">

                  <span className="w-3.5 h-3.5 rounded-full bg-[#7c3aed]" />

                  <span className="text-[#374151]">
                    Marked for Review
                  </span>

                </div>

                <span className="font-bold text-[#111827]">
                  = {counters.marked}
                </span>

              </div>

              {/* NOT VIEWED */}

              <div className="flex items-center justify-between">

                <div className="flex items-center gap-2.5">

                  <span className="w-3.5 h-3.5 rounded-full bg-white border border-[#d1d5db]" />

                  <span className="text-[#374151]">
                    Not Viewed
                  </span>

                </div>

                <span className="font-bold text-[#111827]">
                  = {counters.notViewed}
                </span>

              </div>

              {/* REVIEW & ATTEMPTED */}

              <div className="flex items-center justify-between">

                <div className="flex items-center gap-2.5">

                  <span className="w-3.5 h-3.5 rounded-full bg-[#ea580c]" />

                  <span className="text-[#374151]">
                    Review &amp; Attempted
                  </span>

                </div>

                <span className="font-bold text-[#111827]">
                  ={" "}
                  {
                    counters.reviewAttempted
                  }
                </span>

              </div>

            </div>

          </div>

        </aside>

        {/* =================================================
            CENTER QUESTION AREA
        ================================================= */}

        <section className="flex-1 min-w-0 flex flex-col bg-white">

          {/* QUESTION TOP */}

          <div className="shrink-0 px-7 pt-5">

            <div className="flex items-center justify-between border-b border-[#e5e7eb] pb-4">

              <div>

                {/* QUESTION NUMBER */}

                <div className="flex items-center gap-3">

                  <h2 className="text-[23px] font-bold tracking-tight text-[#111827]">
                    Question{" "}
                    {currentQuestion}
                  </h2>

                  <span className="text-[11px] font-bold uppercase tracking-[0.14em] text-[#6b7280]">
                    of {totalQuestions}
                  </span>

                </div>

                {/* QUESTION META */}

                <div className="flex items-center gap-2 flex-wrap mt-2.5">

                  {/* DIFFICULTY */}

                  <span className="px-3 py-1 rounded-full bg-[#fef2f2] border border-[#fecaca] text-[#b91c1c] text-[12px] font-bold">
                    {currentQuestionData.difficulty ||
                      "Medium"}
                  </span>

                  {/* TYPE */}

                  <span className="px-3 py-1 rounded-full bg-[#f9fafb] border border-[#e5e7eb] text-[#374151] text-[12px] font-bold">
                    {currentQuestionData.questionType ||
                      "MCQ"}
                  </span>

                  {/* SUBJECT */}

                  <span className="px-3 py-1 rounded-full bg-[#fef2f2] border border-[#fecaca] text-[#b91c1c] text-[12px] font-bold">
                    {currentQuestionData.subject ||
                      publishedTest.subject ||
                      "General Awareness"}
                  </span>

                  {/* MARKS */}

                  <span className="px-3 py-1 rounded-full bg-[#f9fafb] border border-[#e5e7eb] text-[#374151] text-[12px] font-bold">
                    +
                    {currentQuestionData.marks
                      ?.correct ??
                      publishedTest.marksPerQuestion ??
                      1}{" "}
                    /{" "}
                    {currentQuestionData.marks
                      ?.incorrect ??
                      publishedTest.negativeMarks ??
                      0}
                  </span>

                </div>

              </div>

              {/* LANGUAGE + FONT */}

              <div className="flex items-center gap-2">

                <select
                  className="
                    h-9 px-3
                    rounded-lg
                    border border-[#e5e7eb]
                    bg-white
                    text-[13px] font-medium
                    text-[#374151]
                    outline-none
                    cursor-pointer
                    hover:border-[#e31b23]
                    focus:border-[#e31b23]
                    focus:ring-2 focus:ring-[#e31b23]/10
                  "
                >

                  <option>
                    English
                  </option>

                  <option>
                    Hindi
                  </option>

                </select>

                <div className="flex h-9 border border-[#e5e7eb] rounded-lg overflow-hidden bg-white">

                  <button
                    onClick={
                      decreaseFontSize
                    }
                    className="
                      px-3
                      text-[13px] font-bold
                      text-[#374151]
                      border-r border-[#e5e7eb]
                      hover:bg-[#fef2f2]
                      hover:text-[#b91c1c]
                      transition
                    "
                  >
                    A−
                  </button>

                  <button
                    onClick={
                      increaseFontSize
                    }
                    className="
                      px-3
                      text-[13px] font-bold
                      text-[#374151]
                      hover:bg-[#fef2f2]
                      hover:text-[#b91c1c]
                      transition
                    "
                  >
                    A+
                  </button>

                </div>

              </div>

            </div>

          </div>

          {/* QUESTION CONTENT */}

          <div className="flex-1 overflow-y-auto px-7 py-7">

            <div className="max-w-[900px]">

              {/* QUESTION LABEL */}

              <div className="flex items-center gap-2 mb-3">

                <span className="w-1.5 h-5 rounded-full bg-[#e31b23]" />

                <span className="text-[11px] font-bold uppercase tracking-[0.18em] text-[#6b7280]">
                  Question
                </span>

              </div>

              {/* COMPLETE QUESTION */}

              <div
                className="
                  text-[#111827]
                  leading-[1.7]
                  font-medium
                  tracking-[-0.01em]
                "
                style={{
                  fontSize: `${questionFontSize}px`,
                }}
              >
                {currentQuestionData?.question ||
                  currentQuestionData?.questionText ||
                  currentQuestionData?.text ||
                  "Question not available"}
              </div>

              {/* MEDIA */}

              {renderQuestionMedia()}

            </div>

          </div>

          {/* BOTTOM ACTION BAR */}

          <div className="shrink-0 border-t border-[#e5e7eb] bg-white px-6 py-4">

            <div className="flex items-center justify-between gap-3">

              {/* PREVIOUS */}

              <button
                onClick={goPrevious}
                disabled={
                  currentQuestion === 1
                }
                className="
                  px-5 py-2.5
                  rounded-lg
                  border border-[#e5e7eb]
                  bg-white
                  text-[#374151]
                  font-semibold
                  text-[14px]
                  hover:bg-[#fef2f2]
                  hover:border-[#e31b23]
                  hover:text-[#b91c1c]
                  transition-all
                  disabled:opacity-40
                  disabled:cursor-not-allowed
                "
              >
                ← Previous
              </button>

              {/* CENTER ACTIONS */}

              <div className="flex items-center gap-3">

                {/* MARK REVIEW */}

                <button
                  onClick={
                    markForReviewAndNext
                  }
                  className="
                    px-5 py-2.5
                    rounded-lg
                    border border-[#fecaca]
                    bg-[#fef2f2]
                    text-[#b91c1c]
                    font-semibold
                    text-[14px]
                    hover:bg-[#e31b23]
                    hover:text-white
                    hover:border-[#e31b23]
                    hover:-translate-y-[1px]
                    transition-all
                  "
                >
                  {currentState.review
                    ? "Remove Review & Next"
                    : "Mark for Review"}
                </button>

                {/* CLEAR RESPONSE */}

                <button
                  onClick={
                    clearResponse
                  }
                  className="
                    px-5 py-2.5
                    rounded-lg
                    border border-[#e5e7eb]
                    bg-white
                    text-[#374151]
                    font-semibold
                    text-[14px]
                    hover:bg-[#fef2f2]
                    hover:text-[#b91c1c]
                    hover:border-[#e31b23]
                    transition-all
                  "
                >
                  Clear Response
                </button>

              </div>

              {/* SAVE NEXT */}

              <button
                onClick={saveAndNext}
                className="
                  px-7 py-2.5
                  rounded-lg
                  bg-[#e31b23]
                  text-white
                  font-bold
                  text-[14px]
                  border border-[#e31b23]
                  shadow-sm
                  hover:bg-[#b91c1c]
                  hover:border-[#b91c1c]
                  hover:-translate-y-[1px]
                  hover:shadow-md
                  transition-all
                "
              >
                Save &amp; Next →
              </button>

            </div>

          </div>

        </section>

        {/* =================================================
            RIGHT OPTIONS
        ================================================= */}

        <aside
          className="
            w-[30%]
            max-w-[470px]
            min-w-[300px]
            border-l border-[#e5e7eb]
            bg-[#fafafa]
            flex flex-col
            min-h-0
          "
        >

          {/* OPTIONS HEADER */}

          <div className="shrink-0 px-6 pt-6 pb-3">

            <div className="flex items-center justify-between">

              <div>

                <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-[#e31b23]">
                  Select Answer
                </p>

                <h3 className="mt-1 text-[18px] font-bold text-[#111827]">
                  Choose the correct option
                </h3>

              </div>

              <span className="w-9 h-9 rounded-full bg-[#fef2f2] border border-[#fecaca] text-[#b91c1c] flex items-center justify-center text-xs font-bold">
                {currentQuestion}
              </span>

            </div>

          </div>

          {/* OPTIONS */}

          <div className="flex-1 overflow-y-auto px-6 pb-5">

            <div className="space-y-3">

              {(
                currentQuestionData.options ||
                []
              ).map(
                (option, index) => {

                  const isSelected =
                    temporaryAnswer ===
                    index;

                  const optionLetter =
                    String.fromCharCode(
                      65 + index
                    );

                  return (
                    <button
                      key={`${currentQuestion}-${index}`}
                      onClick={() =>
                        handleAnswer(
                          index
                        )
                      }
                      className={`
                        group
                        w-full
                        min-h-[82px]
                        px-5
                        rounded-xl
                        border
                        text-left
                        flex
                        items-center
                        gap-4
                        transition-all
                        duration-200

                        ${isSelected
                          ? "border-[#e31b23] bg-[#fef2f2] shadow-[0_4px_14px_rgba(227,27,35,0.10)] ring-1 ring-[#e31b23]"
                          : "border-[#e5e7eb] bg-white hover:border-[#e31b23] hover:bg-[#fef2f2] hover:-translate-y-[1px] hover:shadow-sm"
                        }
                      `}
                    >

                      {/* OPTION LETTER */}

                      <span
                        className={`
                          w-10 h-10
                          shrink-0
                          rounded-full
                          flex
                          items-center
                          justify-center
                          text-[13px]
                          font-bold
                          transition-all

                          ${isSelected
                            ? "bg-[#e31b23] text-white shadow-sm"
                            : "bg-[#f3f4f6] text-[#374151] group-hover:bg-[#e31b23] group-hover:text-white"
                          }
                        `}
                      >
                        {optionLetter}
                      </span>

                      {/* OPTION TEXT */}

                      <span
                        className={`
                          text-[16px]
                          leading-6
                          font-medium
                          transition-colors

                          ${isSelected
                            ? "text-[#991b1b]"
                            : "text-[#374151] group-hover:text-[#991b1b]"
                          }
                        `}
                      >
                        {typeof option ===
                          "object"
                          ? option.text ||
                          option.option ||
                          option.label ||
                          ""
                          : option}
                      </span>

                    </button>
                  );
                }
              )}

            </div>

          </div>

        </aside>

      </main>

      {/* =====================================================
          REPORT MODAL
      ===================================================== */}

      {showReport && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-2 sm:p-3 overflow-hidden">

          <div className="w-full max-w-xl max-h-[calc(100vh-16px)] bg-white rounded-2xl shadow-2xl overflow-hidden border border-[#e5e7eb] flex flex-col">

            {/* HEADER */}

            <div className="shrink-0 bg-[#e31b23] px-5 py-4 sm:px-6 sm:py-5 flex items-center justify-between">

              <div className="min-w-0">

                <p className="text-xs font-semibold tracking-[0.18em] uppercase text-white/80">
                  Report Question
                </p>

                <h2 className="mt-1 text-xl sm:text-2xl font-bold text-white">
                  What is wrong with this question?
                </h2>

              </div>

              {/* CLOSE */}

              <button
                type="button"
                onClick={() => {
                  setShowReport(false);
                  setReportReason("");
                  setReportDescription("");
                  setReportError("");
                }}
                className="w-9 h-9 shrink-0 ml-4 rounded-full border border-white/30 text-white flex items-center justify-center text-2xl leading-none hover:bg-white hover:text-[#e31b23] transition-all duration-200"
              >
                ×
              </button>

            </div>

            {/* CONTENT */}

            <div className="flex-1 min-h-0 overflow-y-auto px-5 py-4 sm:px-6 sm:py-5">

              <p className="text-[#6b7280] text-sm mb-4">
                Help us improve this question by selecting the issue you noticed.
              </p>

              {/* REPORT OPTIONS */}

              <div className="space-y-2.5">

                {[
                  "Question is incorrect",
                  "Options are incorrect",
                  "Image / Graph issue",
                  "Question is unclear",
                  "Other issue",
                ].map(
                  (reason) => (
                    <label
                      key={reason}
                      className={`group flex items-center gap-4 border rounded-xl px-4 py-3 cursor-pointer transition-all duration-200 ${reportReason ===
                        reason
                        ? "border-[#e31b23] bg-[#fef2f2]"
                        : "border-[#e5e7eb] bg-white hover:border-[#e31b23] hover:bg-[#fef2f2]"
                        }`}
                    >

                      <input
                        type="radio"
                        name="reportReason"
                        value={reason}
                        checked={
                          reportReason ===
                          reason
                        }
                        onChange={(e) => {
                          setReportReason(
                            e.target.value
                          );
                          setReportError(
                            ""
                          );
                        }}
                        className="w-[18px] h-[18px] shrink-0 accent-[#e31b23] cursor-pointer"
                      />

                      <span className="text-[15px] font-medium text-[#374151]">
                        {reason}
                      </span>

                    </label>
                  )
                )}

              </div>

              {/* DESCRIPTION */}

              <div className="mt-4">

                <label className="block text-sm font-semibold text-[#111827] mb-2">

                  Additional details

                  <span className="font-normal text-[#6b7280] ml-1">
                    (optional)
                  </span>

                </label>

                <textarea
                  value={
                    reportDescription
                  }
                  onChange={(e) => {
                    setReportDescription(
                      e.target.value
                    );
                    setReportError(
                      ""
                    );
                  }}
                  placeholder="Describe the issue (optional)"
                  className="w-full min-h-[95px] resize-none border border-[#d1d5db] bg-white rounded-xl px-4 py-3 text-[15px] text-[#111827] placeholder:text-[#9ca3af] outline-none transition-all duration-200 focus:border-[#e31b23] focus:ring-2 focus:ring-[#e31b23]/10"
                />

              </div>

              {/* ERROR */}

              {reportError && (
                <div className="mt-3 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
                  {reportError}
                </div>
              )}

              {/* FOOTER BUTTONS */}

              <div className="flex justify-end items-center gap-3 mt-4">

                {/* CANCEL */}

                <button
                  type="button"
                  disabled={
                    reportSubmitting
                  }
                  onClick={() => {
                    setShowReport(false);
                    setReportReason("");
                    setReportDescription("");
                    setReportError("");
                  }}
                  className="px-5 py-2.5 rounded-lg border border-[#d1d5db] bg-white text-[#374151] font-semibold hover:bg-[#fef2f2] hover:text-[#e31b23] hover:border-[#e31b23] transition-all duration-200 disabled:opacity-50"
                >
                  Cancel
                </button>

                {/* SUBMIT */}

                <button
                  type="button"
                  onClick={
                    handleSubmitReport
                  }
                  disabled={
                    reportSubmitting
                  }
                  className="px-6 py-2.5 rounded-lg bg-[#e31b23] text-white font-bold hover:bg-[#b91c1c] disabled:opacity-50 transition-all duration-200"
                >
                  {reportSubmitting
                    ? "Submitting..."
                    : "Submit Report"}
                </button>

              </div>

            </div>

          </div>

        </div>
      )}

      {/* =====================================================
          REPORT SUCCESS
      ===================================================== */}

      {showReportSuccess && (
        <div className="fixed inset-0 z-[60] bg-black/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 overflow-hidden">

          <div className="w-full max-w-md max-h-[calc(100vh-24px)] bg-white rounded-2xl shadow-2xl overflow-hidden border border-[#e5e7eb] flex flex-col">

            {/* TOP ACCENT */}

            <div className="h-1.5 shrink-0 bg-[#e31b23]" />

            {/* CONTENT */}

            <div className="px-6 py-6 sm:px-7 sm:py-7 text-center overflow-y-auto">

              {/* SUCCESS ICON */}

              <div className="mx-auto w-16 h-16 rounded-full bg-[#fef2f2] border border-[#fecaca] flex items-center justify-center mb-5">

                <div className="w-10 h-10 rounded-full bg-[#e31b23] flex items-center justify-center">

                  <span className="text-white text-2xl font-bold">
                    ✓
                  </span>

                </div>

              </div>

              {/* LABEL */}

              <p className="text-xs font-bold tracking-[0.18em] uppercase text-[#e31b23]">
                Thank You
              </p>

              {/* TITLE */}

              <h2 className="mt-2 text-2xl sm:text-[26px] font-bold text-[#111827]">
                Report Submitted
              </h2>

              {/* MESSAGE */}

              <p className="mt-3 text-[15px] leading-6 text-[#6b7280]">
                Your report has been submitted successfully.
                Our team will review the question and take the necessary action.
              </p>

              {/* DONE */}

              <button
                type="button"
                onClick={() =>
                  setShowReportSuccess(
                    false
                  )
                }
                className="mt-6 w-full py-3 rounded-lg bg-[#e31b23] text-white font-semibold border border-[#e31b23] hover:bg-[#b91c1c] hover:-translate-y-[1px] hover:shadow-md transition-all duration-200"
              >
                Done
              </button>

            </div>

          </div>

        </div>
      )}

      {/* =====================================================
          CALCULATOR
      ===================================================== */}

      {showCalculator && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-5">

          <div className="w-full max-w-5xl h-[94vh] bg-white rounded-2xl shadow-2xl overflow-hidden border border-[#e5e7eb] flex flex-col">

            {/* HEADER */}

            <div className="shrink-0 bg-[#e31b23] px-5 py-3.5 flex items-center justify-between">

              <div className="flex items-center gap-3">

                <div className="w-9 h-9 rounded-lg bg-white text-[#e31b23] flex items-center justify-center font-bold">
                  ▣
                </div>

                <div>

                  <p className="text-[10px] font-bold tracking-[0.18em] uppercase text-white/80">
                    Tools
                  </p>

                  <h2 className="text-lg font-bold text-white leading-tight">
                    Graphing Calculator
                  </h2>

                </div>

              </div>

              {/* CLOSE */}

              <button
                type="button"
                onClick={() =>
                  setShowCalculator(
                    false
                  )
                }
                className="w-9 h-9 rounded-full border border-white/30 text-white flex items-center justify-center text-2xl leading-none hover:bg-white hover:text-[#e31b23] transition-all duration-200"
              >
                ×
              </button>

            </div>

            {/* CALCULATOR */}

            <div className="flex-1 min-h-0 p-3 sm:p-4 bg-[#f9fafb]">

              <div className="w-full h-full bg-white rounded-xl border border-[#e5e7eb] overflow-hidden shadow-sm">

                <iframe
                  src="https://www.desmos.com/calculator"
                  title="Graphing Calculator"
                  className="w-full h-full border-0"
                />

              </div>

            </div>

            {/* FOOTER */}

            <div className="shrink-0 px-4 py-2.5 bg-white border-t border-[#e5e7eb] flex items-center justify-between gap-4">

              <p className="text-xs text-[#6b7280] hidden sm:block">
                Use the calculator to solve mathematical expressions and graphs.
              </p>

              <button
                type="button"
                onClick={() =>
                  setShowCalculator(
                    false
                  )
                }
                className="ml-auto px-5 py-2 rounded-lg bg-[#e31b23] text-white text-sm font-semibold hover:bg-[#b91c1c] hover:-translate-y-[1px] hover:shadow-md transition-all duration-200"
              >
                Close
              </button>

            </div>

          </div>

        </div>
      )}

      {/* =====================================================
          SUBMIT CONFIRMATION
      ===================================================== */}

      {showSubmitConfirm && (
        <div className="fixed inset-0 z-[70] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">

          <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl overflow-hidden border border-[#e5e7eb]">

            {/* TOP ACCENT */}

            <div className="h-1.5 bg-[#e31b23]" />

            <div className="p-7">

              {/* ICON */}

              <div className="mx-auto w-16 h-16 rounded-full bg-[#fef2f2] border border-[#fecaca] flex items-center justify-center mb-5">

                <div className="w-10 h-10 rounded-full bg-[#e31b23] flex items-center justify-center">

                  <span className="text-white text-xl font-bold">
                    !
                  </span>

                </div>

              </div>

              {/* LABEL */}

              <p className="text-center text-xs font-bold tracking-[0.18em] uppercase text-[#e31b23]">
                Submit Test
              </p>

              {/* TITLE */}

              <h2 className="mt-2 text-2xl font-bold text-[#111827] text-center">
                Are you sure?
              </h2>

              {/* MESSAGE */}

              <p className="mt-3 text-[15px] leading-6 text-[#6b7280] text-center">
                Once you submit the test, you will not be able to change your answers.
                Please review your responses before submitting.
              </p>

              {/* TEST SUMMARY */}

              <div className="mt-5 bg-[#fafafa] border border-[#e5e7eb] rounded-xl p-4">

                <div className="flex items-center justify-between">

                  <span className="text-sm text-[#6b7280]">
                    Answered
                  </span>

                  <span className="font-bold text-[#111827]">
                    {counters.answered}
                  </span>

                </div>

                <div className="flex items-center justify-between mt-2">

                  <span className="text-sm text-[#6b7280]">
                    Not Answered
                  </span>

                  <span className="font-bold text-[#dc2626]">
                    {counters.notAnswered}
                  </span>

                </div>

                <div className="flex items-center justify-between mt-2">

                  <span className="text-sm text-[#6b7280]">
                    Marked for Review
                  </span>

                  <span className="font-bold text-[#7c3aed]">
                    {counters.marked}
                  </span>

                </div>

                <div className="flex items-center justify-between mt-2">

                  <span className="text-sm text-[#6b7280]">
                    Review &amp; Attempted
                  </span>

                  <span className="font-bold text-[#ea580c]">
                    {
                      counters.reviewAttempted
                    }
                  </span>

                </div>

              </div>

              {/* BUTTONS */}

              <div className="flex gap-3 mt-6">

                {/* CANCEL */}

                <button
                  type="button"
                  onClick={() =>
                    setShowSubmitConfirm(
                      false
                    )
                  }
                  className="flex-1 px-5 py-2.5 rounded-lg border border-[#d1d5db] bg-white text-[#374151] font-semibold hover:bg-[#fef2f2] hover:text-[#e31b23] hover:border-[#e31b23] transition-all duration-200"
                >
                  Go Back
                </button>

                {/* CONFIRM SUBMIT */}

                <button
                  type="button"
                  onClick={confirmSubmitTest}
                  className="flex-1 px-5 py-2.5 rounded-lg bg-[#e31b23] text-white font-bold hover:bg-[#b91c1c] hover:-translate-y-[1px] hover:shadow-md transition-all duration-200"
                >
                  Submit Test
                </button>

              </div>

            </div>

          </div>

        </div>
      )}

    </div>
  );
}

// =====================================================
// REPORT SUBMIT FUNCTION
// =====================================================

export default App;