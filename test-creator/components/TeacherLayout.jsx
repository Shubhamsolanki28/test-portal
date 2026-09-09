import { useEffect, useRef, useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";


function TeacherLayout({ children }) {
    const navigate = useNavigate();

    const [showTeacherMenu, setShowTeacherMenu] = useState(false);
    const [showNotifications, setShowNotifications] = useState(false);

    const [notifications, setNotifications] = useState([]);

    const [teacherProfile, setTeacherProfile] = useState({
        fullName: "",
        email: "",
        mobile: "",
        designation: "",
        department: "",
        city: "",
        photo: "",
    });

    const teacherMenuRef = useRef(null);
    const notificationRef = useRef(null);

    // =====================================================
    // LOAD TEACHER PROFILE
    // =====================================================

    useEffect(() => {
        const loadTeacherProfile = () => {
            const savedProfile = localStorage.getItem("teacherProfile");

            if (!savedProfile) return;

            try {
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
            } catch (error) {
                console.error("Failed to load teacher profile:", error);
            }
        };

        loadTeacherProfile();
    }, []);

    // =====================================================
    // LOAD NOTIFICATIONS
    // =====================================================

    useEffect(() => {
        const loadNotifications = () => {
            try {
                const savedNotifications =
                    JSON.parse(
                        localStorage.getItem("teacherNotifications")
                    ) || [];

                setNotifications(savedNotifications);
            } catch (error) {
                console.error("Failed to load notifications:", error);
                setNotifications([]);
            }
        };

        loadNotifications();

        const handleStorageChange = (event) => {
            if (event.key === "teacherNotifications") {
                loadNotifications();
            }

            if (event.key === "teacherProfile") {
                const savedProfile =
                    localStorage.getItem("teacherProfile");

                if (savedProfile) {
                    try {
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
                    } catch {
                        // Ignore invalid profile data
                    }
                }
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

    // =====================================================
    // CLOSE DROPDOWNS ON OUTSIDE CLICK
    // =====================================================

    useEffect(() => {
        const handleOutsideClick = (event) => {
            if (
                teacherMenuRef.current &&
                !teacherMenuRef.current.contains(event.target)
            ) {
                setShowTeacherMenu(false);
            }

            if (
                notificationRef.current &&
                !notificationRef.current.contains(event.target)
            ) {
                setShowNotifications(false);
            }
        };

        document.addEventListener(
            "mousedown",
            handleOutsideClick
        );

        return () => {
            document.removeEventListener(
                "mousedown",
                handleOutsideClick
            );
        };
    }, []);

    // =====================================================
    // PROFILE INITIAL
    // =====================================================

    const teacherInitial =
        teacherProfile.fullName
            ? teacherProfile.fullName.charAt(0).toUpperCase()
            : "T";

    // =====================================================
    // NAVIGATION ITEM
    // =====================================================

    const navItems = [
        {
            label: "Dashboard",
            path: "/test-creator",
            icon: "▦",
        },
        {
            label: "Create Test",
            path: "/test-creator/tests/create",
            icon: "+",
        },
        { 
            label: "My Tests", 
            path: "/test-creator/tests", 
            icon: "□" 
        },
        {
            label: "Question Bank",
            path: "/test-creator/questions",
            icon: "?",
        },
        {
            label: "Test Results",
            path: "/test-creator/results",
            icon: "📊",
        },
    ];

    // =====================================================
    // LOGOUT
    // =====================================================

    const handleLogout = () => {
        localStorage.removeItem("teacherToken");

        navigate("/login");
    };

    return (
        <div className="min-h-screen bg-[#f5f7f4] text-[#172033]">

            {/* =================================================
          TOP HEADER
      ================================================= */}

            <header className="h-16 shrink-0 bg-[#0b211a] border-b border-[#29463b] text-[#f4efe3] flex items-center justify-between px-4 sm:px-6 lg:px-8">

                {/* BRAND */}

                <div className="flex items-center gap-3 min-w-0">

                    <div className="w-9 h-9 shrink-0 rounded-lg bg-[#f5b91e] text-[#071a14] flex items-center justify-center font-extrabold text-lg">
                        D
                    </div>

                    <div className="min-w-0">

                        <h1 className="font-bold text-[17px] leading-tight truncate">
                            Teacher Portal
                        </h1>

                        <p className="text-[11px] text-[#a8c2b7] hidden sm:block">
                            DexMy Education
                        </p>

                    </div>

                </div>


                {/* HEADER RIGHT */}

                <div className="flex items-center gap-2 sm:gap-4">

                    {/* =================================================
              NOTIFICATIONS
          ================================================= */}

                    <div
                        ref={notificationRef}
                        className="relative"
                    >

                        <button
                            type="button"
                            onClick={() => {
                                setShowNotifications((prev) => !prev);
                                setShowTeacherMenu(false);
                            }}
                            className="relative w-9 h-9 rounded-lg border border-[#3c5d50] bg-[#123025] text-[#f4efe3] flex items-center justify-center hover:bg-[#1a3b2e] hover:border-[#f5b91e] transition-all duration-200"
                        >

                            <span className="text-[17px]">
                                ♧
                            </span>

                            {notifications.length > 0 && (
                                <span className="absolute -top-1.5 -right-1.5 min-w-[17px] h-[17px] px-1 rounded-full bg-[#f5b91e] text-[#071a14] text-[9px] font-extrabold flex items-center justify-center border-2 border-[#0b211a]">
                                    {notifications.length}
                                </span>
                            )}

                        </button>


                        {/* NOTIFICATION DROPDOWN */}

                        {showNotifications && (
                            <div className="absolute right-0 top-full mt-2 w-[330px] max-w-[calc(100vw-24px)] bg-[#f8f7f2] border border-[#29463b] rounded-2xl shadow-2xl z-[100] overflow-hidden">

                                <div className="px-4 py-4 bg-[#0b211a] text-[#f4efe3] flex items-center justify-between">

                                    <div>
                                        <h3 className="font-semibold">
                                            Notifications
                                        </h3>

                                        <p className="text-[11px] text-[#a8c2b7] mt-0.5">
                                            Recent activity
                                        </p>
                                    </div>

                                    {notifications.length > 0 && (
                                        <span className="text-[11px] font-bold text-[#071a14] bg-[#f5b91e] px-2 py-1 rounded-full">
                                            {notifications.length} New
                                        </span>
                                    )}

                                </div>


                                <div className="max-h-[350px] overflow-y-auto">

                                    {notifications.length === 0 ? (

                                        <div className="p-8 text-center">

                                            <div className="w-11 h-11 mx-auto rounded-full bg-[#e8f0eb] text-[#0b211a] flex items-center justify-center text-xl mb-3">
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
                                                className="px-4 py-3 border-b border-[#e3e8e4] hover:bg-[#f1f5f2] transition"
                                            >

                                                <div className="flex gap-3">

                                                    <div
                                                        className={`w-9 h-9 shrink-0 rounded-lg flex items-center justify-center text-sm font-bold ${notification.type === "success"
                                                            ? "bg-[#e8f4ed] text-[#177245]"
                                                            : notification.type === "question"
                                                                ? "bg-[#f1e9ff] text-[#6d28d9]"
                                                                : "bg-[#e8f0ff] text-[#315aa8]"
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

                                                        <p className="text-[10px] text-[#9aa7a1] mt-1.5">
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
                                        className="w-full py-2 rounded-lg text-xs font-bold text-[#0b5968] hover:bg-[#e8f0eb] transition"
                                    >
                                        View All Notifications
                                    </button>

                                </div>

                            </div>
                        )}

                    </div>


                    {/* =================================================
              TEACHER PROFILE
          ================================================= */}

                    <div
                        ref={teacherMenuRef}
                        className="relative"
                    >

                        <button
                            type="button"
                            onClick={() => {
                                setShowTeacherMenu((prev) => !prev);
                                setShowNotifications(false);
                            }}
                            className="flex items-center gap-2.5 rounded-xl px-2 py-1.5 hover:bg-[#123025] transition text-left"
                        >

                            {/* PROFILE PHOTO */}

                            <div className="w-9 h-9 shrink-0 rounded-full bg-[#f5b91e] text-[#071a14] flex items-center justify-center font-bold overflow-hidden">

                                {teacherProfile.photo ? (

                                    <img
                                        src={teacherProfile.photo}
                                        alt="Profile"
                                        className="w-full h-full object-cover"
                                    />

                                ) : (

                                    teacherInitial

                                )}

                            </div>


                            <div className="hidden sm:block">

                                <p className="text-sm font-semibold text-[#f4efe3] max-w-[150px] truncate">
                                    {teacherProfile.fullName || "Teacher"}
                                </p>

                                <p className="text-[11px] text-[#a8c2b7] max-w-[150px] truncate">
                                    {teacherProfile.designation || "Teacher"}
                                </p>

                            </div>

                            <span className="text-[#a8c2b7] text-xs">
                                ▼
                            </span>

                        </button>


                        {/* PROFILE DROPDOWN */}

                        {showTeacherMenu && (
                            <div className="absolute right-0 top-full mt-2 w-[310px] max-w-[calc(100vw-24px)] bg-[#f8f7f2] border border-[#29463b] rounded-2xl shadow-2xl z-[100] overflow-hidden">

                                {/* PROFILE HEADER */}

                                <div className="p-4 bg-[#0b211a] text-[#f4efe3]">

                                    <div className="flex items-center gap-3">

                                        <div className="w-12 h-12 shrink-0 rounded-full bg-[#f5b91e] text-[#071a14] flex items-center justify-center font-bold overflow-hidden">

                                            {teacherProfile.photo ? (

                                                <img
                                                    src={teacherProfile.photo}
                                                    alt="Profile"
                                                    className="w-full h-full object-cover"
                                                />

                                            ) : (

                                                teacherInitial

                                            )}

                                        </div>


                                        <div className="min-w-0">

                                            <div className="flex items-center gap-2">

                                                <h3 className="font-semibold truncate">
                                                    {teacherProfile.fullName || "Teacher"}
                                                </h3>

                                                <span className="text-[9px] font-bold text-[#177245] bg-[#e8f4ed] px-1.5 py-0.5 rounded-full">
                                                    Active
                                                </span>

                                            </div>

                                            <p className="text-xs text-[#a8c2b7] mt-0.5 truncate">
                                                {teacherProfile.designation || "Teacher"}
                                            </p>

                                        </div>

                                    </div>

                                </div>


                                {/* DETAILS */}

                                <div className="p-3">

                                    <div className="grid grid-cols-2 gap-2">

                                        <div className="rounded-xl bg-white border border-[#d7dfda] p-2.5">

                                            <p className="text-[9px] uppercase tracking-wider text-[#8a9891]">
                                                Email
                                            </p>

                                            <p className="text-xs font-medium text-[#172033] truncate mt-1">
                                                {teacherProfile.email || "Not added"}
                                            </p>

                                        </div>


                                        <div className="rounded-xl bg-white border border-[#d7dfda] p-2.5">

                                            <p className="text-[9px] uppercase tracking-wider text-[#8a9891]">
                                                Mobile
                                            </p>

                                            <p className="text-xs font-medium text-[#172033] truncate mt-1">
                                                {teacherProfile.mobile || "Not added"}
                                            </p>

                                        </div>


                                        <div className="rounded-xl bg-white border border-[#d7dfda] p-2.5">

                                            <p className="text-[9px] uppercase tracking-wider text-[#8a9891]">
                                                Department
                                            </p>

                                            <p className="text-xs font-medium text-[#172033] truncate mt-1">
                                                {teacherProfile.department || "Not added"}
                                            </p>

                                        </div>


                                        <div className="rounded-xl bg-white border border-[#d7dfda] p-2.5">

                                            <p className="text-[9px] uppercase tracking-wider text-[#8a9891]">
                                                City
                                            </p>

                                            <p className="text-xs font-medium text-[#172033] truncate mt-1">
                                                {teacherProfile.city || "Not added"}
                                            </p>

                                        </div>

                                    </div>

                                </div>


                                {/* PROFILE BUTTON */}

                                <div className="px-3 pb-3">

                                    <button
                                        type="button"
                                        onClick={() => window.open("/profile", "_blank")}
                                        className="w-full h-10 rounded-lg bg-[#0b211a] text-[#f4efe3] text-sm font-semibold border border-[#29463b] hover:bg-[#f5b91e] hover:text-[#071a14] hover:border-[#f5b91e] transition-all duration-200"
                                    >
                                        View Profile
                                    </button>

                                </div>

                            </div>
                        )}

                    </div>

                </div>

            </header>


            {/* =================================================
          PAGE AREA
      ================================================= */}

            <div className="flex min-h-[calc(100vh-4rem)]">


                {/* =================================================
            SIDEBAR
        ================================================= */}

                <aside className="hidden md:flex w-[245px] shrink-0 bg-[#f8f7f2] border-r border-[#d7dfda] flex-col">

                    <nav className="p-4">

                        <p className="text-[10px] font-bold tracking-[0.16em] uppercase text-[#8a9891] px-3 mb-3">
                            Main Menu
                        </p>


                        <div className="space-y-1">

                            {navItems.map((item) => (

                                <NavLink
                                    key={item.path}
                                    to={item.path}
                                    className={({ isActive }) =>
                                        `group w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm transition-all duration-200 ${isActive
                                            ? "bg-[#0b211a] text-[#f4efe3] shadow-sm"
                                            : "text-[#52645c] hover:bg-[#e8eee9] hover:text-[#0b211a]"
                                        }`
                                    }
                                >

                                    {({ isActive }) => (
                                        <>
                                            <span
                                                className={`w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold ${isActive
                                                    ? "bg-[#f5b91e] text-[#071a14]"
                                                    : "bg-[#e8eee9] text-[#0b5968] group-hover:bg-[#dce7e0]"
                                                    }`}
                                            >
                                                {item.icon}
                                            </span>

                                            <span className="font-medium">
                                                {item.label}
                                            </span>
                                        </>
                                    )}

                                </NavLink>

                            ))}

                        </div>

                    </nav>


                    {/* SIDEBAR BOTTOM */}

                    <div className="mt-auto p-4 border-t border-[#d7dfda]">

                        <button
                            type="button"
                            onClick={() => window.open("/profile", "_blank")}
                            className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-[#52645c] hover:bg-[#e8eee9] hover:text-[#0b211a] text-sm transition"
                        >

                            <span className="w-8 h-8 rounded-lg bg-[#e8eee9] flex items-center justify-center">
                                ⚙
                            </span>

                            <span className="font-medium">
                                Settings
                            </span>

                        </button>


                        <button
                            type="button"
                            onClick={handleLogout}
                            className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-[#b34d42] hover:bg-[#faece9] text-sm mt-1 transition"
                        >

                            <span className="w-8 h-8 rounded-lg bg-[#faece9] flex items-center justify-center">
                                ↪
                            </span>

                            <span className="font-medium">
                                Logout
                            </span>

                        </button>

                    </div>

                </aside>


                {/* =================================================
            MAIN CONTENT
        ================================================= */}

                <main className="flex-1 min-w-0 overflow-x-hidden">
                    {children}
                </main>

            </div>

        </div>
    );
}

export default TeacherLayout;