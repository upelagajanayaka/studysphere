import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";
import {
    Upload,
    Trash2,
    Search,
    Globe,
    Lock,
    FileText,
    Link as LinkIcon,
} from "lucide-react";

type Resource = {
    id: string;
    title: string;
    type: "pdf" | "link";
    file_url?: string;
    link?: string;
    category?: string;
    visibility?: string;
    user_id?: string;
    created_at?: string;

    profiles?: {
        name?: string;
        avatar_url?: string;
    };
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

    const [selectedCategory, setSelectedCategory] =
        useState("All");

    const [category, setCategory] =
        useState("Programming");

    const [visibility, setVisibility] =
        useState("public");

    const [loading, setLoading] =
        useState(false);

    // =========================
    // GET USER
    // =========================
    useEffect(() => {
        supabase.auth.getUser().then(
            ({ data }) => {
                setUser(data.user);
            }
        );
    }, []);

    // =========================
    // FETCH RESOURCES
    // =========================
    const fetchResources = async (
        currentUser: any
    ) => {
        if (!currentUser) return;

        const { data, error } =
            await supabase
                .from("resources")
                .select(`
                    *,
                    profiles (
                        name,
                        avatar_url
                    )
                `)
                .or(
                    `visibility.eq.public,user_id.eq.${currentUser.id}`
                )
                .order("created_at", {
                    ascending: false,
                });

        if (!error && data) {
            setResources(data);
        }
    };

    useEffect(() => {
        if (user) {
            fetchResources(user);
        }
    }, [user]);

    // =========================
    // UPLOAD FILE
    // =========================
    const uploadFile = async () => {
        if (!file || !title || !user)
            return;

        try {
            setLoading(true);

            const fileName = `${user.id}/${Date.now()}-${file.name}`;

            const { error } =
                await supabase.storage
                    .from("resources")
                    .upload(fileName, file);

            if (error) {
                alert(error.message);
                return;
            }

            const {
                data: { publicUrl },
            } = supabase.storage
                .from("resources")
                .getPublicUrl(fileName);

            const { error: insertError } =
                await supabase
                    .from("resources")
                    .insert([
                        {
                            title,
                            type: "pdf",
                            file_url: publicUrl,
                            category,
                            visibility,
                            user_id: user.id,
                        },
                    ]);

            if (insertError) {
                alert(insertError.message);
                return;
            }

            setTitle("");
            setFile(null);

            fetchResources(user);

        } catch (err) {
            console.log(err);
        } finally {
            setLoading(false);
        }
    };

    // =========================
    // ADD LINK
    // =========================
    const addLink = async () => {
        if (!title || !link || !user)
            return;

        try {
            setLoading(true);

            const { error } =
                await supabase
                    .from("resources")
                    .insert([
                        {
                            title,
                            type: "link",
                            link,
                            category,
                            visibility,
                            user_id: user.id,
                        },
                    ]);

            if (error) {
                alert(error.message);
                return;
            }

            setTitle("");
            setLink("");

            fetchResources(user);

        } catch (err) {
            console.log(err);
        } finally {
            setLoading(false);
        }
    };

    // =========================
    // DELETE
    // =========================
    const deleteResource = async (
        res: Resource
    ) => {
        if (!user) return;

        const confirmDelete =
            window.confirm(
                "Delete this resource?"
            );

        if (!confirmDelete) return;

        await supabase
            .from("resources")
            .delete()
            .eq("id", res.id);

        fetchResources(user);
    };

    // =========================
    // FILTERS
    // =========================
    const filtered = resources
        .filter((res) =>
            res.title
                .toLowerCase()
                .includes(
                    search.toLowerCase()
                )
        )
        .filter((res) =>
            selectedCategory === "All"
                ? true
                : res.category ===
                selectedCategory
        );

    const publicResources =
        filtered.filter(
            (r) =>
                r.visibility === "public"
        );

    const privateResources =
        filtered.filter(
            (r) =>
                r.visibility === "private" &&
                r.user_id === user?.id
        );

    // =========================
    // CARD
    // =========================
    const ResourceCard = ({
        res,
    }: {
        res: Resource;
    }) => (
        <div className="bg-[#071226] border border-white/10 rounded-3xl p-5 hover:border-indigo-500 transition">

            {/* TOP */}
            <div className="flex items-start justify-between gap-3">

                <div className="flex gap-4">

                    {/* ICON */}
                    <div className="w-14 h-14 rounded-2xl bg-indigo-600/20 flex items-center justify-center shrink-0">
                        <FileText size={24} />
                    </div>

                    {/* CONTENT */}
                    <div>

                        <h3 className="text-lg font-semibold break-words">
                            {res.title}
                        </h3>

                        <p className="text-sm text-gray-400 mt-1">
                            {res.category}
                        </p>

                        {/* USER */}
                        <div className="flex items-center gap-3 mt-4">

                            {res.profiles
                                ?.avatar_url ? (
                                <img
                                    src={
                                        res
                                            .profiles
                                            .avatar_url
                                    }
                                    alt=""
                                    className="w-10 h-10 rounded-full object-cover"
                                />
                            ) : (
                                <div className="w-10 h-10 rounded-full bg-indigo-600 flex items-center justify-center text-sm font-bold">
                                    {res.profiles?.name
                                        ?.charAt(
                                            0
                                        )
                                        .toUpperCase()}
                                </div>
                            )}

                            <div>
                                <p className="text-sm font-medium">
                                    {res.profiles
                                        ?.name ||
                                        "Unknown User"}
                                </p>

                                <p className="text-xs text-gray-500">
                                    {new Date(
                                        res.created_at ||
                                        ""
                                    ).toLocaleDateString()}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* VISIBILITY */}
                <div
                    className={`flex items-center gap-1 px-3 py-1 rounded-full text-xs ${res.visibility ===
                        "public"
                        ? "bg-green-500/20 text-green-400"
                        : "bg-yellow-500/20 text-yellow-400"
                        }`}
                >
                    {res.visibility ===
                        "public" ? (
                        <>
                            <Globe size={12} />
                            Public
                        </>
                    ) : (
                        <>
                            <Lock size={12} />
                            Private
                        </>
                    )}
                </div>
            </div>

            {/* BUTTONS */}
            <div className="flex gap-3 mt-6">

                {res.type === "pdf" ? (
                    <a
                        href={res.file_url}
                        target="_blank"
                        className="flex-1 bg-indigo-600 hover:bg-indigo-700 py-3 rounded-2xl text-center transition"
                    >
                        Open PDF
                    </a>
                ) : (
                    <a
                        href={res.link}
                        target="_blank"
                        className="flex-1 bg-green-600 hover:bg-green-700 py-3 rounded-2xl text-center transition flex items-center justify-center gap-2"
                    >
                        <LinkIcon size={18} />
                        Visit Link
                    </a>
                )}

                {res.user_id ===
                    user?.id && (
                        <button
                            onClick={() =>
                                deleteResource(
                                    res
                                )
                            }
                            aria-label="Delete resource"
                            title="Delete resource"
                            className="bg-red-600 hover:bg-red-700 p-3 rounded-2xl transition"
                        >
                            <Trash2 size={18} />
                        </button>
                    )}
            </div>
        </div>
    );

    return (
        <div className="min-h-screen bg-[#020817] text-white p-4 md:p-6">

            {/* HEADER */}
            <div className="mb-8">
                <h1 className="text-4xl font-bold">
                    Resource Library
                </h1>

                <p className="text-gray-400 mt-2">
                    Share and discover study
                    resources.
                </p>
            </div>

            {/* UPLOAD BOX */}
            <div className="bg-[#071226] border border-white/10 rounded-3xl p-5 md:p-6 mb-8">

                <h2 className="text-2xl font-semibold mb-6">
                    Upload Resource
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">

                    {/* TITLE */}
                    <div>
                        <label className="text-sm text-gray-400 mb-2 block">
                            Title
                        </label>
                        <input
                            type="text"
                            placeholder="Title"
                            value={title}
                            onChange={(e) =>
                                setTitle(
                                    e.target.value
                                )
                            }
                            className="bg-white/5 border border-white/10 rounded-2xl px-4 py-3 outline-none focus:border-indigo-500"
                        />
                    </div>

                    {/* CATEGORY */}
                    <div>
                        <label htmlFor="profile-category-select" className="text-sm text-gray-400 mb-2 block">
                            Category
                        </label>
                        <select
                            id="profile-category-select"
                            value={category}
                            onChange={(e) =>
                                setCategory(
                                    e.target.value
                                )
                            }
                            className="bg-white/5 border border-white/10 rounded-2xl px-4 py-3 outline-none"
                        >
                            {categories
                                .slice(1)
                                .map((cat) => (
                                    <option
                                        key={cat}
                                        value={cat}
                                        className="bg-[#071226]"
                                    >
                                        {cat}
                                    </option>
                                ))}
                        </select>
                    </div>

                    {/* VISIBILITY */}
                    <div>
                        <label htmlFor="profile-visibility-select" className="text-sm text-gray-400 mb-2 block">
                            Visibility
                        </label>
                        <select
                            id="profile-visibility-select"
                            value={visibility}
                            onChange={(e) =>
                                setVisibility(
                                    e.target.value
                                )
                            }
                            className="bg-white/5 border border-white/10 rounded-2xl px-4 py-3 outline-none"
                        >
                            <option value="public">
                                Public
                            </option>

                            <option value="private">
                                Private
                            </option>
                        </select>
                    </div>

                    {/* FILE */}
                    <div>
                        <label className="text-sm text-gray-400 mb-2 block">
                            Upload PDF
                        </label>
                        <input
                            type="file"
                            accept=".pdf"
                            onChange={(e) =>
                                setFile(
                                    e.target
                                        .files?.[0] ||
                                    null
                                )
                            }
                            title="Upload PDF file"
                            className="bg-white/5 border border-white/10 rounded-2xl px-4 py-3"
                        />
                    </div>
                </div>

                {/* LINK */}
                <div className="mt-5">
                    <label className="text-sm text-gray-400 mb-2 block">
                        Or Add Link
                    </label>
                    <div className="flex flex-col md:flex-row gap-3">

                        <input
                            type="text"
                            placeholder="Paste link..."
                            value={link}
                            onChange={(e) =>
                                setLink(
                                    e.target.value
                                )
                            }
                            className="flex-1 bg-white/5 border border-white/10 rounded-2xl px-4 py-3 outline-none"
                        />

                        <button
                            onClick={addLink}
                            className="bg-green-600 hover:bg-green-700 px-6 py-3 rounded-2xl transition"
                        >
                            Add Link
                        </button>
                    </div>
                </div>

                {/* UPLOAD */}
                <button
                    onClick={uploadFile}
                    disabled={loading}
                    className="mt-6 bg-indigo-600 hover:bg-indigo-700 px-6 py-3 rounded-2xl transition flex items-center gap-2"
                >
                    <Upload size={18} />

                    {loading
                        ? "Uploading..."
                        : "Upload PDF"}
                </button>
            </div>

            {/* SEARCH */}
            <div className="mb-8">
                <label htmlFor="search-input" className="sr-only">Search resources</label>
                <div className="relative">

                    <Search
                        size={18}
                        className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
                    />

                    <input
                        id="search-input"
                        type="text"
                        placeholder="Search resources..."
                        value={search}
                        onChange={(e) =>
                            setSearch(
                                e.target.value
                            )
                        }
                        className="w-full bg-[#071226] border border-white/10 rounded-2xl pl-12 pr-4 py-4 outline-none focus:border-indigo-500"
                    />
                </div>
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
                        className={`px-4 py-2 rounded-xl transition ${selectedCategory ===
                            cat
                            ? "bg-indigo-600"
                            : "bg-white/5 hover:bg-white/10"
                            }`}
                    >
                        {cat}
                    </button>
                ))}
            </div>

            {/* PUBLIC */}
            <div className="mb-12">

                <div className="flex items-center gap-3 mb-6">
                    <Globe className="text-green-400" />

                    <h2 className="text-3xl font-bold">
                        Public Resources
                    </h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">

                    {publicResources.map(
                        (res) => (
                            <ResourceCard
                                key={res.id}
                                res={res}
                            />
                        )
                    )}
                </div>
            </div>

            {/* PRIVATE */}
            <div>

                <div className="flex items-center gap-3 mb-6">
                    <Lock className="text-yellow-400" />

                    <h2 className="text-3xl font-bold">
                        My Private Resources
                    </h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">

                    {privateResources.map(
                        (res) => (
                            <ResourceCard
                                key={res.id}
                                res={res}
                            />
                        )
                    )}
                </div>
            </div>
        </div>
    );
}