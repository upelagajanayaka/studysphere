import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";
import { useNavigate } from "react-router-dom";

type Task = {
    id: string;
    title: string;
    status: string;
    user_id: string;
};

export default function Tasks() {
    const [tasks, setTasks] = useState<Task[]>([]);
    const [input, setInput] = useState("");
    const [user, setUser] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    // 🔐 Get logged-in user
    useEffect(() => {
        const getUser = async () => {
            const { data } = await supabase.auth.getUser();
            setUser(data.user);
            setLoading(false);
        };

        getUser();

        // Listen for auth changes
        const { data: listener } = supabase.auth.onAuthStateChange(
            (_event, session) => {
                setUser(session?.user || null);
            }
        );

        return () => {
            listener.subscription.unsubscribe();
        };
    }, []);

    // 📥 Fetch tasks
    const fetchTasks = async (currentUser: any) => {
        if (!currentUser) return;

        const { data, error } = await supabase
            .from("tasks")
            .select("*")
            .eq("user_id", currentUser.id);

        if (error) {
            console.log("FETCH ERROR:", error);
            setTasks([]);
            return;
        }

        setTasks(data || []);
    };

    // 🔄 Fetch when user is ready
    useEffect(() => {
        if (user) {
            fetchTasks(user);
        }
    }, [user]);

    // ➕ Add task
    const addTask = async () => {
        if (!input.trim() || !user) return;

        const { error } = await supabase.from("tasks").insert([
            {
                title: input,
                status: "pending",
                user_id: user.id,
            },
        ]);

        if (error) console.log("INSERT ERROR:", error);

        setInput("");
        fetchTasks(user);
    };

    // ❌ Delete task
    const deleteTask = async (id: string) => {
        const { error } = await supabase
            .from("tasks")
            .delete()
            .eq("id", id)
            .eq("user_id", user.id);

        if (error) console.log("DELETE ERROR:", error);

        fetchTasks(user);
    };

    // 🔁 Toggle task status
    const toggleTask = async (task: Task) => {
        const newStatus =
            task.status === "pending" ? "completed" : "pending";

        const { error } = await supabase
            .from("tasks")
            .update({ status: newStatus })
            .eq("id", task.id)
            .eq("user_id", user.id);

        if (error) console.log("UPDATE ERROR:", error);

        fetchTasks(user);
    };

    // ⏳ Loading state
    if (loading) {
        return <p className="text-white p-6">Loading...</p>;
    }

    // 🔐 Redirect if not logged in
    if (!user) {
        navigate("/login");
        return null;
    }

    return (
        <div className="p-6 text-white space-y-6">
            <h1 className="text-2xl font-bold">My Tasks</h1>

            {/* Input */}
            <div className="flex gap-3">
                <label htmlFor="task-input" className="sr-only">New Task</label>
                <input
                    id="task-input"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="Enter task..."
                    className="flex-1 p-3 bg-gray-900 border border-gray-700 rounded-lg outline-none"
                />

                <button
                    type="button"
                    onClick={addTask}
                    className="bg-indigo-600 px-4 py-2 rounded-lg hover:bg-indigo-700 transition"
                >
                    Add
                </button>
            </div>

            {/* Task List */}
            <div className="space-y-3">
                {tasks.length === 0 && (
                    <p className="text-gray-400">No tasks yet 🚀</p>
                )}

                {tasks.map((task) => (
                    <div
                        key={task.id}
                        className="flex justify-between items-center bg-gray-900 p-4 rounded-xl border border-gray-800 hover:scale-[1.01] transition"
                    >
                        <span
                            className={
                                task.status === "completed"
                                    ? "line-through text-gray-500"
                                    : ""
                            }
                        >
                            {task.title}
                        </span>

                        <div className="flex gap-2">
                            <button
                                type="button"
                                onClick={() => toggleTask(task)}
                                className={`px-3 py-1 rounded ${task.status === "completed"
                                    ? "bg-green-600"
                                    : "bg-yellow-600"
                                    }`}
                            >
                                {task.status}
                            </button>

                            <button
                                type="button"
                                onClick={() => deleteTask(task.id)}
                                className="bg-red-600 px-3 py-1 rounded hover:bg-red-700"
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