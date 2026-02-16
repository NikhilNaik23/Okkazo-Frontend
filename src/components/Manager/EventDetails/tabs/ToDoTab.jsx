import React, { useState } from 'react';
import { Plus, Users, Calendar, X, Check, CheckCircle } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { initialTasks } from '../../../../data/managerEventDetailsData';

const ToDoTab = () => {
    const [tasks, setTasks] = useState(initialTasks);
    const [newTask, setNewTask] = useState('');

    const doneCount = tasks.filter(t => t.done).length;
    const progress = Math.round((doneCount / tasks.length) * 100);
    const priorityColors = { high: 'bg-red-50 text-red-700 border-red-200', medium: 'bg-amber-50 text-amber-700 border-amber-200', low: 'bg-blue-50 text-blue-700 border-blue-200' };

    const toggleTask = (id) => setTasks(prev => prev.map(t => t.id === id ? { ...t, done: !t.done } : t));

    const addTask = () => {
        if (!newTask.trim()) return;
        setTasks([...tasks, { id: Date.now(), text: newTask, priority: 'medium', assignee: 'You', due: 'TBD', done: false }]);
        setNewTask('');
        toast.success("Task added!");
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
                    <input type="text" value={newTask} onChange={(e) => setNewTask(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && addTask()}
                        placeholder="Add a new task..." className="flex-1 px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm font-medium outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500" />
                    <button onClick={addTask} className="px-5 py-2.5 bg-teal-600 text-white rounded-xl text-sm font-bold hover:bg-teal-700 shadow-lg shadow-teal-900/20 flex items-center gap-2">
                        <Plus className="w-4 h-4" /> Add
                    </button>
                </div>
            </div>

            {/* Active Tasks */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                <div className="p-4 border-b border-gray-100 bg-gray-50/50">
                    <h4 className="font-bold text-gray-900 text-sm">Active Tasks ({tasks.filter(t => !t.done).length})</h4>
                </div>
                <div className="divide-y divide-gray-50">
                    {tasks.filter(t => !t.done).map(task => (
                        <div key={task.id} className="flex items-center gap-4 px-6 py-4 hover:bg-gray-50/50 transition-colors group">
                            <button onClick={() => toggleTask(task.id)} className="w-5 h-5 rounded-md border-2 border-gray-300 hover:border-teal-500 transition-colors shrink-0 flex items-center justify-center"></button>
                            <div className="flex-1 min-w-0">
                                <p className="font-bold text-gray-900 text-sm">{task.text}</p>
                                <div className="flex items-center gap-3 mt-1">
                                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${priorityColors[task.priority]}`}>{task.priority.toUpperCase()}</span>
                                    <span className="text-xs text-gray-500 flex items-center gap-1"><Users className="w-3 h-3" /> {task.assignee}</span>
                                    <span className="text-xs text-gray-500 flex items-center gap-1"><Calendar className="w-3 h-3" /> {task.due}</span>
                                </div>
                            </div>
                            <button onClick={() => { setTasks(prev => prev.filter(t => t.id !== task.id)); toast.success("Task removed"); }} className="opacity-0 group-hover:opacity-100 p-1.5 text-gray-400 hover:text-red-500 transition-all">
                                <X className="w-4 h-4" />
                            </button>
                        </div>
                    ))}
                </div>
            </div>

            {/* Completed Tasks */}
            {doneCount > 0 && (
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                    <div className="p-4 border-b border-gray-100 bg-green-50/50">
                        <h4 className="font-bold text-green-700 text-sm flex items-center gap-2"><CheckCircle className="w-4 h-4" /> Completed ({doneCount})</h4>
                    </div>
                    <div className="divide-y divide-gray-50">
                        {tasks.filter(t => t.done).map(task => (
                            <div key={task.id} className="flex items-center gap-4 px-6 py-3 opacity-60 hover:opacity-80 transition-opacity group">
                                <button onClick={() => toggleTask(task.id)} className="w-5 h-5 rounded-md bg-teal-500 text-white shrink-0 flex items-center justify-center"><Check className="w-3 h-3" /></button>
                                <p className="font-bold text-gray-500 text-sm line-through flex-1">{task.text}</p>
                                <span className="text-xs text-gray-400">{task.assignee}</span>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

export default ToDoTab;
