import { useEffect, useState } from "react";
import QuestionPreview from "../Preview/QuestionPreview";
import EditQuestion from "../Edit/EditQuestion";
import { useNavigate } from "react-router-dom";
import TeacherLayout from "../../components/TeacherLayout";

function AllQuestions() {
    const navigate = useNavigate();

    const [questions, setQuestions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [message, setMessage] = useState("");
    const [previewQuestionId, setPreviewQuestionId] = useState(null);
    const [editQuestionId, setEditQuestionId] = useState(null);
    const [deleteQuestionId, setDeleteQuestionId] = useState(null);
    const [deleting, setDeleting] = useState(false);

    // =====================================================
    // FETCH QUESTIONS
    // =====================================================

    const fetchQuestions = async () => {
        try {
            setLoading(true);
            setMessage("");

            const response = await fetch(
                "http://localhost:5000/api/questions"
            );

            const data = await response.json();

            if (!response.ok) {
                throw new Error(
                    data.message || "Failed to fetch questions"
                );
            }

            setQuestions(data.questions || []);
        } catch (error) {
            setMessage(error.message);
        } finally {
            setLoading(false);
        }
    };

    // =====================================================
    // DELETE QUESTION
    // =====================================================

    const handleDelete = async () => {
        if (!deleteQuestionId) {
            return;
        }

        try {
            setDeleting(true);
            setMessage("");

            const response = await fetch(
                `http://localhost:5000/api/questions/${deleteQuestionId}`,
                {
                    method: "DELETE",
                }
            );

            const data = await response.json();

            if (!response.ok) {
                throw new Error(
                    data.message || "Failed to delete question"
                );
            }

            setDeleteQuestionId(null);
            setMessage("Question deleted successfully.");

            await fetchQuestions();
        } catch (error) {
            setMessage(error.message);
        } finally {
            setDeleting(false);
        }
    };

    // =====================================================
    // INITIAL LOAD
    // =====================================================

    useEffect(() => {
        fetchQuestions();
    }, []);

    // =====================================================
    // QUESTION PREVIEW
    // =====================================================

    if (previewQuestionId) {
        return (
            <TeacherLayout>
                <div className="min-h-screen bg-[#f4f5f4]">

                    <div className="px-5 lg:px-8 pt-5">

                        <button
                            type="button"
                            onClick={() => setPreviewQuestionId(null)}
                            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg border border-[#cbd7d1] bg-white text-[#0b5968] text-sm font-semibold hover:bg-[#eef5f1] transition"
                        >
                            ← Back to Questions
                        </button>

                    </div>

                    <QuestionPreview
                        questionId={previewQuestionId}
                    />

                </div>
            </TeacherLayout>
        );
    }

    // =====================================================
    // EDIT QUESTION
    // =====================================================

    if (editQuestionId) {
        return (
            <TeacherLayout>
                <EditQuestion
                    questionId={editQuestionId}
                    onBack={() => setEditQuestionId(null)}
                />
            </TeacherLayout>
        );
    }

    // =====================================================
    // MAIN PAGE
    // =====================================================

    return (
        <TeacherLayout>

            <div className="min-h-screen bg-[#f4f5f4] text-[#102a25]">

                <main className="p-5 lg:p-8">

                    <div className="max-w-7xl mx-auto">

                        {/* =================================================
                            PAGE HEADER
                        ================================================= */}

                        <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-5 mb-7">

                            <div>

                                <div className="flex items-center gap-2 mb-2">

                                    <span className="text-xs font-bold uppercase tracking-[0.16em] text-[#f0a900]">
                                        Teacher Portal
                                    </span>

                                    <span className="text-[#a0aaa5]">
                                        /
                                    </span>

                                    <span className="text-xs font-medium text-[#718079]">
                                        Question Bank
                                    </span>

                                </div>

                                <h1 className="text-2xl lg:text-[28px] font-bold text-[#0b211a]">
                                    Question Bank
                                </h1>

                                <p className="text-sm text-[#64756e] mt-1">
                                    Create, manage and organize your questions.
                                </p>

                            </div>


                            <div className="flex items-center gap-3">

                                <button
                                    type="button"
                                    onClick={fetchQuestions}
                                    disabled={loading}
                                    className="px-4 py-2.5 rounded-lg border border-[#cbd7d1] bg-white text-[#0b5968] text-sm font-semibold hover:bg-[#eef5f1] disabled:opacity-50 transition"
                                >
                                    ↻ Refresh
                                </button>

                                <button
                                    type="button"
                                    onClick={() => navigate("/questions/add")}
                                    className="px-5 py-2.5 rounded-lg bg-[#0b211a] text-[#f4efe3] border border-[#29463b] text-sm font-semibold hover:bg-[#12382b] hover:-translate-y-[1px] hover:shadow-md transition-all"
                                >
                                    + Add Question
                                </button>

                            </div>

                        </div>


                        {/* =================================================
                            SUMMARY CARDS
                        ================================================= */}

                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">

                            {/* TOTAL */}

                            <div className="bg-white border border-[#dce3df] rounded-xl p-5 shadow-sm">

                                <div className="flex items-center justify-between">

                                    <div>

                                        <p className="text-xs uppercase tracking-[0.12em] font-bold text-[#82908a]">
                                            Total Questions
                                        </p>

                                        <p className="text-3xl font-bold text-[#0b211a] mt-2">
                                            {loading ? "..." : questions.length}
                                        </p>

                                    </div>

                                    <div className="w-11 h-11 rounded-xl bg-[#eef5f1] text-[#0b5968] flex items-center justify-center text-xl font-bold">
                                        ?
                                    </div>

                                </div>

                                <p className="text-xs text-[#8a9691] mt-3">
                                    Questions in your bank
                                </p>

                            </div>


                            {/* SUBJECTS */}

                            <div className="bg-white border border-[#dce3df] rounded-xl p-5 shadow-sm">

                                <div className="flex items-center justify-between">

                                    <div>

                                        <p className="text-xs uppercase tracking-[0.12em] font-bold text-[#82908a]">
                                            Subjects
                                        </p>

                                        <p className="text-3xl font-bold text-[#0b211a] mt-2">
                                            {loading
                                                ? "..."
                                                : new Set(
                                                    questions
                                                        .map(
                                                            (question) =>
                                                                question.subject
                                                        )
                                                        .filter(Boolean)
                                                ).size}
                                        </p>

                                    </div>

                                    <div className="w-11 h-11 rounded-xl bg-[#f1e9ff] text-[#6d28d9] flex items-center justify-center text-xl font-bold">
                                        #
                                    </div>

                                </div>

                                <p className="text-xs text-[#8a9691] mt-3">
                                    Different subjects
                                </p>

                            </div>


                            {/* STATUS */}

                            <div className="bg-white border border-[#dce3df] rounded-xl p-5 shadow-sm">

                                <div className="flex items-center justify-between">

                                    <div>

                                        <p className="text-xs uppercase tracking-[0.12em] font-bold text-[#82908a]">
                                            Question Bank
                                        </p>

                                        <p className="text-lg font-bold text-[#18734b] mt-2">
                                            Active
                                        </p>

                                    </div>

                                    <div className="w-11 h-11 rounded-xl bg-[#e8f4ed] text-[#18734b] flex items-center justify-center text-xl font-bold">
                                        ✓
                                    </div>

                                </div>

                                <p className="text-xs text-[#8a9691] mt-3">
                                    Ready to use in exams
                                </p>

                            </div>

                        </div>


                        {/* =================================================
                            MESSAGE
                        ================================================= */}

                        {!loading && message && (

                            <div className="mb-5 bg-white border border-[#efcaca] rounded-xl px-4 py-3 flex items-center gap-3 shadow-sm">

                                <div className="w-8 h-8 shrink-0 rounded-lg bg-[#fff0f0] text-[#b42318] flex items-center justify-center font-bold">
                                    !
                                </div>

                                <p className="text-sm font-medium text-[#b42318]">
                                    {message}
                                </p>

                            </div>

                        )}


                        {/* =================================================
                            LOADING
                        ================================================= */}

                        {loading && (

                            <div className="bg-white border border-[#dce3df] rounded-2xl p-12 text-center shadow-sm">

                                <div className="mx-auto w-10 h-10 rounded-full border-2 border-[#d9e3de] border-t-[#0b5968] animate-spin" />

                                <p className="text-sm text-[#718079] mt-4">
                                    Loading questions...
                                </p>

                            </div>

                        )}


                        {/* =================================================
                            EMPTY
                        ================================================= */}

                        {!loading &&
                            !message &&
                            questions.length === 0 && (

                                <div className="bg-white border border-[#dce3df] rounded-2xl p-12 text-center shadow-sm">

                                    <div className="mx-auto w-14 h-14 rounded-xl bg-[#eef5f1] text-[#0b5968] flex items-center justify-center text-2xl font-bold mb-4">
                                        ?
                                    </div>

                                    <h2 className="text-lg font-bold text-[#0b211a]">
                                        No questions found
                                    </h2>

                                    <p className="text-sm text-[#7b8983] mt-1">
                                        Create your first question to build your question bank.
                                    </p>

                                    <button
                                        type="button"
                                        onClick={() => navigate("/questions/add")}
                                        className="mt-5 px-5 py-2.5 rounded-lg bg-[#0b211a] text-[#f4efe3] text-sm font-semibold hover:bg-[#12382b] transition"
                                    >
                                        + Create Question
                                    </button>

                                </div>

                            )}


                        {/* =================================================
                            QUESTIONS
                        ================================================= */}

                        {!loading &&
                            !message &&
                            questions.length > 0 && (

                                <div className="space-y-4">

                                    {questions.map((question, index) => (

                                        <div
                                            key={question._id}
                                            className="bg-white border border-[#dce3df] rounded-2xl overflow-hidden shadow-sm hover:border-[#b9c9c1] hover:shadow-md transition-all"
                                        >

                                            {/* QUESTION HEADER */}

                                            <div className="px-5 lg:px-6 py-4 border-b border-[#e7ece9] bg-[#fbfcfb]">

                                                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">

                                                    <div className="flex items-center gap-3">

                                                        <div className="w-9 h-9 rounded-lg bg-[#0b211a] text-[#f5b91e] flex items-center justify-center text-sm font-bold">
                                                            {index + 1}
                                                        </div>

                                                        <div>

                                                            <p className="text-[10px] uppercase tracking-[0.16em] font-bold text-[#82908a]">
                                                                Question
                                                            </p>

                                                            <p className="text-sm font-semibold text-[#0b211a]">
                                                                Question {index + 1}
                                                            </p>

                                                        </div>

                                                    </div>


                                                    {question.subject && (

                                                        <span className="self-start sm:self-auto px-3 py-1.5 rounded-full bg-[#f1e9ff] text-[#6d28d9] text-xs font-semibold">
                                                            {question.subject}
                                                        </span>

                                                    )}

                                                </div>

                                            </div>


                                            {/* QUESTION BODY */}

                                            <div className="p-5 lg:p-6">

                                                <h2 className="text-[16px] lg:text-[17px] font-semibold leading-7 text-[#102a25]">
                                                    {question.questionText ||
                                                        "Image-based question"}
                                                </h2>


                                                {/* IMAGE */}

                                                {question.questionImage && (

                                                    <div className="mt-5">

                                                        <img
                                                            src={question.questionImage}
                                                            alt="Question"
                                                            className="max-w-md max-h-64 object-contain rounded-xl border border-[#dce3df] bg-[#fafbfa]"
                                                        />

                                                    </div>

                                                )}


                                                {/* OPTIONS */}

                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-5">

                                                    {question.options?.map(
                                                        (option, optionIndex) => {

                                                            const isCorrect =
                                                                optionIndex ===
                                                                question.correctAnswer;

                                                            return (

                                                                <div
                                                                    key={optionIndex}
                                                                    className={`flex items-start gap-3 rounded-xl border px-4 py-3 ${isCorrect
                                                                            ? "border-[#a8cfba] bg-[#f0f8f3]"
                                                                            : "border-[#e0e5e2] bg-[#fafbfa]"
                                                                        }`}
                                                                >

                                                                    <span
                                                                        className={`w-8 h-8 shrink-0 rounded-full flex items-center justify-center text-xs font-bold ${isCorrect
                                                                                ? "bg-[#18734b] text-white"
                                                                                : "bg-white border border-[#d1d9d5] text-[#53645d]"
                                                                            }`}
                                                                    >
                                                                        {String.fromCharCode(
                                                                            65 +
                                                                            optionIndex
                                                                        )}
                                                                    </span>


                                                                    <span
                                                                        className={`text-sm leading-6 ${isCorrect
                                                                                ? "text-[#176440] font-medium"
                                                                                : "text-[#344840]"
                                                                            }`}
                                                                    >
                                                                        {option}
                                                                    </span>


                                                                    {isCorrect && (

                                                                        <span className="ml-auto shrink-0 text-[10px] uppercase tracking-wide font-bold text-[#18734b]">
                                                                            Correct
                                                                        </span>

                                                                    )}

                                                                </div>

                                                            );
                                                        }
                                                    )}

                                                </div>


                                                {/* INFO */}

                                                <div className="flex flex-wrap gap-3 mt-5">

                                                    <span className="px-3 py-1.5 rounded-lg bg-[#f5f7f6] border border-[#e4e9e6] text-[#53645d] text-xs">
                                                        <strong className="text-[#102a25]">
                                                            Marks:
                                                        </strong>{" "}
                                                        {question.marks ?? 0}
                                                    </span>

                                                    <span className="px-3 py-1.5 rounded-lg bg-[#f5f7f6] border border-[#e4e9e6] text-[#53645d] text-xs">
                                                        <strong className="text-[#102a25]">
                                                            Negative:
                                                        </strong>{" "}
                                                        {question.negativeMarks ?? 0}
                                                    </span>

                                                    <span className="px-3 py-1.5 rounded-lg bg-[#f5f7f6] border border-[#e4e9e6] text-[#53645d] text-xs">
                                                        <strong className="text-[#102a25]">
                                                            Options:
                                                        </strong>{" "}
                                                        {question.options?.length ||
                                                            0}
                                                    </span>

                                                </div>

                                            </div>


                                            {/* ACTION BAR */}

                                            <div className="px-5 lg:px-6 py-4 border-t border-[#e7ece9] bg-[#fbfcfb] flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">

                                                <p className="text-xs text-[#8a9691]">
                                                    Manage this question
                                                </p>

                                                <div className="flex flex-wrap gap-2">

                                                    <button
                                                        type="button"
                                                        onClick={() =>
                                                            navigate(
                                                                `/questions/${question._id}/preview`
                                                            )
                                                        }
                                                        className="px-4 py-2 rounded-lg border border-[#cbd7d1] bg-white text-[#0b5968] text-sm font-semibold hover:bg-[#eef5f1] transition"
                                                    >
                                                        Preview
                                                    </button>


                                                    <button
                                                        type="button"
                                                        onClick={() =>
                                                            navigate(
                                                                `/questions/${question._id}/edit`
                                                            )
                                                        }
                                                        className="px-4 py-2 rounded-lg border border-[#cbd7d1] bg-white text-[#344840] text-sm font-semibold hover:bg-[#f1f4f2] transition"
                                                    >
                                                        Edit
                                                    </button>


                                                    <button
                                                        type="button"
                                                        onClick={() =>
                                                            setDeleteQuestionId(
                                                                question._id
                                                            )
                                                        }
                                                        className="px-4 py-2 rounded-lg border border-[#edc5c5] bg-[#fff7f7] text-[#b42318] text-sm font-semibold hover:bg-[#fff0f0] transition"
                                                    >
                                                        Delete
                                                    </button>

                                                </div>

                                            </div>

                                        </div>

                                    ))}

                                </div>

                            )}

                    </div>

                </main>


                {/* =====================================================
                    DELETE CONFIRMATION MODAL
                ====================================================== */}

                {deleteQuestionId && (

                    <div className="fixed inset-0 z-[60] bg-[#071a14]/75 backdrop-blur-sm flex items-center justify-center p-4">

                        <div className="w-full max-w-md bg-[#f8f7f2] rounded-2xl shadow-2xl border border-[#29463b] overflow-hidden">

                            {/* TOP ACCENT */}

                            <div className="h-1.5 bg-[#f5b91e]" />


                            <div className="p-6">

                                {/* ICON */}

                                <div className="w-12 h-12 rounded-full bg-[#fff0f0] border border-[#f0c1c1] text-[#b42318] flex items-center justify-center text-xl font-bold mb-4">
                                    !
                                </div>


                                {/* LABEL */}

                                <p className="text-xs font-bold uppercase tracking-[0.16em] text-[#b42318]">
                                    Confirmation
                                </p>


                                {/* TITLE */}

                                <h2 className="text-xl font-bold text-[#0b211a] mt-1">
                                    Delete Question?
                                </h2>


                                {/* MESSAGE */}

                                <p className="text-sm leading-6 text-[#687972] mt-2">
                                    Are you sure you want to delete this
                                    question? This action cannot be undone.
                                </p>


                                {/* BUTTONS */}

                                <div className="flex justify-end gap-3 mt-6">

                                    <button
                                        type="button"
                                        onClick={() =>
                                            setDeleteQuestionId(null)
                                        }
                                        disabled={deleting}
                                        className="px-5 py-2.5 rounded-lg border border-[#b8c8c1] bg-white text-[#0b5968] text-sm font-semibold hover:bg-[#f1f5f3] disabled:opacity-50 transition"
                                    >
                                        Cancel
                                    </button>


                                    <button
                                        type="button"
                                        onClick={handleDelete}
                                        disabled={deleting}
                                        className="px-5 py-2.5 rounded-lg bg-[#b42318] text-white text-sm font-semibold hover:bg-[#941b12] disabled:opacity-50 transition"
                                    >
                                        {deleting
                                            ? "Deleting..."
                                            : "Delete Question"}
                                    </button>

                                </div>

                            </div>

                        </div>

                    </div>

                )}

            </div>

        </TeacherLayout>
    );
}

export default AllQuestions;