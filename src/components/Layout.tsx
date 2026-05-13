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
import {
    motion,
    AnimatePresence,
} from "framer-motion";

export default function Layout() {
    const [open, setOpen] =
        useState(false);

    const links = [
        {
            name: "Dashboard",
            path: "/",
            icon: (
                <LayoutDashboard
                    size={22}
                />
            ),
        },
        {
            name: "Tasks",
            path: "/tasks",
            icon: (
                <CheckSquare
                    size={22}
                />
            ),
        },
        {
            name: "Library",
            path: "/library",
            icon: (
                <Library size={22} />
            ),
        },
        {
            name: "Chat",
            path: "/chat",
            icon: (
                <MessageCircle
                    size={22}
                />
            ),
        },
        {
            name: "Profile",
            path: "/profile",
            icon: (
                <User size={22} />
            ),
        },
    ];

    return (
        <div className="min-h-screen bg-[#020817] text-white">

            {/* MOBILE TOPBAR */}
            <div className="md:hidden fixed top-0 left-0 right-0 h-16 bg-[#071226]/95 backdrop-blur-xl border-b border-white/10 flex items-center justify-between px-4 z-50">

                <h1 className="text-2xl font-bold text-indigo-400">
                    StudySphere
                </h1>

                <button
                    onClick={() =>
                        setOpen(true)
                    }
                    aria-label="Open menu"
                    className="bg-indigo-600 hover:bg-indigo-700 transition p-2 rounded-xl shadow-lg"
                >
                    <Menu size={24} />
                </button>
            </div>

            {/* MOBILE SIDEBAR */}
            <AnimatePresence>
                {open && (
                    <>
                        {/* BACKDROP */}
                        <motion.div
                            initial={{
                                opacity: 0,
                            }}
                            animate={{
                                opacity: 1,
                            }}
                            exit={{
                                opacity: 0,
                            }}
                            onClick={() =>
                                setOpen(
                                    false
                                )
                            }
                            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 md:hidden"
                        />

                        {/* SIDEBAR */}
                        <motion.div
                            initial={{
                                x: -320,
                            }}
                            animate={{
                                x: 0,
                            }}
                            exit={{
                                x: -320,
                            }}
                            transition={{
                                type: "spring",
                                damping: 22,
                            }}
                            className="fixed top-0 left-0 bottom-0 w-[280px] bg-[#071226] border-r border-white/10 z-50 p-5 flex flex-col md:hidden"
                        >

                            {/* HEADER */}
                            <div className="flex items-center justify-between mb-10">

                                <h1 className="text-3xl font-bold text-indigo-400">
                                    StudySphere
                                </h1>

                                <button
                                    onClick={() =>
                                        setOpen(
                                            false
                                        )
                                    }
                                    aria-label="Close menu"
                                    className="hover:bg-white/10 p-2 rounded-xl transition"
                                >
                                    <X
                                        size={
                                            26
                                        }
                                    />
                                </button>
                            </div>

                            {/* NAVIGATION */}
                            <div className="space-y-3">

                                {links.map(
                                    (
                                        link
                                    ) => (
                                        <NavLink
                                            key={
                                                link.path
                                            }
                                            to={
                                                link.path
                                            }
                                            onClick={() =>
                                                setOpen(
                                                    false
                                                )
                                            }
                                            className={({
                                                isActive,
                                            }) =>
                                                `flex items-center gap-4 px-5 py-4 rounded-2xl transition-all duration-300 ${isActive
                                                    ? "bg-gradient-to-r from-indigo-600 to-purple-600 shadow-lg"
                                                    : "hover:bg-white/10"
                                                }`
                                            }
                                        >
                                            {
                                                link.icon
                                            }

                                            <span className="text-lg">
                                                {
                                                    link.name
                                                }
                                            </span>
                                        </NavLink>
                                    )
                                )}
                            </div>

                            {/* FOOTER */}
                            <div className="mt-auto bg-white/5 border border-white/10 rounded-3xl p-5">

                                <p className="text-gray-400 text-sm">
                                    StudySphere
                                    v1.0
                                </p>

                                <p className="text-xs text-gray-500 mt-1">
                                    Modern
                                    Student
                                    Platform
                                </p>
                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>

            {/* DESKTOP SIDEBAR */}
            <aside className="hidden md:flex fixed left-0 top-0 bottom-0 w-[280px] bg-[#071226] border-r border-white/10 flex-col p-6 z-30">

                {/* LOGO */}
                <h1 className="text-4xl font-bold text-indigo-400 mb-10">
                    StudySphere
                </h1>

                {/* NAVIGATION */}
                <div className="space-y-3">

                    {links.map((link) => (
                        <NavLink
                            key={link.path}
                            to={link.path}
                            className={({
                                isActive,
                            }) =>
                                `flex items-center gap-4 px-5 py-4 rounded-2xl transition-all duration-300 ${isActive
                                    ? "bg-gradient-to-r from-indigo-600 to-purple-600 shadow-lg"
                                    : "hover:bg-white/10"
                                }`
                            }
                        >
                            {link.icon}

                            <span className="text-lg">
                                {link.name}
                            </span>
                        </NavLink>
                    ))}
                </div>

                {/* FOOTER */}
                <div className="mt-auto bg-white/5 border border-white/10 rounded-3xl p-5">

                    <p className="text-gray-400 text-sm">
                        StudySphere v1.0
                    </p>

                    <p className="text-xs text-gray-500 mt-1">
                        Modern Student
                        Platform
                    </p>
                </div>
            </aside>

            {/* MAIN CONTENT */}
            <main className="md:ml-[280px] pt-16 md:pt-0 min-h-screen overflow-y-auto overflow-x-hidden">
                <Outlet />
            </main>
        </div>
    );
}