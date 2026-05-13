import { useEffect, useRef, useState } from "react";
import { supabase } from "../lib/supabase";
import {
    Send,
    Plus,
    X,
    Search,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function Chat() {
    const [profiles, setProfiles] = useState<any[]>([]);
    const [allUsers, setAllUsers] = useState<any[]>([]);
    const [selectedUser, setSelectedUser] =
        useState<any>(null);

    const [messages, setMessages] = useState<any[]>([]);
    const [newMessage, setNewMessage] =
        useState("");

    const [currentUser, setCurrentUser] =
        useState<any>(null);

    const [showModal, setShowModal] =
        useState(false);

    const [search, setSearch] = useState("");

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

        // ONLINE STATUS
        await supabase
            .from("profiles")
            .update({
                is_online: true,
            })
            .eq("id", user.id);

        getChatUsers(user.id);
        getAllUsers(user.id);
    };

    // =========================
    // GET CHAT USERS
    // =========================
    const getChatUsers = async (
        myId: string
    ) => {
        const { data: messagesData } =
            await supabase
                .from("messages")
                .select(
                    "sender_id, receiver_id"
                );

        if (!messagesData) return;

        const userIds = new Set<string>();

        messagesData.forEach((msg) => {
            if (
                msg.sender_id === myId
            ) {
                userIds.add(
                    msg.receiver_id
                );
            }

            if (
                msg.receiver_id === myId
            ) {
                userIds.add(
                    msg.sender_id
                );
            }
        });

        const ids = Array.from(userIds);

        if (ids.length === 0) {
            setProfiles([]);
            return;
        }

        const { data } = await supabase
            .from("profiles")
            .select("*")
            .in("id", ids);

        setProfiles(data || []);
    };

    // =========================
    // GET ALL USERS
    // =========================
    const getAllUsers = async (
        myId: string
    ) => {
        const { data } = await supabase
            .from("profiles")
            .select("*")
            .neq("id", myId);

        setAllUsers(data || []);
    };

    // =========================
    // FETCH MESSAGES
    // =========================
    useEffect(() => {
        if (
            selectedUser &&
            currentUser
        ) {
            fetchMessages();

            const channel = supabase
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

    const fetchMessages = async () => {
        if (
            !selectedUser ||
            !currentUser
        )
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
            bottomRef.current?.scrollIntoView(
                {
                    behavior: "smooth",
                }
            );
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
                    sender_id:
                        currentUser.id,
                    receiver_id:
                        selectedUser.id,
                },
            ]);

        setNewMessage("");
    };

    // =========================
    // FORMAT TIME
    // =========================
    const formatTime = (
        time: string
    ) => {
        return new Date(
            time
        ).toLocaleTimeString(
            "en-LK",
            {
                hour: "2-digit",
                minute: "2-digit",
                hour12: true,
            }
        );
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
        <div
            className="
            h-screen
            bg-[#020817]
            text-white
            flex
            flex-col
            md:flex-row
            overflow-hidden
            w-full
        "
        >
            {/* SIDEBAR */}
            <div
                className="
                w-full
                md:w-[340px]
                h-[320px]
                md:h-full
                border-r
                md:border-r
                border-b
                md:border-b-0
                border-white/10
                bg-[#071226]
                flex
                flex-col
                shrink-0
            "
            >
                {/* HEADER */}
                <div className="p-5 border-b border-white/10 flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold">
                            Chats
                        </h1>

                        <p className="text-sm text-gray-400">
                            Private messages
                        </p>
                    </div>

                    {/* ADD USER */}
                    <button
                        onClick={() =>
                            setShowModal(
                                true
                            )
                        }
                        className="w-12 h-12 rounded-2xl bg-gradient-to-r from-indigo-600 to-purple-600 flex items-center justify-center"
                        aria-label="Add new chat"
                    >
                        <Plus size={24} />
                    </button>
                </div>

                {/* USERS */}
                <div className="flex-1 overflow-y-auto p-4 space-y-3">
                    {profiles.map(
                        (profile) => (
                            <motion.div
                                key={
                                    profile.id
                                }
                                whileHover={{
                                    scale: 1.02,
                                }}
                                whileTap={{
                                    scale: 0.98,
                                }}
                                onClick={() =>
                                    setSelectedUser(
                                        profile
                                    )
                                }
                                className={`p-4 rounded-3xl cursor-pointer transition-all border ${selectedUser?.id ===
                                    profile.id
                                    ? "bg-gradient-to-r from-indigo-600 to-purple-600 border-transparent"
                                    : "bg-white/5 border-white/10 hover:bg-white/10"
                                    }`}
                            >
                                <div className="flex items-center gap-4">
                                    {/* AVATAR */}
                                    {profile.avatar_url ? (
                                        <img
                                            src={
                                                profile.avatar_url
                                            }
                                            alt=""
                                            className="w-14 h-14 rounded-full object-cover"
                                        />
                                    ) : (
                                        <div className="w-14 h-14 rounded-full bg-indigo-600 flex items-center justify-center text-lg font-bold">
                                            {profile.name
                                                ?.charAt(
                                                    0
                                                )
                                                .toUpperCase()}
                                        </div>
                                    )}

                                    {/* INFO */}
                                    <div className="flex-1 overflow-hidden">
                                        <h2 className="font-semibold text-lg truncate">
                                            {
                                                profile.name
                                            }
                                        </h2>

                                        <p className="text-sm text-gray-400">
                                            {profile.is_online
                                                ? "Online"
                                                : "Offline"}
                                        </p>
                                    </div>

                                    {/* STATUS */}
                                    <div
                                        className={`w-3 h-3 rounded-full ${profile.is_online
                                            ? "bg-green-400"
                                            : "bg-gray-500"
                                            }`}
                                    />
                                </div>
                            </motion.div>
                        )
                    )}
                </div>
            </div>

            {/* CHAT AREA */}
            <div className="flex-1 flex flex-col h-full min-w-0">
                {selectedUser ? (
                    <>
                        {/* TOP BAR */}
                        <div className="h-[80px] border-b border-white/10 bg-[#071226] flex items-center px-5 shrink-0">
                            <div className="flex items-center gap-4">
                                {selectedUser.avatar_url ? (
                                    <img
                                        src={
                                            selectedUser.avatar_url
                                        }
                                        alt=""
                                        className="w-12 h-12 rounded-full object-cover"
                                    />
                                ) : (
                                    <div className="w-12 h-12 rounded-full bg-indigo-600 flex items-center justify-center text-lg font-bold">
                                        {selectedUser.name
                                            ?.charAt(
                                                0
                                            )
                                            .toUpperCase()}
                                    </div>
                                )}

                                <div>
                                    <h1 className="text-lg font-semibold">
                                        {
                                            selectedUser.name
                                        }
                                    </h1>

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
                        <div className="flex-1 overflow-y-auto overflow-x-hidden p-4 space-y-4">
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
                                                className={`max-w-[240px] md:max-w-[320px] px-4 py-3 rounded-3xl shadow-lg ${mine
                                                    ? "bg-gradient-to-r from-indigo-600 to-purple-600"
                                                    : "bg-white/10"
                                                    }`}
                                            >
                                                <p className="text-sm break-words">
                                                    {
                                                        msg.text
                                                    }
                                                </p>

                                                <p className="text-[10px] text-gray-300 mt-1 text-right">
                                                    {formatTime(
                                                        msg.created_at
                                                    )}
                                                </p>
                                            </div>
                                        </motion.div>
                                    );
                                }
                            )}

                            <div
                                ref={
                                    bottomRef
                                }
                            />
                        </div>

                        {/* INPUT */}
                        <div className="p-4 border-t border-white/10 bg-[#071226] shrink-0">
                            <div className="flex items-center gap-3">
                                <input
                                    type="text"
                                    placeholder="Type a message..."
                                    value={
                                        newMessage
                                    }
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
                                    className="flex-1 bg-white/10 border border-white/10 rounded-2xl px-5 py-3 outline-none text-sm focus:border-indigo-500"
                                />

                                <button
                                    onClick={
                                        sendMessage
                                    }
                                    className="w-12 h-12 rounded-2xl bg-gradient-to-r from-indigo-600 to-purple-600 flex items-center justify-center"
                                    aria-label="Send message"
                                >
                                    <Send
                                        size={
                                            20
                                        }
                                    />
                                </button>
                            </div>
                        </div>
                    </>
                ) : (
                    <div className="flex-1 flex items-center justify-center text-gray-400 text-lg p-5 text-center">
                        Select a user to
                        start chatting
                    </div>
                )}
            </div>

            {/* MODAL */}
            <AnimatePresence>
                {showModal && (
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
                                setShowModal(
                                    false
                                )
                            }
                            className="fixed inset-0 bg-black/60 z-40"
                        />

                        {/* MODAL */}
                        <motion.div
                            initial={{
                                opacity: 0,
                                scale: 0.9,
                            }}
                            animate={{
                                opacity: 1,
                                scale: 1,
                            }}
                            exit={{
                                opacity: 0,
                                scale: 0.9,
                            }}
                            className="
                            fixed
                            inset-0
                            z-50
                            flex
                            items-center
                            justify-center
                            p-4
                        "
                        >
                            <div
                                className="
                                w-[95%]
                                max-w-lg
                                bg-[#071226]
                                border
                                border-white/10
                                rounded-3xl
                                p-6
                                max-h-[80vh]
                                overflow-hidden
                            "
                            >
                                {/* HEADER */}
                                <div className="flex items-center justify-between mb-5">
                                    <h1 className="text-3xl font-bold">
                                        All
                                        Users
                                    </h1>

                                    <button
                                        onClick={() =>
                                            setShowModal(
                                                false
                                            )
                                        }
                                        className="w-12 h-12 rounded-2xl bg-white/10 flex items-center justify-center"
                                        aria-label="Close user selection"
                                    >
                                        <X
                                            size={
                                                24
                                            }
                                        />
                                    </button>
                                </div>

                                {/* SEARCH */}
                                <div className="relative mb-5">
                                    <Search
                                        size={
                                            20
                                        }
                                        className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
                                    />

                                    <input
                                        type="text"
                                        placeholder="Search users..."
                                        value={
                                            search
                                        }
                                        onChange={(
                                            e
                                        ) =>
                                            setSearch(
                                                e
                                                    .target
                                                    .value
                                            )
                                        }
                                        className="w-full bg-white/10 border border-white/10 rounded-2xl pl-12 pr-4 py-4 outline-none"
                                    />
                                </div>

                                {/* USERS */}
                                <div className="space-y-3 overflow-y-auto max-h-[50vh] pr-1">
                                    {filteredUsers.map(
                                        (
                                            user
                                        ) => (
                                            <div
                                                key={
                                                    user.id
                                                }
                                                onClick={() => {
                                                    setSelectedUser(
                                                        user
                                                    );

                                                    setShowModal(
                                                        false
                                                    );

                                                    if (
                                                        !profiles.find(
                                                            (
                                                                p
                                                            ) =>
                                                                p.id ===
                                                                user.id
                                                        )
                                                    ) {
                                                        setProfiles(
                                                            (
                                                                prev
                                                            ) => [
                                                                    ...prev,
                                                                    user,
                                                                ]
                                                        );
                                                    }
                                                }}
                                                className="bg-white/10 hover:bg-white/20 transition p-4 rounded-2xl cursor-pointer flex items-center gap-4"
                                            >
                                                {user.avatar_url ? (
                                                    <img
                                                        src={
                                                            user.avatar_url
                                                        }
                                                        alt=""
                                                        className="w-14 h-14 rounded-full object-cover"
                                                    />
                                                ) : (
                                                    <div className="w-14 h-14 rounded-full bg-indigo-600 flex items-center justify-center text-lg font-bold">
                                                        {user.name
                                                            ?.charAt(
                                                                0
                                                            )
                                                            .toUpperCase()}
                                                    </div>
                                                )}

                                                <div>
                                                    <h2 className="font-semibold text-lg">
                                                        {
                                                            user.name
                                                        }
                                                    </h2>

                                                    <p className="text-sm text-gray-400">
                                                        {
                                                            user.email
                                                        }
                                                    </p>
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