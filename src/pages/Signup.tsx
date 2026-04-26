import { useState } from "react";
import { supabase } from "../lib/supabase";
import { useNavigate } from "react-router-dom";

export default function Signup() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const navigate = useNavigate();

    const handleSignup = async () => {
        const { error } = await supabase.auth.signUp({
            email,
            password,
        });

        if (error) {
            alert(error.message);
        } else {
            alert("Signup successful! You can login now.");
            navigate("/login");
        }
    };

    return (
        <div className="flex items-center justify-center h-screen bg-gray-950">
            <div className="bg-gray-900 p-6 rounded-xl w-80 space-y-4">
                <h2 className="text-white text-xl font-bold">Sign Up</h2>

                <input
                    type="email"
                    placeholder="Email"
                    className="w-full p-2 rounded bg-gray-800 text-white"
                    onChange={(e) => setEmail(e.target.value)}
                />

                <input
                    type="password"
                    placeholder="Password"
                    className="w-full p-2 rounded bg-gray-800 text-white"
                    onChange={(e) => setPassword(e.target.value)}
                />

                <button
                    onClick={handleSignup}
                    className="w-full bg-indigo-600 p-2 rounded text-white"
                >
                    Sign Up
                </button>
            </div>
        </div>
    );
}