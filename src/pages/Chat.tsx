import {
    useEffect,
    useRef,
    useState,
} from "react";

import { supabase } from "../lib/supabase";

import {
    Send,
    Plus,
    Search,
    ArrowLeft,
    X,
} from "lucide-react";

import { motion, AnimatePresence } from "framer-motion";

export default function Chat() {

    const [profiles, setProfiles] =
        useState<any[]>([]);

    const [chatUsers, setChatUsers] =
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

        // ONLINE
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

        const { data, error } =
            await supabase
                .from("profiles")
                .select("*")
                .neq("id", myId);

        if (!error && data) {
            setProfiles(data);
        }

        // CHAT LIST
        const saved =
            localStorage.getItem(
                `chat_users_${myId}`
            );

        if (saved) {
            setChatUsers(
                JSON.parse(saved)
            );
        }
    };

    // =========================
    // SAVE CHAT USERS
    // =========================
    const saveChatUsers = (
        users: any[]
    ) => {

        if (!currentUser) return;

        localStorage.setItem(
            `chat_users_${currentUser.id}`,
            JSON.stringify(users)
        );

        setChatUsers(users);
    };

    // =========================
    // ADD USER
    // =========================
    const addUserToChat = (
        user: any
    ) => {

        const exists =
            chatUsers.find(
                (u) => u.id === user.id
            );

        if (exists) return;

        const updated = [
            user,
            ...chatUsers,
        ];

        saveChatUsers(updated);

        setShowModal(false);
    };

    // =========================
    // REMOVE USER
    // =========================
    const removeUser = (
        id: string
    ) => {

        const updated =
            chatUsers.filter(
                (u) => u.id !== id
            );

        saveChatUsers(updated);

        if (
            selectedUser?.id === id
        ) {
            setSelectedUser(null);
        }
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

            const channel =
                supabase
                    .channel(
                        "chat-room"
                    )
                    .on(
                        "postgres_changes",
                        {
                            event: "*",
                            schema:
                                "public",
                            table:
                                "messages",
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

            const {
                data,
                error,
            } = await supabase
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

            if (
                !error &&
                data
            ) {

                setMessages(data);

                setTimeout(() => {
                    bottomRef.current?.scrollIntoView(
                        {
                            behavior:
                                "smooth",
                        }
                    );
                }, 100);
            }
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

            const { error } =
                await supabase
                    .from(
                        "messages"
                    )
                    .insert([
                        {
                            text: newMessage,
                            sender_id:
                                currentUser.id,
                            receiver_id:
                                selectedUser.id,
                        },
                    ]);

            if (error) {
                console.log(
                    error
                );
                return;
            }

            setNewMessage("");
        };

    // =========================
    // FILTER USERS
    // =========================
    const filteredUsers =
        profiles.filter((u) =>
            u.name
                ?.toLowerCase()
                .includes(
                    search.toLowerCase()
                )
        );

    return (
        <div className="h-screen bg-[#020817] text-white flex overflow-hidden">

            {/* SIDEBAR */}
            <div
                className={`
                    ${selectedUser
                        ? "hidden md:flex"
                        : "flex"
                    }

                    w-full md:w-[340px]
                    bg-[#071226]
                    border-r border-white/10
                    flex-col
                    shrink-0
                `}
            >

                {/* MOBILE HEADER */}
                <div className="md:hidden h-[70px] border-b border-white/10 flex items-center justify-between px-4">

                    <div>
                        <h1 className="text-xl font-bold">
                            Chats
                        </h1>

                        <p className="text-xs text-gray-400">
                            StudySphere Messenger
                        </p>
                    </div>

                    <button
                        type="button"
                        title="Add User"
                        aria-label="Add User"
                        onClick={() =>
                            setShowModal(true)
                        }
                        className="w-11 h-11 rounded-2xl bg-indigo-600 hover:bg-indigo-700 flex items-center justify-center"
                    >
                        <Plus size={22} />
                    </button>
                </div>

                {/* DESKTOP HEADER */}
                <div className="hidden md:flex p-6 border-b border-white/10 items-center justify-between">

                    <div>
                        <h1 className="text-2xl font-bold">
                            Chats
                        </h1>

                        <p className="text-sm text-gray-400 mt-1">
                            StudySphere Messenger
                        </p>
                    </div>

                    <button
                        type="button"
                        title="Add User"
                        aria-label="Add User"
                        onClick={() =>
                            setShowModal(true)
                        }
                        className="w-12 h-12 rounded-2xl bg-indigo-600 hover:bg-indigo-700 flex items-center justify-center"
                    >
                        <Plus size={22} />
                    </button>
                </div>

                {/* USERS */}
                <div className="flex-1 overflow-y-auto p-4 space-y-3">

                    {chatUsers.length === 0 && (
                        <div className="text-center text-gray-400 mt-10">
                            No chats yet
                        </div>
                    )}

                    {chatUsers.map(
                        (profile) => (
                            <motion.div
                                key={
                                    profile.id
                                }
                                whileHover={{
                                    scale: 1.02,
                                }}
                                onClick={() =>
                                    setSelectedUser(
                                        profile
                                    )
                                }
                                className={`p-4 rounded-3xl cursor-pointer border transition ${selectedUser?.id ===
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

                                    {/* REMOVE */}
                                    <button
                                        type="button"
                                        title="Remove Chat"
                                        aria-label="Remove Chat"
                                        onClick={(
                                            e
                                        ) => {
                                            e.stopPropagation();

                                            removeUser(
                                                profile.id
                                            );
                                        }}
                                        className="text-gray-400 hover:text-red-400"
                                    >
                                        <X
                                            size={
                                                18
                                            }
                                        />
                                    </button>
                                </div>
                            </motion.div>
                        )
                    )}
                </div>
            </div>

            {/* CHAT AREA */}
            <div
                className={`
                    ${selectedUser
                        ? "flex"
                        : "hidden md:flex"
                    }

                    flex-1
                    flex-col
                    h-full
                `}
            >

                {selectedUser ? (
                    <>
                        {/* CHAT HEADER */}
                        <div className="h-[80px] border-b border-white/10 bg-[#071226] flex items-center px-4 md:px-6 shrink-0">

                            {/* BACK */}
                            <button
                                type="button"
                                title="Back"
                                aria-label="Back"
                                onClick={() =>
                                    setSelectedUser(null)
                                }
                                className="md:hidden mr-3 bg-white/10 p-2 rounded-xl"
                            >
                                <ArrowLeft
                                    size={
                                        20
                                    }
                                />
                            </button>

                            {/* AVATAR */}
                            {selectedUser.avatar_url ? (
                                <img
                                    src={
                                        selectedUser.avatar_url
                                    }
                                    alt=""
                                    className="w-12 h-12 rounded-full object-cover"
                                />
                            ) : (
                                <div className="w-12 h-12 rounded-full bg-indigo-600 flex items-center justify-center font-bold">
                                    {selectedUser.name
                                        ?.charAt(
                                            0
                                        )
                                        .toUpperCase()}
                                </div>
                            )}

                            {/* INFO */}
                            <div className="ml-4 overflow-hidden">

                                <h1 className="font-semibold truncate">
                                    {
                                        selectedUser.name
                                    }
                                </h1>

                                <p className="text-sm text-green-400">
                                    Online
                                </p>
                            </div>
                        </div>

                        {/* MESSAGES */}
                        <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-4">

                            {messages.map(
                                (msg) => {

                                    const mine =
                                        msg.sender_id ===
                                        currentUser.id;

                                    return (
                                        <div
                                            key={
                                                msg.id
                                            }
                                            className={`flex ${mine
                                                ? "justify-end"
                                                : "justify-start"
                                                }`}
                                        >
                                            <div
                                                className={`max-w-[85%] md:max-w-[70%] px-4 py-3 rounded-3xl ${mine
                                                    ? "bg-gradient-to-r from-indigo-600 to-purple-600"
                                                    : "bg-white/10"
                                                    }`}
                                            >
                                                <p className="text-sm break-words">
                                                    {
                                                        msg.text
                                                    }
                                                </p>

                                                <p className="text-[10px] text-gray-300 mt-2 text-right">
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
                                }
                            )}

                            <div
                                ref={
                                    bottomRef
                                }
                            />
                        </div>

                        {/* INPUT */}
                        <div className="p-4 border-t border-white/10 bg-[#071226]">

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
                                    className="flex-1 bg-white/10 border border-white/10 rounded-2xl px-5 py-4 outline-none text-sm focus:border-indigo-500"
                                />

                                <button
                                    type="button"
                                    title="Send Message"
                                    aria-label="Send Message"
                                    onClick={
                                        sendMessage
                                    }
                                    className="w-14 h-14 rounded-2xl bg-gradient-to-r from-indigo-600 to-purple-600 flex items-center justify-center shrink-0"
                                >
                                    <Send
                                        size={
                                            22
                                        }
                                    />
                                </button>
                            </div>
                        </div>
                    </>
                ) : (
                    <div className="hidden md:flex flex-1 items-center justify-center text-gray-400">
                        Select a user to start chatting
                    </div>
                )}
            </div>

            {/* ADD USER MODAL */}
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
                                setShowModal(false)
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
                            className="fixed inset-0 flex items-center justify-center z-50 p-4"
                        >

                            <div className="w-full max-w-md bg-[#071226] border border-white/10 rounded-3xl p-6">

                                {/* HEADER */}
                                <div className="flex items-center justify-between mb-5">

                                    <h2 className="text-2xl font-bold">
                                        Add User
                                    </h2>

                                    <button
                                        type="button"
                                        title="Close"
                                        aria-label="Close"
                                        onClick={() =>
                                            setShowModal(false)
                                        }
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
                                            18
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
                                        className="w-full bg-white/5 border border-white/10 rounded-2xl pl-12 pr-4 py-3 outline-none focus:border-indigo-500"
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
                                                className="bg-white/5 border border-white/10 rounded-2xl p-4 flex items-center justify-between"
                                            >

                                                <div className="flex items-center gap-3 overflow-hidden">

                                                    {profile.avatar_url ? (
                                                        <img
                                                            src={
                                                                profile.avatar_url
                                                            }
                                                            alt=""
                                                            className="w-12 h-12 rounded-full object-cover"
                                                        />
                                                    ) : (
                                                        <div className="w-12 h-12 rounded-full bg-indigo-600 flex items-center justify-center font-bold">
                                                            {profile.name
                                                                ?.charAt(
                                                                    0
                                                                )
                                                                .toUpperCase()}
                                                        </div>
                                                    )}

                                                    <div className="overflow-hidden">

                                                        <h3 className="font-medium truncate">
                                                            {
                                                                profile.name
                                                            }
                                                        </h3>

                                                        <p className="text-sm text-gray-400 truncate">
                                                            {
                                                                profile.email
                                                            }
                                                        </p>
                                                    </div>
                                                </div>

                                                <button
                                                    type="button"
                                                    title="Add User"
                                                    aria-label="Add User"
                                                    onClick={() =>
                                                        addUserToChat(
                                                            profile
                                                        )
                                                    }
                                                    className="bg-indigo-600 hover:bg-indigo-700 px-4 py-2 rounded-xl text-sm shrink-0"
                                                >
                                                    Add
                                                </button>
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