import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";
import {
    Camera,
    Mail,
    User,
    Save,
    LogOut,
} from "lucide-react";
import { motion } from "framer-motion";

export default function Profile() {
    const [user, setUser] = useState<any>(null);

    const [name, setName] = useState("");
    const [bio, setBio] = useState("");
    const [avatar, setAvatar] = useState("");

    const [loading, setLoading] = useState(false);
    const [uploading, setUploading] =
        useState(false);

    // =========================
    // GET PROFILE
    // =========================
    useEffect(() => {
        getProfile();
    }, []);

    const getProfile = async () => {
        const {
            data: { user },
        } = await supabase.auth.getUser();

        if (!user) return;

        setUser(user);

        const { data, error } = await supabase
            .from("profiles")
            .select("*")
            .eq("id", user.id)
            .single();

        if (error) {
            console.log(error.message);
            return;
        }

        if (data) {
            setName(data.name || "");
            setBio(data.bio || "");
            setAvatar(data.avatar_url || "");
        }
    };

    // =========================
    // UPLOAD AVATAR
    // =========================
    const uploadAvatar = async (
        e: React.ChangeEvent<HTMLInputElement>
    ) => {
        try {
            setUploading(true);

            const file = e.target.files?.[0];

            if (!file || !user) return;

            const fileExt =
                file.name.split(".").pop();

            const fileName = `${user.id}.${fileExt}`;

            // UPLOAD IMAGE
            const { error } =
                await supabase.storage
                    .from("avatars")
                    .upload(fileName, file, {
                        upsert: true,
                    });

            if (error) {
                console.log(error);
                alert(error.message);
                return;
            }

            // GET PUBLIC URL
            const {
                data: { publicUrl },
            } = supabase.storage
                .from("avatars")
                .getPublicUrl(fileName);

            setAvatar(publicUrl);

        } catch (err) {
            console.log(err);
        } finally {
            setUploading(false);
        }
    };

    // =========================
    // SAVE PROFILE
    // =========================
    const saveProfile = async () => {
        if (!user) return;

        setLoading(true);

        const { error } = await supabase
            .from("profiles")
            .update({
                name,
                bio,
                avatar_url: avatar,
            })
            .eq("id", user.id);

        setLoading(false);

        if (error) {
            console.log(error);
            alert(error.message);
        } else {
            alert("Profile updated 🚀");
        }
    };
    // =========================
    // LOGOUT
    // =========================
    const logout = async () => {
        await supabase.auth.signOut();
        window.location.href = "/login";
    };

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="min-h-screen bg-gradient-to-br from-[#0f172a] via-[#111827] to-[#1e1b4b] text-white p-6"
        >

            <div className="max-w-5xl mx-auto">

                {/* MAIN CARD */}
                <motion.div
                    initial={{
                        y: -20,
                        opacity: 0,
                    }}
                    animate={{
                        y: 0,
                        opacity: 1,
                    }}
                    className="bg-white/5 backdrop-blur-lg border border-white/10 rounded-3xl p-8 shadow-2xl"
                >

                    <div className="flex flex-col lg:flex-row gap-10">

                        {/* LEFT SIDE */}
                        <div className="flex flex-col items-center">

                            <motion.div
                                whileHover={{
                                    scale: 1.05,
                                }}
                                className="relative"
                            >

                                {avatar ? (
                                    <img
                                        src={avatar}
                                        alt="avatar"
                                        className="w-40 h-40 rounded-full object-cover border-4 border-indigo-500 shadow-xl"
                                    />
                                ) : (
                                    <div className="w-40 h-40 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-5xl font-bold shadow-xl">
                                        {name
                                            ? name
                                                .charAt(0)
                                                .toUpperCase()
                                            : user?.email
                                                ?.charAt(0)
                                                .toUpperCase()}
                                    </div>
                                )}

                                <div className="absolute bottom-2 right-2 bg-indigo-600 p-2 rounded-full shadow-lg">
                                    <Camera size={18} />
                                </div>
                            </motion.div>

                            {/* UPLOAD BUTTON */}
                            <label className="mt-5 cursor-pointer bg-indigo-600 hover:bg-indigo-700 px-5 py-3 rounded-xl transition shadow-lg">

                                {uploading
                                    ? "Uploading..."
                                    : "Upload Avatar"}

                                <input
                                    type="file"
                                    accept="image/*"
                                    onChange={uploadAvatar}
                                    className="hidden"
                                />
                            </label>
                        </div>

                        {/* RIGHT SIDE */}
                        <div className="flex-1 space-y-6">

                            <div>
                                <h1 className="text-4xl font-bold">
                                    My Profile
                                </h1>

                                <p className="text-gray-400 mt-2">
                                    Customize your StudySphere
                                    profile.
                                </p>
                            </div>

                            {/* NAME */}
                            <div>
                                <label htmlFor="full-name-input" className="text-sm text-gray-300 flex items-center gap-2 mb-2">
                                    <User size={16} />
                                    Full Name
                                </label>

                                <input
                                    id="full-name-input"
                                    type="text"
                                    placeholder="Enter your full name"
                                    value={name}
                                    onChange={(e) =>
                                        setName(e.target.value)
                                    }
                                    className="w-full bg-white/10 border border-white/10 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-indigo-500"
                                />
                            </div>

                            {/* EMAIL */}
                            <div>
                                <label htmlFor="email-input" className="text-sm text-gray-300 flex items-center gap-2 mb-2">
                                    <Mail size={16} />
                                    Email
                                </label>

                                <input
                                    id="email-input"
                                    type="text"
                                    disabled
                                    value={user?.email || ""}
                                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-gray-400"
                                />
                            </div>

                            {/* BIO */}
                            <div>
                                <label htmlFor="bio-textarea" className="text-sm text-gray-300 mb-2 block">
                                    Bio
                                </label>

                                <textarea
                                    id="bio-textarea"
                                    placeholder="Write something about yourself..."
                                    value={bio}
                                    onChange={(e) =>
                                        setBio(e.target.value)
                                    }
                                    rows={5}
                                    className="w-full bg-white/10 border border-white/10 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
                                />
                            </div>

                            {/* BUTTONS */}
                            <div className="flex flex-wrap gap-4 pt-2">

                                <motion.button
                                    whileHover={{
                                        scale: 1.03,
                                    }}
                                    whileTap={{
                                        scale: 0.95,
                                    }}
                                    onClick={saveProfile}
                                    className="bg-indigo-600 hover:bg-indigo-700 px-6 py-3 rounded-xl flex items-center gap-2 shadow-lg"
                                >
                                    <Save size={18} />

                                    {loading
                                        ? "Saving..."
                                        : "Save Profile"}
                                </motion.button>

                                <motion.button
                                    whileHover={{
                                        scale: 1.03,
                                    }}
                                    whileTap={{
                                        scale: 0.95,
                                    }}
                                    onClick={logout}
                                    className="bg-red-600 hover:bg-red-700 px-6 py-3 rounded-xl flex items-center gap-2 shadow-lg"
                                >
                                    <LogOut size={18} />
                                    Logout
                                </motion.button>
                            </div>
                        </div>
                    </div>
                </motion.div>

                {/* EXTRA STATS */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">

                    <motion.div
                        whileHover={{
                            y: -5,
                        }}
                        className="bg-white/5 border border-white/10 rounded-2xl p-6 backdrop-blur-lg"
                    >
                        <h3 className="text-gray-400 text-sm">
                            Account Status
                        </h3>

                        <p className="text-2xl font-bold mt-2 text-green-400">
                            Active
                        </p>
                    </motion.div>

                    <motion.div
                        whileHover={{
                            y: -5,
                        }}
                        className="bg-white/5 border border-white/10 rounded-2xl p-6 backdrop-blur-lg"
                    >
                        <h3 className="text-gray-400 text-sm">
                            Joined
                        </h3>

                        <p className="text-2xl font-bold mt-2">
                            2025
                        </p>
                    </motion.div>

                    <motion.div
                        whileHover={{
                            y: -5,
                        }}
                        className="bg-white/5 border border-white/10 rounded-2xl p-6 backdrop-blur-lg"
                    >
                        <h3 className="text-gray-400 text-sm">
                            Role
                        </h3>

                        <p className="text-2xl font-bold mt-2 text-indigo-400">
                            Student
                        </p>
                    </motion.div>
                </div>
            </div>
        </motion.div>
    );
}