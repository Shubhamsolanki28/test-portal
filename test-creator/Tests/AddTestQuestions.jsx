import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import TeacherLayout from "../components/TeacherLayout";
import { fetchWithAuth } from "../src/api";

function AddTestQuestions() {
    const { testId } = useParams();
    const navigate = useNavigate();

    const [test, setTest] = useState(null);
    const [questions, setQuestions] = useState([]);
    const [search, setSearch] = useState("");
    const [loading, setLoading] = useState(true);
    const [addingId, setAddingId] = useState(null);
    const [message, setMessage] = useState("");
    const [error, setError] = useState("");

    // ==========================================
    // FETCH TEST + QUESTION BANK
    // ==========================================

    const fetchData = async () => {
        try {
            setLoading(true);
            setError("");

            const [testResponse, questionsResponse] = await Promise.all([
                fetchWithAuth(`/api/tests/${testId}`),
                fetchWithAuth("/api/questions"),
            ]);

            const testData = await testResponse.json();
            const questionsData = await questionsResponse.json();

            if (!testResponse.ok || !testData.success) {
                throw new Error(
                    testData.message || "Failed to fetch test"
                );
            }

            if (!questionsResponse.ok) {
                throw new Error(
                    questionsData.message ||
                    "Failed to fetch questions"
                );
            }

            setTest(testData.test);
            setQuestions(questionsData.questions || []);
        } catch (error) {
            console.error("FETCH TEST QUESTIONS ERROR:", error);
            setError(
                error.message || "Failed to load test questions"
            );
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, [testId]);

    // ==========================================
    // CHECK IF QUESTION ALREADY EXISTS
    // ==========================================

    const isQuestionAdded = (questionId) => {
        return (
            test?.questions?.some(
                (question) =>
                    (question._id || question).toString() ===
                    questionId.toString()
            ) || false
        );
    };

    // ==========================================
    // ADD QUESTION
    // ==========================================

    const handleAddQuestion = async (questionId) => {
        try {
            setAddingId(questionId);
            setMessage("");
            setError("");

            let response = await fetchWithAuth(`/api/tests/${testId}/questions`, {
                method: "POST",
                body: JSON.stringify({ questionId }),
            });

            if (!response.ok) {
                response = await fetchWithAuth(`/api/test-creation/${testId}/questions`, {
                    method: "POST",
                    body: JSON.stringify({ questionId }),
                });
            }

            const data = await response.json();

            if (!response.ok || !data.success) {
                throw new Error(
                    data.message || "Failed to add question"
                );
            }

            setTest(data.test);
            setMessage("Question added successfully.");
        } catch (error) {
            console.error("ADD QUESTION ERROR:", error);
            setError(
                error.message || "Failed to add question"
            );
        } finally {
            setAddingId(null);
        }
    };


    const handleRemoveQuestion = async (questionId) => {
        try {
            setAddingId(questionId);
            setMessage("");
            setError("");

            const response = await fetch(
                `http://localhost:5000/api/test-creation/${testId}/questions`,
                {
                    method: "DELETE",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        questionId,
                    }),
                }
            );

            const data = await response.json();

            if (!response.ok || !data.success) {
                throw new Error(
                    data.message || "Failed to remove question"
                );
            }

            setTest(data.test);
            setMessage("Question removed successfully.");
        } catch (error) {
            console.error("REMOVE QUESTION ERROR:", error);

            setError(
                error.message || "Failed to remove question"
            );
        } finally {
            setAddingId(null);
        }
    };
    // ==========================================
    // SEARCH
    // ==========================================

    const filteredQuestions = questions.filter((question) => {
        const searchText = search.toLowerCase().trim();

        if (!searchText) return true;

        return (
            question.questionText
                ?.toLowerCase()
                .includes(searchText) ||
            question.subject
                ?.toLowerCase()
                .includes(searchText)
        );
    });

    // ==========================================
    // LOADING
    // ==========================================

    if (loading) {
        return (
            <TeacherLayout>
                <div className="p-6">
                    <div className="bg-white border border-gray-200 rounded-xl p-10 text-center">
                        <p className="text-gray-500">
                            Loading questions...
                        </p>
                    </div>
                </div>
            </TeacherLayout>
        );
    }

    // ==========================================
    // MAIN UI
    // ==========================================

    return (
        <TeacherLayout>
            <div className="min-h-full bg-[#f7f8f5] p-6">

                {/* Header */}
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
                            <h1 className="text-2xl font-bold text-gray-900">
                                Add Questions
                            </h1>

                            <p className="text-sm text-gray-500 mt-1">
                                {test?.title || "Test"}
                            </p>
                        </div>

                    </div>

                    {/* Question Count */}
                    <div className="bg-white border border-gray-200 rounded-lg px-5 py-3">
                        <p className="text-xs text-gray-400">
                            Questions Added
                        </p>

                        <p className="text-xl font-bold text-gray-900">
                            {test?.questions?.length || 0}
                        </p>
                    </div>

                </div>

                {/* Messages */}

                {message && (
                    <div className="mb-5 bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg">
                        {message}
                    </div>
                )}

                {error && (
                    <div className="mb-5 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
                        {error}
                    </div>
                )}

                {/* Search */}

                <div className="bg-white border border-gray-200 rounded-xl p-4 mb-5">

                    <input
                        type="text"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder="Search questions by question text or subject..."
                        className="w-full border border-gray-300 rounded-lg px-4 py-3 outline-none focus:border-yellow-400"
                    />

                </div>

                {/* Questions */}

                <div className="space-y-4">

                    {filteredQuestions.length === 0 ? (
                        <div className="bg-white border border-gray-200 rounded-xl p-10 text-center">
                            <p className="text-gray-500">
                                No questions found.
                            </p>
                        </div>
                    ) : (
                        filteredQuestions.map((question, index) => {

                            const alreadyAdded = isQuestionAdded(
                                question._id
                            );

                            return (
                                <div
                                    key={question._id}
                                    className="bg-white border border-gray-200 rounded-xl overflow-hidden"
                                >

                                    {/* Question Header */}

                                    <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between gap-4">

                                        <div className="flex items-center gap-3">

                                            <div className="w-9 h-9 rounded-lg bg-gray-900 text-yellow-400 flex items-center justify-center font-bold">
                                                {index + 1}
                                            </div>

                                            <div>
                                                <p className="text-xs text-gray-400 uppercase tracking-wide">
                                                    Question
                                                </p>

                                                <p className="text-sm font-semibold text-gray-900">
                                                    Question {index + 1}
                                                </p>
                                            </div>

                                        </div>

                                        {question.subject && (
                                            <span className="px-3 py-1 rounded-full bg-gray-100 text-gray-600 text-xs font-semibold">
                                                {question.subject}
                                            </span>
                                        )}

                                    </div>

                                    {/* Question Body */}

                                    <div className="p-5">

                                        <p className="text-base font-semibold leading-7 text-gray-800">
                                            {question.questionText ||
                                                "Image-based question"}
                                        </p>

                                        {/* Image */}

                                        {question.questionImage && (
                                            <div className="mt-4">
                                                <img
                                                    src={question.questionImage}
                                                    alt="Question"
                                                    className="max-w-md max-h-56 object-contain rounded-lg border border-gray-200"
                                                />
                                            </div>
                                        )}

                                        {/* Options */}

                                        {question.options?.length > 0 && (
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-4">

                                                {question.options.map(
                                                    (option, optionIndex) => (
                                                        <div
                                                            key={optionIndex}
                                                            className="border border-gray-200 rounded-lg px-4 py-3 text-sm text-gray-700"
                                                        >
                                                            <span className="font-semibold mr-2">
                                                                {String.fromCharCode(
                                                                    65 + optionIndex
                                                                )}
                                                                .
                                                            </span>

                                                            {option}
                                                        </div>
                                                    )
                                                )}

                                            </div>
                                        )}

                                        {/* Bottom */}

                                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mt-5">

                                            <div className="flex gap-2">

                                                <span className="px-3 py-1.5 rounded-lg bg-gray-50 border border-gray-200 text-xs text-gray-600">
                                                    Marks: {question.marks ?? 0}
                                                </span>

                                                <span className="px-3 py-1.5 rounded-lg bg-gray-50 border border-gray-200 text-xs text-gray-600">
                                                    Negative:{" "}
                                                    {question.negativeMarks ?? 0}
                                                </span>

                                            </div>
                                            <button
                                                type="button"
                                                disabled={addingId === question._id}
                                                onClick={() =>
                                                    alreadyAdded
                                                        ? handleRemoveQuestion(question._id)
                                                        : handleAddQuestion(question._id)
                                                }
                                                className={`px-5 py-2.5 rounded-lg text-sm font-semibold transition ${alreadyAdded
                                                        ? "bg-red-50 text-red-600 border border-red-200 hover:bg-red-100"
                                                        : "bg-yellow-400 hover:bg-yellow-500 text-gray-900"
                                                    }`}
                                            >
                                                {addingId === question._id
                                                    ? "Please wait..."
                                                    : alreadyAdded
                                                        ? "Remove"
                                                        : "+ Add to Test"}
                                            </button>

                                        </div>

                                    </div>
                                </div>
                            );
                        })
                    )}

                </div>
            </div>
        </TeacherLayout>
    );
}

export default AddTestQuestions;