import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import TeacherLayout from "../components/TeacherLayout";
import { fetchWithAuth } from "../src/api";

function EditTest() {
  const { testId } = useParams();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    subject: "",
    duration: "",
    marksPerQuestion: "",
    negativeMarks: "",
    isPaid: false,
    price: "",
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  // Fetch existing test
  useEffect(() => {
    const fetchTest = async () => {
      try {
        let response = await fetchWithAuth(`/api/tests/${testId}`);
        if (!response.ok) {
          response = await fetchWithAuth(`/api/test-creation/${testId}`);
        }

        const data = await response.json();

        if (!response.ok || !data.success) {
          throw new Error(data.message || "Failed to fetch test");
        }

        const test = data.test;

        setFormData({
          title: test.title || "",
          description: test.description || "",
          subject: test.subject || "",
          duration: test.duration || "",
          marksPerQuestion: test.marksPerQuestion ?? test.marks_per_question ?? "",
          negativeMarks: test.negativeMarks ?? test.negative_marks ?? "",
          isPaid: Boolean(test.isPaid ?? test.is_paid),
          price: test.price ?? "",
        });
      } catch (error) {
        console.error("FETCH TEST ERROR:", error);
        setError(error.message || "Failed to load test");
      } finally {
        setLoading(false);
      }
    };

    fetchTest();
  }, [testId]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setError("");
    setSuccessMessage("");
    setSaving(true);

    try {
      const payload = {
        title: formData.title.trim(),
        description: formData.description.trim(),
        subject: formData.subject.trim(),
        duration: Number(formData.duration),
        marksPerQuestion: Number(formData.marksPerQuestion),
        negativeMarks: Number(formData.negativeMarks),
        isPaid: Boolean(formData.isPaid),
        is_paid: Boolean(formData.isPaid),
        price: formData.isPaid ? Number(formData.price) || 0 : 0,
      };

      let response = await fetchWithAuth(`/api/tests/${testId}`, {
        method: "PUT",
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        response = await fetchWithAuth(`/api/test-creation/${testId}`, {
          method: "PUT",
          body: JSON.stringify(payload),
        });
      }

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || "Failed to update test");
      }

      setSuccessMessage("Test updated successfully!");

      setTimeout(() => {
        navigate("/test-creator/tests");
      }, 1000);
    } catch (error) {
      console.error("UPDATE TEST ERROR:", error);
      setError(error.message || "Failed to update test");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <TeacherLayout>
        <div className="p-6">
          <p className="text-gray-500">Loading test...</p>
        </div>
      </TeacherLayout>
    );
  }

  return (
    <TeacherLayout>
      <div className="min-h-full bg-[#f7f8f5] p-6">

        {/* Header */}
        <div className="flex items-center gap-4 mb-6">
          <button
            type="button"
            onClick={() => navigate("/tests")}
            className="px-3 py-2 bg-white border border-gray-200 rounded-lg hover:bg-gray-50"
          >
            ←
          </button>

          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Edit Test
            </h1>

            <p className="text-sm text-gray-500 mt-1">
              Update your test details.
            </p>
          </div>
        </div>

        {/* Error */}
        {error && (
          <div className="mb-5 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
            {error}
          </div>
        )}

        {/* Success */}
        {successMessage && (
          <div className="mb-5 bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg">
            {successMessage}
          </div>
        )}

        {/* Form */}
        <form
          onSubmit={handleSubmit}
          className="bg-white border border-gray-200 rounded-xl p-6 max-w-4xl"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">

            {/* Title */}
            <div className="md:col-span-2">
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Test Title
              </label>

              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleChange}
                required
                className="w-full border border-gray-300 rounded-lg px-4 py-3 outline-none focus:border-yellow-400"
                placeholder="Enter test title"
              />
            </div>

            {/* Subject */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Subject
              </label>

              <input
                type="text"
                name="subject"
                value={formData.subject}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded-lg px-4 py-3 outline-none focus:border-yellow-400"
                placeholder="Enter subject"
              />
            </div>

            {/* Duration */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Duration (minutes)
              </label>

              <input
                type="number"
                name="duration"
                value={formData.duration}
                onChange={handleChange}
                min="1"
                required
                className="w-full border border-gray-300 rounded-lg px-4 py-3 outline-none focus:border-yellow-400"
                placeholder="e.g. 60"
              />
            </div>

            {/* Marks */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Marks per Question
              </label>

              <input
                type="number"
                name="marksPerQuestion"
                value={formData.marksPerQuestion}
                onChange={handleChange}
                min="0"
                step="0.5"
                className="w-full border border-gray-300 rounded-lg px-4 py-3 outline-none focus:border-yellow-400"
                placeholder="e.g. 1"
              />
            </div>

            {/* Negative */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Negative Marks
              </label>

              <input
                type="number"
                name="negativeMarks"
                value={formData.negativeMarks}
                onChange={handleChange}
                min="0"
                step="0.5"
                className="w-full border border-gray-300 rounded-lg px-4 py-3 outline-none focus:border-yellow-400"
                placeholder="e.g. 0.25"
              />
            </div>

            {/* Description */}
            <div className="md:col-span-2">
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Description
              </label>

              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows="5"
                className="w-full border border-gray-300 rounded-lg px-4 py-3 outline-none focus:border-yellow-400 resize-none"
                placeholder="Enter test description"
              />
            </div>

            {/* Pricing (Free vs Paid) */}
            <div className="md:col-span-2 bg-[#f9fafb] border border-gray-200 rounded-xl p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-bold text-gray-900">Paid Test Access</p>
                  <p className="text-xs text-gray-500 mt-0.5">Require students to purchase this test before attempting</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    name="isPaid"
                    checked={formData.isPaid}
                    onChange={handleChange}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-yellow-500"></div>
                </label>
              </div>

              {formData.isPaid && (
                <div className="mt-4 pt-4 border-t border-gray-200">
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                    Test Price (₹ INR)
                  </label>
                  <input
                    type="number"
                    name="price"
                    value={formData.price}
                    onChange={handleChange}
                    placeholder="499"
                    min="1"
                    required={formData.isPaid}
                    className="w-full border border-gray-300 rounded-lg px-4 py-3 outline-none focus:border-yellow-400"
                  />
                </div>
              )}
            </div>
          </div>

          {/* Buttons */}
          <div className="flex justify-end gap-3 mt-6 pt-5 border-t border-gray-100">
            <button
              type="button"
              onClick={() => navigate("/tests")}
              className="px-5 py-2.5 border border-gray-300 rounded-lg font-semibold text-sm hover:bg-gray-50"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={saving}
              className="px-5 py-2.5 bg-yellow-400 hover:bg-yellow-500 rounded-lg font-semibold text-sm disabled:opacity-60"
            >
              {saving ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </form>
      </div>
    </TeacherLayout>
  );
}

export default EditTest;