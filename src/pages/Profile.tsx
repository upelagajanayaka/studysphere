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

    const [user, setUser] =
        useState<any>(null);

    const [name, setName] =
        useState("");

    const [bio, setBio] =
        useState("");

    const [avatar, setAvatar] =
        useState("");

    const [loading, setLoading] =
        useState(false);

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

        const { data, error } =
            await supabase
                .from("profiles")
                .select("*")
                .eq("id", user.id)
                .single();

        if (error) {
            console.log(error);
            return;
        }

        if (data) {

            setName(data.name || "");

            setBio(data.bio || "");

            setAvatar(
                data.avatar_url || ""
            );
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

            const file =
                e.target.files?.[0];

            if (!file || !user)
                return;

            const fileExt =
                file.name
                    .split(".")
                    .pop();

            const fileName =
                `${user.id}.${fileExt}`;

            // DELETE OLD FILES
            const { data: oldFiles } =
                await supabase.storage
                    .from("avatars")
                    .list("", {
                        search: user.id,
                    });

            if (
                oldFiles &&
                oldFiles.length > 0
            ) {

                const filesToDelete =
                    oldFiles.map(
                        (file) =>
                            file.name
                    );

                await supabase.storage
                    .from("avatars")
                    .remove(
                        filesToDelete
                    );
            }

            // UPLOAD NEW FILE
            const { error } =
                await supabase.storage
                    .from("avatars")
                    .upload(
                        fileName,
                        file,
                        {
                            upsert: true,
                        }
                    );

            if (error) {
                alert(
                    error.message
                );
                return;
            }

            // GET PUBLIC URL
            const {
                data: { publicUrl },
            } = supabase.storage
                .from("avatars")
                .getPublicUrl(
                    fileName
                );

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

        try {

            setLoading(true);

            const { error } =
                await supabase
                    .from("profiles")
                    .update({
                        name,
                        bio,
                        avatar_url:
                            avatar,
                    })
                    .eq(
                        "id",
                        user.id
                    );

            if (error) {
                alert(
                    error.message
                );
                return;
            }

            alert(
                "Profile updated successfully 🚀"
            );

        } catch (err) {
            console.log(err);
        } finally {
            setLoading(false);
        }
    };

    // =========================
    // LOGOUT
    // =========================
    const logout = async () => {

        await supabase.auth.signOut();

        window.location.href =
            "/login";
    };

    return (
        <div className="min-h-screen bg-[#020817] text-white p-4 md:p-6">

            <div className="max-w-6xl mx-auto">

                {/* HEADER */}
                <div className="mb-8">

                    <h1 className="text-3xl md:text-4xl font-bold">
                        My Profile
                    </h1>

                    <p className="text-gray-400 mt-2">
                        Manage your StudySphere
                        account settings and
                        profile information.
                    </p>
                </div>

                {/* MAIN CARD */}
                <motion.div
                    initial={{
                        opacity: 0,
                        y: 20,
                    }}
                    animate={{
                        opacity: 1,
                        y: 0,
                    }}
                    className="bg-[#071226] border border-white/10 rounded-3xl overflow-hidden"
                >

                    <div className="grid grid-cols-1 lg:grid-cols-[320px_1fr]">

                        {/* LEFT SIDE */}
                        <div className="border-b lg:border-b-0 lg:border-r border-white/10 p-6 md:p-8">

                            <div className="flex flex-col items-center">

                                {/* AVATAR */}
                                <div className="relative">

                                    {avatar ? (
                                        <img
                                            src={
                                                avatar
                                            }
                                            alt="Profile"
                                            className="w-36 h-36 md:w-44 md:h-44 rounded-full object-cover border-4 border-indigo-500 shadow-2xl"
                                        />
                                    ) : (
                                        <div className="w-36 h-36 md:w-44 md:h-44 rounded-full bg-gradient-to-br from-indigo-600 to-purple-600 flex items-center justify-center text-5xl font-bold shadow-2xl">
                                            {name
                                                ?.charAt(
                                                    0
                                                )
                                                .toUpperCase() ||
                                                user?.email
                                                    ?.charAt(
                                                        0
                                                    )
                                                    .toUpperCase()}
                                        </div>
                                    )}

                                    <div className="absolute bottom-2 right-2 bg-indigo-600 p-3 rounded-full shadow-lg">
                                        <Camera
                                            size={
                                                18
                                            }
                                        />
                                    </div>
                                </div>

                                {/* UPLOAD */}
                                <label
                                    htmlFor="avatar-upload"
                                    className="mt-6 cursor-pointer bg-indigo-600 hover:bg-indigo-700 px-5 py-3 rounded-2xl transition flex items-center gap-2"
                                >
                                    <Camera
                                        size={
                                            18
                                        }
                                    />

                                    {uploading
                                        ? "Uploading..."
                                        : "Upload Avatar"}
                                </label>

                                <input
                                    id="avatar-upload"
                                    title="Upload avatar image"
                                    type="file"
                                    accept="image/*"
                                    onChange={
                                        uploadAvatar
                                    }
                                    className="hidden"
                                />

                                {/* USER INFO */}
                                <div className="text-center mt-6">

                                    <h2 className="text-2xl font-bold break-words">
                                        {name ||
                                            "User"}
                                    </h2>

                                    <p className="text-gray-400 mt-2 break-all">
                                        {
                                            user?.email
                                        }
                                    </p>
                                </div>

                                {/* STATUS */}
                                <div className="w-full mt-8 space-y-4">

                                    <div className="bg-white/5 border border-white/10 rounded-2xl p-4">

                                        <p className="text-gray-400 text-sm">
                                            Account Status
                                        </p>

                                        <h3 className="text-green-400 font-semibold mt-1">
                                            Active
                                        </h3>
                                    </div>

                                    <div className="bg-white/5 border border-white/10 rounded-2xl p-4">

                                        <p className="text-gray-400 text-sm">
                                            Role
                                        </p>

                                        <h3 className="text-indigo-400 font-semibold mt-1">
                                            Student
                                        </h3>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* RIGHT SIDE */}
                        <div className="p-6 md:p-8">

                            <div className="space-y-6">

                                {/* NAME */}
                                <div>

                                    <label
                                        htmlFor="name-input"
                                        className="flex items-center gap-2 text-sm text-gray-400 mb-3"
                                    >
                                        <User
                                            size={
                                                16
                                            }
                                        />
                                        Full Name
                                    </label>

                                    <input
                                        id="name-input"
                                        title="Full name"
                                        type="text"
                                        placeholder="Enter your full name"
                                        value={
                                            name
                                        }
                                        onChange={(
                                            e
                                        ) =>
                                            setName(
                                                e
                                                    .target
                                                    .value
                                            )
                                        }
                                        className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 outline-none focus:border-indigo-500 transition"
                                    />
                                </div>

                                {/* EMAIL */}
                                <div>

                                    <label
                                        htmlFor="email-input"
                                        className="flex items-center gap-2 text-sm text-gray-400 mb-3"
                                    >
                                        <Mail
                                            size={
                                                16
                                            }
                                        />
                                        Email Address
                                    </label>

                                    <input
                                        id="email-input"
                                        title="Email address"
                                        type="text"
                                        disabled
                                        value={
                                            user?.email ||
                                            ""
                                        }
                                        className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 text-gray-400"
                                    />
                                </div>

                                {/* BIO */}
                                <div>

                                    <label
                                        htmlFor="bio-input"
                                        className="text-sm text-gray-400 mb-3 block"
                                    >
                                        Bio
                                    </label>

                                    <textarea
                                        id="bio-input"
                                        title="Bio"
                                        placeholder="Write something about yourself..."
                                        value={
                                            bio
                                        }
                                        onChange={(
                                            e
                                        ) =>
                                            setBio(
                                                e
                                                    .target
                                                    .value
                                            )
                                        }
                                        rows={6}
                                        className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 outline-none resize-none focus:border-indigo-500 transition"
                                    />
                                </div>

                                {/* BUTTONS */}
                                <div className="flex flex-col sm:flex-row gap-4 pt-2">

                                    <motion.button
                                        whileHover={{
                                            scale: 1.02,
                                        }}
                                        whileTap={{
                                            scale: 0.98,
                                        }}
                                        onClick={
                                            saveProfile
                                        }
                                        disabled={
                                            loading
                                        }
                                        className="flex-1 bg-indigo-600 hover:bg-indigo-700 py-4 rounded-2xl transition flex items-center justify-center gap-2 font-medium"
                                    >
                                        <Save
                                            size={
                                                18
                                            }
                                        />

                                        {loading
                                            ? "Saving..."
                                            : "Save Profile"}
                                    </motion.button>

                                    <motion.button
                                        whileHover={{
                                            scale: 1.02,
                                        }}
                                        whileTap={{
                                            scale: 0.98,
                                        }}
                                        onClick={
                                            logout
                                        }
                                        className="flex-1 bg-red-600 hover:bg-red-700 py-4 rounded-2xl transition flex items-center justify-center gap-2 font-medium"
                                    >
                                        <LogOut
                                            size={
                                                18
                                            }
                                        />

                                        Logout
                                    </motion.button>
                                </div>
                            </div>
                        </div>
                    </div>
                </motion.div>
            </div>
        </div>
    );
}