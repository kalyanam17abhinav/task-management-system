import {useEffect, useState, useContext} from "react";
import {fetchTasks, fetchStats, createTask, updateTask, deleteTask} from "../services/taskService";
import { AuthContext } from "../context/AuthContext";

export default function Tasks(){
    const { logout } = useContext(AuthContext);

    const [tasks, setTasks] = useState([]);
    const [stats, setStats] = useState(null);
    const [search, setSearch] = useState("");
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [priority, setPriority] = useState("");
    const [loading, setLoading] = useState(false);

    const loadTasks = async(params = {}) => {
        try{
            const res = await fetchTasks(params);
            setTasks(res.tasks);
        } catch (err){
            console.error('Error loading tasks:', err);
        }
    };

    const loadStats = async () => {
        try{
            const res = await fetchStats();
            setStats(res);
        } catch(err){
            console.error('Error loading stats:', err);
        }
    };

    useEffect(() => {
        loadTasks({ status: "pending", sortBy: "due_date" });
        loadStats();
    }, []);

    const handleCreate = async (e) => {
        e.preventDefault();
        if(!title.trim()) return;
        
        setLoading(true);
        try {
            await createTask({ title, description, priority: priority || "medium" });
            setTitle("");
            setDescription("");
            setPriority("");
            await loadTasks();
            await loadStats();
        } catch (err) {
            console.error('Error creating task:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleSearch = (e) => {
        e.preventDefault();
        loadTasks({search});
    };

    const handleDelete = async (id) => {
        try {
            await deleteTask(id);
            await loadTasks();
            await loadStats();
        } catch (err) {
            console.error('Error deleting task:', err);
        }
    };

    const markComplete = async (task) => {
        try {
            await updateTask(task.task_id, { ...task, status: 'completed' });
            await loadTasks();
            await loadStats();
        } catch (err) {
            console.error('Error updating task:', err);
        }
    };

    return (
      <div className="p-6 max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-gray-800">My Tasks</h1>
          <button onClick={logout} className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded">
            Logout
          </button>
        </div>

        {stats && (
            <div className="grid grid-cols-5 gap-4 mb-6">
                <div className="bg-blue-100 p-4 rounded text-center">
                    <div className="text-2xl font-bold text-blue-600">{stats.total}</div>
                    <div className="text-sm text-gray-600">Total</div>
                </div>
                <div className="bg-yellow-100 p-4 rounded text-center">
                    <div className="text-2xl font-bold text-yellow-600">{stats.pending}</div>
                    <div className="text-sm text-gray-600">Pending</div>
                </div>
                <div className="bg-orange-100 p-4 rounded text-center">
                    <div className="text-2xl font-bold text-orange-600">{stats.in_progress}</div>
                    <div className="text-sm text-gray-600">In Progress</div>
                </div>
                <div className="bg-green-100 p-4 rounded text-center">
                    <div className="text-2xl font-bold text-green-600">{stats.completed}</div>
                    <div className="text-sm text-gray-600">Completed</div>
                </div>
                <div className="bg-red-100 p-4 rounded text-center">
                    <div className="text-2xl font-bold text-red-600">{stats.high_priority}</div>
                    <div className="text-sm text-gray-600">High Priority</div>
                </div>
            </div>
        )}

        <form onSubmit={handleCreate} className="mb-6 space-y-4">
            <div className="flex gap-4">
                <input placeholder="Task title" value={title} onChange={(e) => setTitle(e.target.value)} className="flex-1 p-2 border rounded" required/>
                <select value={priority} onChange={(e)=>setPriority(e.target.value)} className="priorityTab p-2 border rounded border-black bg-purple-600 text-white" required>
                    <option value="" disabled>Priority</option>
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                </select>
            </div>
            <div className="flex gap-4">
                <textarea placeholder="Task description (optional)" value={description} onChange={(e) => setDescription(e.target.value)} className="flex-1 p-2 border rounded h-20 resize-none border-black" rows="3"/>
                <button type="submit" disabled={loading} className="bg-blue-500 hover:bg-blue-600 disabled:bg-gray-400 text-white px-6 py-2 rounded h-fit">
                    {loading ? 'Adding...' : 'Add Task'}
                </button>
            </div>
        </form>

        <form onSubmit={handleSearch} className="mb-6 flex gap-4">
            <input placeholder="Search tasks by title..." value={search} onChange={(e) => setSearch(e.target.value)} className="flex-1 p-2 border rounded"/>
            <button type="submit" className="bg-gray-500 hover:bg-gray-600 text-white px-6 py-2 rounded">
                Search
            </button>
            <button type="button" onClick={() => {setSearch(''); loadTasks();}} className="bg-gray-300 hover:bg-gray-400 text-gray-700 px-4 py-2 rounded">
                Clear
            </button>
        </form>

        <div className="space-y-3">
            {tasks.map((task) => (
                <div key={task.task_id} className="bg-white p-4 rounded-lg shadow border">
                    <div className="flex justify-between items-center">
                        <div className="flex-1">
                            <h3 className="font-semibold text-lg">{task.title}</h3>
                            {task.description && (
                                <p className="text-gray-600 text-sm mt-1">{task.description}</p>
                            )}
                            <div className="flex gap-4 text-sm text-gray-600 mt-2">
                                <span className={`px-2 py-1 rounded ${
                                    task.priority === 'high' ? 'bg-red-100 text-red-700' :
                                    task.priority === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                                    'bg-green-100 text-green-700'
                                }`}>
                                    {task.priority}
                                </span>
                                <span className={`px-2 py-1 rounded ${
                                    task.status === 'completed' ? 'bg-green-100 text-green-700' :
                                    task.status === 'in_progress' ? 'bg-blue-100 text-blue-700' :
                                    'bg-gray-100 text-gray-700'
                                }`}>
                                    {task.status.replace('_', ' ')}
                                </span>
                            </div>
                        </div>
                        <div className="flex gap-2">
                            {task.status !== "completed" && (
                                <button onClick={() => markComplete(task)} className="bg-green-500 hover:bg-green-600 text-white px-3 py-1 rounded text-sm">
                                    Complete
                                </button>
                            )}
                            <button onClick={() => handleDelete(task.task_id)} className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded text-sm">
                                Delete
                            </button>
                        </div>
                    </div>
                </div>
            ))}
        </div>
        
        {tasks.length === 0 && (
            <div className="text-center py-8 text-gray-500">
                <p>No tasks found</p>
            </div>
        )}
      </div>
    );
}