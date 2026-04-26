import { useState } from "react";
import { supabase } from "../lib/supabase";
import { useNavigate } from "react-router-dom";

export default function Login() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const navigate = useNavigate();

    const handleLogin = async () => {
        const { error } = await supabase.auth.signInWithPassword({
            email,
            password,
        });

        if (error) {
            alert(error.message);
        } else {
            navigate("/");
        }
    };

    return (
        <div className="flex items-center justify-center h-screen bg-gray-950">
            <div className="bg-gray-900 p-6 rounded-xl w-80 space-y-4">
                <h2 className="text-white text-xl font-bold">Login</h2>

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
                    onClick={handleLogin}
                    className="w-full bg-indigo-600 p-2 rounded text-white"
                >
                    Login
                </button>
            </div>
        </div>
    );
}