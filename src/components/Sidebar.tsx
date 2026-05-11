import { NavLink } from "react-router-dom";
import {
    LayoutDashboard,
    CheckSquare,
    BookOpen,
    MessageCircle,
    User,
} from "lucide-react";
import { supabase } from "../lib/supabase";

const menuItems = [
    { name: "Dashboard", path: "/", icon: LayoutDashboard },
    { name: "Tasks", path: "/tasks", icon: CheckSquare },
    { name: "Library", path: "/library", icon: BookOpen }, // ✅ already added
    { name: "Chat", path: "/chat", icon: MessageCircle },
    { name: "Profile", path: "/profile", icon: User },
];
const handleLogout = async () => {
    await supabase.auth.signOut();
    window.location.href = "/login";
};

export default function Sidebar() {
    return (
        <div className="h-screen w-64 bg-gray-950 border-r border-gray-800 flex flex-col">

            {/* Logo */}
            <div className="p-6 text-2xl font-bold text-indigo-400 tracking-wide">
                StudySphere
            </div>

            {/* Menu */}
            <nav className="flex-1 px-3 space-y-2">
                {menuItems.map((item) => {
                    const Icon = item.icon;

                    return (
                        <NavLink
                            key={item.name}
                            to={item.path}
                            end={item.path === "/"} // ✅ fix active state for "/"
                            className={({ isActive }) =>
                                `flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200
                hover:bg-gray-800 hover:translate-x-1
                ${isActive
                                    ? "bg-indigo-600 text-white"
                                    : "text-gray-400 hover:text-white"
                                }`
                            }
                        >
                            <Icon size={20} />
                            <span className="font-medium">{item.name}</span>
                        </NavLink>
                    );
                })}
            </nav>

            {/* Footer */}
            <div className="p-4 text-xs text-gray-500 border-t border-gray-800">
                v1.0 StudySphere
            </div>
            <div className="p-4 border-t border-gray-800">
                <button
                    type="button"
                    onClick={handleLogout}
                    className="w-full bg-red-600 py-2 rounded-lg hover:bg-red-700"
                >
                    Logout
                </button>
            </div>
        </div>
    );
}