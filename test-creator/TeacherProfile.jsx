import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

function TeacherProfile() {
    const navigate = useNavigate();

    const [profile, setProfile] = useState({
        fullName: "",
        email: "",
        mobile: "",
        dob: "",
        gender: "",
        designation: "",
        department: "",
        qualification: "",
        experience: "",
        address: "",
        city: "",
        state: "",
        pinCode: "",
        country: "India",
        photo: "",
    });

    const [saved, setSaved] = useState(false);

    // Load saved profile
    useEffect(() => {
        const savedProfile = localStorage.getItem("teacherProfile");

        if (savedProfile) {
            setProfile(JSON.parse(savedProfile));
        }
    }, []);

    const handleChange = (e) => {
        const { name, value } = e.target;

        setProfile((prev) => ({
            ...prev,
            [name]: value,
        }));

        setSaved(false);
    };

    const handlePhotoChange = (e) => {
        const file = e.target.files?.[0];

        if (!file) return;

        const reader = new FileReader();

        reader.onload = () => {
            setProfile((prev) => ({
                ...prev,
                photo: reader.result,
            }));

            setSaved(false);
        };

        reader.readAsDataURL(file);
    };

    const removePhoto = () => {
        setProfile((prev) => ({
            ...prev,
            photo: "",
        }));

        setSaved(false);
    };

    // Profile completion
    const completion = useMemo(() => {
        const fields = [
            "fullName",
            "email",
            "mobile",
            "dob",
            "gender",
            "designation",
            "department",
            "qualification",
            "experience",
            "address",
            "city",
            "state",
            "pinCode",
            "country",
            "photo",
        ];

        const completed = fields.filter(
            (field) => profile[field] && profile[field].toString().trim() !== ""
        ).length;

        return Math.round((completed / fields.length) * 100);
    }, [profile]);

    const handleSave = () => {
        localStorage.setItem("teacherProfile", JSON.stringify(profile));
        setSaved(true);
    };

    const handleCancel = () => {
        const savedProfile = localStorage.getItem("teacherProfile");

        if (savedProfile) {
            setProfile(JSON.parse(savedProfile));
        } else {
            setProfile({
                fullName: "",
                email: "",
                mobile: "",
                dob: "",
                gender: "",
                designation: "",
                department: "",
                qualification: "",
                experience: "",
                address: "",
                city: "",
                state: "",
                pinCode: "",
                country: "India",
                photo: "",
            });
        }

        setSaved(false);
    };

    const inputClass =
        "w-full h-11 rounded-lg border border-slate-700 bg-slate-900/70 px-3.5 text-sm text-white placeholder-slate-500 outline-none transition focus:border-blue-500 focus:ring-1 focus:ring-blue-500";

    const labelClass =
        "block text-sm font-medium text-slate-200 mb-2";

    return (
        <div className="min-h-screen bg-[#080f1d] text-white px-4 py-7 sm:px-6 lg:px-8">
            <div className="max-w-6xl mx-auto">

                {/* Header */}
                <div className="mb-7">
                    <h1 className="text-2xl sm:text-3xl font-bold text-white">
                        My Profile
                    </h1>

                    <p className="text-sm sm:text-base text-slate-400 mt-1">
                        Manage your personal and professional information.
                    </p>
                </div>

                {/* Main Profile Card */}
                <div className="rounded-xl border border-slate-800 bg-[#101827] p-4 sm:p-5 mb-6">
                    <div className="rounded-xl border border-slate-800 bg-gradient-to-r from-[#111b2c] via-[#111827] to-[#17122d] p-5 sm:p-6">

                        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5">

                            {/* Profile Photo */}
                            <div className="relative shrink-0">

                                <div className="w-32 h-32 rounded-full overflow-hidden border border-slate-600 bg-[#24334f] flex items-center justify-center shadow-lg">

                                    {profile.photo ? (
                                        <img
                                            src={profile.photo}
                                            alt="Teacher Profile"
                                            className="w-full h-full object-cover"
                                        />
                                    ) : (
                                        <span className="text-5xl font-semibold text-slate-300">
                                            {profile.fullName
                                                ? profile.fullName.charAt(0).toUpperCase()
                                                : "T"}
                                        </span>
                                    )}

                                </div>

                                {/* Edit Photo */}
                                <label className="absolute -bottom-1 -right-1 w-10 h-10 rounded-full bg-[#17243a] border border-blue-400 flex items-center justify-center cursor-pointer hover:bg-blue-600 transition shadow-lg">

                                    <span className="text-lg">✎</span>

                                    <input
                                        type="file"
                                        accept="image/*"
                                        onChange={handlePhotoChange}
                                        className="hidden"
                                    />

                                </label>

                            </div>


                            {/* Teacher Details */}
                            <div className="flex-1 min-w-0 w-full">

                                {/* Name + Status */}
                                <div className="flex flex-wrap items-center gap-3">

                                    <h2 className="text-2xl font-bold text-white">
                                        {profile.fullName || "Teacher Name"}
                                    </h2>

                                    <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/15 border border-emerald-500/25 px-3 py-1 text-xs font-semibold text-emerald-400">
                                        ✓ Active
                                    </span>

                                </div>


                                {/* Designation + Department */}
                                <p className="text-slate-300 mt-2">
                                    {profile.designation || "Teacher"}

                                    {profile.department && (
                                        <>
                                            <span className="mx-2 text-slate-600">•</span>
                                            {profile.department}
                                        </>
                                    )}
                                </p>


                                {/* Email */}
                                <p className="text-sm text-slate-400 mt-3">
                                    ✉{" "}
                                    {profile.email || "Email address not added"}
                                </p>


                                {/* Mobile / Department / City */}
                                <div className="flex flex-wrap gap-x-4 gap-y-2 mt-4 text-sm text-slate-400">

                                    <span>
                                        📞 {profile.mobile || "Not Added"}
                                    </span>

                                    <span className="text-slate-600">
                                        •
                                    </span>

                                    <span>
                                        🏫 {profile.department || "Department"}
                                    </span>

                                    <span className="text-slate-600">
                                        •
                                    </span>

                                    <span>
                                        📍 {profile.city || "City"}
                                    </span>

                                </div>


                                {/* Profile Completion */}
                                {completion > 0 && (
                                    <div className="mt-5 max-w-2xl">

                                        <div className="flex items-center justify-between mb-2">

                                            <span className="text-xs font-medium text-slate-400">
                                                Profile Completion
                                            </span>

                                            <span className="text-xs font-semibold text-blue-400">
                                                {completion}%
                                            </span>

                                        </div>

                                        <div className="h-2 rounded-full bg-slate-800 overflow-hidden">

                                            <div
                                                className="h-full rounded-full bg-gradient-to-r from-blue-600 to-indigo-500 transition-all duration-500"
                                                style={{
                                                    width: `${completion}%`,
                                                }}
                                            />

                                        </div>

                                    </div>
                                )}

                            </div>

                        </div>

                    </div>
                </div>

                {/* Personal Information */}
                <section className="rounded-xl border border-slate-800 bg-[#111a29] mb-5">

                    <div className="px-5 sm:px-6 py-5 border-b border-slate-800">

                        <div className="flex items-center gap-3">

                            <div className="w-10 h-10 rounded-full bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400">
                                ♙
                            </div>

                            <div>
                                <h3 className="font-semibold text-white">
                                    Personal Information
                                </h3>

                                <p className="text-sm text-slate-400 mt-1">
                                    Basic information about you.
                                </p>
                            </div>

                        </div>

                    </div>

                    <div className="p-5 sm:p-6 grid grid-cols-1 md:grid-cols-2 gap-5">

                        <div>
                            <label className={labelClass}>Full Name</label>

                            <input
                                name="fullName"
                                value={profile.fullName}
                                onChange={handleChange}
                                placeholder="Enter full name"
                                className={inputClass}
                            />
                        </div>

                        <div>
                            <label className={labelClass}>Email Address</label>

                            <input
                                type="email"
                                name="email"
                                value={profile.email}
                                onChange={handleChange}
                                placeholder="Enter email address"
                                className={inputClass}
                            />
                        </div>

                        <div>
                            <label className={labelClass}>Mobile Number</label>

                            <input
                                type="tel"
                                name="mobile"
                                value={profile.mobile}
                                onChange={handleChange}
                                placeholder="Enter mobile number"
                                className={inputClass}
                            />
                        </div>

                        <div>
                            <label className={labelClass}>Date of Birth</label>

                            <input
                                type="date"
                                name="dob"
                                value={profile.dob}
                                onChange={handleChange}
                                className={inputClass}
                            />
                        </div>

                        <div>
                            <label className={labelClass}>Gender</label>

                            <select
                                name="gender"
                                value={profile.gender}
                                onChange={handleChange}
                                className={inputClass}
                            >
                                <option value="" className="bg-slate-900">
                                    Select gender
                                </option>
                                <option value="Male" className="bg-slate-900">
                                    Male
                                </option>
                                <option value="Female" className="bg-slate-900">
                                    Female
                                </option>
                                <option value="Other" className="bg-slate-900">
                                    Other
                                </option>
                            </select>
                        </div>

                    </div>
                </section>

                {/* Professional Information */}
                <section className="rounded-xl border border-slate-800 bg-[#111a29] mb-5">

                    <div className="px-5 sm:px-6 py-5 border-b border-slate-800">

                        <div className="flex items-center gap-3">

                            <div className="w-10 h-10 rounded-full bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400">
                                💼
                            </div>

                            <div>
                                <h3 className="font-semibold text-white">
                                    Professional Information
                                </h3>

                                <p className="text-sm text-slate-400 mt-1">
                                    Information related to your teaching role.
                                </p>
                            </div>

                        </div>

                    </div>

                    <div className="p-5 sm:p-6 grid grid-cols-1 md:grid-cols-2 gap-5">

                        <div>
                            <label className={labelClass}>Designation</label>

                            <input
                                name="designation"
                                value={profile.designation}
                                onChange={handleChange}
                                placeholder="e.g. Senior Teacher"
                                className={inputClass}
                            />
                        </div>

                        <div>
                            <label className={labelClass}>
                                Department / Subject
                            </label>

                            <input
                                name="department"
                                value={profile.department}
                                onChange={handleChange}
                                placeholder="e.g. Computer Science"
                                className={inputClass}
                            />
                        </div>

                        <div>
                            <label className={labelClass}>Qualification</label>

                            <input
                                name="qualification"
                                value={profile.qualification}
                                onChange={handleChange}
                                placeholder="Enter qualification"
                                className={inputClass}
                            />
                        </div>

                        <div>
                            <label className={labelClass}>Experience</label>

                            <input
                                name="experience"
                                value={profile.experience}
                                onChange={handleChange}
                                placeholder="e.g. 5 Years"
                                className={inputClass}
                            />
                        </div>

                    </div>
                </section>

                {/* Contact Information */}
                <section className="rounded-xl border border-slate-800 bg-[#111a29] mb-5">

                    <div className="px-5 sm:px-6 py-5 border-b border-slate-800">

                        <div className="flex items-center gap-3">

                            <div className="w-10 h-10 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
                                📍
                            </div>

                            <div>
                                <h3 className="font-semibold text-white">
                                    Contact Information
                                </h3>

                                <p className="text-sm text-slate-400 mt-1">
                                    Your address and location details.
                                </p>
                            </div>

                        </div>

                    </div>

                    <div className="p-5 sm:p-6">

                        <div className="mb-5">

                            <label className={labelClass}>
                                Address
                            </label>

                            <textarea
                                name="address"
                                value={profile.address}
                                onChange={handleChange}
                                rows="3"
                                placeholder="Enter your complete address"
                                className={`${inputClass} h-auto py-3 resize-none`}
                            />

                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">

                            <div>
                                <label className={labelClass}>City</label>

                                <input
                                    name="city"
                                    value={profile.city}
                                    onChange={handleChange}
                                    placeholder="Enter city"
                                    className={inputClass}
                                />
                            </div>

                            <div>
                                <label className={labelClass}>State</label>

                                <input
                                    name="state"
                                    value={profile.state}
                                    onChange={handleChange}
                                    placeholder="Enter state"
                                    className={inputClass}
                                />
                            </div>

                            <div>
                                <label className={labelClass}>PIN Code</label>

                                <input
                                    name="pinCode"
                                    value={profile.pinCode}
                                    onChange={handleChange}
                                    placeholder="Enter PIN code"
                                    className={inputClass}
                                />
                            </div>

                        </div>

                        <div className="mt-5 max-w-md">

                            <label className={labelClass}>Country</label>

                            <select
                                name="country"
                                value={profile.country}
                                onChange={handleChange}
                                className={inputClass}
                            >
                                <option value="India" className="bg-slate-900">
                                    India
                                </option>
                                <option value="United States" className="bg-slate-900">
                                    United States
                                </option>
                                <option value="United Kingdom" className="bg-slate-900">
                                    United Kingdom
                                </option>
                                <option value="Canada" className="bg-slate-900">
                                    Canada
                                </option>
                            </select>

                        </div>

                    </div>
                </section>


                {/* Saved Message */}
                {saved && (
                    <div className="mb-4 rounded-lg border border-emerald-500/20 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-400">
                        ✓ Profile changes saved successfully.
                    </div>
                )}

                {/* Bottom Actions */}
                <div className="flex justify-end pb-6">

                    <button
                        type="button"
                        onClick={handleSave}
                        className="h-11 px-8 rounded-lg bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-semibold shadow-lg shadow-blue-900/20 transition"
                    >
                        ▣ &nbsp; Save Changes
                    </button>

                </div>

            </div>
        </div>
    );
}

export default TeacherProfile;