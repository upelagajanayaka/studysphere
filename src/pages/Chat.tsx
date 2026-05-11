import { useEffect, useRef, useState } from "react";
import { supabase } from "../lib/supabase";
import { Send } from "lucide-react";
import { motion } from "framer-motion";

export default function Chat() {
    const [profiles, setProfiles] = useState<any[]>([]);
    const [selectedUser, setSelectedUser] =
        useState<any>(null);

    const [messages, setMessages] = useState<any[]>([]);
    const [newMessage, setNewMessage] =
        useState("");

    const [currentUser, setCurrentUser] =
        useState<any>(null);

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

        // SET ONLINE
        await supabase
            .from("profiles")
            .update({
                is_online: true,
            })
            .eq("id", user.id);

        getUsers(user.id);
    };

    // =========================
    // GET USERS
    // =========================
    const getUsers = async (myId: string) => {
        const { data, error } = await supabase
            .from("profiles")
            .select("*")
            .neq("id", myId);

        if (!error && data) {
            setProfiles(data);
        }
    };

    // =========================
    // LIVE USER STATUS
    // =========================
    useEffect(() => {
        const channel = supabase
            .channel("profiles-live")
            .on(
                "postgres_changes",
                {
                    event: "*",
                    schema: "public",
                    table: "profiles",
                },
                () => {
                    if (currentUser) {
                        getUsers(currentUser.id);
                    }
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, [currentUser]);

    // =========================
    // GET MESSAGES
    // =========================
    useEffect(() => {
        if (selectedUser && currentUser) {
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
                supabase.removeChannel(channel);
            };
        }
    }, [selectedUser]);

    const fetchMessages = async () => {
        if (!selectedUser || !currentUser)
            return;

        const { data, error } = await supabase
            .from("messages")
            .select("*")
            .or(
                `and(sender_id.eq.${currentUser.id},receiver_id.eq.${selectedUser.id}),and(sender_id.eq.${selectedUser.id},receiver_id.eq.${currentUser.id})`
            )
            .order("created_at", {
                ascending: true,
            });

        if (!error && data) {
            setMessages(data);

            setTimeout(() => {
                bottomRef.current?.scrollIntoView({
                    behavior: "smooth",
                });
            }, 100);
        }
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

        const { error } = await supabase
            .from("messages")
            .insert([
                {
                    text: newMessage,
                    sender_id: currentUser.id,
                    receiver_id:
                        selectedUser.id,
                },
            ]);

        if (error) {
            console.log(error);
            return;
        }

        setNewMessage("");
    };

    return (
        <div className="h-screen bg-[#020817] text-white flex overflow-hidden">

            {/* SIDEBAR */}
            <div className="w-[340px] border-r border-white/10 bg-[#071226] flex flex-col">

                {/* HEADER */}
                <div className="p-6 border-b border-white/10">
                    <h1 className="text-2xl font-bold">
                        Chats
                    </h1>

                    <p className="text-sm text-gray-400 mt-1">
                        StudySphere Messenger
                    </p>
                </div>

                {/* USERS */}
                <div className="flex-1 overflow-y-auto p-4 space-y-3">

                    {profiles.map((profile) => (
                        <motion.div
                            key={profile.id}
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
                                            ?.charAt(0)
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

                                    <p className="text-sm text-gray-400 truncate">
                                        {
                                            profile.email
                                        }
                                    </p>
                                </div>

                                {/* ONLINE STATUS */}
                                <div
                                    className={`w-3 h-3 rounded-full ${profile.is_online
                                        ? "bg-green-400"
                                        : "bg-gray-500"
                                        }`}
                                />
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>

            {/* CHAT AREA */}
            <div className="flex-1 flex flex-col h-full">

                {selectedUser ? (
                    <>
                        {/* TOP BAR */}
                        <div className="h-[85px] border-b border-white/10 bg-[#071226] flex items-center px-6 shrink-0">

                            <div className="flex items-center gap-4">

                                {selectedUser.avatar_url ? (
                                    <img
                                        src={
                                            selectedUser.avatar_url
                                        }
                                        alt=""
                                        className="w-14 h-14 rounded-full object-cover"
                                    />
                                ) : (
                                    <div className="w-14 h-14 rounded-full bg-indigo-600 flex items-center justify-center text-lg font-bold">
                                        {selectedUser.name
                                            ?.charAt(0)
                                            .toUpperCase()}
                                    </div>
                                )}

                                <div>
                                    <h1 className="text-xl font-semibold">
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
                        <div className="flex-1 overflow-y-auto p-5 space-y-4">

                            {messages.map((msg) => {
                                const mine =
                                    msg.sender_id ===
                                    currentUser.id;

                                return (
                                    <motion.div
                                        key={msg.id}
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
                                            className={`max-w-[280px] px-4 py-3 rounded-3xl shadow-lg ${mine
                                                ? "bg-gradient-to-r from-indigo-600 to-purple-600"
                                                : "bg-white/10"
                                                }`}
                                        >
                                            {/* MESSAGE */}
                                            <p className="text-sm leading-relaxed break-words">
                                                {
                                                    msg.text
                                                }
                                            </p>

                                            {/* TIME */}
                                            <p className="text-[10px] text-gray-300 mt-1 text-right">
                                                {new Date(
                                                    msg.created_at
                                                ).toLocaleString(
                                                    "en-LK",
                                                    {
                                                        timeZone:
                                                            "Asia/Colombo",
                                                        hour: "2-digit",
                                                        minute: "2-digit",
                                                        hour12: true,
                                                    }
                                                )}
                                            </p>
                                        </div>
                                    </motion.div>
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
                                    className="flex-1 bg-white/10 border border-white/10 rounded-2xl px-5 py-4 outline-none text-sm focus:border-indigo-500"
                                />

                                <motion.button
                                    whileTap={{
                                        scale: 0.9,
                                    }}
                                    whileHover={{
                                        scale: 1.05,
                                    }}
                                    onClick={
                                        sendMessage
                                    }
                                    className="w-14 h-14 rounded-2xl bg-gradient-to-r from-indigo-600 to-purple-600 flex items-center justify-center shadow-xl"
                                >
                                    <Send size={22} />
                                </motion.button>
                            </div>
                        </div>
                    </>
                ) : (
                    <div className="flex-1 flex items-center justify-center text-gray-400 text-lg">
                        Select a user to start chatting
                    </div>
                )}
            </div>
        </div>
    );
}