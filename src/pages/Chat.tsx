import { useEffect, useRef, useState } from "react";
import { supabase } from "../lib/supabase";

import {
    Send,
    Plus,
    X,
    Trash2,
    Search,
    Menu,
} from "lucide-react";

import { motion, AnimatePresence } from "framer-motion";

export default function Chat() {

    const [profiles, setProfiles] =
        useState<any[]>([]);

    const [allUsers, setAllUsers] =
        useState<any[]>([]);

    const [selectedUser, setSelectedUser] =
        useState<any>(null);

    const [messages, setMessages] =
        useState<any[]>([]);

    const [newMessage, setNewMessage] =
        useState("");

    const [currentUser, setCurrentUser] =
        useState<any>(null);

    const [showModal, setShowModal] =
        useState(false);

    const [search, setSearch] =
        useState("");

    const [mobileSidebar, setMobileSidebar] =
        useState(false);

    const bottomRef =
        useRef<HTMLDivElement>(null);

    // =========================
    // GET USER
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

        // ONLINE
        await supabase
            .from("profiles")
            .update({
                is_online: true,
            })
            .eq("id", user.id);

        getUsers(user.id);

        getAllUsers(user.id);
    };

    // =========================
    // GET CHAT USERS
    // =========================
    const getUsers = async (
        myId: string
    ) => {

        const { data, error } =
            await supabase
                .from("chat_users")
                .select(`
                    id,
                    friend_id,
                    profiles!chat_users_friend_id_fkey (
                        id,
                        name,
                        email,
                        avatar_url,
                        is_online
                    )
                `)
                .eq("user_id", myId);

        if (error) {
            console.log(error);
            return;
        }

        const formatted =
            data?.map((item: any) => ({
                chat_id: item.id,
                ...item.profiles,
            })) || [];

        setProfiles(formatted);
    };

    // =========================
    // GET ALL USERS
    // =========================
    const getAllUsers = async (
        myId: string
    ) => {

        const { data } =
            await supabase
                .from("profiles")
                .select("*")
                .neq("id", myId);

        setAllUsers(data || []);
    };

    // =========================
    // ADD CHAT
    // =========================
    const addChatUser = async (
        friend: any
    ) => {

        if (!currentUser) return;

        const alreadyExists =
            profiles.find(
                (p) => p.id === friend.id
            );

        if (alreadyExists) {
            setShowModal(false);
            return;
        }

        const { error } =
            await supabase
                .from("chat_users")
                .insert([
                    {
                        user_id:
                            currentUser.id,
                        friend_id:
                            friend.id,
                    },
                ]);

        if (error) {
            console.log(error);
            return;
        }

        getUsers(currentUser.id);

        setShowModal(false);
    };

    // =========================
    // REMOVE CHAT
    // =========================
    const removeChat = async (
        chatId: string
    ) => {

        await supabase
            .from("chat_users")
            .delete()
            .eq("id", chatId);

        if (
            selectedUser?.chat_id ===
            chatId
        ) {
            setSelectedUser(null);
        }

        getUsers(currentUser.id);
    };

    // =========================
    // GET MESSAGES
    // =========================
    useEffect(() => {

        if (
            selectedUser &&
            currentUser
        ) {

            fetchMessages();

            const channel =
                supabase
                    .channel("chat-room")
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
                supabase.removeChannel(
                    channel
                );
            };
        }

    }, [selectedUser]);

    const fetchMessages =
        async () => {

            if (
                !selectedUser ||
                !currentUser
            )
                return;

            const { data } =
                await supabase
                    .from("messages")
                    .select("*")
                    .or(
                        `and(sender_id.eq.${currentUser.id},receiver_id.eq.${selectedUser.id}),and(sender_id.eq.${selectedUser.id},receiver_id.eq.${currentUser.id})`
                    )
                    .order(
                        "created_at",
                        {
                            ascending: true,
                        }
                    );

            setMessages(data || []);

            setTimeout(() => {
                bottomRef.current?.scrollIntoView(
                    {
                        behavior:
                            "smooth",
                    }
                );
            }, 100);
        };

    // =========================
    // SEND MESSAGE
    // =========================
    const sendMessage =
        async () => {

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
                        sender_id:
                            currentUser.id,
                        receiver_id:
                            selectedUser.id,
                    },
                ]);

            setNewMessage("");
        };

    // =========================
    // FILTER USERS
    // =========================
    const filteredUsers =
        allUsers.filter((user) =>
            user.name
                ?.toLowerCase()
                .includes(
                    search.toLowerCase()
                )
        );

    return (
        <div className="h-[100dvh] bg-[#020817] text-white flex overflow-hidden relative">

            {/* MOBILE MENU */}
            <button
                type="button"
                aria-label="Open chats"
                title="Open chats"
                onClick={() =>
                    setMobileSidebar(true)
                }
                className="md:hidden absolute top-4 left-4 z-40 bg-indigo-600 p-2 rounded-xl"
            >
                <Menu size={22} />
            </button>

            {/* MOBILE OVERLAY */}
            <AnimatePresence>
                {mobileSidebar && (
                    <>
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
                                setMobileSidebar(
                                    false
                                )
                            }
                            className="fixed inset-0 bg-black/50 z-40 md:hidden"
                        />

                        <motion.div
                            initial={{
                                x: -300,
                            }}
                            animate={{
                                x: 0,
                            }}
                            exit={{
                                x: -300,
                            }}
                            className="fixed left-0 top-0 w-[320px] h-full bg-[#071226] z-50 border-r border-white/10 flex flex-col md:hidden"
                        >

                            {/* SIDEBAR HEADER */}
                            <div className="p-5 border-b border-white/10 flex items-center justify-between">

                                <h1 className="text-2xl font-bold">
                                    Chats
                                </h1>

                                <button
                                    type="button"
                                    aria-label="Close"
                                    title="Close"
                                    onClick={() =>
                                        setMobileSidebar(
                                            false
                                        )
                                    }
                                >
                                    <X
                                        size={24}
                                    />
                                </button>
                            </div>

                            {/* CHAT USERS */}
                            <div className="flex-1 overflow-y-auto p-4 space-y-3">

                                {profiles.map(
                                    (
                                        profile
                                    ) => (
                                        <div
                                            key={
                                                profile.id
                                            }
                                            className="bg-white/5 rounded-2xl p-3"
                                        >
                                            <div className="flex items-center gap-3">

                                                {profile.avatar_url ? (
                                                    <img
                                                        src={
                                                            profile.avatar_url
                                                        }
                                                        alt=""
                                                        className="w-12 h-12 rounded-full object-cover"
                                                    />
                                                ) : (
                                                    <div className="w-12 h-12 rounded-full bg-indigo-600 flex items-center justify-center">
                                                        {profile.name
                                                            ?.charAt(
                                                                0
                                                            )
                                                            .toUpperCase()}
                                                    </div>
                                                )}

                                                <div
                                                    className="flex-1 cursor-pointer"
                                                    onClick={() => {
                                                        setSelectedUser(
                                                            profile
                                                        );

                                                        setMobileSidebar(
                                                            false
                                                        );
                                                    }}
                                                >
                                                    <h2 className="font-semibold">
                                                        {
                                                            profile.name
                                                        }
                                                    </h2>

                                                    <p className="text-xs text-gray-400">
                                                        {profile.is_online
                                                            ? "Online"
                                                            : "Offline"}
                                                    </p>
                                                </div>

                                                <button
                                                    type="button"
                                                    aria-label="Remove chat"
                                                    title="Remove chat"
                                                    onClick={() =>
                                                        removeChat(
                                                            profile.chat_id
                                                        )
                                                    }
                                                    className="text-red-400"
                                                >
                                                    <Trash2
                                                        size={
                                                            18
                                                        }
                                                    />
                                                </button>
                                            </div>
                                        </div>
                                    )
                                )}
                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>

            {/* DESKTOP SIDEBAR */}
            <div className="hidden md:flex w-[320px] bg-[#071226] border-r border-white/10 flex-col shrink-0">

                {/* HEADER */}
                <div className="p-5 border-b border-white/10 flex items-center justify-between">

                    <div>
                        <h1 className="text-2xl font-bold">
                            Chats
                        </h1>

                        <p className="text-sm text-gray-400 mt-1">
                            Private Messaging
                        </p>
                    </div>

                    <button
                        type="button"
                        aria-label="Add chat"
                        title="Add chat"
                        onClick={() =>
                            setShowModal(true)
                        }
                        className="w-11 h-11 rounded-2xl bg-indigo-600 hover:bg-indigo-700 flex items-center justify-center"
                    >
                        <Plus size={22} />
                    </button>
                </div>

                {/* USERS */}
                <div className="flex-1 overflow-y-auto p-4 space-y-3">

                    {profiles.map((profile) => (

                        <motion.div
                            key={profile.id}
                            whileHover={{
                                scale: 1.02,
                            }}
                            className={`p-4 rounded-3xl border transition ${selectedUser?.id ===
                                profile.id
                                ? "bg-indigo-600 border-indigo-500"
                                : "bg-white/5 border-white/10"
                                }`}
                        >
                            <div className="flex items-center gap-3">

                                <div
                                    onClick={() =>
                                        setSelectedUser(
                                            profile
                                        )
                                    }
                                    className="flex items-center gap-3 flex-1 cursor-pointer"
                                >

                                    {profile.avatar_url ? (
                                        <img
                                            src={
                                                profile.avatar_url
                                            }
                                            alt=""
                                            className="w-14 h-14 rounded-full object-cover"
                                        />
                                    ) : (
                                        <div className="w-14 h-14 rounded-full bg-indigo-600 flex items-center justify-center">
                                            {profile.name
                                                ?.charAt(
                                                    0
                                                )
                                                .toUpperCase()}
                                        </div>
                                    )}

                                    <div className="overflow-hidden">

                                        <h2 className="font-semibold truncate">
                                            {
                                                profile.name
                                            }
                                        </h2>

                                        <p className="text-xs text-gray-400">
                                            {profile.is_online
                                                ? "Online"
                                                : "Offline"}
                                        </p>
                                    </div>
                                </div>

                                <button
                                    type="button"
                                    aria-label="Remove chat"
                                    title="Remove chat"
                                    onClick={() =>
                                        removeChat(
                                            profile.chat_id
                                        )
                                    }
                                    className="text-red-400"
                                >
                                    <Trash2
                                        size={18}
                                    />
                                </button>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>

            {/* CHAT AREA */}
            <div className="flex-1 flex flex-col min-w-0">

                {selectedUser ? (
                    <>
                        {/* TOP */}
                        <div className="h-[80px] border-b border-white/10 bg-[#071226] flex items-center px-5 shrink-0">

                            <div className="flex items-center gap-3">

                                {selectedUser.avatar_url ? (
                                    <img
                                        src={
                                            selectedUser.avatar_url
                                        }
                                        alt=""
                                        className="w-12 h-12 rounded-full object-cover"
                                    />
                                ) : (
                                    <div className="w-12 h-12 rounded-full bg-indigo-600 flex items-center justify-center">
                                        {selectedUser.name
                                            ?.charAt(
                                                0
                                            )
                                            .toUpperCase()}
                                    </div>
                                )}

                                <div>
                                    <h2 className="font-semibold text-lg">
                                        {
                                            selectedUser.name
                                        }
                                    </h2>

                                    <p className="text-xs text-gray-400">
                                        {selectedUser.is_online
                                            ? "Online"
                                            : "Offline"}
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* MESSAGES */}
                        <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-4">

                            {messages.map((msg) => {

                                const mine =
                                    msg.sender_id ===
                                    currentUser.id;

                                return (
                                    <div
                                        key={msg.id}
                                        className={`flex ${mine
                                            ? "justify-end"
                                            : "justify-start"
                                            }`}
                                    >
                                        <div
                                            className={`max-w-[85%] md:max-w-[60%] px-4 py-3 rounded-3xl ${mine
                                                ? "bg-indigo-600"
                                                : "bg-white/10"
                                                }`}
                                        >
                                            <p className="text-sm break-words leading-relaxed">
                                                {
                                                    msg.text
                                                }
                                            </p>

                                            <p className="text-[10px] text-gray-300 mt-1 text-right">
                                                {new Date(
                                                    msg.created_at
                                                ).toLocaleTimeString(
                                                    [],
                                                    {
                                                        hour:
                                                            "2-digit",
                                                        minute:
                                                            "2-digit",
                                                    }
                                                )}
                                            </p>
                                        </div>
                                    </div>
                                );
                            })}

                            <div ref={bottomRef} />
                        </div>

                        {/* INPUT */}
                        <div className="p-4 border-t border-white/10 bg-[#071226] shrink-0">

                            <div className="flex items-center gap-3">

                                <input
                                    type="text"
                                    placeholder="Type a message..."
                                    value={newMessage}
                                    onChange={(
                                        e
                                    ) =>
                                        setNewMessage(
                                            e
                                                .target
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
                                    className="flex-1 bg-white/5 border border-white/10 rounded-2xl px-5 py-3 outline-none focus:border-indigo-500 text-sm"
                                />

                                <button
                                    type="button"
                                    aria-label="Send message"
                                    title="Send message"
                                    onClick={
                                        sendMessage
                                    }
                                    className="w-12 h-12 rounded-2xl bg-indigo-600 hover:bg-indigo-700 flex items-center justify-center shrink-0"
                                >
                                    <Send
                                        size={20}
                                    />
                                </button>
                            </div>
                        </div>
                    </>
                ) : (
                    <div className="flex-1 flex items-center justify-center text-gray-400 px-6 text-center">
                        Select or add a user to start chatting
                    </div>
                )}
            </div>

            {/* ADD USER MODAL */}
            <AnimatePresence>
                {showModal && (
                    <>
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
                                setShowModal(
                                    false
                                )
                            }
                            className="fixed inset-0 bg-black/50 z-50"
                        />

                        <motion.div
                            initial={{
                                scale: 0.9,
                                opacity: 0,
                            }}
                            animate={{
                                scale: 1,
                                opacity: 1,
                            }}
                            exit={{
                                scale: 0.9,
                                opacity: 0,
                            }}
                            className="fixed inset-0 flex items-center justify-center z-50 p-4"
                        >

                            <div className="w-full max-w-md bg-[#071226] border border-white/10 rounded-3xl p-6">

                                <div className="flex items-center justify-between mb-5">

                                    <h2 className="text-2xl font-bold">
                                        Add Chat
                                    </h2>

                                    <button
                                        type="button"
                                        aria-label="Close modal"
                                        title="Close modal"
                                        onClick={() =>
                                            setShowModal(
                                                false
                                            )
                                        }
                                    >
                                        <X
                                            size={24}
                                        />
                                    </button>
                                </div>

                                {/* SEARCH */}
                                <div className="relative mb-5">

                                    <Search
                                        size={18}
                                        className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
                                    />

                                    <input
                                        type="text"
                                        placeholder="Search users..."
                                        value={search}
                                        onChange={(
                                            e
                                        ) =>
                                            setSearch(
                                                e
                                                    .target
                                                    .value
                                            )
                                        }
                                        className="w-full bg-white/5 border border-white/10 rounded-2xl pl-11 pr-4 py-3 outline-none focus:border-indigo-500"
                                    />
                                </div>

                                {/* USERS */}
                                <div className="space-y-3 max-h-[400px] overflow-y-auto">

                                    {filteredUsers.map(
                                        (
                                            profile
                                        ) => (

                                            <div
                                                key={
                                                    profile.id
                                                }
                                                onClick={() =>
                                                    addChatUser(
                                                        profile
                                                    )
                                                }
                                                className="bg-white/5 hover:bg-white/10 p-4 rounded-2xl cursor-pointer transition"
                                            >
                                                <div className="flex items-center gap-3">

                                                    {profile.avatar_url ? (
                                                        <img
                                                            src={
                                                                profile.avatar_url
                                                            }
                                                            alt=""
                                                            className="w-12 h-12 rounded-full object-cover"
                                                        />
                                                    ) : (
                                                        <div className="w-12 h-12 rounded-full bg-indigo-600 flex items-center justify-center">
                                                            {profile.name
                                                                ?.charAt(
                                                                    0
                                                                )
                                                                .toUpperCase()}
                                                        </div>
                                                    )}

                                                    <div>
                                                        <h3 className="font-semibold">
                                                            {
                                                                profile.name
                                                            }
                                                        </h3>

                                                        <p className="text-xs text-gray-400">
                                                            {
                                                                profile.email
                                                            }
                                                        </p>
                                                    </div>
                                                </div>
                                            </div>
                                        )
                                    )}
                                </div>
                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
        </div>
    );
}