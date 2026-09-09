import { useEffect, useState } from "react";
import TeacherLayout from "../components/TeacherLayout";
import { fetchWithAuth } from "../src/api";

function MyTests() {
    const [tests, setTests] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchTests = async () => {
        try {
            let response = await fetchWithAuth("/api/tests");
            if (!response.ok) {
                response = await fetchWithAuth("/api/test-creation");
            }

            const data = await response.json();

            if (data.success) {
                setTests(data.tests || []);
            }
        } catch (error) {
            console.error("Failed to fetch tests:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchTests();
    }, []);

    return (
        <TeacherLayout>
            <div className="min-h-full bg-[#f7f8f5] p-6">

                {/* Header */}
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">
                            My Tests
                        </h1>

                        <p className="text-sm text-gray-500 mt-1">
                            Manage and monitor your created tests.
                        </p>
                    </div>

                    <button
                        onClick={() => {
                            window.location.href = "/create-test";
                        }}
                        className="bg-yellow-400 hover:bg-yellow-500 text-gray-900 px-5 py-2.5 rounded-lg font-semibold text-sm transition"
                    >
                        + Create Test
                    </button>
                </div>

                {/* Loading */}
                {loading && (
                    <div className="bg-white border border-gray-200 rounded-xl p-8 text-center">
                        <p className="text-gray-500">
                            Loading tests...
                        </p>
                    </div>
                )}

                {/* Empty State */}
                {!loading && tests.length === 0 && (
                    <div className="bg-white border border-gray-200 rounded-xl p-10 text-center">
                        <div className="w-14 h-14 mx-auto rounded-full bg-yellow-100 flex items-center justify-center text-2xl">
                            +
                        </div>

                        <h2 className="text-lg font-semibold text-gray-900 mt-4">
                            No tests created yet
                        </h2>

                        <p className="text-sm text-gray-500 mt-1">
                            Create your first test to get started.
                        </p>

                        <button
                            onClick={() => {
                                window.location.href = "/create-test";
                            }}
                            className="mt-5 bg-yellow-400 hover:bg-yellow-500 px-5 py-2.5 rounded-lg font-semibold text-sm"
                        >
                            Create Test
                        </button>
                    </div>
                )}

                {/* Test Cards */}
                {!loading && tests.length > 0 && (
                    <div className="grid grid-cols-1 xl:grid-cols-2 gap-5">

                        {tests.map((test) => (
                            <div
                                key={test._id}
                                className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm hover:shadow-md transition"
                            >

                                {/* Card Header */}
                                <div className="p-5 border-b border-gray-100">
                                    <div className="flex items-start justify-between gap-4">

                                        <div className="flex items-start gap-3">

                                            <div className="w-11 h-11 rounded-lg bg-yellow-400 flex items-center justify-center font-bold text-lg shrink-0">
                                                +
                                            </div>

                                            <div>
                                                <h2 className="font-bold text-gray-900 text-lg">
                                                    {test.title}
                                                </h2>

                                                <p className="text-sm text-gray-500 mt-1">
                                                    {test.subject || "General"}
                                                </p>
                                            </div>

                                        </div>

                                        {/* Status and Pricing Badges */}
                                        <div className="flex items-center gap-2">
                                            <span
                                                className={`text-xs font-semibold px-2.5 py-1 rounded-full ${
                                                    test.is_paid || test.isPaid
                                                        ? "bg-purple-100 text-purple-800 border border-purple-200"
                                                        : "bg-emerald-100 text-emerald-800 border border-emerald-200"
                                                }`}
                                            >
                                                {test.is_paid || test.isPaid ? `Paid · ₹${test.price || 499}` : "Free"}
                                            </span>

                                            <span
                                                className={`text-xs font-semibold px-3 py-1 rounded-full ${
                                                    test.isPublished || test.is_published
                                                        ? "bg-green-100 text-green-700"
                                                        : "bg-yellow-100 text-yellow-700"
                                                }`}
                                            >
                                                {test.isPublished || test.is_published ? "Published" : "Draft"}
                                            </span>
                                        </div>

                                    </div>

                                    {test.description && (
                                        <p className="text-sm text-gray-600 mt-4 line-clamp-2">
                                            {test.description}
                                        </p>
                                    )}
                                </div>

                                {/* Test Information */}
                                <div className="grid grid-cols-2 sm:grid-cols-4 border-b border-gray-100">

                                    <div className="p-4">
                                        <p className="text-xs text-gray-400">
                                            Questions
                                        </p>
                                        <p className="font-semibold text-gray-900 mt-1">
                                            {test.totalQuestions ?? 0}
                                        </p>
                                    </div>

                                    <div className="p-4 border-l border-gray-100">
                                        <p className="text-xs text-gray-400">
                                            Duration
                                        </p>
                                        <p className="font-semibold text-gray-900 mt-1">
                                            {test.duration} min
                                        </p>
                                    </div>

                                    <div className="p-4 border-l border-gray-100">
                                        <p className="text-xs text-gray-400">
                                            Marks / Q
                                        </p>
                                        <p className="font-semibold text-gray-900 mt-1">
                                            {test.marksPerQuestion}
                                        </p>
                                    </div>

                                    <div className="p-4 border-l border-gray-100">
                                        <p className="text-xs text-gray-400">
                                            Negative
                                        </p>
                                        <p className="font-semibold text-gray-900 mt-1">
                                            {test.negativeMarks}
                                        </p>
                                    </div>

                                </div>

                                {/* Footer */}
                                <div className="px-5 py-4 flex items-center justify-between">

                                    <p className="text-xs text-gray-400">
                                        Created{" "}
                                        {test.createdAt
                                            ? new Date(test.createdAt).toLocaleDateString()
                                            : "—"}
                                    </p>

                                    <div className="flex gap-2">

                                        <button
                                            onClick={() => {
                                                window.location.href = `/tests/${test._id}/questions`;
                                            }}
                                            className="px-3 py-2 text-sm font-medium bg-yellow-400 text-gray-900 rounded-lg hover:bg-yellow-500"
                                        >
                                            Add Questions
                                        </button>

                                        <button
                                            onClick={() => {
                                                window.location.href = `/tests/${test._id}/preview`;
                                            }}
                                            className="px-3 py-2 text-sm font-medium border border-gray-200 rounded-lg hover:bg-gray-50"
                                        >
                                            View
                                        </button>

                                        <button
                                            onClick={() => {
                                                window.location.href = `/tests/${test._id}/edit`;
                                            }}
                                            className="px-3 py-2 text-sm font-medium border border-gray-200 rounded-lg hover:bg-gray-50"
                                        >
                                            Edit
                                        </button>

                                        <button
                                            onClick={async () => {
                                                try {
                                                    const testId = test.id || test._id;
                                                    let response = await fetchWithAuth(`/api/tests/${testId}/publish`, {
                                                        method: "PATCH",
                                                    });
                                                    if (!response.ok) {
                                                        response = await fetchWithAuth(`/api/test-creation/${testId}/publish`, {
                                                            method: "PATCH",
                                                        });
                                                    }

                                                    const data = await response.json();

                                                    if (!response.ok || !data.success) {
                                                        throw new Error(
                                                            data.message || "Failed to update test status"
                                                        );
                                                    }

                                                    setTests((prevTests) =>
                                                        prevTests.map((item) =>
                                                            (item._id === testId || item.id === testId)
                                                                ? {
                                                                    ...item,
                                                                    isPublished: data.test?.isPublished ?? !item.isPublished,
                                                                    is_published: data.test?.is_published ?? !item.is_published,
                                                                }
                                                                : item
                                                        )
                                                    );
                                                } catch (error) {
                                                    console.error("PUBLISH TEST ERROR:", error);
                                                    alert(error.message || "Failed to update test status");
                                                }
                                            }}
                                            className={`px-3 py-2 text-sm font-medium rounded-lg ${test.isPublished
                                                ? "border border-yellow-300 text-yellow-700 hover:bg-yellow-50"
                                                : "bg-green-600 text-white hover:bg-green-700"
                                                }`}
                                        >
                                            {test.isPublished ? "Unpublish" : "Publish"}
                                        </button>
                                        <button
                                            onClick={async () => {
                                                const confirmed = window.confirm(
                                                    `Are you sure you want to delete "${test.title}"?`
                                                );

                                                if (!confirmed) return;

                                                try {
                                                    const response = await fetch(
                                                        `http://localhost:5000/api/test-creation/${test._id}`,
                                                        {
                                                            method: "DELETE",
                                                        }
                                                    );

                                                    const data = await response.json();

                                                    if (!response.ok || !data.success) {
                                                        throw new Error(data.message || "Failed to delete test");
                                                    }

                                                    setTests((prevTests) =>
                                                        prevTests.filter((item) => item._id !== test._id)
                                                    );
                                                } catch (error) {
                                                    console.error("DELETE TEST ERROR:", error);
                                                    alert(error.message || "Failed to delete test");
                                                }
                                            }}
                                            className="px-3 py-2 text-sm font-medium border border-red-200 text-red-600 rounded-lg hover:bg-red-50"
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
        </TeacherLayout>
    );
}

export default MyTests;