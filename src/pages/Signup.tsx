import { useState } from "react";
import { supabase } from "../lib/supabase";
import { useNavigate, Link } from "react-router-dom";

import {
    User,
    Mail,
    Lock,
    UserPlus,
} from "lucide-react";

import { motion } from "framer-motion";

export default function Signup() {
    const [name, setName] =
        useState("");

    const [email, setEmail] =
        useState("");

    const [password, setPassword] =
        useState("");

    const [loading, setLoading] =
        useState(false);

    const navigate = useNavigate();

    // =========================
    // SIGNUP
    // =========================
    const handleSignup = async () => {
        if (!name || !email || !password) {
            alert("Please fill all fields");
            return;
        }

        try {
            setLoading(true);

            // CREATE USER
            const { data, error } =
                await supabase.auth.signUp({
                    email,
                    password,
                });

            if (error) {
                alert(error.message);
                return;
            }

            // CREATE PROFILE
            if (data.user) {
                const {
                    error: profileError,
                } = await supabase
                    .from("profiles")
                    .insert([
                        {
                            id: data.user.id,
                            email:
                                data.user.email,
                            name: name,
                            is_online: false,
                        },
                    ]);

                if (profileError) {
                    console.log(
                        profileError
                    );
                }
            }

            alert(
                "Account created successfully!"
            );

            navigate("/login");

        } catch (err) {
            console.log(err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-[#020817] via-[#0f172a] to-[#1e1b4b] flex items-center justify-center p-6 overflow-hidden">

            {/* BACKGROUND BLUR */}
            <div className="absolute w-[400px] h-[400px] bg-indigo-500/20 rounded-full blur-3xl top-[-100px] left-[-100px]" />

            <div className="absolute w-[350px] h-[350px] bg-purple-500/20 rounded-full blur-3xl bottom-[-100px] right-[-100px]" />

            {/* CARD */}
            <motion.div
                initial={{
                    opacity: 0,
                    y: 40,
                }}
                animate={{
                    opacity: 1,
                    y: 0,
                }}
                transition={{
                    duration: 0.5,
                }}
                className="relative z-10 w-full max-w-md bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl shadow-2xl p-8"
            >

                {/* HEADER */}
                <div className="text-center mb-8">

                    <motion.div
                        initial={{
                            scale: 0.8,
                        }}
                        animate={{
                            scale: 1,
                        }}
                        transition={{
                            duration: 0.4,
                        }}
                        className="w-20 h-20 mx-auto rounded-3xl bg-gradient-to-r from-indigo-600 to-purple-600 flex items-center justify-center shadow-xl"
                    >
                        <UserPlus
                            size={34}
                        />
                    </motion.div>

                    <h1 className="text-4xl font-bold text-white mt-6">
                        Create Account
                    </h1>

                    <p className="text-gray-400 mt-2">
                        Join StudySphere today
                    </p>
                </div>

                {/* FULL NAME */}
                <div className="mb-5">

                    <label className="text-sm text-gray-300 block mb-2">
                        Full Name
                    </label>

                    <div className="flex items-center gap-3 bg-white/10 border border-white/10 rounded-2xl px-4 py-4 focus-within:border-indigo-500 transition">

                        <User
                            size={20}
                            className="text-gray-400"
                        />

                        <input
                            type="text"
                            placeholder="Enter your name"
                            value={name}
                            onChange={(e) =>
                                setName(
                                    e.target.value
                                )
                            }
                            className="bg-transparent outline-none w-full text-white placeholder:text-gray-500"
                        />
                    </div>
                </div>

                {/* EMAIL */}
                <div className="mb-5">

                    <label className="text-sm text-gray-300 block mb-2">
                        Email
                    </label>

                    <div className="flex items-center gap-3 bg-white/10 border border-white/10 rounded-2xl px-4 py-4 focus-within:border-indigo-500 transition">

                        <Mail
                            size={20}
                            className="text-gray-400"
                        />

                        <input
                            type="email"
                            placeholder="Enter your email"
                            value={email}
                            onChange={(e) =>
                                setEmail(
                                    e.target.value
                                )
                            }
                            className="bg-transparent outline-none w-full text-white placeholder:text-gray-500"
                        />
                    </div>
                </div>

                {/* PASSWORD */}
                <div className="mb-6">

                    <label className="text-sm text-gray-300 block mb-2">
                        Password
                    </label>

                    <div className="flex items-center gap-3 bg-white/10 border border-white/10 rounded-2xl px-4 py-4 focus-within:border-indigo-500 transition">

                        <Lock
                            size={20}
                            className="text-gray-400"
                        />

                        <input
                            type="password"
                            placeholder="Enter your password"
                            value={password}
                            onChange={(e) =>
                                setPassword(
                                    e.target.value
                                )
                            }
                            className="bg-transparent outline-none w-full text-white placeholder:text-gray-500"
                        />
                    </div>
                </div>

                {/* BUTTON */}
                <motion.button
                    whileHover={{
                        scale: 1.02,
                    }}
                    whileTap={{
                        scale: 0.98,
                    }}
                    onClick={handleSignup}
                    disabled={loading}
                    className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:opacity-90 transition rounded-2xl py-4 font-semibold text-lg shadow-lg"
                >
                    {loading
                        ? "Creating Account..."
                        : "Create Account"}
                </motion.button>

                {/* LOGIN */}
                <p className="text-center text-gray-400 mt-6">
                    Already have an account?{" "}

                    <Link
                        to="/login"
                        className="text-indigo-400 hover:text-indigo-300 font-semibold"
                    >
                        Login
                    </Link>
                </p>
            </motion.div>
        </div>
    );
}