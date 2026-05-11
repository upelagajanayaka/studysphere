import { Outlet, NavLink } from "react-router-dom";
import {
    LayoutDashboard,
    CheckSquare,
    Library,
    MessageCircle,
    User,
    Menu,
    X,
} from "lucide-react";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

export default function Layout() {
    const [open, setOpen] = useState(false);

    const links = [
        {
            name: "Dashboard",
            path: "/",
            icon: <LayoutDashboard size={22} />,
        },
        {
            name: "Tasks",
            path: "/tasks",
            icon: <CheckSquare size={22} />,
        },
        {
            name: "Library",
            path: "/library",
            icon: <Library size={22} />,
        },
        {
            name: "Chat",
            path: "/chat",
            icon: <MessageCircle size={22} />,
        },
        {
            name: "Profile",
            path: "/profile",
            icon: <User size={22} />,
        },
    ];

    return (
        <div className="h-screen bg-[#020817] text-white overflow-hidden flex">

            {/* MOBILE MENU BUTTON */}
            <button
                onClick={() => setOpen(true)}
                aria-label="Open menu"
                title="Open menu"
                className="md:hidden fixed top-4 left-4 z-50 bg-indigo-600 p-2 rounded-lg"
            >
                <Menu size={24} />
            </button>

            {/* MOBILE SIDEBAR */}
            <AnimatePresence>
                {open && (
                    <>
                        {/* BACKDROP */}
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setOpen(false)}
                            className="fixed inset-0 bg-black/50 z-40 md:hidden"
                        />

                        {/* SIDEBAR */}
                        <motion.div
                            initial={{ x: -300 }}
                            animate={{ x: 0 }}
                            exit={{ x: -300 }}
                            transition={{ type: "spring", damping: 20 }}
                            className="fixed top-0 left-0 w-[280px] h-screen bg-[#071226] border-r border-white/10 z-50 p-5 md:hidden flex flex-col"
                        >
                            {/* CLOSE BUTTON */}
                            <div className="flex items-center justify-between mb-10">
                                <h1 className="text-3xl font-bold text-indigo-400">
                                    StudySphere
                                </h1>

                                <button
                                    onClick={() => setOpen(false)}
                                    aria-label="Close menu"
                                    title="Close menu"
                                >
                                    <X size={26} />
                                </button>
                            </div>

                            {/* NAV */}
                            <div className="space-y-3">
                                {links.map((link) => (
                                    <NavLink
                                        key={link.path}
                                        to={link.path}
                                        onClick={() => setOpen(false)}
                                        className={({ isActive }) =>
                                            `flex items-center gap-4 px-5 py-4 rounded-2xl transition-all duration-300 ${isActive
                                                ? "bg-gradient-to-r from-indigo-600 to-purple-600 shadow-lg"
                                                : "hover:bg-white/10"
                                            }`
                                        }
                                    >
                                        {link.icon}
                                        <span className="text-lg">{link.name}</span>
                                    </NavLink>
                                ))}
                            </div>

                            {/* FOOTER */}
                            <div className="mt-auto bg-white/5 border border-white/10 rounded-3xl p-5">
                                <p className="text-gray-400 text-sm">
                                    StudySphere v1.0
                                </p>


                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>

            {/* DESKTOP SIDEBAR */}
            <aside className="hidden md:flex w-[280px] bg-[#071226] border-r border-white/10 flex-col p-5 shrink-0">
                <h1 className="text-4xl font-bold text-indigo-400 mb-10">
                    StudySphere
                </h1>

                {/* NAV */}
                <div className="space-y-3">
                    {links.map((link) => (
                        <NavLink
                            key={link.path}
                            to={link.path}
                            className={({ isActive }) =>
                                `flex items-center gap-4 px-5 py-4 rounded-2xl transition-all duration-300 ${isActive
                                    ? "bg-gradient-to-r from-indigo-600 to-purple-600 shadow-lg"
                                    : "hover:bg-white/10"
                                }`
                            }
                        >
                            {link.icon}
                            <span className="text-lg">{link.name}</span>
                        </NavLink>
                    ))}
                </div>

                {/* FOOTER */}
                <div className="mt-auto bg-white/5 border border-white/10 rounded-3xl p-5">
                    <p className="text-gray-400 text-sm">
                        StudySphere v1.0
                    </p>


                </div>
            </aside>

            {/* MAIN CONTENT */}
            <main className="flex-1 overflow-y-auto overflow-x-hidden">
                <Outlet />
            </main>
        </div>
    );
}