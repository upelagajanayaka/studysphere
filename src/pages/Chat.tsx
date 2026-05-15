import { useEffect, useRef, useState } from "react";
import { supabase } from "../lib/supabase";

import {
    Send,
    Search,
    ArrowLeft,
    MessageCircle,
} from "lucide-react";

import { motion } from "framer-motion";

export default function Chat() {
    const [profiles, setProfiles] =
        useState<any[]>([]);

    const [selectedUser, setSelectedUser] =
        useState<any>(null);

    const [messages, setMessages] =
        useState<any[]>([]);

    const [newMessage, setNewMessage] =
        useState("");

    const [currentUser, setCurrentUser] =
        useState<any>(null);

    const [search, setSearch] =
        useState("");

    const [mobileChat, setMobileChat] =
        useState(false);

    const bottomRef =
        useRef<HTMLDivElement>(null);

    // =========================
    // GET CURRENT USER
    // =========================
    useEffect(() => {
        getCurrentUser();
    }, []);

    const getCurrentUser = async () => {
        const {
            data: { user },
        } = await supabase.auth.getUser();

        if (!user) return;

        setCurrentUser(user);

        await supabase
            .from("profiles")
            .update({
                is_online: true,
            })
            .eq("id", user.id);

        fetchUsers(user.id);
    };

    // =========================
    // FETCH USERS
    // =========================
    const fetchUsers = async (
        myId: string
    ) => {
        const { data } = await supabase
            .from("profiles")
            .select("*")
            .neq("id", myId);

        setProfiles(data || []);
    };

    // =========================
    // FETCH MESSAGES
    // =========================
    useEffect(() => {
        if (selectedUser && currentUser) {
            fetchMessages();

            const channel = supabase
                .channel("messages-live")
                .on(
                    "postgres_changes",
                    {
                        event: "*",
                        schema: "public",
                        table: "messages",
                    },
                    () => {
                        fetchMessages();
                    }
                )
                .subscribe();

            return () => {
                supabase.removeChannel(channel);
            };
        }
    }, [selectedUser]);

    const fetchMessages = async () => {
        if (!selectedUser || !currentUser)
            return;

        const { data } = await supabase
            .from("messages")
            .select("*")
            .or(
                `and(sender_id.eq.${currentUser.id},receiver_id.eq.${selectedUser.id}),and(sender_id.eq.${selectedUser.id},receiver_id.eq.${currentUser.id})`
            )
            .order("created_at", {
                ascending: true,
            });

        setMessages(data || []);

        setTimeout(() => {
            bottomRef.current?.scrollIntoView({
                behavior: "smooth",
            });
        }, 100);
    };

    // =========================
    // SEND MESSAGE
    // =========================
    const sendMessage = async () => {
        if (
            !newMessage.trim() ||
            !selectedUser
        )
            return;

        await supabase
            .from("messages")
            .insert([
                {
                    text: newMessage,
                    sender_id: currentUser.id,
                    receiver_id:
                        selectedUser.id,
                },
            ]);

        setNewMessage("");
    };

    // =========================
    // SEARCH USERS
    // =========================
    const filteredUsers =
        profiles.filter((profile) =>
            profile.name
                ?.toLowerCase()
                .includes(
                    search.toLowerCase()
                )
        );

    return (
        <div className="h-[100dvh] bg-[#020817] text-white flex overflow-hidden">

            {/* SIDEBAR */}
            <div
                className={`
                ${mobileChat
                        ? "hidden md:flex"
                        : "flex"}
                flex-col
                w-full
                md:w-[340px]
                lg:w-[360px]
                bg-[#071226]
                border-r
                border-white/10
                shrink-0
                `}
            >

                {/* HEADER */}
                <div className="p-5 border-b border-white/10 bg-[#071226]/90 backdrop-blur-xl">

                    <h1 className="text-2xl font-bold">
                        Chats
                    </h1>

                    <p className="text-sm text-gray-400 mt-1">
                        StudySphere Messenger
                    </p>

                    {/* SEARCH */}
                    <div className="mt-5 relative">

                        <Search
                            size={18}
                            className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
                        />

                        <input
                            type="text"
                            placeholder="Search users..."
                            value={search}
                            onChange={(e) =>
                                setSearch(
                                    e.target.value
                                )
                            }
                            className="
                            w-full
                            bg-white/5
                            border
                            border-white/10
                            rounded-2xl
                            pl-12
                            pr-4
                            py-3
                            outline-none
                            focus:border-indigo-500
                            text-sm
                            "
                        />
                    </div>
                </div>

                {/* USERS */}
                <div className="flex-1 overflow-y-auto overflow-x-hidden p-4 space-y-3">

                    {filteredUsers.map(
                        (profile) => (
                            <motion.div
                                key={profile.id}
                                whileHover={{
                                    scale: 1.02,
                                }}
                                whileTap={{
                                    scale: 0.98,
                                }}
                                onClick={() => {
                                    setSelectedUser(
                                        profile
                                    );

                                    setMobileChat(
                                        true
                                    );
                                }}
                                className={`
                                p-4
                                rounded-3xl
                                cursor-pointer
                                transition-all
                                duration-300
                                border
                                backdrop-blur-xl
                                ${selectedUser?.id ===
                                        profile.id
                                        ? "bg-gradient-to-r from-indigo-600 to-purple-600 border-transparent shadow-xl"
                                        : "bg-white/5 border-white/10 hover:bg-white/10"
                                    }
                                `}
                            >

                                <div className="flex items-center gap-4">

                                    {/* AVATAR */}
                                    <div className="relative shrink-0">

                                        {profile.avatar_url ? (
                                            <img
                                                src={
                                                    profile.avatar_url
                                                }
                                                alt=""
                                                className="w-14 h-14 rounded-full object-cover"
                                            />
                                        ) : (
                                            <div className="w-14 h-14 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center font-bold text-lg">
                                                {profile.name
                                                    ?.charAt(
                                                        0
                                                    )
                                                    .toUpperCase()}
                                            </div>
                                        )}

                                        {/* ONLINE */}
                                        <div
                                            className={`
                                            absolute
                                            bottom-0
                                            right-0
                                            w-4
                                            h-4
                                            rounded-full
                                            border-2
                                            border-[#071226]
                                            ${profile.is_online
                                                    ? "bg-green-400"
                                                    : "bg-gray-500"
                                                }
                                            `}
                                        />
                                    </div>

                                    {/* INFO */}
                                    <div className="flex-1 min-w-0">

                                        <h2 className="font-semibold truncate">
                                            {
                                                profile.name
                                            }
                                        </h2>

                                        <p className="text-sm text-gray-400 truncate">
                                            {
                                                profile.email
                                            }
                                        </p>
                                    </div>
                                </div>
                            </motion.div>
                        )
                    )}
                </div>
            </div>

            {/* CHAT AREA */}
            <div
                className={`
                ${mobileChat
                        ? "flex"
                        : "hidden md:flex"}
                flex-1
                flex-col
                min-w-0
                `}
            >

                {selectedUser ? (
                    <>
                        {/* CHAT HEADER */}
                        <div className="h-[85px] px-5 border-b border-white/10 bg-[#071226]/90 backdrop-blur-xl flex items-center justify-between shrink-0">

                            <div className="flex items-center gap-4">

                                {/* MOBILE BACK */}
                                <button
                                    type="button"
                                    onClick={() =>
                                        setMobileChat(
                                            false
                                        )
                                    }
                                    className="md:hidden"
                                    aria-label="Back to chat list"
                                >
                                    <ArrowLeft
                                        size={24}
                                    />
                                </button>

                                {/* AVATAR */}
                                <div className="relative">

                                    {selectedUser.avatar_url ? (
                                        <img
                                            src={
                                                selectedUser.avatar_url
                                            }
                                            alt=""
                                            className="w-14 h-14 rounded-full object-cover"
                                        />
                                    ) : (
                                        <div className="w-14 h-14 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center font-bold text-lg">
                                            {selectedUser.name
                                                ?.charAt(
                                                    0
                                                )
                                                .toUpperCase()}
                                        </div>
                                    )}

                                    <div
                                        className={`
                                        absolute
                                        bottom-0
                                        right-0
                                        w-4
                                        h-4
                                        rounded-full
                                        border-2
                                        border-[#071226]
                                        ${selectedUser.is_online
                                                ? "bg-green-400"
                                                : "bg-gray-500"
                                            }
                                        `}
                                    />
                                </div>

                                {/* USER INFO */}
                                <div>
                                    <h2 className="font-semibold text-lg">
                                        {
                                            selectedUser.name
                                        }
                                    </h2>

                                    <p
                                        className={`text-sm ${selectedUser.is_online
                                            ? "text-green-400"
                                            : "text-gray-400"
                                            }`}
                                    >
                                        {selectedUser.is_online
                                            ? "Online"
                                            : "Offline"}
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* MESSAGES */}
                        <div className="
                        flex-1
                        overflow-y-auto
                        overflow-x-hidden
                        p-4
                        md:p-6
                        space-y-4
                        bg-gradient-to-b
                        from-[#020817]
                        to-[#071226]
                        ">

                            {messages.map(
                                (msg) => {
                                    const mine =
                                        msg.sender_id ===
                                        currentUser.id;

                                    return (
                                        <motion.div
                                            key={
                                                msg.id
                                            }
                                            initial={{
                                                opacity: 0,
                                                y: 10,
                                            }}
                                            animate={{
                                                opacity: 1,
                                                y: 0,
                                            }}
                                            className={`flex ${mine
                                                ? "justify-end"
                                                : "justify-start"
                                                }`}
                                        >

                                            <div
                                                className={`
                                                max-w-[80%]
                                                sm:max-w-[85%]
                                                md:max-w-[350px]
                                                px-5
                                                py-3
                                                rounded-[24px]
                                                shadow-lg
                                                backdrop-blur-xl
                                                break-words
                                                ${mine
                                                        ? "bg-gradient-to-r from-indigo-600 to-purple-600"
                                                        : "bg-white/10 border border-white/10"
                                                    }
                                                `}
                                            >

                                                {/* TEXT */}
                                                <p className="text-sm leading-relaxed">
                                                    {
                                                        msg.text
                                                    }
                                                </p>

                                                {/* TIME */}
                                                <p className="text-[11px] text-gray-300 mt-2 text-right">
                                                    {new Date(
                                                        msg.created_at
                                                    ).toLocaleTimeString(
                                                        [],
                                                        {
                                                            hour: "2-digit",
                                                            minute: "2-digit",
                                                        }
                                                    )}
                                                </p>
                                            </div>
                                        </motion.div>
                                    );
                                }
                            )}

                            <div ref={bottomRef} />
                        </div>

                        {/* INPUT */}
                        <div
                            style={{
                                paddingBottom:
                                    "env(safe-area-inset-bottom)",
                            }}
                            className="
                            p-4
                            border-t
                            border-white/10
                            bg-[#071226]/90
                            backdrop-blur-xl
                            shrink-0
                            "
                        >

                            <div className="flex items-center gap-3">

                                <input
                                    type="text"
                                    placeholder="Type a message..."
                                    value={newMessage}
                                    onChange={(e) =>
                                        setNewMessage(
                                            e.target
                                                .value
                                        )
                                    }
                                    onKeyDown={(
                                        e
                                    ) => {
                                        if (
                                            e.key ===
                                            "Enter"
                                        ) {
                                            sendMessage();
                                        }
                                    }}
                                    className="
                                    flex-1
                                    bg-white/5
                                    border
                                    border-white/10
                                    rounded-full
                                    px-6
                                    py-4
                                    outline-none
                                    focus:border-indigo-500
                                    text-sm
                                    "
                                />

                                <motion.button
                                    whileHover={{
                                        scale: 1.05,
                                    }}
                                    whileTap={{
                                        scale: 0.9,
                                    }}
                                    onClick={
                                        sendMessage
                                    }
                                    className="
                                    w-14
                                    h-14
                                    rounded-full
                                    bg-gradient-to-r
                                    from-indigo-600
                                    to-purple-600
                                    flex
                                    items-center
                                    justify-center
                                    shadow-xl
                                    shrink-0
                                    "
                                >
                                    <Send
                                        size={22}
                                    />
                                </motion.button>
                            </div>
                        </div>
                    </>
                ) : (
                    <div className="flex-1 flex flex-col items-center justify-center text-center p-6">

                        <div className="w-28 h-28 rounded-full bg-indigo-600/20 flex items-center justify-center mb-6">
                            <MessageCircle
                                size={42}
                                className="text-indigo-400"
                            />
                        </div>

                        <h2 className="text-2xl md:text-3xl font-bold">
                            Welcome to Chat
                        </h2>

                        <p className="text-gray-400 mt-3 max-w-sm text-sm md:text-base">
                            Select a user and start
                            a beautiful real-time
                            conversation.
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
}