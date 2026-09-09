import { useNavigate } from "react-router-dom";
import { useEffect, useRef, useState } from "react";
import { fetchWithAuth, API_BASE } from "./src/api";

function TestCreatorDashboard() {
    const navigate = useNavigate();
    const [stats, setStats] = useState({
        totalExams: 0,
        totalQuestions: 0,
        publishedExams: 0,
        draftExams: 0,
    });

    const [loading, setLoading] = useState(true);
    const [message, setMessage] = useState("");
    const [exams, setExams] = useState([]);
    const [showTeacherMenu, setShowTeacherMenu] = useState(false);
    const teacherMenuRef = useRef(null);
    const [teacherProfile, setTeacherProfile] = useState({
        fullName: "",
        email: "",
        mobile: "",
        designation: "",
        department: "",
        city: "",
        photo: "",
    });
    const [showNotifications, setShowNotifications] = useState(false);
    const [notifications, setNotifications] = useState([]);
    const notificationRef = useRef(null);
    useEffect(() => {
        const handleNotificationOutsideClick = (event) => {
            if (
                notificationRef.current &&
                !notificationRef.current.contains(event.target)
            ) {
                setShowNotifications(false);
            }
        };

        document.addEventListener(
            "mousedown",
            handleNotificationOutsideClick
        );

        return () => {
            document.removeEventListener(
                "mousedown",
                handleNotificationOutsideClick
            );
        };
    }, []);
    useEffect(() => {
        const loadNotifications = () => {
            const savedNotifications =
                JSON.parse(
                    localStorage.getItem("teacherNotifications")
                ) || [];

            setNotifications(savedNotifications);
        };

        // Load notifications when Dashboard opens
        loadNotifications();

        // Update when another tab changes notifications
        const handleStorageChange = (event) => {
            if (event.key === "teacherNotifications") {
                loadNotifications();
            }
        };

        window.addEventListener(
            "storage",
            handleStorageChange
        );

        return () => {
            window.removeEventListener(
                "storage",
                handleStorageChange
            );
        };
    }, []);
    useEffect(() => {
        const loadTeacherProfile = () => {
            const savedProfile = localStorage.getItem("teacherProfile");

            if (savedProfile) {
                const data = JSON.parse(savedProfile);

                setTeacherProfile({
                    fullName: data.fullName || "",
                    email: data.email || "",
                    mobile: data.mobile || "",
                    designation: data.designation || "",
                    department: data.department || "",
                    city: data.city || "",
                    photo: data.photo || "",
                });
            }
        };

        loadTeacherProfile();
    }, []);

    useEffect(() => {
        const handleOutsideClick = (event) => {
            if (
                teacherMenuRef.current &&
                !teacherMenuRef.current.contains(event.target)
            ) {
                setShowTeacherMenu(false);
            }
        };

        document.addEventListener("mousedown", handleOutsideClick);

        return () => {
            document.removeEventListener("mousedown", handleOutsideClick);
        };
    }, []);

    useEffect(() => {

        const fetchDashboardData = async () => {
            try {
                setLoading(true);
                setMessage("");

                let tests = [];
                let questions = [];

                try {
                    const testRes = await fetchWithAuth("/api/tests");
                    if (testRes.ok) {
                        const testData = await testRes.json();
                        tests = testData.tests || [];
                    } else {
                        const examRes = await fetchWithAuth("/api/exams");
                        if (examRes.ok) {
                            const examData = await examRes.json();
                            tests = examData.exams || [];
                        }
                    }
                } catch (e) {
                    console.warn("Tests fetch error, falling back:", e.message);
                }

                try {
                    const qRes = await fetchWithAuth("/api/questions");
                    if (qRes.ok) {
                        const qData = await qRes.json();
                        questions = qData.questions || [];
                    }
                } catch (e) {
                    console.warn("Questions fetch error:", e.message);
                }

                setExams(tests);
                const publishedExams = tests.filter(
                    (exam) => exam.isPublished || exam.is_published
                );

                setStats({
                    totalExams: tests.length,
                    totalQuestions: questions.length,
                    publishedExams: publishedExams.length,
                    draftExams: Math.max(0, tests.length - publishedExams.length),
                });
            } catch (error) {
                setMessage(error.message);
            } finally {
                setLoading(false);
            }
        };

        fetchDashboardData();
    }, []);

    return (
        <div className="min-h-screen bg-[#f5f7f4] text-[#172033]">

            {/* =====================================================
            TOP HEADER
        ===================================================== */}
            <header className="h-[68px] bg-[#0b211a] border-b border-[#29463b] flex items-center justify-between px-5 lg:px-8">

                {/* BRAND */}
                <div className="flex items-center gap-3">

                    <div className="w-10 h-10 rounded-xl bg-[#f5b91e] text-[#071a14] flex items-center justify-center font-bold text-lg shadow-sm">
                        D
                    </div>

                    <div>
                        <h1 className="text-lg font-bold text-[#f4efe3] leading-tight">
                            Test Creator Portal
                        </h1>

                        <p className="text-[11px] text-[#a8c2b7] tracking-wide">
                            DexMy Education
                        </p>
                    </div>

                </div>


                {/* RIGHT HEADER */}
                <div className="flex items-center gap-3">

                    {/* NOTIFICATIONS */}
                    <div ref={notificationRef} className="relative">

                        <button
                            type="button"
                            onClick={() => {
                                setShowNotifications((prev) => !prev);
                                setShowTeacherMenu(false);
                            }}
                            className="relative w-10 h-10 rounded-xl border border-[#3c5d50] bg-[#12382b] text-[#f4efe3] hover:bg-[#174535] hover:border-[#4d6d60] flex items-center justify-center transition-all"
                        >
                            <span className="text-base">♧</span>

                            {notifications.length > 0 && (
                                <span className="absolute -top-1.5 -right-1.5 min-w-[18px] h-[18px] px-1 rounded-full bg-[#f5b91e] text-[#071a14] text-[10px] font-bold flex items-center justify-center border-2 border-[#0b211a]">
                                    {notifications.length}
                                </span>
                            )}
                        </button>


                        {/* NOTIFICATION DROPDOWN */}
                        {showNotifications && (
                            <div className="absolute right-0 top-full mt-3 w-[350px] max-w-[calc(100vw-24px)] bg-[#f8f7f2] border border-[#29463b] rounded-2xl shadow-2xl z-50 overflow-hidden">

                                <div className="px-5 py-4 bg-[#0b211a] border-b border-[#29463b] flex items-center justify-between">

                                    <div>
                                        <p className="text-[10px] font-bold tracking-[0.18em] uppercase text-[#f5b91e]">
                                            Updates
                                        </p>

                                        <h3 className="text-base font-bold text-[#f4efe3] mt-0.5">
                                            Notifications
                                        </h3>
                                    </div>

                                    <span className="text-xs font-semibold text-[#f5b91e]">
                                        {notifications.length} New
                                    </span>

                                </div>


                                <div className="max-h-[360px] overflow-y-auto">

                                    {notifications.length === 0 ? (

                                        <div className="p-9 text-center">

                                            <div className="mx-auto w-11 h-11 rounded-full bg-[#e8f0eb] text-[#0b5968] flex items-center justify-center text-lg mb-3">
                                                ♧
                                            </div>

                                            <p className="text-sm font-semibold text-[#172033]">
                                                No notifications
                                            </p>

                                            <p className="text-xs text-[#718079] mt-1">
                                                You're all caught up.
                                            </p>

                                        </div>

                                    ) : (

                                        notifications.map((notification) => (

                                            <div
                                                key={notification.id}
                                                className="px-5 py-3.5 border-b border-[#e3e8e4] hover:bg-[#fffaf0] transition"
                                            >

                                                <div className="flex gap-3">

                                                    <div
                                                        className={`w-9 h-9 shrink-0 rounded-xl flex items-center justify-center text-sm font-bold ${notification.type === "success"
                                                            ? "bg-[#e8f4ed] text-[#15803d]"
                                                            : notification.type === "question"
                                                                ? "bg-[#f1e9ff] text-[#7c3aed]"
                                                                : "bg-[#e8f0f2] text-[#0b5968]"
                                                            }`}
                                                    >
                                                        {notification.type === "success"
                                                            ? "✓"
                                                            : notification.type === "question"
                                                                ? "?"
                                                                : "i"}
                                                    </div>

                                                    <div className="min-w-0 flex-1">

                                                        <p className="text-sm font-semibold text-[#172033]">
                                                            {notification.title}
                                                        </p>

                                                        <p className="text-xs text-[#718079] mt-1 leading-5">
                                                            {notification.description}
                                                        </p>

                                                        <p className="text-[11px] text-[#9aa7a1] mt-1.5">
                                                            {notification.time}
                                                        </p>

                                                    </div>

                                                </div>

                                            </div>

                                        ))

                                    )}

                                </div>


                                <div className="p-3 border-t border-[#d7dfda] bg-[#f8f7f2]">

                                    <button
                                        type="button"
                                        className="w-full py-2.5 rounded-lg text-sm font-semibold text-[#0b5968] hover:bg-[#e8f0f2] transition"
                                    >
                                        View All Notifications
                                    </button>

                                </div>

                            </div>
                        )}

                    </div>


                    {/* TEACHER PROFILE */}
                    <div ref={teacherMenuRef} className="relative">

                        <button
                            type="button"
                            onClick={() => {
                                setShowTeacherMenu((prev) => !prev);
                                setShowNotifications(false);
                            }}
                            className="flex items-center gap-3 rounded-xl px-2 py-1.5 hover:bg-[#12382b] transition text-left"
                        >

                            {teacherProfile.photo ? (

                                <img
                                    src={teacherProfile.photo}
                                    alt="Profile"
                                    className="w-9 h-9 rounded-full object-cover border border-[#587266]"
                                />

                            ) : (

                                <div className="w-9 h-9 rounded-full bg-[#f5b91e] text-[#071a14] flex items-center justify-center font-bold">
                                    {teacherProfile.fullName
                                        ? teacherProfile.fullName.charAt(0).toUpperCase()
                                        : "T"}
                                </div>

                            )}

                            <div className="hidden sm:block">

                                <p className="text-sm font-semibold text-[#f4efe3]">
                                    {teacherProfile.fullName || "Teacher"}
                                </p>

                                <p className="text-xs text-[#a8c2b7]">
                                    {teacherProfile.designation || "Teacher"}
                                </p>

                            </div>

                            <span className="hidden sm:block text-[#a8c2b7] text-xs">
                                ▾
                            </span>

                        </button>


                        {/* PROFILE DROPDOWN */}
                        {showTeacherMenu && (
                            <div className="absolute right-0 top-full mt-3 w-[310px] bg-[#f8f7f2] border border-[#29463b] rounded-2xl shadow-2xl z-50 overflow-hidden">

                                <div className="p-5 bg-[#0b211a] border-b border-[#29463b]">

                                    <div className="flex items-center gap-3">

                                        <div className="w-12 h-12 shrink-0 rounded-full bg-[#f5b91e] text-[#071a14] flex items-center justify-center font-bold overflow-hidden">

                                            {teacherProfile.photo ? (

                                                <img
                                                    src={teacherProfile.photo}
                                                    alt="Profile"
                                                    className="w-full h-full object-cover"
                                                />

                                            ) : (

                                                teacherProfile.fullName
                                                    ? teacherProfile.fullName.charAt(0).toUpperCase()
                                                    : "T"

                                            )}

                                        </div>

                                        <div className="min-w-0">

                                            <div className="flex items-center gap-2">

                                                <h3 className="font-bold text-[#f4efe3] truncate">
                                                    {teacherProfile.fullName || "Teacher"}
                                                </h3>

                                                <span className="text-[9px] font-bold text-[#071a14] bg-[#f5b91e] px-1.5 py-0.5 rounded-full">
                                                    ACTIVE
                                                </span>

                                            </div>

                                            <p className="text-xs text-[#a8c2b7] mt-1 truncate">
                                                {teacherProfile.designation || "Teacher"}
                                            </p>

                                        </div>

                                    </div>

                                </div>


                                <div className="p-4">

                                    <div className="grid grid-cols-2 gap-2">

                                        <div className="rounded-xl bg-white border border-[#d7dfda] p-3">
                                            <p className="text-[9px] uppercase tracking-wider text-[#8a9691]">
                                                Email
                                            </p>

                                            <p className="text-xs font-medium text-[#172033] truncate mt-1">
                                                {teacherProfile.email || "Not added"}
                                            </p>
                                        </div>

                                        <div className="rounded-xl bg-white border border-[#d7dfda] p-3">
                                            <p className="text-[9px] uppercase tracking-wider text-[#8a9691]">
                                                Mobile
                                            </p>

                                            <p className="text-xs font-medium text-[#172033] truncate mt-1">
                                                {teacherProfile.mobile || "Not added"}
                                            </p>
                                        </div>

                                        <div className="rounded-xl bg-white border border-[#d7dfda] p-3">
                                            <p className="text-[9px] uppercase tracking-wider text-[#8a9691]">
                                                Department
                                            </p>

                                            <p className="text-xs font-medium text-[#172033] truncate mt-1">
                                                {teacherProfile.department || "Not added"}
                                            </p>
                                        </div>

                                        <div className="rounded-xl bg-white border border-[#d7dfda] p-3">
                                            <p className="text-[9px] uppercase tracking-wider text-[#8a9691]">
                                                City
                                            </p>

                                            <p className="text-xs font-medium text-[#172033] truncate mt-1">
                                                {teacherProfile.city || "Not added"}
                                            </p>
                                        </div>

                                    </div>

                                </div>


                                <div className="px-4 pb-4">

                                    <button
                                        type="button"
                                        onClick={() => window.open("/profile", "_blank")}
                                        className="w-full h-10 rounded-xl bg-[#f5b91e] hover:bg-[#ffcf26] text-[#071a14] text-sm font-bold transition-all hover:-translate-y-[1px] hover:shadow-md"
                                    >
                                        View Profile
                                    </button>

                                </div>

                            </div>
                        )}

                    </div>

                </div>

            </header>


            {/* =====================================================
            BODY
        ===================================================== */}
            <div className="flex min-h-[calc(100vh-68px)]">


                {/* =================================================
                SIDEBAR
            ================================================= */}
                <aside className="hidden md:flex w-64 bg-[#0b211a] border-r border-[#29463b] flex-col">

                    <nav className="p-4">

                        <p className="px-3 mb-3 text-[10px] font-bold tracking-[0.18em] uppercase text-[#6f8b80]">
                            Main Menu
                        </p>


                        {/* DASHBOARD */}
                        <button
                            type="button"
                            className="w-full flex items-center gap-3 px-3.5 py-3 rounded-xl bg-[#f5b91e] text-[#071a14] font-bold text-sm shadow-sm"
                        >
                            <span className="w-7 h-7 rounded-lg bg-[#071a14]/10 flex items-center justify-center">
                                ▦
                            </span>

                            Dashboard
                        </button>


                        {/* CREATE TEST */}
                        <button
                            onClick={() => navigate("/test-creator/tests/create")}
                            type="button"
                            className="w-full flex items-center gap-3 px-3.5 py-3 rounded-xl text-[#c4d4cd] hover:bg-[#12382b] hover:text-[#f4efe3] text-sm mt-1.5 transition"
                        >
                            <span className="w-7 h-7 rounded-lg bg-[#12382b] flex items-center justify-center text-[#f5b91e]">
                                +
                            </span>

                            Create Test
                        </button>


                        {/* MY TESTS */}
                        <button
                            onClick={() => navigate("/test-creator/tests")}
                            type="button"
                            className="w-full flex items-center gap-3 px-3.5 py-3 rounded-xl text-[#c4d4cd] hover:bg-[#12382b] hover:text-[#f4efe3] text-sm mt-1.5 transition"
                        >
                            <span className="w-7 h-7 rounded-lg bg-[#12382b] flex items-center justify-center text-[#f5b91e]">
                                □
                            </span>

                            My Tests
                        </button>


                        {/* QUESTION BANK */}
                        <button
                            onClick={() => navigate("/test-creator/questions")}
                            type="button"
                            className="w-full flex items-center gap-3 px-3.5 py-3 rounded-xl text-[#c4d4cd] hover:bg-[#12382b] hover:text-[#f4efe3] text-sm mt-1.5 transition"
                        >
                            <span className="w-7 h-7 rounded-lg bg-[#12382b] flex items-center justify-center text-[#f5b91e]">
                                ?
                            </span>

                            Question Bank
                        </button>
                        <button
                            onClick={() => navigate("/test-creator/results")}
                            type="button"
                            className="w-full flex items-center gap-3 px-3.5 py-3 rounded-xl text-[#c4d4cd] hover:bg-[#12382b] hover:text-[#f4efe3] text-sm mt-1.5 transition"
                        >
                            <span className="w-7 h-7 rounded-lg bg-[#12382b] flex items-center justify-center text-[#f5b91e]">
                                📊
                            </span>

                            <span>
                                Test Results
                            </span>
                        </button>

                    </nav>


                    {/* SIDEBAR BOTTOM */}
                    <div className="mt-auto p-4 border-t border-[#29463b]">

                        <button
                            onClick={() => window.open("/profile", "_blank")}
                            type="button"
                            className="w-full flex items-center gap-3 px-3.5 py-3 rounded-xl text-[#c4d4cd] hover:bg-[#12382b] hover:text-[#f4efe3] text-sm transition"
                        >
                            <span className="w-7 h-7 rounded-lg bg-[#12382b] flex items-center justify-center">
                                ⚙
                            </span>

                            Settings
                        </button>


                        <button
                            type="button"
                            className="w-full flex items-center gap-3 px-3.5 py-3 rounded-xl text-[#dca89a] hover:bg-[#45231d] hover:text-[#f0b4a5] text-sm mt-1 transition"
                        >
                            <span className="w-7 h-7 rounded-lg bg-[#45231d] flex items-center justify-center">
                                ↪
                            </span>

                            Logout
                        </button>

                    </div>

                </aside>


                {/* =================================================
                MAIN CONTENT
            ================================================= */}
                <main className="flex-1 min-w-0 overflow-y-auto bg-[#f5f7f4]">

                    <div className="max-w-[1500px] mx-auto p-5 lg:p-8">


                        {/* PAGE INTRO */}
                        <div className="mb-7">

                            <p className="text-[11px] font-bold tracking-[0.18em] uppercase text-[#0b5968]">
                                Teacher Dashboard
                            </p>

                            <h2 className="mt-1 text-3xl lg:text-[34px] font-bold text-[#0b211a]">
                                Good morning, Teacher
                                <span className="text-[#f0ad00] ml-2">👋</span>
                            </h2>

                            <p className="text-sm text-[#718079] mt-1.5 max-w-2xl">
                                Manage your exams, questions and assessments from one place.
                            </p>

                        </div>


                        {/* =================================================
                        STAT CARDS
                    ================================================= */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 mb-7">


                            {/* TOTAL EXAMS */}
                            <div className="group bg-[#f8f7f2] border border-[#d7dfda] rounded-2xl p-5 hover:border-[#b8c8c1] hover:-translate-y-[2px] hover:shadow-lg transition-all duration-200">

                                <div className="flex items-start justify-between">

                                    <div>

                                        <p className="text-xs font-semibold text-[#718079]">
                                            Total Exams
                                        </p>

                                        <p className="text-3xl font-bold text-[#0b211a] mt-2">
                                            {loading ? "..." : stats.totalExams}
                                        </p>

                                    </div>

                                    <div className="w-11 h-11 rounded-xl bg-[#e8f0eb] text-[#0b5968] flex items-center justify-center text-lg">
                                        □
                                    </div>

                                </div>

                                <div className="mt-4 h-px bg-[#e2e8e4]" />

                                <p className="text-[11px] text-[#8a9691] mt-3">
                                    All created exams
                                </p>

                            </div>


                            {/* TOTAL QUESTIONS */}
                            <div className="group bg-[#f8f7f2] border border-[#d7dfda] rounded-2xl p-5 hover:border-[#b8c8c1] hover:-translate-y-[2px] hover:shadow-lg transition-all duration-200">

                                <div className="flex items-start justify-between">

                                    <div>

                                        <p className="text-xs font-semibold text-[#718079]">
                                            Total Questions
                                        </p>

                                        <p className="text-3xl font-bold text-[#0b211a] mt-2">
                                            {loading ? "..." : stats.totalQuestions}
                                        </p>

                                    </div>

                                    <div className="w-11 h-11 rounded-xl bg-[#f1e9ff] text-[#7c3aed] flex items-center justify-center text-lg">
                                        ?
                                    </div>

                                </div>

                                <div className="mt-4 h-px bg-[#e2e8e4]" />

                                <p className="text-[11px] text-[#8a9691] mt-3">
                                    Questions in question bank
                                </p>

                            </div>


                            {/* PUBLISHED */}
                            <div className="group bg-[#f8f7f2] border border-[#d7dfda] rounded-2xl p-5 hover:border-[#b8c8c1] hover:-translate-y-[2px] hover:shadow-lg transition-all duration-200">

                                <div className="flex items-start justify-between">

                                    <div>

                                        <p className="text-xs font-semibold text-[#718079]">
                                            Published Exams
                                        </p>

                                        <p className="text-3xl font-bold text-[#0b211a] mt-2">
                                            {loading ? "..." : stats.publishedExams}
                                        </p>

                                    </div>

                                    <div className="w-11 h-11 rounded-xl bg-[#e8f4ed] text-[#16805a] flex items-center justify-center text-lg">
                                        ✓
                                    </div>

                                </div>

                                <div className="mt-4 h-px bg-[#e2e8e4]" />

                                <p className="text-[11px] text-[#8a9691] mt-3">
                                    Currently available
                                </p>

                            </div>


                            {/* DRAFT */}
                            <div className="group bg-[#f8f7f2] border border-[#d7dfda] rounded-2xl p-5 hover:border-[#b8c8c1] hover:-translate-y-[2px] hover:shadow-lg transition-all duration-200">

                                <div className="flex items-start justify-between">

                                    <div>

                                        <p className="text-xs font-semibold text-[#718079]">
                                            Draft Exams
                                        </p>

                                        <p className="text-3xl font-bold text-[#0b211a] mt-2">
                                            {loading ? "..." : stats.draftExams}
                                        </p>

                                    </div>

                                    <div className="w-11 h-11 rounded-xl bg-[#fff3d6] text-[#b86b00] flex items-center justify-center text-lg">
                                        ✎
                                    </div>

                                </div>

                                <div className="mt-4 h-px bg-[#e2e8e4]" />

                                <p className="text-[11px] text-[#8a9691] mt-3">
                                    Not published yet
                                </p>

                            </div>

                        </div>


                        {/* =================================================
                        CONTENT GRID
                    ================================================= */}
                        <div className="grid grid-cols-1 xl:grid-cols-3 gap-5">


                            {/* RECENT EXAMS */}
                            <div className="xl:col-span-2 bg-[#f8f7f2] border border-[#d7dfda] rounded-2xl overflow-hidden shadow-sm">

                                <div className="px-5 py-5 border-b border-[#d7dfda] flex items-center justify-between">

                                    <div>

                                        <p className="text-[10px] font-bold tracking-[0.16em] uppercase text-[#0b5968]">
                                            Activity
                                        </p>

                                        <h3 className="font-bold text-lg text-[#0b211a] mt-0.5">
                                            Recent Exams
                                        </h3>

                                        <p className="text-xs text-[#718079] mt-1">
                                            Your recently created exams
                                        </p>

                                    </div>

                                    <button
                                        type="button"
                                        onClick={() => navigate("/exams")}
                                        className="px-4 py-2 rounded-lg border border-[#b8c8c1] text-[#0b5968] text-sm font-semibold hover:bg-[#0b5968] hover:text-white hover:border-[#0b5968] transition"
                                    >
                                        View All
                                    </button>

                                </div>


                                <div className="divide-y divide-[#e5e9e6]">

                                    {exams.length === 0 ? (

                                        <div className="p-10 text-center">

                                            <div className="mx-auto w-12 h-12 rounded-xl bg-[#e8f0eb] text-[#0b5968] flex items-center justify-center text-lg mb-3">
                                                □
                                            </div>

                                            <p className="text-sm font-semibold text-[#172033]">
                                                No exams created yet.
                                            </p>

                                            <p className="text-xs text-[#8a9691] mt-1">
                                                Create your first exam to get started.
                                            </p>

                                        </div>

                                    ) : (

                                        exams.slice(0, 5).map((exam) => (

                                            <div
                                                key={exam._id}
                                                className="px-5 py-4 flex items-center justify-between gap-4 hover:bg-[#fffaf0] transition"
                                            >

                                                <div className="flex items-center gap-4 min-w-0">

                                                    <div className="w-10 h-10 shrink-0 rounded-xl bg-[#e8f0eb] text-[#0b5968] flex items-center justify-center">
                                                        □
                                                    </div>

                                                    <div className="min-w-0">

                                                        <h4 className="font-semibold text-sm text-[#172033] truncate">
                                                            {exam.title}
                                                        </h4>

                                                        <p className="text-xs text-[#718079] mt-1 truncate">
                                                            {exam.subject || "General"} ·{" "}
                                                            {exam.duration} minutes ·{" "}
                                                            {exam.totalQuestions ||
                                                                exam.questions?.length ||
                                                                0}{" "}
                                                            questions
                                                        </p>

                                                    </div>

                                                </div>


                                                <span
                                                    className={`shrink-0 px-3 py-1 rounded-full text-[11px] font-bold ${exam.isPublished
                                                        ? "bg-[#e8f4ed] text-[#16805a] border border-[#b9dbc7]"
                                                        : "bg-[#fff3d6] text-[#a76300] border border-[#f0d18a]"
                                                        }`}
                                                >
                                                    {exam.isPublished ? "Published" : "Draft"}
                                                </span>

                                            </div>

                                        ))

                                    )}

                                </div>

                            </div>


                            {/* QUICK ACTIONS */}
                            <div className="bg-[#f8f7f2] border border-[#d7dfda] rounded-2xl overflow-hidden shadow-sm">

                                <div className="px-5 py-5 border-b border-[#d7dfda]">

                                    <p className="text-[10px] font-bold tracking-[0.16em] uppercase text-[#0b5968]">
                                        Shortcuts
                                    </p>

                                    <h3 className="font-bold text-lg text-[#0b211a] mt-0.5">
                                        Quick Actions
                                    </h3>

                                    <p className="text-xs text-[#718079] mt-1">
                                        Frequently used actions
                                    </p>

                                </div>


                                <div className="p-4 space-y-3">


                                    {/* CREATE TEST */}
                                    <button
                                        onClick={() => navigate("/test-creator/tests/create")}
                                        type="button"
                                        className="group w-full flex items-center gap-3 p-3.5 rounded-xl border border-[#d7dfda] bg-white hover:border-[#f5b91e] hover:bg-[#fffaf0] transition text-left"
                                    >

                                        <div className="w-10 h-10 shrink-0 rounded-xl bg-[#0b211a] text-[#f5b91e] flex items-center justify-center text-lg font-bold group-hover:bg-[#f5b91e] group-hover:text-[#071a14] transition">
                                            +
                                        </div>

                                        <div>

                                            <p className="text-sm font-bold text-[#172033]">
                                                Create Test
                                            </p>

                                            <p className="text-xs text-[#718079] mt-0.5">
                                                Start a new assessment
                                            </p>

                                        </div>

                                    </button>


                                    {/* ADD QUESTION */}
                                    <button
                                        onClick={() => navigate("/test-creator/questions/add")}
                                        type="button"
                                        className="group w-full flex items-center gap-3 p-3.5 rounded-xl border border-[#d7dfda] bg-white hover:border-[#f5b91e] hover:bg-[#fffaf0] transition text-left"
                                    >

                                        <div className="w-10 h-10 shrink-0 rounded-xl bg-[#0b5968] text-white flex items-center justify-center text-lg font-bold group-hover:bg-[#f5b91e] group-hover:text-[#071a14] transition">
                                            +
                                        </div>

                                        <div>

                                            <p className="text-sm font-bold text-[#172033]">
                                                Add Question
                                            </p>

                                            <p className="text-xs text-[#718079] mt-0.5">
                                                Add to question bank
                                            </p>

                                        </div>

                                    </button>


                                    {/* MANAGE TESTS */}
                                    <button
                                        onClick={() => navigate("/test-creator/tests")}
                                        type="button"
                                        className="group w-full flex items-center gap-3 p-3.5 rounded-xl border border-[#d7dfda] bg-white hover:border-[#f5b91e] hover:bg-[#fffaf0] transition text-left"
                                    >

                                        <div className="w-10 h-10 shrink-0 rounded-xl bg-[#f1e9ff] text-[#7c3aed] flex items-center justify-center text-lg font-bold group-hover:bg-[#f5b91e] group-hover:text-[#071a14] transition">
                                            □
                                        </div>

                                        <div>

                                            <p className="text-sm font-bold text-[#172033]">
                                                Manage Tests
                                            </p>

                                            <p className="text-xs text-[#718079] mt-0.5">
                                                View, edit and publish tests
                                            </p>

                                        </div>

                                    </button>

                                    {/* VIEW RESULTS */}
                                    <button
                                        onClick={() => navigate("/test-creator/results")}
                                        type="button"
                                        className="group w-full flex items-center gap-3 p-3.5 rounded-xl border border-[#d7dfda] bg-white hover:border-[#f5b91e] hover:bg-[#fffaf0] transition text-left"
                                    >

                                        <div className="w-10 h-10 shrink-0 rounded-xl bg-[#e8f4ed] text-[#16805a] flex items-center justify-center text-lg font-bold group-hover:bg-[#f5b91e] group-hover:text-[#071a14] transition">
                                            📊
                                        </div>

                                        <div>

                                            <p className="text-sm font-bold text-[#172033]">
                                                View Results
                                            </p>

                                            <p className="text-xs text-[#718079] mt-0.5">
                                                Student performance & scores
                                            </p>

                                        </div>

                                    </button>

                                </div>

                            </div>

                        </div>

                    </div>

                </main>

            </div>

        </div>
    );
}

export default TestCreatorDashboard;