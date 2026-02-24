import React, { useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import {
    BsPlus,
    BsCheckCircleFill,
    BsCircle,
    BsFlagFill
} from 'react-icons/bs';

const VendorEventTodoTab = () => {
    const { todoTasks, toggleTask, handleAddTask } = useOutletContext();

    const [title, setTitle] = useState('');
    const [urgency, setUrgency] = useState('MEDIUM');

    const completed = todoTasks.filter(t => t.completed).length;
    const total = todoTasks.length;
    const progress = total === 0 ? 0 : Math.round((completed / total) * 100);

    const createTask = () => {
        if (!title.trim()) return;

        handleAddTask({
            title,
            priority: urgency
        });

        setTitle('');
        setUrgency('MEDIUM');
    };

    const urgencyStyles = (level) => {
        switch (level) {
            case 'HIGH':
                return "bg-red-50 text-red-600 border-red-200";
            case 'MEDIUM':
                return "bg-amber-50 text-amber-600 border-amber-200";
            default:
                return "bg-blue-50 text-blue-600 border-blue-200";
        }
    };

    return (
        <div className="space-y-8 animate-in slide-in-from-bottom-4 duration-500">

            {/* Top Command Bar */}
            <div className="bg-white p-6 rounded-[2rem] border border-[#708aa0]/10 shadow-sm space-y-6">

                {/* Progress Row */}
                <div className="flex justify-between items-center">
                    <div>
                        <h3 className="text-lg font-black text-[#0b2d49]">Execution Board</h3>
                        <p className="text-xs font-bold text-[#708aa0]">
                            {completed} / {total} completed
                        </p>
                    </div>
                    <div className="text-2xl font-black text-[#14b67b]">
                        {progress}%
                    </div>
                </div>

                <div className="h-2 w-full bg-gray-100 rounded-full overflow-hidden">
                    <div
                        className="h-full bg-[#14b67b] transition-all duration-700"
                        style={{ width: `${progress}%` }}
                    />
                </div>

                {/* Creation Strip */}
                <div className="flex gap-4 pt-4 border-t border-[#708aa0]/10">

                    <input
                        type="text"
                        placeholder="Define task objective..."
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && createTask()}
                        className="flex-1 px-5 py-3 rounded-xl border border-[#708aa0]/20 focus:border-[#14b67b] outline-none text-sm font-medium text-[#0b2d49]"
                    />

                    {/* Urgency Selector */}
                    <div className="flex bg-[#f4f7f9] rounded-xl p-1 border border-[#708aa0]/10">
                        {['HIGH', 'MEDIUM', 'LOW'].map(level => {
                            const active = urgency === level;

                            const activeStyle =
                                level === 'HIGH'
                                    ? "bg-red-500 text-white"
                                    : level === 'MEDIUM'
                                        ? "bg-amber-500 text-white"
                                        : "bg-blue-500 text-white";

                            return (
                                <button
                                    key={level}
                                    onClick={() => setUrgency(level)}
                                    className={`
          px-4 py-2 text-xs font-black uppercase tracking-wider rounded-lg transition-all
          ${active ? activeStyle : "text-[#708aa0] hover:text-[#0b2d49]"}
        `}
                                >
                                    {level}
                                </button>
                            );
                        })}
                    </div>

                    <button
                        onClick={createTask}
                        className="bg-[#14b67b] text-white px-6 py-3 rounded-xl font-black text-xs uppercase tracking-widest flex items-center gap-2 hover:bg-[#0ea18d] transition active:scale-95"
                    >
                        <BsPlus size={18} />
                        Add
                    </button>
                </div>
            </div>

            {/* Task List */}
            <div className="bg-white rounded-[2rem] border border-[#708aa0]/10 shadow-sm overflow-hidden">

                {todoTasks.length === 0 ? (
                    <div className="p-12 text-center text-sm font-bold text-[#708aa0]">
                        No tasks defined. Add strategic objectives above.
                    </div>
                ) : (
                    <div className="divide-y divide-[#708aa0]/10">
                        {todoTasks
                            .sort((a, b) => {
                                const order = { HIGH: 1, MEDIUM: 2, LOW: 3 };
                                return order[a.priority] - order[b.priority];
                            })
                            .map(task => (
                                <div
                                    key={task.id}
                                    className="p-6 flex items-center justify-between hover:bg-[#f8fafb] transition-all group"
                                >
                                    <div className="flex items-center gap-4">

                                        <button
                                            onClick={() => toggleTask(task.id)}
                                            className="text-[#708aa0] hover:text-[#14b67b] transition"
                                        >
                                            {task.completed
                                                ? <BsCheckCircleFill size={20} className="text-[#14b67b]" />
                                                : <BsCircle size={20} />}
                                        </button>

                                        <div>
                                            <h4 className={`font-black text-sm ${task.completed
                                                ? "line-through text-[#708aa0]"
                                                : "text-[#0b2d49]"}`}>
                                                {task.title}
                                            </h4>

                                            <div className="mt-2">
                                                <span
                                                    className={`px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider border flex items-center gap-1 w-fit ${urgencyStyles(task.priority)}`}
                                                >
                                                    <BsFlagFill size={10} />
                                                    {task.priority}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default VendorEventTodoTab;