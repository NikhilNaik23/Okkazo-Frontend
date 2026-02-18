import React from 'react';
import { useOutletContext } from 'react-router-dom';
import { BsPlus, BsCircle, BsPerson, BsCalendar4Event, BsCheckCircleFill } from 'react-icons/bs';

const VendorEventTodoTab = () => {
    const { todoTasks, toggleTask, newTaskTitle, setNewTaskTitle, handleAddTask } = useOutletContext();

    const completedCount = todoTasks.filter(t => t.completed).length;
    const totalCount = todoTasks.length;
    const progress = totalCount === 0 ? 0 : Math.round((completedCount / totalCount) * 100);

    return (
        <div className="space-y-6 animate-in slide-in-from-bottom-4 duration-500">
            {/* Progress Header */}
            <div className="bg-white p-8 rounded-[2rem] border border-[#708aa0]/10 shadow-sm flex items-center justify-between">
                <div className="flex-1 mr-10">
                    <div className="flex justify-between items-end mb-4">
                        <div>
                            <h3 className="text-xl font-black text-[#0b2d49]">Event Tasks</h3>
                            <p className="text-xs font-bold text-[#708aa0] mt-1">{completedCount} of {totalCount} tasks completed</p>
                        </div>
                        <div className="text-3xl font-black text-[#14b67b]">{progress}%</div>
                    </div>
                    <div className="h-2 w-full bg-gray-100 rounded-full overflow-hidden">
                        <div
                            className="h-full bg-[#14b67b] transition-all duration-1000"
                            style={{ width: `${progress}%` }}
                        ></div>
                    </div>
                </div>
            </div>

            {/* Add Task Input */}
            <div className="bg-white p-4 rounded-[1.5rem] border border-[#708aa0]/10 shadow-sm flex gap-4">
                <input
                    type="text"
                    placeholder="Add a new task..."
                    value={newTaskTitle}
                    onChange={(e) => setNewTaskTitle(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleAddTask()}
                    className="flex-1 bg-white px-6 py-3 rounded-xl border border-transparent focus:border-[#14b67b]/20 outline-none font-medium text-[#0b2d49] text-sm"
                />
                <button
                    onClick={handleAddTask}
                    className="bg-[#14b67b] text-white px-6 py-3 rounded-xl font-black text-xs uppercase tracking-widest flex items-center gap-2 hover:bg-[#0ea18d] transition-all shadow-md active:scale-95"
                >
                    <BsPlus size={20} /> Add
                </button>
            </div>

            {/* Active Tasks */}
            <div className="bg-white rounded-[2rem] border border-[#708aa0]/10 shadow-sm overflow-hidden">
                <div className="p-6 border-b border-gray-50 bg-[#fbfcfd]">
                    <h3 className="text-sm font-black text-[#0b2d49] uppercase tracking-widest">Active Tasks ({totalCount - completedCount})</h3>
                </div>
                <div className="divide-y divide-gray-50">
                    {todoTasks.filter(t => !t.completed).map((task) => (
                        <div key={task.id} className="p-6 flex items-start gap-4 hover:bg-gray-50 transition-all group">
                            <button
                                onClick={() => toggleTask(task.id)}
                                className="mt-1 text-[#708aa0] hover:text-[#14b67b] transition-all"
                            >
                                <BsCircle size={20} />
                            </button>
                            <div className="flex-1">
                                <h4 className="font-black text-[#0b2d49] text-base group-hover:text-[#14b67b] transition-colors">{task.title}</h4>
                                <div className="flex items-center gap-4 mt-2">
                                    <span className={`px-2 py-0.5 rounded-md text-[9px] font-black uppercase tracking-wider ${task.priority === 'HIGH' ? "bg-red-50 text-red-500" :
                                        task.priority === 'MEDIUM' ? "bg-amber-50 text-amber-500" :
                                            "bg-blue-50 text-blue-500"
                                        }`}>
                                        {task.priority}
                                    </span>
                                    <div className="flex items-center gap-1.5 text-[10px] font-bold text-[#708aa0]">
                                        <BsPerson size={12} className="opacity-60" />
                                        {task.owner}
                                    </div>
                                    <div className="flex items-center gap-1.5 text-[10px] font-bold text-[#708aa0]">
                                        <BsCalendar4Event size={12} className="opacity-60" />
                                        {task.date}
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Completed Tasks */}
            <div className="bg-[#f8fafb]/50 rounded-[2rem] border border-[#708aa0]/5 shadow-sm overflow-hidden">
                <div className="p-6 border-b border-[#708aa0]/5 flex items-center gap-3">
                    <div className="w-6 h-6 rounded-full bg-[#14b67b]/10 text-[#14b67b] flex items-center justify-center">
                        <BsCheckCircleFill size={14} />
                    </div>
                    <h3 className="text-sm font-black text-[#14b67b] uppercase tracking-widest">Completed ({completedCount})</h3>
                </div>
                <div className="divide-y divide-gray-50/50">
                    {todoTasks.filter(t => t.completed).map((task) => (
                        <div key={task.id} className="p-5 flex items-center justify-between gap-4 opacity-50 bg-white/30">
                            <div className="flex items-center gap-4">
                                <button
                                    onClick={() => toggleTask(task.id)}
                                    className="text-[#14b67b] hover:scale-110 transition-all"
                                >
                                    <BsCheckCircleFill size={18} />
                                </button>
                                <span className="text-sm font-bold text-[#0b2d49] line-through">{task.title}</span>
                            </div>
                            <span className="text-[10px] font-black text-[#708aa0] uppercase tracking-wider">{task.owner}</span>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default VendorEventTodoTab;
