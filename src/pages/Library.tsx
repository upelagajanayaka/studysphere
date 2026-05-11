import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";

type Resource = {
    id: string;
    title: string;
    type: "pdf" | "link";
    file_url?: string;
    link?: string;
    category?: string;
};

const categories = ["All", "Programming", "Math", "Science", "Other"];

export default function Library() {
    const [resources, setResources] = useState<Resource[]>([]);
    const [title, setTitle] = useState("");
    const [link, setLink] = useState("");
    const [file, setFile] = useState<File | null>(null);
    const [user, setUser] = useState<any>(null);
    const [search, setSearch] = useState("");
    const [selectedCategory, setSelectedCategory] = useState("All");
    const [category, setCategory] = useState("Programming");

    // 🔐 Get user
    useEffect(() => {
        supabase.auth.getUser().then(({ data }) => {
            setUser(data.user);
        });
    }, []);

    // 📥 Fetch resources
    const fetchResources = async (currentUser: any) => {
        if (!currentUser) return;

        const { data } = await supabase
            .from("resources")
            .select("*")
            .eq("user_id", currentUser.id)
            .order("created_at", { ascending: false });

        setResources(data || []);
    };

    useEffect(() => {
        if (user) fetchResources(user);
    }, [user]);

    // 📤 Upload PDF
    const uploadFile = async () => {
        if (!file || !user || !title) return;

        const fileName = `${user.id}/${Date.now()}-${file.name}`;

        const { error } = await supabase.storage
            .from("resources")
            .upload(fileName, file);

        if (error) {
            alert(error.message);
            return;
        }

        const { data } = supabase.storage
            .from("resources")
            .getPublicUrl(fileName);

        await supabase.from("resources").insert([
            {
                title,
                type: "pdf",
                file_url: data.publicUrl,
                category,
                user_id: user.id,
            },
        ]);

        setTitle("");
        setFile(null);
        fetchResources(user);
    };

    // 🔗 Add link
    const addLink = async () => {
        if (!title || !link || !user) return;

        await supabase.from("resources").insert([
            {
                title,
                type: "link",
                link,
                category,
                user_id: user.id,
            },
        ]);

        setTitle("");
        setLink("");
        fetchResources(user);
    };

    // 🗑️ Delete
    const deleteResource = async (res: Resource) => {
        if (!user) return;

        if (res.type === "pdf" && res.file_url) {
            const filePath = res.file_url.split("/").slice(-2).join("/");
            await supabase.storage.from("resources").remove([filePath]);
        }

        await supabase
            .from("resources")
            .delete()
            .eq("id", res.id)
            .eq("user_id", user.id);

        fetchResources(user);
    };

    // 🔍 FILTER LOGIC
    const filtered = resources
        .filter((res) =>
            res.title.toLowerCase().includes(search.toLowerCase())
        )
        .filter((res) =>
            selectedCategory === "All"
                ? true
                : res.category === selectedCategory
        );

    return (
        <div className="p-6 text-white space-y-6">
            <h1 className="text-2xl font-bold">Library</h1>

            {/* INPUT */}
            <div className="bg-gray-900 p-4 rounded-xl space-y-4">
                <div>
                    <label htmlFor="title-input" className="block mb-2 text-sm">Title</label>
                    <input
                        id="title-input"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        placeholder="Enter title"
                        className="w-full p-2 bg-gray-800 rounded"
                    />
                </div>

                {/* CATEGORY SELECT */}
                <div>
                    <label htmlFor="category-select" className="block mb-2 text-sm">Category</label>
                    <select
                        id="category-select"
                        value={category}
                        onChange={(e) => setCategory(e.target.value)}
                        className="w-full p-2 bg-gray-800 rounded"
                    >
                        {categories.slice(1).map((cat) => (
                            <option key={cat}>{cat}</option>
                        ))}
                    </select>
                </div>

                {/* FILE */}
                <div className="flex gap-2">
                    <input
                        id="file-input"
                        type="file"
                        aria-label="Upload PDF"
                        onChange={(e) =>
                            setFile(e.target.files?.[0] || null)
                        }
                    />
                    <button
                        type="button"
                        onClick={uploadFile}
                        className="bg-indigo-600 px-3 py-1 rounded"
                    >
                        Upload PDF
                    </button>
                </div>

                {/* LINK */}
                <div className="flex gap-2">
                    <label htmlFor="link-input" className="sr-only">Link URL</label>
                    <input
                        id="link-input"
                        value={link}
                        onChange={(e) => setLink(e.target.value)}
                        placeholder="Paste link"
                        className="flex-1 p-2 bg-gray-800 rounded"
                    />
                    <button
                        type="button"
                        onClick={addLink}
                        className="bg-green-600 px-3 py-1 rounded"
                    >
                        Add Link
                    </button>
                </div>
            </div>

            {/* SEARCH */}
            <div>
                <label htmlFor="search-input" className="block mb-2 text-sm">Search</label>
                <input
                    id="search-input"
                    type="text"
                    placeholder="Search..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="w-full p-3 bg-gray-900 border border-gray-800 rounded"
                />
            </div>

            {/* CATEGORY FILTER */}
            <div className="flex gap-2">
                {categories.map((cat) => (
                    <button
                        type="button"
                        key={cat}
                        onClick={() => setSelectedCategory(cat)}
                        className={`px-3 py-1 rounded ${selectedCategory === cat
                            ? "bg-indigo-600"
                            : "bg-gray-800"
                            }`}
                    >
                        {cat}
                    </button>
                ))}
            </div>

            {/* LIST */}
            <div className="space-y-3">
                {filtered.map((res) => (
                    <div
                        key={res.id}
                        className="bg-gray-900 p-4 rounded-xl flex justify-between"
                    >
                        <div>
                            <p>{res.title}</p>
                            <p className="text-xs text-gray-400">
                                {res.type} • {res.category}
                            </p>
                        </div>

                        <div className="flex gap-3">
                            {res.type === "pdf" ? (
                                <a href={res.file_url} target="_blank">
                                    Open
                                </a>
                            ) : (
                                <a href={res.link} target="_blank">
                                    Visit
                                </a>
                            )}

                            <button
                                type="button"
                                onClick={() => deleteResource(res)}
                                className="bg-red-600 px-2 rounded"
                            >
                                Delete
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}