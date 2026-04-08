import React, { useState, useEffect } from "react";
import { 
  ChevronRight, 
  Info, 
  ShieldCheck,
  Loader2
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import toast from "react-hot-toast";
import { fetchWithAuth } from "../../../utils/apiHandler";
import { refreshAccessToken } from "../../../store/slices/authSlice";
import { createManager, resetCreateManager } from "../../../store/slices/adminSlice";

const AdminManager = () => {
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const { submitting, submitError, createManagerSuccess } = useSelector((state) => state.admin);

    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [selectedDepartment, setSelectedDepartment] = useState("");
    const [selectedRole, setSelectedRole] = useState("");
    const [roleOptions, setRoleOptions] = useState({
        departments: ["Public Event", "Private Event", "Core Operation"],
        departmentRoleMap: {
            "Public Event": ["Senior Event Manager", "Junior Manager"],
            "Private Event": ["Senior Event Manager", "Junior Manager"],
            "Core Operation": ["Event Coordinator", "Revenue Operations Specialist"],
        },
    });

    const availableRolesForSelectedDepartment = selectedDepartment
        ? (roleOptions?.departmentRoleMap?.[selectedDepartment] || [])
        : [];

    useEffect(() => {
        return () => {
            dispatch(resetCreateManager());
        };
    }, [dispatch]);

    useEffect(() => {
        if (createManagerSuccess) {
            toast.success("Invitation sent to manager successfully!");
            navigate("/admin/team-access");
        }
    }, [createManagerSuccess, navigate]);

    useEffect(() => {
        if (submitError) {
            toast.error(submitError);
        }
    }, [submitError]);

    useEffect(() => {
        let cancelled = false;

        const loadRoleOptions = async () => {
            try {
                const response = await fetchWithAuth(
                    `${import.meta.env.VITE_BACKEND_URL}/api/admin/managers/options`,
                    { method: "GET" },
                    { dispatch, refreshAction: refreshAccessToken }
                );

                const data = await response.json().catch(() => null);
                if (cancelled) return;

                if (!response.ok || !data?.success || !data?.data) {
                    return;
                }

                const departments = Array.isArray(data.data.departments) ? data.data.departments : [];
                const departmentRoleMap = data.data.departmentRoleMap && typeof data.data.departmentRoleMap === 'object'
                    ? data.data.departmentRoleMap
                    : {};

                if (departments.length > 0 && Object.keys(departmentRoleMap).length > 0) {
                    setRoleOptions({ departments, departmentRoleMap });
                }
            } catch {
                // Keep fallback options on fetch failure.
            }
        };

        loadRoleOptions();

        return () => {
            cancelled = true;
        };
    }, [dispatch]);

    const handleDepartmentChange = (e) => {
        const dept = e.target.value;
        setSelectedDepartment(dept);

        const deptRoles = roleOptions?.departmentRoleMap?.[dept] || [];
        setSelectedRole(deptRoles[0] || "");
    };

    useEffect(() => {
        if (!selectedDepartment) return;
        const deptRoles = roleOptions?.departmentRoleMap?.[selectedDepartment] || [];
        if (!deptRoles.includes(selectedRole)) {
            setSelectedRole(deptRoles[0] || "");
        }
    }, [selectedDepartment, selectedRole, roleOptions]);

    const handleAddManager = (e) => {
        e.preventDefault();
        if (!name.trim() || !email.trim() || !selectedDepartment || !selectedRole) {
            toast.error("Please fill in all fields");
            return;
        }
        dispatch(createManager({
            name: name.trim(),
            email: email.trim(),
            department: selectedDepartment,
            assignedRole: selectedRole,
        }));
    };

    return (
        <div className="flex flex-col h-full bg-[#fcfdfe] overflow-hidden">
            {/* Header / Breadcrumbs */}
            <div className="px-8 py-5 flex flex-col gap-4 shrink-0">
                <div className="flex items-center gap-2 text-[13px] font-medium text-[#94a3b8]">
                    <span>System</span>
                    <ChevronRight size={14} />
                    <span className="cursor-pointer hover:text-[#0b2d49]" onClick={() => navigate("/admin/team-access")}>Team Access</span>
                    <ChevronRight size={14} />
                    <span className="text-[#1a1c1e] font-bold">Add Manager</span>
                </div>

                <div>
                    <h2 className="text-[32px] font-black text-[#1a1c1e] tracking-tight">Add Manager</h2>
                </div>
            </div>

            <div className="flex-1 overflow-y-auto p-8 space-y-8 custom-scrollbar">
                {/* Main Form Card */}
                <div className="bg-white rounded-3xl border border-[#f0f2f5] shadow-sm overflow-hidden auto-rows-min max-w-5xl">
                    <div className="px-8 py-6 border-b border-[#f0f2f5]">
                        <h3 className="text-lg font-bold text-[#1a1c1e]">Manager Details</h3>
                    </div>

                    <form className="p-8 space-y-8" onSubmit={handleAddManager}>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-8">
                            {/* Left Column */}
                            <div className="space-y-6">
                                <div className="space-y-2">
                                    <label className="text-sm font-bold text-[#1a1c1e]">Full Name</label>
                                    <div className="relative">
                                        <input 
                                            type="text" 
                                            placeholder="e.g. Michael Chen" 
                                            value={name}
                                            onChange={(e) => setName(e.target.value)}
                                            className="w-full px-4 py-3 bg-[#f8fafc] border border-transparent rounded-xl text-sm focus:bg-white focus:border-[#28a785]/30 focus:ring-4 focus:ring-[#28a785]/5 focus:outline-none transition-all placeholder:text-[#cbd5e1]"
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-sm font-bold text-[#1a1c1e]">Email Address</label>
                                    <input 
                                        type="email" 
                                        placeholder="m.chen@okkazo.com" 
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        className="w-full px-4 py-3 bg-[#f8fafc] border border-transparent rounded-xl text-sm focus:bg-white focus:border-[#28a785]/30 focus:ring-4 focus:ring-[#28a785]/5 focus:outline-none transition-all placeholder:text-[#cbd5e1]"
                                    />
                                </div>
                            </div>

                            {/* Right Column */}
                            <div className="space-y-6">
                                <div className="space-y-2">
                                    <label className="text-sm font-bold text-[#1a1c1e]">Department</label>
                                    <div className="relative">
                                        <select 
                                            className="w-full px-4 py-3 bg-[#f8fafc] border border-transparent rounded-xl text-sm focus:bg-white focus:border-[#28a785]/30 focus:ring-4 focus:ring-[#28a785]/5 focus:outline-none transition-all appearance-none cursor-pointer text-[#1a1c1e] font-medium font-sans"
                                            value={selectedDepartment}
                                            onChange={handleDepartmentChange}
                                        >
                                            <option value="" disabled>Select Department</option>
                                            {roleOptions.departments.map((dept) => (
                                                <option key={dept} value={dept}>{dept}</option>
                                            ))}
                                        </select>
                                        <ChevronRight size={16} className="absolute right-4 top-1/2 -translate-y-1/2 rotate-90 text-[#94a3b8] pointer-events-none" />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <div className="flex justify-between items-center">
                                        <label className="text-sm font-bold text-[#1a1c1e]">Assigned Role</label>
                                        <button type="button" className="text-[11px] font-bold text-[#28a785] flex items-center gap-1 hover:underline">
                                            <Info size={12} />
                                            View permissions
                                        </button>
                                    </div>
                                    <div className="relative">
                                        <select 
                                            className="w-full px-4 py-3 bg-[#f8fafc] border border-transparent rounded-xl text-sm focus:bg-white focus:border-[#28a785]/30 focus:ring-4 focus:ring-[#28a785]/5 focus:outline-none transition-all appearance-none cursor-pointer text-[#1a1c1e] font-medium"
                                            value={selectedRole}
                                            onChange={(e) => setSelectedRole(e.target.value)}
                                        >
                                            <option disabled value="">Select Role</option>
                                            {availableRolesForSelectedDepartment.map((role) => (
                                                <option key={role}>{role}</option>
                                            ))}
                                        </select>
                                        <ChevronRight size={16} className="absolute right-4 top-1/2 -translate-y-1/2 rotate-90 text-[#94a3b8] pointer-events-none" />
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Footer Section in Card */}
                        <div className="pt-8 mt-4 border-t border-[#f0f2f5] flex items-center justify-between">
                            <div className="flex items-center gap-4">
                                <div className="w-10 h-10 rounded-xl bg-[#ebf7f3] text-[#28a785] flex items-center justify-center">
                                    <ShieldCheck size={20} />
                                </div>
                                <div className="max-w-[400px]">
                                    <h4 className="text-sm font-bold text-[#1a1c1e]">Security Confirmation</h4>
                                    <p className="text-[11px] text-[#94a3b8] leading-relaxed font-medium">
                                        An invitation email will be sent to the manager to set their initial password and complete the setup.
                                    </p>
                                </div>
                            </div>

                            <div className="flex items-center gap-4">
                                <button 
                                    type="button"
                                    onClick={() => navigate("/admin/team-access")}
                                    className="px-6 py-2.5 text-sm font-bold text-[#64748b] hover:text-[#1a1c1e] transition-colors"
                                >
                                    Cancel
                                </button>
                                <button 
                                    type="submit"
                                    disabled={submitting}
                                    className="px-8 py-3 bg-[#28a785] text-white rounded-xl text-sm font-black shadow-lg shadow-[#28a785]/20 hover:brightness-110 active:scale-95 transition-all disabled:opacity-60 disabled:cursor-not-allowed flex items-center gap-2"
                                >
                                    {submitting && <Loader2 size={16} className="animate-spin" />}
                                    {submitting ? "Sending..." : "Add Manager"}
                                </button>
                            </div>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default AdminManager;
