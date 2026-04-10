import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Plus, Users, Calendar, X, Check, CheckCircle } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { useDispatch, useSelector } from 'react-redux';
import { fetchWithAuth } from '../../../../utils/apiHandler';
import { refreshAccessToken, selectUser } from '../../../../store/slices/authSlice';

const API_BASE_URL = import.meta.env.VITE_BACKEND_URL;

const safeJson = async (response) => {
    try {
        return await response.json();
    } catch {
        return null;
    }
};

const formatDueDate = (value) => {
    if (!value) return 'No due date';
    const parsed = new Date(value);
    if (Number.isNaN(parsed.getTime())) return 'No due date';
    return parsed.toLocaleDateString(undefined, {
        month: 'short',
        day: '2-digit',
    });
};

const ToDoTab = ({ eventId, onTaskCountChange }) => {
    const dispatch = useDispatch();
    const user = useSelector(selectUser);
    const currentUserAuthId = String(user?.authId || '').trim();

    const [tasks, setTasks] = useState([]);
    const [newTask, setNewTask] = useState('');
    const [newTaskPriority, setNewTaskPriority] = useState('medium');
    const [loading, setLoading] = useState(false);
    const [loadError, setLoadError] = useState('');
    const [creating, setCreating] = useState(false);
    const [updatingTaskId, setUpdatingTaskId] = useState('');
    const [deletingTaskId, setDeletingTaskId] = useState('');

    const doneCount = tasks.filter(t => t.done).length;
    const progress = tasks.length ? Math.round((doneCount / tasks.length) * 100) : 0;
    const priorityColors = { high: 'bg-red-50 text-red-700 border-red-200', medium: 'bg-amber-50 text-amber-700 border-amber-200', low: 'bg-blue-50 text-blue-700 border-blue-200' };

    const activeTasks = useMemo(() => tasks.filter(t => !t.done), [tasks]);
    const completedTasks = useMemo(() => tasks.filter(t => t.done), [tasks]);

    useEffect(() => {
        if (typeof onTaskCountChange === 'function') {
            onTaskCountChange(tasks.length);
        }
    }, [tasks.length, onTaskCountChange]);

    const loadTasks = useCallback(async () => {
        if (!eventId) {
            setTasks([]);
            setLoadError('Missing event id');
            return;
        }

        setLoading(true);
        setLoadError('');
        try {
            const response = await fetchWithAuth(
                `${API_BASE_URL}/api/events/todo/${encodeURIComponent(String(eventId))}`,
                { method: 'GET' },
                { dispatch, refreshAction: refreshAccessToken }
            );
            const json = await safeJson(response);

            if (!response.ok || !json?.success) {
                throw new Error(json?.message || 'Failed to load event tasks');
            }

            const list = Array.isArray(json?.data?.tasks) ? json.data.tasks : [];
            setTasks(list);
        } catch (error) {
            setTasks([]);
            setLoadError(error?.message || 'Failed to load event tasks');
        } finally {
            setLoading(false);
        }
    }, [dispatch, eventId]);

    useEffect(() => {
        loadTasks();
    }, [loadTasks]);

    const toggleTask = async (task) => {
        const taskId = String(task?._id || task?.id || '').trim();
        if (!taskId || !eventId) return;

        setUpdatingTaskId(taskId);
        try {
            const response = await fetchWithAuth(
                `${API_BASE_URL}/api/events/todo/${encodeURIComponent(String(eventId))}/${encodeURIComponent(taskId)}`,
                {
                    method: 'PATCH',
                    body: JSON.stringify({ done: !task.done }),
                },
                { dispatch, refreshAction: refreshAccessToken }
            );
            const json = await safeJson(response);

            if (!response.ok || !json?.success) {
                throw new Error(json?.message || 'Failed to update task');
            }

            const updatedTask = json?.data?.task;
            setTasks((prev) => prev.map((item) => {
                const itemId = String(item?._id || item?.id || '').trim();
                return itemId === taskId ? { ...item, ...updatedTask } : item;
            }));
            toast.success('Task status updated');
        } catch (error) {
            toast.error(error?.message || 'Failed to update task');
        } finally {
            setUpdatingTaskId('');
        }
    };

    const addTask = async () => {
        const title = String(newTask || '').trim();
        if (!title || !eventId) return;

        setCreating(true);
        try {
            const response = await fetchWithAuth(
                `${API_BASE_URL}/api/events/todo/${encodeURIComponent(String(eventId))}`,
                {
                    method: 'POST',
                    body: JSON.stringify({
                        title,
                        priority: newTaskPriority,
                    }),
                },
                { dispatch, refreshAction: refreshAccessToken }
            );
            const json = await safeJson(response);

            if (!response.ok || !json?.success) {
                throw new Error(json?.message || 'Failed to create task');
            }

            const createdTask = json?.data?.task;
            if (createdTask) {
                setTasks((prev) => [createdTask, ...prev]);
            }

            setNewTask('');
            setNewTaskPriority('medium');
            toast.success('Task added');
        } catch (error) {
            toast.error(error?.message || 'Failed to create task');
        } finally {
            setCreating(false);
        }
    };

    const deleteTask = async (task) => {
        const taskId = String(task?._id || task?.id || '').trim();
        if (!taskId || !eventId) return;

        setDeletingTaskId(taskId);
        try {
            const response = await fetchWithAuth(
                `${API_BASE_URL}/api/events/todo/${encodeURIComponent(String(eventId))}/${encodeURIComponent(taskId)}`,
                { method: 'DELETE' },
                { dispatch, refreshAction: refreshAccessToken }
            );
            const json = await safeJson(response);

            if (!response.ok || !json?.success) {
                throw new Error(json?.message || 'Failed to delete task');
            }

            setTasks((prev) => prev.filter((item) => {
                const itemId = String(item?._id || item?.id || '').trim();
                return itemId !== taskId;
            }));
            toast.success('Task removed');
        } catch (error) {
            toast.error(error?.message || 'Failed to delete task');
        } finally {
            setDeletingTaskId('');
        }
    };

    return (
        <div className="space-y-6">
            {/* Progress */}
            <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
                <div className="flex justify-between items-center mb-3">
                    <div>
                        <h3 className="text-lg font-bold text-gray-900">Event Tasks</h3>
                        <p className="text-sm text-gray-500">{doneCount} of {tasks.length} tasks completed</p>
                    </div>
                    <span className="text-3xl font-extrabold text-teal-600">{progress}%</span>
                </div>
                <div className="w-full bg-gray-100 rounded-full h-3">
                    <div className="bg-teal-500 h-3 rounded-full shadow-[0_0_10px_rgba(20,184,166,0.4)] transition-all" style={{ width: `${progress}%` }}></div>
                </div>
            </div>

            {/* Add Task */}
            <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm">
                <div className="flex gap-3">
                    <input type="text" value={newTask} onChange={(e) => setNewTask(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && !creating && addTask()}
                        placeholder="Add a new task..." className="flex-1 px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm font-medium outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500" />
                    <button disabled={creating || !newTask.trim()} onClick={addTask} className="px-5 py-2.5 bg-teal-600 text-white rounded-xl text-sm font-bold hover:bg-teal-700 shadow-lg shadow-teal-900/20 flex items-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed">
                        <Plus className="w-4 h-4" /> {creating ? 'Adding...' : 'Add'}
                    </button>
                </div>
                <div className="mt-3 flex items-center gap-2">
                    {['high', 'medium', 'low'].map((priority) => (
                        <button
                            key={priority}
                            type="button"
                            onClick={() => setNewTaskPriority(priority)}
                            className={`px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase border transition-colors ${newTaskPriority === priority
                                ? 'bg-teal-600 text-white border-teal-600'
                                : 'bg-white text-gray-600 border-gray-200 hover:border-teal-300'
                                }`}
                        >
                            {priority}
                        </button>
                    ))}
                </div>
            </div>

            {/* Active Tasks */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                <div className="p-4 border-b border-gray-100 bg-gray-50/50">
                    <h4 className="font-bold text-gray-900 text-sm">Active Tasks ({activeTasks.length})</h4>
                </div>
                <div className="divide-y divide-gray-50">
                    {loading ? (
                        <div className="px-6 py-5 text-sm font-medium text-gray-500">Loading tasks...</div>
                    ) : loadError ? (
                        <div className="px-6 py-5 text-sm">
                            <p className="font-semibold text-red-600">{loadError}</p>
                            <button type="button" onClick={loadTasks} className="mt-2 text-teal-600 font-semibold hover:underline">Retry</button>
                        </div>
                    ) : activeTasks.length === 0 ? (
                        <div className="px-6 py-5 text-sm font-medium text-gray-500">No active tasks yet.</div>
                    ) : activeTasks.map(task => {
                        const taskId = String(task?._id || task?.id || '').trim();
                        const assigneeLabel = task?.createdByAuthId && task.createdByAuthId === currentUserAuthId
                            ? 'You'
                            : (task?.createdByName || 'Team Member');
                        return (
                        <div key={taskId} className="flex items-center gap-4 px-6 py-4 hover:bg-gray-50/50 transition-colors group">
                            <button disabled={updatingTaskId === taskId} onClick={() => toggleTask(task)} className="w-5 h-5 rounded-md border-2 border-gray-300 hover:border-teal-500 transition-colors shrink-0 flex items-center justify-center disabled:opacity-60 disabled:cursor-not-allowed"></button>
                            <div className="flex-1 min-w-0">
                                <p className="font-bold text-gray-900 text-sm">{task.title}</p>
                                <div className="flex items-center gap-3 mt-1">
                                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${priorityColors[task.priority] || priorityColors.medium}`}>{String(task.priority || 'medium').toUpperCase()}</span>
                                    <span className="text-xs text-gray-500 flex items-center gap-1"><Users className="w-3 h-3" /> {assigneeLabel}</span>
                                    <span className="text-xs text-gray-500 flex items-center gap-1"><Calendar className="w-3 h-3" /> {formatDueDate(task.dueAt)}</span>
                                </div>
                            </div>
                            <button disabled={deletingTaskId === taskId} onClick={() => deleteTask(task)} className="opacity-0 group-hover:opacity-100 p-1.5 text-gray-400 hover:text-red-500 transition-all disabled:opacity-50 disabled:cursor-not-allowed">
                                <X className="w-4 h-4" />
                            </button>
                        </div>
                    );})}
                </div>
            </div>

            {/* Completed Tasks */}
            {doneCount > 0 && (
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                    <div className="p-4 border-b border-gray-100 bg-green-50/50">
                        <h4 className="font-bold text-green-700 text-sm flex items-center gap-2"><CheckCircle className="w-4 h-4" /> Completed ({doneCount})</h4>
                    </div>
                    <div className="divide-y divide-gray-50">
                        {completedTasks.map(task => {
                            const taskId = String(task?._id || task?.id || '').trim();
                            const assigneeLabel = task?.createdByAuthId && task.createdByAuthId === currentUserAuthId
                                ? 'You'
                                : (task?.createdByName || 'Team Member');
                            return (
                            <div key={taskId} className="flex items-center gap-4 px-6 py-3 opacity-60 hover:opacity-80 transition-opacity group">
                                <button disabled={updatingTaskId === taskId} onClick={() => toggleTask(task)} className="w-5 h-5 rounded-md bg-teal-500 text-white shrink-0 flex items-center justify-center disabled:opacity-60 disabled:cursor-not-allowed"><Check className="w-3 h-3" /></button>
                                <p className="font-bold text-gray-500 text-sm line-through flex-1">{task.title}</p>
                                <span className="text-xs text-gray-400">{assigneeLabel}</span>
                            </div>
                        );})}
                    </div>
                </div>
            )}
        </div>
    );
};

export default ToDoTab;
