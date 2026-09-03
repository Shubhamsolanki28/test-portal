import { useState } from "react";
import { useNavigate } from "react-router-dom";

function AddQuestion() {
    const navigate = useNavigate();

    const [questionText, setQuestionText] = useState("");
    const [options, setOptions] = useState(["", ""]);
    const [correctAnswer, setCorrectAnswer] = useState(0);
    const [marks, setMarks] = useState(4);
    const [negativeMarks, setNegativeMarks] = useState(1);
    const [questionImage, setQuestionImage] = useState(null);

    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState("");
    const [messageType, setMessageType] = useState("");
    const [difficulty, setDifficulty] = useState("Medium");

    // =====================================================
    // OPTION HANDLERS
    // =====================================================

    const handleOptionChange = (index, value) => {
        const updatedOptions = [...options];
        updatedOptions[index] = value;
        setOptions(updatedOptions);
    };

    const addOption = () => {
        if (options.length < 5) {
            setOptions([...options, ""]);
        }
    };

    const removeOption = (index) => {
        if (options.length <= 2) {
            return;
        }

        const updatedOptions = options.filter(
            (_, optionIndex) => optionIndex !== index
        );

        setOptions(updatedOptions);

        if (correctAnswer >= updatedOptions.length) {
            setCorrectAnswer(updatedOptions.length - 1);
        }
    };

    // =====================================================
    // IMAGE
    // =====================================================

    const handleImageChange = (e) => {
        const file = e.target.files?.[0];

        if (!file) {
            return;
        }

        setQuestionImage(file);
    };

    const removeImage = () => {
        setQuestionImage(null);

        const fileInput =
            document.getElementById("question-image");

        if (fileInput) {
            fileInput.value = "";
        }
    };

    // =====================================================
    // SUBMIT
    // =====================================================

    const handleSubmit = async (e) => {
       
            setDifficulty("Medium");
        e.preventDefault();

        setMessage("");
        setMessageType("");

        if (!questionText.trim()) {
            setMessage("Please enter the question.");
            setMessageType("error");
            return;
        }

        if (options.some((option) => !option.trim())) {
            setMessage("Please fill all options.");
            setMessageType("error");
            return;
        }

        try {
            setLoading(true);

            const response = await fetch(
                "http://localhost:5000/api/questions",
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        questionText,
                        options,
                        correctAnswer,
                        marks: Number(marks),
                        negativeMarks: Number(negativeMarks),
                        difficulty,
                    }),
                }
            );

            const data = await response.json();

            if (!response.ok) {
                throw new Error(
                    data.message || "Failed to create question"
                );
            }

            setMessage(
                "Question created successfully."
            );
            setMessageType("success");

            // =================================================
            // NOTIFICATION
            // =================================================

            const existingNotifications =
                JSON.parse(
                    localStorage.getItem(
                        "teacherNotifications"
                    )
                ) || [];

            const newNotification = {
                id: Date.now(),
                type: "question",
                title: "Question added successfully",
                description:
                    "A new question has been added to your question bank.",
                time: "Just now",
                createdAt: new Date().toISOString(),
            };

            localStorage.setItem(
                "teacherNotifications",
                JSON.stringify([
                    newNotification,
                    ...existingNotifications,
                ])
            );

            // =================================================
            // RESET
            // =================================================

            setQuestionText("");
            setOptions(["", ""]);
            setCorrectAnswer(0);
            setMarks(4);
            setNegativeMarks(1);
            setQuestionImage(null);

            e.target.reset();
        } catch (error) {
            setMessage(
                error.message || "Something went wrong."
            );
            setMessageType("error");
        } finally {
            setLoading(false);
        }
    };

    // =====================================================
    // UI
    // =====================================================

    return (
        <div className="min-h-screen bg-[#f4f5f3] p-5 lg:p-8">

            <div className="max-w-5xl mx-auto">

                {/* =================================================
                    HEADER
                ================================================= */}

                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-5 mb-7">

                    <div className="flex items-center gap-4">

                        <button
                            type="button"
                            onClick={() => navigate("/questions")}
                            className="w-10 h-10 rounded-xl bg-white border border-[#cbd7d1] text-[#0b211a] flex items-center justify-center text-lg hover:bg-[#0b211a] hover:text-white transition"
                            title="Back to Question Bank"
                        >
                            ←
                        </button>

                        <div>
                            <div className="flex items-center gap-2">

                                <p className="text-[10px] sm:text-xs font-bold tracking-[0.18em] uppercase text-[#e19f00]">
                                    TEACHER PORTAL
                                </p>

                                <span className="text-[#9aa7a1]">
                                    /
                                </span>

                                <p className="text-xs text-[#65756d]">
                                    Question Bank
                                </p>

                            </div>

                            <h1 className="text-2xl lg:text-3xl font-bold text-[#102a25] mt-1">
                                Add Question
                            </h1>

                            <p className="text-sm text-[#718079] mt-1">
                                Create a new question for your question bank.
                            </p>
                        </div>

                    </div>

                </div>


                {/* =================================================
                    FORM
                ================================================= */}

                <form onSubmit={handleSubmit}>
                    {/* Difficulty */}

                    <div className="mb-6">
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                            Difficulty Level
                        </label>

                        <select
                            value={difficulty}
                            onChange={(e) => setDifficulty(e.target.value)}
                            className="w-full border border-gray-300 rounded-lg px-4 py-2.5 outline-none focus:ring-2 focus:ring-blue-500"
                        >
                            <option value="Easy">Easy</option>
                            <option value="Medium">Medium</option>
                            <option value="Hard">Hard</option>
                        </select>
                    </div>
                    {/* =================================================
                        QUESTION CARD
                    ================================================= */}

                    <div className="bg-white border border-[#d5ded9] rounded-2xl shadow-sm overflow-hidden">

                        {/* CARD HEADER */}

                        <div className="px-6 lg:px-7 py-5 border-b border-[#dce3df] bg-[#fafbf9]">

                            <div className="flex items-center gap-3">

                                <div className="w-10 h-10 rounded-xl bg-[#e8f2ee] text-[#0b5968] flex items-center justify-center font-bold">
                                    01
                                </div>

                                <div>
                                    <h2 className="text-base font-bold text-[#102a25]">
                                        Question Details
                                    </h2>

                                    <p className="text-xs text-[#7a8982] mt-0.5">
                                        Enter the question that students will see.
                                    </p>
                                </div>

                            </div>

                        </div>


                        {/* CARD BODY */}

                        <div className="p-6 lg:p-7">

                            {/* QUESTION */}

                            <div>

                                <div className="flex items-center justify-between mb-2">

                                    <label className="text-sm font-bold text-[#102a25]">
                                        Question
                                    </label>

                                    <span className="text-xs text-[#87948e]">
                                        Required
                                    </span>

                                </div>

                                <textarea
                                    value={questionText}
                                    onChange={(e) =>
                                        setQuestionText(
                                            e.target.value
                                        )
                                    }
                                    placeholder="Enter your question here..."
                                    rows={5}
                                    required
                                    className="w-full border border-[#cbd7d1] bg-[#fbfcfb] rounded-xl px-4 py-3.5 text-sm text-[#102a25] placeholder:text-[#9aa6a1] outline-none resize-none focus:bg-white focus:border-[#0b5968] focus:ring-2 focus:ring-[#0b5968]/10 transition"
                                />

                            </div>


                            {/* =================================================
                                IMAGE
                            ================================================= */}

                            <div className="mt-7">

                                <div className="flex items-center justify-between mb-2">

                                    <label className="text-sm font-bold text-[#102a25]">
                                        Question Image
                                        <span className="font-normal text-[#89958f] ml-1">
                                            (Optional)
                                        </span>
                                    </label>

                                </div>

                                {!questionImage ? (
                                    <label
                                        htmlFor="question-image"
                                        className="group block cursor-pointer"
                                    >

                                        <div className="border-2 border-dashed border-[#cbd7d1] rounded-xl bg-[#fafcfb] px-5 py-7 text-center hover:border-[#f5b91e] hover:bg-[#fffaf0] transition">

                                            <div className="w-11 h-11 mx-auto rounded-xl bg-[#e9f2ee] flex items-center justify-center text-[#0b5968] text-lg">
                                                ↑
                                            </div>

                                            <p className="mt-3 text-sm font-semibold text-[#29463b]">
                                                Upload question image
                                            </p>

                                            <p className="mt-1 text-xs text-[#89958f]">
                                                PNG, JPG or JPEG
                                            </p>

                                        </div>

                                        <input
                                            id="question-image"
                                            type="file"
                                            accept="image/*"
                                            onChange={handleImageChange}
                                            className="hidden"
                                        />

                                    </label>
                                ) : (
                                    <div className="relative w-fit">

                                        <img
                                            src={URL.createObjectURL(
                                                questionImage
                                            )}
                                            alt="Question preview"
                                            className="max-w-lg max-h-64 object-contain rounded-xl border border-[#d5ded9] bg-[#fafbf9] p-2"
                                        />

                                        <button
                                            type="button"
                                            onClick={removeImage}
                                            className="absolute -top-3 -right-3 w-9 h-9 rounded-full bg-red-600 text-white flex items-center justify-center text-lg font-bold shadow-md hover:bg-red-700 transition"
                                            title="Remove image"
                                        >
                                            ×
                                        </button>

                                    </div>
                                )}

                            </div>

                        </div>

                    </div>


                    {/* =================================================
                        OPTIONS CARD
                    ================================================= */}

                    <div className="mt-5 bg-white border border-[#d5ded9] rounded-2xl shadow-sm overflow-hidden">

                        {/* HEADER */}

                        <div className="px-6 lg:px-7 py-5 border-b border-[#dce3df] bg-[#fafbf9] flex items-center justify-between gap-4">

                            <div className="flex items-center gap-3">

                                <div className="w-10 h-10 rounded-xl bg-[#fff4cf] text-[#946900] flex items-center justify-center font-bold">
                                    02
                                </div>

                                <div>
                                    <h2 className="text-base font-bold text-[#102a25]">
                                        Answer Options
                                    </h2>

                                    <p className="text-xs text-[#7a8982] mt-0.5">
                                        Select the correct answer.
                                    </p>
                                </div>

                            </div>

                            {options.length < 5 && (
                                <button
                                    type="button"
                                    onClick={addOption}
                                    className="px-3.5 py-2 rounded-lg bg-[#0b211a] text-white text-xs sm:text-sm font-semibold hover:bg-[#12352a] transition"
                                >
                                    + Add Option
                                </button>
                            )}

                        </div>


                        {/* OPTIONS */}

                        <div className="p-6 lg:p-7">

                            <div className="space-y-3">

                                {options.map((option, index) => {

                                    const isCorrect =
                                        correctAnswer === index;

                                    const letter =
                                        String.fromCharCode(
                                            65 + index
                                        );

                                    return (
                                        <div
                                            key={index}
                                            className={`flex items-center gap-3 p-3 rounded-xl border transition ${isCorrect
                                                ? "border-[#9dc7ae] bg-[#eef8f1]"
                                                : "border-[#d7e0db] bg-white hover:border-[#b7c8c0]"
                                                }`}
                                        >

                                            {/* RADIO */}

                                            <label className="shrink-0 cursor-pointer">

                                                <input
                                                    type="radio"
                                                    name="correctAnswer"
                                                    checked={
                                                        isCorrect
                                                    }
                                                    onChange={() =>
                                                        setCorrectAnswer(
                                                            index
                                                        )
                                                    }
                                                    className="sr-only"
                                                />

                                                <div
                                                    className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold border transition ${isCorrect
                                                        ? "bg-[#0b211a] text-[#f5b91e] border-[#0b211a]"
                                                        : "bg-[#edf2ef] text-[#29463b] border-[#d0dbd5] hover:border-[#f5b91e]"
                                                        }`}
                                                >
                                                    {letter}
                                                </div>

                                            </label>


                                            {/* INPUT */}

                                            <input
                                                type="text"
                                                value={option}
                                                onChange={(e) =>
                                                    handleOptionChange(
                                                        index,
                                                        e.target.value
                                                    )
                                                }
                                                placeholder={`Option ${letter}`}
                                                className={`flex-1 min-w-0 bg-transparent outline-none text-sm text-[#102a25] placeholder:text-[#9aa6a1] ${isCorrect
                                                    ? "font-semibold"
                                                    : ""
                                                    }`}
                                            />


                                            {/* CORRECT */}

                                            {isCorrect && (
                                                <span className="hidden sm:block px-2.5 py-1 rounded-full bg-[#d8f0df] text-[#237044] text-[10px] font-bold uppercase tracking-wide">
                                                    Correct
                                                </span>
                                            )}


                                            {/* REMOVE */}

                                            {options.length > 2 && (
                                                <button
                                                    type="button"
                                                    onClick={() =>
                                                        removeOption(
                                                            index
                                                        )
                                                    }
                                                    className="w-8 h-8 shrink-0 rounded-lg bg-red-50 text-red-600 border border-red-100 hover:bg-red-100 transition"
                                                    title="Remove option"
                                                >
                                                    ×
                                                </button>
                                            )}

                                        </div>
                                    );
                                })}

                            </div>

                            <div className="mt-4 flex items-start gap-2 text-xs text-[#7b8983]">

                                <span className="text-[#e19f00] font-bold">
                                    ●
                                </span>

                                <p>
                                    Select the option marked as correct.
                                    You can add between 2 and 5 options.
                                </p>

                            </div>

                        </div>

                    </div>


                    {/* =================================================
                        MARKS CARD
                    ================================================= */}

                    <div className="mt-5 bg-white border border-[#d5ded9] rounded-2xl shadow-sm overflow-hidden">

                        <div className="px-6 lg:px-7 py-5 border-b border-[#dce3df] bg-[#fafbf9]">

                            <div className="flex items-center gap-3">

                                <div className="w-10 h-10 rounded-xl bg-[#eee8ff] text-[#6842b5] flex items-center justify-center font-bold">
                                    03
                                </div>

                                <div>
                                    <h2 className="text-base font-bold text-[#102a25]">
                                        Question Scoring
                                    </h2>

                                    <p className="text-xs text-[#7a8982] mt-0.5">
                                        Configure marks for this question.
                                    </p>
                                </div>

                            </div>

                        </div>


                        <div className="p-6 lg:p-7">

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">

                                {/* MARKS */}

                                <div>

                                    <label className="block text-sm font-bold text-[#102a25] mb-2">
                                        Marks
                                    </label>

                                    <div className="relative">

                                        <input
                                            type="number"
                                            value={marks}
                                            min="0"
                                            step="0.25"
                                            onChange={(e) =>
                                                setMarks(
                                                    e.target.value
                                                )
                                            }
                                            className="w-full border border-[#cbd7d1] bg-[#fbfcfb] rounded-xl px-4 py-3 text-sm text-[#102a25] outline-none focus:bg-white focus:border-[#0b5968] focus:ring-2 focus:ring-[#0b5968]/10 transition"
                                        />

                                        <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs text-[#89958f]">
                                            points
                                        </span>

                                    </div>

                                </div>


                                {/* NEGATIVE */}

                                <div>

                                    <label className="block text-sm font-bold text-[#102a25] mb-2">
                                        Negative Marks
                                    </label>

                                    <div className="relative">

                                        <input
                                            type="number"
                                            value={negativeMarks}
                                            min="0"
                                            step="0.25"
                                            onChange={(e) =>
                                                setNegativeMarks(
                                                    e.target.value
                                                )
                                            }
                                            className="w-full border border-[#cbd7d1] bg-[#fbfcfb] rounded-xl px-4 py-3 text-sm text-[#102a25] outline-none focus:bg-white focus:border-[#0b5968] focus:ring-2 focus:ring-[#0b5968]/10 transition"
                                        />

                                        <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs text-[#89958f]">
                                            points
                                        </span>

                                    </div>

                                </div>

                            </div>

                        </div>

                    </div>


                    {/* =================================================
                        MESSAGE
                    ================================================= */}

                    {message && (
                        <div
                            className={`mt-5 px-4 py-3.5 rounded-xl border text-sm font-medium ${messageType === "success"
                                ? "bg-[#eaf6ef] border-[#b8d9c5] text-[#237044]"
                                : "bg-[#fff2f0] border-[#efc8bf] text-[#bd5444]"
                                }`}
                        >
                            <div className="flex items-center gap-2">

                                <span className="font-bold">
                                    {messageType === "success"
                                        ? "✓"
                                        : "!"}
                                </span>

                                <span>
                                    {message}
                                </span>

                            </div>
                        </div>
                    )}


                    {/* =================================================
                        BOTTOM ACTIONS
                    ================================================= */}

                    <div className="mt-6 flex flex-col-reverse sm:flex-row sm:items-center sm:justify-between gap-3">

                        <button
                            type="button"
                            onClick={() => navigate("/questions")}
                            className="px-5 py-3 rounded-xl border border-[#cbd7d1] bg-white text-[#0b5968] text-sm font-semibold hover:bg-[#f1f5f3] transition"
                        >
                            Cancel
                        </button>


                        <button
                            type="submit"
                            disabled={loading}
                            className="px-7 py-3 rounded-xl bg-[#0b211a] text-[#f4efe3] text-sm font-bold border border-[#29463b] hover:bg-[#12352a] transition disabled:bg-[#89958f] disabled:cursor-not-allowed"
                        >
                            {loading
                                ? "Saving Question..."
                                : "Save Question →"}
                        </button>

                    </div>

                </form>

            </div>

        </div>
    );
}

export default AddQuestion;