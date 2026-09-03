import { useState } from "react";
import { useNavigate } from "react-router-dom";
import TeacherLayout from "../components/TeacherLayout";

function CreateExam() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    subject: "",
    duration: "",
    marksPerQuestion: "",
    negativeMarks: "",
  });

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setLoading(true);
    setMessage("");

    try {
      const response = await fetch(
        "http://localhost:5000/api/test-creation",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            title: formData.title.trim(),
            description: formData.description.trim(),
            subject: formData.subject.trim(),
            duration: Number(formData.duration),
            marksPerQuestion: Number(formData.marksPerQuestion),
            negativeMarks: Number(formData.negativeMarks),
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to create test");
      }

      setMessage("Test created successfully!");
      // Create notification
      const existingNotifications =
        JSON.parse(localStorage.getItem("teacherNotifications")) || [];

      const newNotification = {
        id: Date.now(),
        type: "success",
        title: "Test created successfully",
        description: `${formData.title} has been created successfully.`,
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

      setFormData({
        title: "",
        description: "",
        subject: "",
        duration: "",
        marksPerQuestion: "",
        negativeMarks: "",
      });

      setSuccessMessage("Test created successfully!");
    } catch (error) {
      setMessage(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <TeacherLayout>
      <div className="min-h-[calc(100vh-64px)] bg-[#f4f5f3] px-5 py-7 lg:px-8 lg:py-8">

        <div className="max-w-7xl mx-auto">

          {/* PAGE HEADER */}
          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-7">

            <div>
              <p className="text-[11px] font-bold tracking-[0.18em] uppercase text-[#d99b00] mb-2">
                Assessment Management
              </p>

              <h1 className="text-[28px] lg:text-[30px] font-bold tracking-tight text-[#0b211a]">
                Create Test
              </h1>

              <p className="mt-1.5 text-[14px] text-[#66756e]">
                Create and configure a new assessment for your students.
              </p>
            </div>

            <button
              type="button"
              onClick={() => navigate("/exams")}
              className="self-start sm:self-auto inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg border border-[#cbd6d1] bg-white text-[#0b5968] text-sm font-semibold hover:bg-[#eef5f2] hover:border-[#0b5968] transition-all duration-200"
            >
              ← My Exams
            </button>

          </div>


          {/* MAIN GRID */}
          <div className="grid grid-cols-1 xl:grid-cols-[minmax(0,1fr)_320px] gap-6">


            {/* FORM CARD */}
            <form
              onSubmit={handleSubmit}
              className="bg-white border border-[#dce3df] rounded-2xl shadow-[0_4px_20px_rgba(11,33,26,0.05)] overflow-hidden"
            >

              {/* CARD HEADER */}
              <div className="px-6 py-5 border-b border-[#e5eae7] bg-[#fbfcfb]">

                <div className="flex items-center gap-3">

                  <div className="w-10 h-10 rounded-xl bg-[#fff4cf] border border-[#f5d36b] flex items-center justify-center">
                    <span className="text-[#0b211a] text-lg font-bold">
                      +
                    </span>
                  </div>

                  <div>
                    <h2 className="text-[17px] font-bold text-[#0b211a]">
                      Exam Information
                    </h2>

                    <p className="text-xs text-[#718079] mt-0.5">
                      Add the basic details of your examination.
                    </p>
                  </div>

                </div>

              </div>


              {/* FORM BODY */}
              <div className="p-6 lg:p-7">

                {/* TITLE */}
                <div className="mb-6">

                  <label className="block text-[13px] font-semibold text-[#18362d] mb-2">
                    Exam Title
                    <span className="text-[#d99b00] ml-1">*</span>
                  </label>

                  <input
                    type="text"
                    name="title"
                    value={formData.title}
                    onChange={handleChange}
                    placeholder="e.g. CUET PG General Awareness Mock Test"
                    required
                    className="w-full h-12 rounded-lg border border-[#ccd7d2] bg-white px-4 text-[14px] text-[#102a25] placeholder:text-[#98a49f] outline-none transition-all duration-200 focus:border-[#0b5968] focus:ring-2 focus:ring-[#0b5968]/10 hover:border-[#aebdb6]"
                  />

                </div>


                {/* SUBJECT */}
                <div className="mb-6">

                  <label className="block text-[13px] font-semibold text-[#18362d] mb-2">
                    Subject
                    <span className="text-[#d99b00] ml-1">*</span>
                  </label>

                  <input
                    type="text"
                    name="subject"
                    value={formData.subject}
                    onChange={handleChange}
                    placeholder="e.g. General Awareness"
                    required
                    className="w-full h-12 rounded-lg border border-[#ccd7d2] bg-white px-4 text-[14px] text-[#102a25] placeholder:text-[#98a49f] outline-none transition-all duration-200 focus:border-[#0b5968] focus:ring-2 focus:ring-[#0b5968]/10 hover:border-[#aebdb6]"
                  />

                </div>


                {/* DESCRIPTION */}
                <div className="mb-7">

                  <label className="block text-[13px] font-semibold text-[#18362d] mb-2">
                    Description
                    <span className="font-normal text-[#8a9691] ml-1">
                      (optional)
                    </span>
                  </label>

                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    placeholder="Enter a short description about this exam..."
                    rows="4"
                    className="w-full min-h-[115px] resize-none rounded-lg border border-[#ccd7d2] bg-white px-4 py-3 text-[14px] leading-6 text-[#102a25] placeholder:text-[#98a49f] outline-none transition-all duration-200 focus:border-[#0b5968] focus:ring-2 focus:ring-[#0b5968]/10 hover:border-[#aebdb6]"
                  />

                </div>


                {/* DIVIDER */}
                <div className="border-t border-[#e5eae7] mb-6" />


                {/* CONFIGURATION HEADER */}
                <div className="mb-5">

                  <h3 className="text-[16px] font-bold text-[#0b211a]">
                    Test Configuration
                  </h3>

                  <p className="text-xs text-[#718079] mt-1">
                    Configure duration and marking scheme.
                  </p>

                </div>


                {/* DURATION / MARKS / NEGATIVE */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-7">

                  {/* DURATION */}
                  <div>

                    <label className="block text-[13px] font-semibold text-[#18362d] mb-2">
                      Duration
                      <span className="text-[#8a9691] font-normal ml-1">
                        (minutes)
                      </span>
                    </label>

                    <div className="relative">

                      <input
                        type="number"
                        name="duration"
                        value={formData.duration}
                        onChange={handleChange}
                        placeholder="120"
                        min="1"
                        required
                        className="w-full h-12 rounded-lg border border-[#ccd7d2] bg-white px-4 pr-16 text-[14px] text-[#102a25] placeholder:text-[#98a49f] outline-none focus:border-[#0b5968] focus:ring-2 focus:ring-[#0b5968]/10 transition-all"
                      />

                      <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-[#8a9691]">
                        min
                      </span>

                    </div>

                  </div>


                  {/* MARKS */}
                  <div>

                    <label className="block text-[13px] font-semibold text-[#18362d] mb-2">
                      Marks / Question
                    </label>

                    <input
                      type="number"
                      name="marksPerQuestion"
                      value={formData.marksPerQuestion}
                      onChange={handleChange}
                      placeholder="4"
                      min="0"
                      required
                      className="w-full h-12 rounded-lg border border-[#ccd7d2] bg-white px-4 text-[14px] text-[#102a25] placeholder:text-[#98a49f] outline-none focus:border-[#0b5968] focus:ring-2 focus:ring-[#0b5968]/10 transition-all"
                    />

                  </div>


                  {/* NEGATIVE */}
                  <div>

                    <label className="block text-[13px] font-semibold text-[#18362d] mb-2">
                      Negative Marks
                    </label>

                    <input
                      type="number"
                      name="negativeMarks"
                      value={formData.negativeMarks}
                      onChange={handleChange}
                      placeholder="1"
                      min="0"
                      step="0.25"
                      required
                      className="w-full h-12 rounded-lg border border-[#ccd7d2] bg-white px-4 text-[14px] text-[#102a25] placeholder:text-[#98a49f] outline-none focus:border-[#0b5968] focus:ring-2 focus:ring-[#0b5968]/10 transition-all"
                    />

                  </div>

                </div>


                {/* MESSAGE */}
                {message && (
                  <div
                    className={`mb-6 rounded-lg px-4 py-3 text-sm border ${message.toLowerCase().includes("success")
                      ? "bg-[#edf8f1] border-[#b8ddc5] text-[#23613a]"
                      : "bg-[#fff4f1] border-[#edc6bd] text-[#a13f2b]"
                      }`}
                  >
                    {message}
                  </div>
                )}


                {/* FORM FOOTER */}
                <div className="flex flex-col-reverse sm:flex-row sm:items-center sm:justify-between gap-3 pt-5 border-t border-[#e5eae7]">

                  <button
                    type="button"
                    onClick={() => navigate("/exams")}
                    className="px-5 py-2.5 rounded-lg border border-[#cbd6d1] bg-white text-[#31544a] text-sm font-semibold hover:bg-[#f4f7f5] hover:border-[#9eafa8] transition-all duration-200"
                  >
                    Cancel
                  </button>


                  <button
                    type="submit"
                    disabled={loading}
                    className="px-6 py-2.5 rounded-lg bg-[#f5b91e] text-[#071a14] text-sm font-bold border border-[#e5aa09] hover:bg-[#ffca32] hover:-translate-y-[1px] hover:shadow-md disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:translate-y-0 transition-all duration-200"
                  >
                    {loading ? "Creating Test..." : "Create Test →"}
                  </button>

                </div>

              </div>

            </form>


            {/* RIGHT OVERVIEW */}
            <aside className="space-y-5">


              {/* OVERVIEW CARD */}
              <div className="bg-[#0b211a] rounded-2xl overflow-hidden border border-[#29463b] shadow-[0_8px_25px_rgba(11,33,26,0.12)]">

                <div className="h-1.5 bg-[#f5b91e]" />

                <div className="p-5">

                  <p className="text-[10px] font-bold tracking-[0.18em] uppercase text-[#f5b91e]">
                    Exam Overview
                  </p>

                  <h3 className="mt-1 text-lg font-bold text-[#f4efe3]">
                    Review your setup
                  </h3>

                  <p className="mt-1.5 text-xs leading-5 text-[#a9bbb4]">
                    Make sure the exam details and marking scheme are correct before creating it.
                  </p>


                  {/* PREVIEW */}
                  <div className="mt-5 rounded-xl bg-[#102b22] border border-[#29463b] p-4">

                    <div className="flex items-center gap-3">

                      <div className="w-10 h-10 rounded-lg bg-[#f5b91e] text-[#071a14] flex items-center justify-center font-bold">
                        +
                      </div>

                      <div className="min-w-0">

                        <p className="text-[10px] uppercase tracking-wider text-[#91aaa0]">
                          Exam
                        </p>

                        <p className="text-sm font-semibold text-[#f4efe3] truncate">
                          {formData.title || "Untitled Exam"}
                        </p>

                      </div>

                    </div>


                    {/* DETAILS */}
                    <div className="mt-5 space-y-3">

                      <div className="flex items-center justify-between gap-3">
                        <span className="text-xs text-[#91aaa0]">
                          Subject
                        </span>

                        <span className="text-xs font-semibold text-[#f4efe3] truncate max-w-[150px]">
                          {formData.subject || "Not specified"}
                        </span>
                      </div>


                      <div className="flex items-center justify-between gap-3">
                        <span className="text-xs text-[#91aaa0]">
                          Duration
                        </span>

                        <span className="text-xs font-semibold text-[#f4efe3]">
                          {formData.duration
                            ? `${formData.duration} min`
                            : "Not specified"}
                        </span>
                      </div>


                      <div className="flex items-center justify-between gap-3">
                        <span className="text-xs text-[#91aaa0]">
                          Marks
                        </span>

                        <span className="text-xs font-semibold text-[#f4efe3]">
                          {formData.marksPerQuestion
                            ? `+${formData.marksPerQuestion}`
                            : "Not specified"}
                        </span>
                      </div>


                      <div className="flex items-center justify-between gap-3">
                        <span className="text-xs text-[#91aaa0]">
                          Negative
                        </span>

                        <span className="text-xs font-semibold text-[#f4efe3]">
                          {formData.negativeMarks
                            ? `-${formData.negativeMarks}`
                            : "Not specified"}
                        </span>
                      </div>

                    </div>

                  </div>


                  {/* STATUS */}
                  <div className="mt-4 flex items-center gap-2 px-3 py-2.5 rounded-lg bg-[#17372b] border border-[#315444]">

                    <span className="w-2 h-2 rounded-full bg-[#f5b91e]" />

                    <span className="text-xs font-medium text-[#dce8e3]">
                      New exam will be created as Draft
                    </span>

                  </div>

                </div>

              </div>


              {/* TIPS */}
              <div className="bg-white border border-[#dce3df] rounded-2xl p-5 shadow-[0_4px_18px_rgba(11,33,26,0.04)]">

                <div className="flex items-center gap-3 mb-4">

                  <div className="w-9 h-9 rounded-lg bg-[#fff4cf] border border-[#f5d36b] flex items-center justify-center">
                    <span className="text-[#9a6b00] font-bold">
                      i
                    </span>
                  </div>

                  <div>
                    <h3 className="text-sm font-bold text-[#0b211a]">
                      Before you create
                    </h3>

                    <p className="text-[11px] text-[#7b8983] mt-0.5">
                      A few things to check
                    </p>
                  </div>

                </div>


                <div className="space-y-3">

                  <div className="flex gap-2.5">
                    <span className="text-[#f0b20b] text-sm">✓</span>
                    <p className="text-xs leading-5 text-[#66756e]">
                      Use a clear and descriptive exam title.
                    </p>
                  </div>

                  <div className="flex gap-2.5">
                    <span className="text-[#f0b20b] text-sm">✓</span>
                    <p className="text-xs leading-5 text-[#66756e]">
                      Verify the duration and marking scheme.
                    </p>
                  </div>

                  <div className="flex gap-2.5">
                    <span className="text-[#f0b20b] text-sm">✓</span>
                    <p className="text-xs leading-5 text-[#66756e]">
                      Questions can be added after creating the exam.
                    </p>
                  </div>

                </div>

              </div>

            </aside>

          </div>

        </div>

      </div>
    </TeacherLayout>
  );

}

export default CreateExam;