import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";

import {
    Upload,
    Link2,
    Search,
    Trash2,
    ExternalLink,
    FileText,
} from "lucide-react";

import { motion } from "framer-motion";

type Resource = {
    id: string;
    title: string;
    type: "pdf" | "link";
    file_url?: string;
    link?: string;
    category?: string;
};

const categories = [
    "All",
    "Programming",
    "Math",
    "Science",
    "Other",
];

export default function Library() {
    const [resources, setResources] =
        useState<Resource[]>([]);

    const [title, setTitle] =
        useState("");

    const [link, setLink] =
        useState("");

    const [file, setFile] =
        useState<File | null>(null);

    const [user, setUser] =
        useState<any>(null);

    const [search, setSearch] =
        useState("");

    const [
        selectedCategory,
        setSelectedCategory,
    ] = useState("All");

    const [category, setCategory] =
        useState("Programming");

    // =========================
    // GET USER
    // =========================
    useEffect(() => {
        supabase.auth
            .getUser()
            .then(({ data }) => {
                setUser(data.user);
            });
    }, []);

    // =========================
    // FETCH RESOURCES
    // =========================
    const fetchResources = async (
        currentUser: any
    ) => {
        if (!currentUser) return;

        const { data } =
            await supabase
                .from("resources")
                .select("*")
                .eq(
                    "user_id",
                    currentUser.id
                )
                .order(
                    "created_at",
                    {
                        ascending:
                            false,
                    }
                );

        setResources(data || []);
    };

    useEffect(() => {
        if (user)
            fetchResources(user);
    }, [user]);

    // =========================
    // UPLOAD PDF
    // =========================
    const uploadFile =
        async () => {
            if (
                !file ||
                !user ||
                !title
            )
                return;

            const fileName = `${user.id}/${Date.now()}-${file.name}`;

            const { error } =
                await supabase.storage
                    .from(
                        "resources"
                    )
                    .upload(
                        fileName,
                        file
                    );

            if (error) {
                alert(
                    error.message
                );
                return;
            }

            const { data } =
                supabase.storage
                    .from(
                        "resources"
                    )
                    .getPublicUrl(
                        fileName
                    );

            await supabase
                .from(
                    "resources"
                )
                .insert([
                    {
                        title,
                        type: "pdf",
                        file_url:
                            data.publicUrl,
                        category,
                        user_id:
                            user.id,
                    },
                ]);

            setTitle("");
            setFile(null);

            fetchResources(user);
        };

    // =========================
    // ADD LINK
    // =========================
    const addLink = async () => {
        if (
            !title ||
            !link ||
            !user
        )
            return;

        await supabase
            .from("resources")
            .insert([
                {
                    title,
                    type: "link",
                    link,
                    category,
                    user_id:
                        user.id,
                },
            ]);

        setTitle("");
        setLink("");

        fetchResources(user);
    };

    // =========================
    // DELETE
    // =========================
    const deleteResource =
        async (
            res: Resource
        ) => {
            if (!user) return;

            await supabase
                .from("resources")
                .delete()
                .eq("id", res.id);

            fetchResources(user);
        };

    // =========================
    // FILTER
    // =========================
    const filtered =
        resources
            .filter((res) =>
                res.title
                    .toLowerCase()
                    .includes(
                        search.toLowerCase()
                    )
            )
            .filter((res) =>
                selectedCategory ===
                    "All"
                    ? true
                    : res.category ===
                    selectedCategory
            );

    return (
        <div className="min-h-screen bg-[#020817] text-white p-4 md:p-6">

            {/* HEADER */}
            <div className="mb-8">

                <h1 className="text-3xl md:text-4xl font-bold">
                    Library
                </h1>

                <p className="text-gray-400 mt-2">
                    Upload and manage
                    your study
                    resources
                </p>
            </div>

            {/* UPLOAD CARD */}
            <motion.div
                initial={{
                    opacity: 0,
                    y: 20,
                }}
                animate={{
                    opacity: 1,
                    y: 0,
                }}
                className="bg-white/5 border border-white/10 backdrop-blur-xl rounded-3xl p-5 md:p-7 mb-8"
            >

                <h2 className="text-xl font-semibold mb-6">
                    Upload Resource
                </h2>

                <div className="space-y-5">

                    {/* TITLE */}
                    <div>
                        <label className="text-sm text-gray-300 block mb-2">
                            Title
                        </label>

                        <input
                            value={title}
                            onChange={(e) =>
                                setTitle(
                                    e.target
                                        .value
                                )
                            }
                            placeholder="Enter title..."
                            className="w-full bg-white/10 border border-white/10 rounded-2xl px-4 py-3 outline-none focus:border-indigo-500"
                        />
                    </div>

                    {/* CATEGORY */}
                    <div>
                        <label htmlFor="category" className="text-sm text-gray-300 block mb-2">
                            Category
                        </label>

                        <select
                            id="category"
                            title="Category"
                            value={
                                category
                            }
                            onChange={(
                                e
                            ) =>
                                setCategory(
                                    e
                                        .target
                                        .value
                                )
                            }
                            className="w-full bg-white/10 border border-white/10 rounded-2xl px-4 py-3 outline-none focus:border-indigo-500"
                        >
                            {categories
                                .slice(1)
                                .map(
                                    (
                                        cat
                                    ) => (
                                        <option
                                            key={
                                                cat
                                            }
                                            className="bg-[#0f172a]"
                                        >
                                            {
                                                cat
                                            }
                                        </option>
                                    )
                                )}
                        </select>
                    </div>

                    {/* PDF */}
                    <div className="bg-white/5 rounded-2xl p-4 border border-white/10">

                        <div className="flex items-center gap-2 mb-4">

                            <Upload
                                size={
                                    18
                                }
                            />

                            <h3 className="font-medium">
                                Upload
                                PDF
                            </h3>
                        </div>

                        <div className="flex flex-col md:flex-row gap-3">

                            <input
                                type="file"
                                title="Select a PDF file to upload"
                                aria-label="Select a PDF file to upload"
                                onChange={(
                                    e
                                ) =>
                                    setFile(
                                        e
                                            .target
                                            .files?.[0] ||
                                        null
                                    )
                                }
                                className="flex-1 text-sm"
                            />

                            <button
                                onClick={
                                    uploadFile
                                }
                                className="bg-indigo-600 hover:bg-indigo-700 transition px-5 py-3 rounded-2xl font-medium"
                            >
                                Upload
                            </button>
                        </div>
                    </div>

                    {/* LINK */}
                    <div className="bg-white/5 rounded-2xl p-4 border border-white/10">

                        <div className="flex items-center gap-2 mb-4">

                            <Link2
                                size={
                                    18
                                }
                            />

                            <h3 className="font-medium">
                                Add
                                Link
                            </h3>
                        </div>

                        <div className="flex flex-col md:flex-row gap-3">

                            <input
                                value={
                                    link
                                }
                                onChange={(
                                    e
                                ) =>
                                    setLink(
                                        e
                                            .target
                                            .value
                                    )
                                }
                                placeholder="Paste URL..."
                                className="flex-1 bg-white/10 border border-white/10 rounded-2xl px-4 py-3 outline-none focus:border-green-500"
                            />

                            <button
                                onClick={
                                    addLink
                                }
                                className="bg-green-600 hover:bg-green-700 transition px-5 py-3 rounded-2xl font-medium"
                            >
                                Add Link
                            </button>
                        </div>
                    </div>
                </div>
            </motion.div>

            {/* SEARCH */}
            <div className="relative mb-6">

                <Search
                    size={18}
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
                />

                <input
                    type="text"
                    placeholder="Search resources..."
                    value={search}
                    onChange={(e) =>
                        setSearch(
                            e.target.value
                        )
                    }
                    className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-4 outline-none focus:border-indigo-500"
                />
            </div>

            {/* FILTERS */}
            <div className="flex flex-wrap gap-3 mb-8">

                {categories.map((cat) => (
                    <button
                        key={cat}
                        onClick={() =>
                            setSelectedCategory(
                                cat
                            )
                        }
                        className={`px-5 py-2 rounded-2xl transition ${selectedCategory ===
                            cat
                            ? "bg-indigo-600"
                            : "bg-white/5 border border-white/10 hover:bg-white/10"
                            }`}
                    >
                        {cat}
                    </button>
                ))}
            </div>

            {/* RESOURCE LIST */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">

                {filtered.map((res) => (
                    <motion.div
                        key={res.id}
                        whileHover={{
                            y: -5,
                        }}
                        className="bg-white/5 border border-white/10 rounded-3xl p-5 backdrop-blur-xl"
                    >

                        {/* TOP */}
                        <div className="flex items-start justify-between gap-3 mb-4">

                            <div className="flex items-center gap-3">

                                <div className="w-12 h-12 rounded-2xl bg-indigo-600/20 flex items-center justify-center">

                                    <FileText
                                        size={
                                            22
                                        }
                                        className="text-indigo-400"
                                    />
                                </div>

                                <div>
                                    <h2 className="font-semibold text-lg line-clamp-1">
                                        {
                                            res.title
                                        }
                                    </h2>

                                    <p className="text-xs text-gray-400">
                                        {
                                            res.type
                                        }{" "}
                                        •{" "}
                                        {
                                            res.category
                                        }
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* ACTIONS */}
                        <div className="flex items-center justify-between mt-6">

                            {res.type ===
                                "pdf" ? (
                                <a
                                    href={
                                        res.file_url
                                    }
                                    target="_blank"
                                    className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 transition px-4 py-2 rounded-xl text-sm"
                                >
                                    <ExternalLink
                                        size={
                                            16
                                        }
                                    />
                                    Open
                                </a>
                            ) : (
                                <a
                                    href={
                                        res.link
                                    }
                                    target="_blank"
                                    className="flex items-center gap-2 bg-green-600 hover:bg-green-700 transition px-4 py-2 rounded-xl text-sm"
                                >
                                    <ExternalLink
                                        size={
                                            16
                                        }
                                    />
                                    Visit
                                </a>
                            )}

                            <button
                                onClick={() =>
                                    deleteResource(
                                        res
                                    )
                                }
                                title="Delete resource"
                                aria-label="Delete resource"
                                className="w-10 h-10 rounded-xl bg-red-600 hover:bg-red-700 transition flex items-center justify-center"
                            >
                                <Trash2
                                    size={
                                        18
                                    }
                                />
                            </button>
                        </div>
                    </motion.div>
                ))}
            </div>

            {/* EMPTY */}
            {filtered.length ===
                0 && (
                    <div className="text-center py-20 text-gray-400">
                        No resources found
                    </div>
                )}
        </div>
    );
}