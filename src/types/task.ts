export interface Task {
    id: string;
    title: string;
    status: "pending" | "completed";
}