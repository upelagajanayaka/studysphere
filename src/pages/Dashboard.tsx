import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";
import {
    CheckCircle,
    Clock,
    ListTodo,
} from "lucide-react";

import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    Tooltip,
    ResponsiveContainer,
    PieChart,
    Pie,
    Cell,
} from "recharts";

// 🔥 Animated Counter
function useCountUp(target: number, duration = 800) {
    const [count, setCount] = useState(0);

    useEffect(() => {
        let start = 0;
        const increment = target / (duration / 16);

        const timer = setInterval(() => {
            start += increment;

            if (start >= target) {
                setCount(target);
                clearInterval(timer);
            } else {
                setCount(Math.floor(start));
            }
        }, 16);

        return () => clearInterval(timer);
    }, [target, duration]);

    return count;
}

export default function Dashboard() {
    const [stats, setStats] = useState({
        total: 0,
        completed: 0,
        pending: 0,
    });

    const [recentTasks, setRecentTasks] = useState<any[]>([]);
    const [user, setUser] = useState<any>(null);

    // 🔐 Get user
    useEffect(() => {
        const getUser = async () => {
            const { data } = await supabase.auth.getUser();
            setUser(data.user);
        };

        getUser();
    }, []);

    // 📊 Fetch stats
    const fetchStats = async (currentUser: any) => {
        if (!currentUser) return;

        const { data } = await supabase
            .from("tasks")
            .select("*")
            .eq("user_id", currentUser.id);

        if (!data) return;

        const total = data.length;
        const completed = data.filter(
            (t) => t.status === "completed"
        ).length;
        const pending = data.filter(
            (t) => t.status === "pending"
        ).length;

        setStats({ total, completed, pending });
    };

    // 📥 Fetch recent tasks
    const fetchRecentTasks = async (currentUser: any) => {
        if (!currentUser) return;

        const { data } = await supabase
            .from("tasks")
            .select("*")
            .eq("user_id", currentUser.id)
            .order("created_at", { ascending: false })
            .limit(5);

        if (data) setRecentTasks(data);
    };

    // 🔄 Initial fetch
    useEffect(() => {
        if (user) {
            fetchStats(user);
            fetchRecentTasks(user);
        }
    }, [user]);

    // ⚡ REAL-TIME updates
    useEffect(() => {
        if (!user) return;

        const channel = supabase
            .channel("dashboard-realtime")
            .on(
                "postgres_changes",
                {
                    event: "*",
                    schema: "public",
                    table: "tasks",
                    filter: `user_id=eq.${user.id}`,
                },
                () => {
                    fetchStats(user);
                    fetchRecentTasks(user);
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, [user]);

    // 📊 Chart Data
    const barData = [
        { name: "Completed", value: stats.completed },
        { name: "Pending", value: stats.pending },
    ];

    const pieData = [
        { name: "Completed", value: stats.completed },
        { name: "Pending", value: stats.pending },
    ];

    const COLORS = ["#22c55e", "#eab308"];

    // 🎨 Card
    const Card = ({ title, value, icon: Icon, color }: any) => {
        const animatedValue = useCountUp(value);

        return (
            <div
                className={`p-6 rounded-2xl bg-gradient-to-br ${color} 
        shadow-lg hover:scale-105 transition`}
            >
                <div className="flex justify-between">
                    <div>
                        <p className="text-sm opacity-80">{title}</p>
                        <h2 className="text-3xl font-bold">
                            {animatedValue}
                        </h2>
                    </div>

                    <Icon size={24} />
                </div>
            </div>
        );
    };

    return (
        <div className="space-y-10 text-white">
            <h1 className="text-3xl font-bold">Dashboard</h1>

            {/* 🔥 Stats */}
            <div className="grid md:grid-cols-3 gap-6">
                <Card
                    title="Total Tasks"
                    value={stats.total}
                    icon={ListTodo}
                    color="from-indigo-600 to-indigo-800"
                />

                <Card
                    title="Completed"
                    value={stats.completed}
                    icon={CheckCircle}
                    color="from-green-600 to-green-800"
                />

                <Card
                    title="Pending"
                    value={stats.pending}
                    icon={Clock}
                    color="from-yellow-600 to-yellow-800"
                />
            </div>

            {/* 📊 Charts */}
            <div className="grid md:grid-cols-2 gap-6">
                <div className="bg-gray-900 p-6 rounded-2xl">
                    <h2 className="mb-4 font-semibold">Task Overview</h2>

                    <ResponsiveContainer width="100%" height={250}>
                        <BarChart data={barData}>
                            <XAxis dataKey="name" stroke="#ccc" />
                            <YAxis stroke="#ccc" />
                            <Tooltip />
                            <Bar dataKey="value" />
                        </BarChart>
                    </ResponsiveContainer>
                </div>

                <div className="bg-gray-900 p-6 rounded-2xl">
                    <h2 className="mb-4 font-semibold">Distribution</h2>

                    <ResponsiveContainer width="100%" height={250}>
                        <PieChart>
                            <Pie data={pieData} dataKey="value" outerRadius={80}>
                                {pieData.map((_, i) => (
                                    <Cell key={i} fill={COLORS[i]} />
                                ))}
                            </Pie>
                            <Tooltip />
                        </PieChart>
                    </ResponsiveContainer>
                </div>
            </div>

            {/* 🆕 Recent Activity */}
            <div className="bg-gray-900 p-6 rounded-2xl">
                <h2 className="text-lg font-semibold mb-4">
                    Recent Activity
                </h2>

                <div className="space-y-3">
                    {recentTasks.length === 0 && (
                        <p className="text-gray-400">
                            No recent activity
                        </p>
                    )}

                    {recentTasks.map((task) => (
                        <div
                            key={task.id}
                            className="flex justify-between items-center bg-gray-800 p-3 rounded-lg"
                        >
                            <div>
                                <p className="font-medium">{task.title}</p>
                                <p className="text-xs text-gray-400">
                                    {new Date(task.created_at).toLocaleString()}
                                </p>
                            </div>

                            <span
                                className={`text-xs px-2 py-1 rounded ${task.status === "completed"
                                        ? "bg-green-600"
                                        : "bg-yellow-600"
                                    }`}
                            >
                                {task.status}
                            </span>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}