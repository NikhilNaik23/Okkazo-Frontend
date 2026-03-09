import React, { useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import { BsCheck2Circle, BsCircle, BsTrash, BsPlus, BsLightningCharge, BsKanban, BsFilter } from 'react-icons/bs';

const VendorEventTodoTab = () => {
    const { event } = useOutletContext();
    const [tasks, setTasks] = useState([
        { id: 1, title: 'Confirm final headcount with client', completed: true, priority: 'high' },
        { id: 2, title: 'Review venue setup requirements', completed: false, priority: 'medium' },
        { id: 3, title: 'Finalize equipment rental list', completed: false, priority: 'high' },
        { id: 4, title: 'Schedule staff briefing', completed: false, priority: 'low' },
    ]);
    const [newTask, setNewTask] = useState('');
    const [newTaskPriority, setNewTaskPriority] = useState('medium');

    const toggleTask = (id) => {
        setTasks(tasks.map(task =>
            task.id === id ? { ...task, completed: !task.completed } : task
        ));
    };

    const addTask = (e) => {
        e.preventDefault();
        if (!newTask.trim()) return;
        const newId = tasks.length ? Math.max(...tasks.map(t => t.id)) + 1 : 1;
        setTasks([{ id: newId, title: newTask, completed: false, priority: newTaskPriority }, ...tasks]);
        setNewTask('');
    };

    const deleteTask = (id) => {
        setTasks(tasks.filter(task => task.id !== id));
    };

    const completedCount = tasks.filter(t => t.completed).length;
    const progress = tasks.length === 0 ? 0 : Math.round((completedCount / tasks.length) * 100);

    const getPriorityColor = (priority) => {
        switch (priority) {
            case 'high': return 'bg-rose-500 text-rose-50 border-rose-600/20 shadow-[0_0_10px_rgba(244,63,94,0.3)]';
            case 'medium': return 'bg-[#d7a444] text-white border-[#d7a444]/20 shadow-[0_0_10px_rgba(215,164,68,0.3)]';
            case 'low': return 'bg-[#4ea8de] text-white border-[#4ea8de]/20 shadow-[0_0_10px_rgba(78,168,222,0.3)]';
            default: return 'bg-gray-500 text-white';
        }
    };

    return (
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-8 animate-in slide-in-from-bottom-4 duration-700">
            {/* Left Column: Task Input and Overview */}
            <div className="xl:col-span-4 space-y-8">
                {/* Overview Header */}
                <div className="relative overflow-hidden bg-gradient-to-br from-[#0b2d49] to-[#12426e] p-8 rounded-[3rem] shadow-2xl group">
                    <div className="absolute top-0 right-0 -mr-16 -mt-16 w-32 h-32 bg-[#d7a444] rounded-full mix-blend-multiply filter blur-2xl opacity-30 group-hover:opacity-50 transition-opacity"></div>

                    <h2 className="text-3xl font-black text-white mb-2 flex items-center gap-3">
                        <BsKanban className="text-[#d7a444]" /> Execution Board
                    </h2>
                    <p className="text-white/60 text-sm font-medium mb-8">Manage event preparation tasks efficiently.</p>

                    {/* Progress Bar Container */}
                    <div className="relative z-10 p-6 bg-white/10 rounded-3xl backdrop-blur-md border border-white/10 flex flex-col items-center text-center">
                        <div className="w-full flex justify-between items-end mb-3">
                            <span className="text-xs font-black text-white/50 uppercase tracking-widest">Progress</span>
                            <span className="text-3xl font-black text-white">{progress}%</span>
                        </div>
                        <div className="w-full h-3 bg-white/10 rounded-full overflow-hidden shrink-0 border border-white/5">
                            <div
                                className="h-full bg-gradient-to-r from-[#d7a444] to-[#f3ddb1] rounded-full relative"
                                style={{ width: `${progress}%`, transition: 'width 1s cubic-bezier(0.4, 0, 0.2, 1)' }}
                            >
                                {/* Glowing tip */}
                                <div className="absolute top-0 right-0 bottom-0 w-4 bg-white/50 blur-sm rounded-full"></div>
                            </div>
                        </div>
                        <p className="text-xs font-bold text-white/80 mt-4">
                            {completedCount} of {tasks.length} tasks completed
                        </p>
                    </div>
                </div>

                {/* Add New Task Form */}
                <div className="bg-white p-8 rounded-[3rem] shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100 relative group">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-[#f8fafb] to-transparent rounded-bl-[100px] pointer-events-none"></div>
                    <form onSubmit={addTask} className="relative z-10 flex flex-col gap-5">
                        <div className="flex items-center justify-between mb-2">
                            <h3 className="text-xs font-black text-[#0b2d49] uppercase tracking-widest flex items-center gap-2">
                                <BsLightningCharge className="text-[#d7a444]" /> Quick Add
                            </h3>
                        </div>

                        <div className="relative group/input">
                            <input
                                type="text"
                                placeholder="What needs to be done?"
                                value={newTask}
                                onChange={(e) => setNewTask(e.target.value)}
                                className="w-full pl-5 pr-5 py-4 bg-[#f8fafb] border-2 border-gray-100 rounded-2xl text-[#0b2d49] font-bold text-sm placeholder-gray-400 outline-none focus:bg-white focus:border-[#0b2d49]/20 focus:ring-4 focus:ring-[#0b2d49]/5 transition-all w-full shadow-inner"
                            />
                        </div>

                        <div className="flex flex-col sm:flex-row gap-4 sm:items-center justify-between w-full">
                            <div className="flex gap-2">
                                {['low', 'medium', 'high'].map(p => (
                                    <button
                                        key={p}
                                        type="button"
                                        onClick={() => setNewTaskPriority(p)}
                                        className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${newTaskPriority === p
                                            ? getPriorityColor(p)
                                            : 'bg-gray-100 text-gray-500 hover:bg-gray-200 border border-transparent'
                                            }`}
                                    >
                                        {p}
                                    </button>
                                ))}
                            </div>

                            <button
                                type="submit"
                                disabled={!newTask.trim()}
                                className="px-6 py-4 bg-[#0b2d49] text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-[#d7a444] hover:shadow-[0_10px_20px_rgba(215,164,68,0.2)] transition-all flex items-center justify-center gap-2 shrink-0 disabled:opacity-50 disabled:cursor-not-allowed group/btn active:scale-95"
                            >
                                <BsPlus size={18} className="transition-transform group-hover/btn:rotate-90" />
                                Add Task
                            </button>
                        </div>
                    </form>
                </div>
            </div>

            {/* Right Column: Task List */}
            <div className="xl:col-span-8">
                <div className="bg-white p-8 md:p-10 rounded-[3rem] shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100 h-full relative">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
                        <h3 className="text-xl font-black text-[#0b2d49] flex items-center gap-3">
                            <div className="w-10 h-10 bg-gradient-to-br from-[#f8fafb] to-gray-100 rounded-xl flex items-center justify-center text-[#0b2d49] border border-gray-200">
                                <span className="text-lg leading-none mt-1">{tasks.length}</span>
                            </div>
                            Active Tasks
                        </h3>
                        <button className="flex items-center gap-2 text-xs font-bold text-[#708aa0] hover:text-[#0b2d49] transition-colors p-2 rounded-lg hover:bg-[#f8fafb]">
                            <BsFilter size={18} /> Sort by Priority
                        </button>
                    </div>

                    <div className="space-y-3">
                        {tasks.length === 0 ? (
                            <div className="text-center py-16 bg-[#f8fafb] rounded-[2rem] border border-dashed border-gray-200">
                                <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-4 text-gray-300 shadow-sm">
                                    <BsCheck2Circle size={32} />
                                </div>
                                <p className="text-[#0b2d49] font-bold">All caught up!</p>
                                <p className="text-sm text-[#708aa0] mt-1">Add a new task to get started.</p>
                            </div>
                        ) : (
                            tasks.map((task, idx) => (
                                <div
                                    key={task.id}
                                    className={`group flex items-center gap-4 p-5 rounded-2xl border transition-all duration-300 hover:-translate-y-1 hover:shadow-lg ${task.completed
                                        ? 'bg-gray-50 border-gray-100 opacity-60 hover:opacity-100'
                                        : 'bg-white border-[#0b2d49]/5 shadow-sm hover:border-[#0b2d49]/10'
                                        }`}
                                    style={{ animationDelay: `${idx * 50}ms` }}
                                >
                                    <button
                                        onClick={() => toggleTask(task.id)}
                                        className={`shrink-0 text-2xl transition-all duration-300 ${task.completed
                                            ? 'text-[#d7a444] scale-110 drop-shadow-md'
                                            : 'text-gray-300 hover:text-[#0b2d49]'
                                            }`}
                                    >
                                        {task.completed ? <BsCheck2Circle /> : <BsCircle />}
                                    </button>

                                    <div className="flex-1 min-w-0 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                                        <p className={`font-bold truncate transition-all ${task.completed ? 'text-gray-500 line-through' : 'text-[#0b2d49]'
                                            }`}>
                                            {task.title}
                                        </p>
                                        <div className="flex items-center gap-3 shrink-0">
                                            <span className={`px-3 py-1 text-[9px] font-black uppercase tracking-widest rounded-lg border ${getPriorityColor(task.priority)}`}>
                                                {task.priority}
                                            </span>
                                        </div>
                                    </div>

                                    <button
                                        onClick={() => deleteTask(task.id)}
                                        className="shrink-0 p-3 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all opacity-0 group-hover:opacity-100 focus:opacity-100 -mr-2"
                                        aria-label="Delete task"
                                    >
                                        <BsTrash />
                                    </button>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default VendorEventTodoTab;