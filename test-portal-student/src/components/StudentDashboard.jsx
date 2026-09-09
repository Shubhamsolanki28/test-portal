import { useState, useMemo } from "react";

export default function StudentDashboard({
  tests = [],
  completedSubmissions = {},
  purchasedTestIds = new Set(),
  onStartTest,
  onUnlockTest,
}) {
  const [activeTab, setActiveTab] = useState("all");
  const [selectedSubject, setSelectedSubject] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [unlockModalTest, setUnlockModalTest] = useState(null);
  const [scorecardModalTest, setScorecardModalTest] = useState(null);

  // Extract unique subjects
  const subjects = useMemo(() => {
    const list = new Set();
    tests.forEach((t) => {
      if (t.subject) list.add(t.subject);
    });
    return ["all", ...Array.from(list)];
  }, [tests]);

  // Compute test metrics
  const stats = useMemo(() => {
    const total = tests.length;
    let completedCount = 0;
    let totalScore = 0;

    tests.forEach((t) => {
      const id = String(t.id || t._id);
      if (completedSubmissions[id]) {
        completedCount++;
        totalScore += completedSubmissions[id].percentage || 0;
      }
    });

    const notAttemptedCount = Math.max(0, total - completedCount);
    const avgScore = completedCount > 0 ? (totalScore / completedCount).toFixed(1) : "0";

    return {
      total,
      completedCount,
      notAttemptedCount,
      avgScore,
    };
  }, [tests, completedSubmissions]);

  // Filter tests based on tab, subject, and search query
  const filteredTests = useMemo(() => {
    return tests.filter((test) => {
      const id = String(test.id || test._id);
      const isPaid = Boolean(test.is_paid || test.isPaid);
      const isPurchased = purchasedTestIds.has(id);
      const isCompleted = Boolean(completedSubmissions[id]);

      // Filter by Tab
      if (activeTab === "free" && isPaid) return false;
      if (activeTab === "paid" && !isPaid) return false;
      if (activeTab === "purchased" && (!isPaid || !isPurchased)) return false;
      if (activeTab === "completed" && !isCompleted) return false;
      if (activeTab === "notAttempted" && isCompleted) return false;

      // Filter by Subject
      if (selectedSubject !== "all" && test.subject !== selectedSubject) {
        return false;
      }

      // Filter by Search Query
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const titleMatch = (test.title || "").toLowerCase().includes(query);
        const descMatch = (test.description || "").toLowerCase().includes(query);
        const subjectMatch = (test.subject || "").toLowerCase().includes(query);
        if (!titleMatch && !descMatch && !subjectMatch) return false;
      }

      return true;
    });
  }, [tests, activeTab, selectedSubject, searchQuery, purchasedTestIds, completedSubmissions]);

  return (
    <div className="min-h-screen bg-[#071a14] text-[#f4efe3] font-sans pb-16">
      {/* Top Navigation Bar */}
      <header className="sticky top-0 z-30 bg-[#0b231b]/95 backdrop-blur-md border-b border-[#1b3d30] px-6 py-4 flex items-center justify-between shadow-lg">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-[#e31b23] to-[#f59e0b] flex items-center justify-center text-white font-black text-xl shadow-md">
            D
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
              Dexmy <span className="text-[#f5b91e] font-normal text-sm px-2 py-0.5 rounded-full bg-[#1b3d30] border border-[#2a5745]">Testing System</span>
            </h1>
            <p className="text-xs text-[#9eb7ad]">Student Assessment & Examination Dashboard</p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[#0e2c22] border border-[#1b3d30] text-xs text-[#b8d1c6]">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            Role: <span className="font-semibold text-emerald-300">Student</span>
          </div>
          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-emerald-600 to-teal-800 flex items-center justify-center font-bold text-white text-sm border border-emerald-400/30 shadow">
            ST
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        {/* Welcome & Overview Header */}
        <div className="bg-gradient-to-r from-[#0d2a20] via-[#0f3327] to-[#123e30] border border-[#204a3b] rounded-2xl p-6 sm:p-8 mb-8 shadow-xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-80 h-80 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20"></div>
          
          <div className="relative z-10">
            <span className="inline-block text-xs font-bold uppercase tracking-wider text-[#f5b91e] px-2.5 py-1 rounded-md bg-[#184233] border border-[#275d49] mb-3">
              Student Tests Hub
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Ready to challenge your knowledge?
            </h2>
            <p className="text-[#a4c2b5] text-sm sm:text-base mt-2 max-w-2xl">
              Browse available national mock tests, topic-specific practice assessments, and paid certified exams. Track your completed scores and review detailed answers.
            </p>

            {/* Quick Stats Banner */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-6">
              <div className="bg-[#0b211a]/80 border border-[#1b3f32] rounded-xl p-4">
                <div className="text-xs text-[#8ca89c] font-medium">Available Tests</div>
                <div className="text-2xl font-black text-white mt-1">{stats.total}</div>
              </div>
              <div className="bg-[#0b211a]/80 border border-[#1b3f32] rounded-xl p-4">
                <div className="text-xs text-[#8ca89c] font-medium">Completed</div>
                <div className="text-2xl font-black text-emerald-400 mt-1">{stats.completedCount}</div>
              </div>
              <div className="bg-[#0b211a]/80 border border-[#1b3f32] rounded-xl p-4">
                <div className="text-xs text-[#8ca89c] font-medium">Not Attempted</div>
                <div className="text-2xl font-black text-[#f5b91e] mt-1">{stats.notAttemptedCount}</div>
              </div>
              <div className="bg-[#0b211a]/80 border border-[#1b3f32] rounded-xl p-4">
                <div className="text-xs text-[#8ca89c] font-medium">Average Score</div>
                <div className="text-2xl font-black text-cyan-300 mt-1">{stats.avgScore}%</div>
              </div>
            </div>
          </div>
        </div>

        {/* Controls Section: Search & Filters */}
        <div className="bg-[#0c261e] border border-[#1a4032] rounded-xl p-4 mb-6 shadow-md flex flex-col md:flex-row gap-4 justify-between items-stretch md:items-center">
          {/* Tabs */}
          <div className="flex flex-wrap items-center gap-2 border-b md:border-b-0 border-[#1a4032] pb-3 md:pb-0">
            {[
              { key: "all", label: "All Tests" },
              { key: "free", label: "Free" },
              { key: "paid", label: "Paid" },
              { key: "purchased", label: "Purchased" },
              { key: "notAttempted", label: "Not Attempted" },
              { key: "completed", label: "Completed" },
            ].map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all duration-150 ${
                  activeTab === tab.key
                    ? "bg-[#e31b23] text-white shadow-md shadow-red-900/30"
                    : "bg-[#071a14] text-[#9eb7ad] hover:text-white hover:bg-[#12362b] border border-[#1b3f32]"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Search Input */}
          <div className="relative min-w-[240px]">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search tests by title or topic..."
              className="w-full bg-[#071a14] border border-[#1b3f32] rounded-lg px-3 py-2 text-xs text-white placeholder-[#688a7c] focus:outline-none focus:border-[#f5b91e]"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-2.5 top-2 text-xs text-gray-400 hover:text-white"
              >
                ✕
              </button>
            )}
          </div>
        </div>

        {/* Subject Filter Pills */}
        {subjects.length > 2 && (
          <div className="flex items-center gap-2 overflow-x-auto pb-4 mb-4 text-xs">
            <span className="text-[#7c9d90] font-medium whitespace-nowrap">Subjects:</span>
            {subjects.map((sub) => (
              <button
                key={sub}
                onClick={() => setSelectedSubject(sub)}
                className={`px-2.5 py-1 rounded-md capitalize whitespace-nowrap transition-colors ${
                  selectedSubject === sub
                    ? "bg-[#f5b91e] text-[#071a14] font-bold"
                    : "bg-[#0e2c22] text-[#9eb7ad] hover:text-white border border-[#1b3d30]"
                }`}
              >
                {sub === "all" ? "All Subjects" : sub}
              </button>
            ))}
          </div>
        )}

        {/* Tests Grid */}
        {filteredTests.length === 0 ? (
          <div className="bg-[#0b231b] border border-[#1a4032] rounded-2xl p-12 text-center text-[#8ca89c]">
            <div className="text-4xl mb-3">🔍</div>
            <h3 className="text-lg font-bold text-white">No tests match your filter</h3>
            <p className="text-xs text-[#8ca89c] mt-1 max-w-sm mx-auto">
              Try switching your tab, clearing your search keywords, or selecting "All Subjects" to see other tests.
            </p>
            <button
              onClick={() => {
                setActiveTab("all");
                setSelectedSubject("all");
                setSearchQuery("");
              }}
              className="mt-4 px-4 py-2 rounded-lg bg-[#1a4032] hover:bg-[#255745] text-xs font-semibold text-white transition"
            >
              Reset Filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredTests.map((test) => {
              const testId = String(test.id || test._id);
              const isPaid = Boolean(test.is_paid || test.isPaid);
              const isPurchased = purchasedTestIds.has(testId);
              const isLocked = isPaid && !isPurchased;
              const submission = completedSubmissions[testId];
              const isCompleted = Boolean(submission);

              return (
                <div
                  key={testId}
                  className="bg-[#0b221a] border border-[#1b3f32] rounded-2xl p-5 hover:border-[#2f6652] hover:shadow-xl hover:-translate-y-1 transition-all duration-200 flex flex-col justify-between"
                >
                  <div>
                    {/* Badges Row */}
                    <div className="flex items-center justify-between gap-2 mb-3">
                      {/* Classification Badge: Free vs Paid */}
                      {isPaid ? (
                        <span className="inline-flex items-center gap-1.5 text-xs font-bold px-2.5 py-1 rounded-full bg-purple-950/80 text-purple-300 border border-purple-800/60 shadow-sm">
                          {isPurchased ? (
                            <>
                              <span>✓</span> Purchased
                            </>
                          ) : (
                            <>
                              <span>🔒</span> Paid • ₹{test.price || 499}
                            </>
                          )}
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 text-xs font-bold px-2.5 py-1 rounded-full bg-emerald-950/80 text-emerald-300 border border-emerald-800/60 shadow-sm">
                          <span>🎁</span> Free Test
                        </span>
                      )}

                      {/* Status Badge */}
                      {isCompleted ? (
                        <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-emerald-900/60 text-emerald-300 border border-emerald-700/60">
                          Completed • {submission.percentage}%
                        </span>
                      ) : (
                        <span className="text-xs font-medium px-2.5 py-0.5 rounded-full bg-[#112d23] text-[#8ca89c] border border-[#1f4738]">
                          Not Attempted
                        </span>
                      )}
                    </div>

                    {/* Subject Tag */}
                    <div className="text-[11px] font-semibold tracking-wider text-[#f5b91e] uppercase mb-1.5">
                      {test.subject || "General Awareness"}
                    </div>

                    {/* Test Title */}
                    <h3 className="text-base font-bold text-white line-clamp-2 leading-snug">
                      {test.title}
                    </h3>

                    {/* Description */}
                    <p className="text-xs text-[#9eb7ad] mt-2 line-clamp-2 leading-relaxed">
                      {test.description || "Comprehensive mock assessment designed to evaluate test readiness and core competencies."}
                    </p>

                    {/* Test Info Badges */}
                    <div className="grid grid-cols-3 gap-2 mt-4 pt-3 border-t border-[#16362b] text-[11px] text-[#b0cbc0]">
                      <div className="flex items-center gap-1">
                        <span>⏱️</span>
                        <span>{test.duration || 30} Mins</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <span>📝</span>
                        <span>{test.total_questions || test.totalQuestions || test.questions?.length || 0} Qs</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <span>🎯</span>
                        <span>+{test.marks_per_question || 1} / -{test.negative_marks || 0}</span>
                      </div>
                    </div>
                  </div>

                  {/* Actions Section */}
                  <div className="mt-5 pt-3 border-t border-[#16362b] flex items-center gap-2">
                    {isLocked ? (
                      <button
                        onClick={() => setUnlockModalTest(test)}
                        className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-purple-700 to-indigo-700 hover:from-purple-600 hover:to-indigo-600 text-white font-bold text-xs shadow-md transition flex items-center justify-center gap-2"
                      >
                        <span>🔒</span> Unlock Test (₹{test.price || 499})
                      </button>
                    ) : isCompleted ? (
                      <div className="flex w-full gap-2">
                        <button
                          onClick={() => setScorecardModalTest({ test, submission })}
                          className="flex-1 py-2 px-3 rounded-xl bg-[#14362a] hover:bg-[#1d4c3b] border border-[#295a47] text-white font-semibold text-xs transition text-center"
                        >
                          View Scorecard
                        </button>
                        <button
                          onClick={() => onStartTest(test)}
                          className="flex-1 py-2 px-3 rounded-xl bg-[#e31b23] hover:bg-[#c9181f] text-white font-bold text-xs shadow transition text-center"
                        >
                          Retake Test
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => onStartTest(test)}
                        className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-[#e31b23] to-[#ef4444] hover:from-[#c9181f] hover:to-[#dc2626] text-white font-bold text-xs shadow-md transition flex items-center justify-center gap-2"
                      >
                        <span>🚀</span> Start Test Now
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>

      {/* Unlock / Purchase Simulation Modal */}
      {unlockModalTest && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4">
          <div className="bg-[#0b231b] border border-[#275846] rounded-2xl max-w-md w-full p-6 text-white shadow-2xl animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between pb-3 border-b border-[#1b3f32]">
              <h4 className="text-base font-bold flex items-center gap-2 text-purple-300">
                <span>🔒</span> Unlock Premium Test
              </h4>
              <button
                onClick={() => setUnlockModalTest(null)}
                className="text-gray-400 hover:text-white text-lg"
              >
                ✕
              </button>
            </div>

            <div className="mt-4">
              <h5 className="font-bold text-lg text-white">{unlockModalTest.title}</h5>
              <p className="text-xs text-[#a4c2b5] mt-1">{unlockModalTest.description}</p>

              <div className="bg-[#071a14] border border-[#1b3f32] rounded-xl p-3 mt-4 space-y-2 text-xs">
                <div className="flex justify-between text-[#b0cbc0]">
                  <span>Duration:</span>
                  <span className="font-semibold text-white">{unlockModalTest.duration} Mins</span>
                </div>
                <div className="flex justify-between text-[#b0cbc0]">
                  <span>Total Questions:</span>
                  <span className="font-semibold text-white">
                    {unlockModalTest.total_questions || unlockModalTest.questions?.length || 0} Questions
                  </span>
                </div>
                <div className="flex justify-between text-[#b0cbc0]">
                  <span>Subject:</span>
                  <span className="font-semibold text-[#f5b91e]">{unlockModalTest.subject}</span>
                </div>
                <div className="flex justify-between text-[#b0cbc0] pt-2 border-t border-[#1b3f32] text-sm">
                  <span className="font-bold text-white">Price:</span>
                  <span className="font-extrabold text-purple-300">₹{unlockModalTest.price || 499}</span>
                </div>
              </div>

              <div className="mt-4 text-xs text-[#8ca89c] bg-[#112d23] p-3 rounded-lg border border-[#1c4737]">
                ✨ <strong>Included:</strong> Full performance analytics, detailed answer keys with explanations, and official Dexmy completion score.
              </div>
            </div>

            <div className="mt-6 flex gap-3">
              <button
                onClick={() => setUnlockModalTest(null)}
                className="flex-1 py-2.5 rounded-xl border border-[#275846] bg-[#0e2c22] hover:bg-[#163e30] text-xs font-semibold text-gray-300 transition"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  onUnlockTest(unlockModalTest);
                  setUnlockModalTest(null);
                }}
                className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-xs font-bold text-white shadow-lg transition"
              >
                Verify &amp; Unlock
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Scorecard Modal */}
      {scorecardModalTest && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4">
          <div className="bg-[#0b231b] border border-[#275846] rounded-2xl max-w-lg w-full p-6 text-white shadow-2xl animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between pb-3 border-b border-[#1b3f32]">
              <h4 className="text-base font-bold flex items-center gap-2 text-emerald-300">
                <span>🏆</span> Test Performance Scorecard
              </h4>
              <button
                onClick={() => setScorecardModalTest(null)}
                className="text-gray-400 hover:text-white text-lg"
              >
                ✕
              </button>
            </div>

            <div className="mt-4">
              <h5 className="font-bold text-lg text-white">{scorecardModalTest.test?.title}</h5>
              <div className="text-xs text-[#8ca89c] mt-0.5">
                Submitted on: {new Date(scorecardModalTest.submission.createdAt || Date.now()).toLocaleString()}
              </div>

              {/* Score Highlight Box */}
              <div className="mt-4 bg-gradient-to-br from-[#071a14] to-[#0c2e22] border border-[#1b3f32] rounded-xl p-5 text-center">
                <div className="text-3xl font-black text-emerald-400">
                  {scorecardModalTest.submission.percentage}%
                </div>
                <div className="text-xs font-semibold text-[#8ca89c] uppercase tracking-wider mt-1">
                  Final Score
                </div>
                <div className="text-sm font-bold text-white mt-2">
                  {scorecardModalTest.submission.obtainedMarks} / {scorecardModalTest.submission.totalMarks} Marks Obtained
                </div>
              </div>

              {/* Breakdown Grid */}
              <div className="grid grid-cols-4 gap-2 mt-4 text-center text-xs">
                <div className="bg-[#071a14] border border-[#1b3f32] p-2.5 rounded-lg">
                  <div className="text-gray-400 text-[10px]">Total Qs</div>
                  <div className="text-base font-bold text-white mt-0.5">
                    {scorecardModalTest.submission.totalQuestions}
                  </div>
                </div>
                <div className="bg-[#071a14] border border-[#1b3f32] p-2.5 rounded-lg">
                  <div className="text-emerald-400 text-[10px]">Correct</div>
                  <div className="text-base font-bold text-emerald-400 mt-0.5">
                    {scorecardModalTest.submission.correct}
                  </div>
                </div>
                <div className="bg-[#071a14] border border-[#1b3f32] p-2.5 rounded-lg">
                  <div className="text-red-400 text-[10px]">Incorrect</div>
                  <div className="text-base font-bold text-red-400 mt-0.5">
                    {scorecardModalTest.submission.incorrect}
                  </div>
                </div>
                <div className="bg-[#071a14] border border-[#1b3f32] p-2.5 rounded-lg">
                  <div className="text-amber-400 text-[10px]">Unattempted</div>
                  <div className="text-base font-bold text-amber-400 mt-0.5">
                    {scorecardModalTest.submission.notAnswered}
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-6 flex gap-3">
              <button
                onClick={() => setScorecardModalTest(null)}
                className="flex-1 py-2.5 rounded-xl border border-[#275846] bg-[#0e2c22] hover:bg-[#163e30] text-xs font-semibold text-gray-300 transition"
              >
                Close
              </button>
              <button
                onClick={() => {
                  const testToStart = scorecardModalTest.test;
                  setScorecardModalTest(null);
                  onStartTest(testToStart);
                }}
                className="flex-1 py-2.5 rounded-xl bg-[#e31b23] hover:bg-[#c9181f] text-xs font-bold text-white shadow transition"
              >
                Retake Test
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
