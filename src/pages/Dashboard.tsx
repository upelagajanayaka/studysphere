export default function Dashboard() {
    return (
        <div className="space-y-6">

            {/* Header */}
            <h1 className="text-4xl font-bold tracking-tight">
                Good Morning 👋
            </h1>

            <p className="text-gray-400 mt-2 text-lg">
                Welcome back to StudySphere — let’s build your progress today.
            </p>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">

                <div className="bg-gray-900/60 backdrop-blur-md p-5 rounded-2xl border border-gray-800 hover:border-indigo-500 hover:scale-[1.02] transition">
                    <p className="text-gray-400 text-sm">Tasks Completed</p>
                    <h2 className="text-3xl font-bold mt-2">12</h2>
                </div>

                <div className="bg-gray-900/60 backdrop-blur-md p-5 rounded-2xl border border-gray-800 hover:border-indigo-500 hover:scale-[1.02] transition">
                    <p className="text-gray-400 text-sm">Study Streak 🔥</p>
                    <h2 className="text-3xl font-bold text-indigo-400 mt-2">5 Days</h2>
                </div>

                <div className="bg-gray-900/60 backdrop-blur-md p-5 rounded-2xl border border-gray-800 hover:border-indigo-500 hover:scale-[1.02] transition">
                    <p className="text-gray-400 text-sm">Uploaded Papers</p>
                    <h2 className="text-3xl font-bold mt-2">8</h2>
                </div>

                <div className="bg-gray-900/60 backdrop-blur-md p-5 rounded-2xl border border-gray-800 hover:border-indigo-500 hover:scale-[1.02] transition">
                    <p className="text-gray-400 text-sm">Pending Tasks</p>
                    <h2 className="text-3xl font-bold text-red-400 mt-2">3</h2>
                </div>

            </div>

            {/* Content Section */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                {/* Tasks */}
                <div className="bg-gray-900 p-5 rounded-xl border border-gray-800">
                    <h3 className="text-lg font-semibold text-white mb-4">
                        Today’s Tasks
                    </h3>

                    <ul className="space-y-3 text-gray-300">
                        <li className="flex justify-between">
                            <span>Complete DSA Assignment</span>
                            <span className="text-yellow-400">Pending</span>
                        </li>
                        <li className="flex justify-between">
                            <span>Read React Docs</span>
                            <span className="text-green-400">Done</span>
                        </li>
                        <li className="flex justify-between">
                            <span>Upload Exam Paper</span>
                            <span className="text-yellow-400">Pending</span>
                        </li>
                    </ul>
                </div>

                {/* Recent Files */}
                <div className="bg-gray-900 p-5 rounded-xl border border-gray-800">
                    <h3 className="text-lg font-semibold text-white mb-4">
                        Recent Study Materials
                    </h3>

                    <div className="space-y-3 text-gray-300">
                        <div className="p-3 bg-gray-800 rounded-lg">
                            📄 DSA Notes.pdf
                        </div>
                        <div className="p-3 bg-gray-800 rounded-lg">
                            📄 Web Dev Guide.pdf
                        </div>
                        <div className="p-3 bg-gray-800 rounded-lg">
                            📄 Exam Paper 2025.pdf
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
}