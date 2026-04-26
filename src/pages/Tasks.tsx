import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";

type Task = {
    id: string;
    title: string;
    status: string;
};

export default function Tasks() {
    const [tasks, setTasks] = useState<Task[]>([]);
    const [input, setInput] = useState("");

    // 📥 Load tasks from DB
    const fetchTasks = async () => {
        const { data } = await supabase.from("tasks").select("*");
        if (data) setTasks(data);
    };

    useEffect(() => {
        fetchTasks();
    }, []);

    // ➕ Add task
    const addTask = async () => {
        if (!input) return;

        await supabase.from("tasks").insert([
            { title: input, status: "pending" },
        ]);

        setInput("");
        fetchTasks();
    };

    // ❌ Delete task
    const deleteTask = async (id: string) => {
        await supabase.from("tasks").delete().eq("id", id);
        fetchTasks();
    };

    // ✅ Toggle status
    const toggleTask = async (task: Task) => {
        const newStatus =
            task.status === "pending" ? "completed" : "pending";

        await supabase
            .from("tasks")
            .update({ status: newStatus })
            .eq("id", task.id);

        fetchTasks();
    };

    return (
        <div className="space-y-6 text-white">

            <h1 className="text-2xl font-bold">Tasks</h1>

            {/* Input */}
            <div className="flex gap-3">
                <input
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    className="flex-1 p-3 bg-gray-900 rounded-lg border border-gray-800"
                    placeholder="Enter task..."
                />

                <button
                    onClick={addTask}
                    className="bg-indigo-600 px-4 rounded-lg"
                >
                    Add
                </button>
            </div>

            {/* List */}
            <div className="space-y-3">
                {tasks.map((task) => (
                    <div
                        key={task.id}
                        className="flex justify-between bg-gray-900 p-4 rounded-xl"
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
                                onClick={() => toggleTask(task)}
                                className="bg-green-600 px-3 rounded"
                            >
                                {task.status}
                            </button>

                            <button
                                onClick={() => deleteTask(task.id)}
                                className="bg-red-600 px-3 rounded"
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