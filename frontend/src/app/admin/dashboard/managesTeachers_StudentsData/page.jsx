'use client';
import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { FiPlus, FiEdit, FiTrash2, FiSearch } from 'react-icons/fi';
import { useSearchParams, useRouter } from 'next/navigation';
import { motion, AnimatePresence } from "framer-motion";
import dynamic from "next/dynamic";

// Import the new isolated Modal
import AddUserModal from './AddUserModal';

const Confetti = dynamic(() => import("react-confetti"), {
  ssr: false,
});

const AdminManageUsers = () => {
  // --- Data State ---
  const [teachers, setTeachers] = useState([]);
  const [students, setStudents] = useState([]);
  const [dropdownSubjects, setDropdownSubjects] = useState([]);
  
  // --- UI State ---
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showSuccessPopup, setShowSuccessPopup] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [showErrorPopup, setShowErrorPopup] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [showConfetti, setShowConfetti] = useState(false);
  const [successLoading, setSuccessLoading] = useState(false);
  const [editData, setEditData] = useState(null);
  const [dropdownYear_branch,setDropdownYear_branch] = useState([]); 
  const searchParams = useSearchParams();
  const router = useRouter();

  const tabFromURL = searchParams.get('tab');
  const activeTab = tabFromURL === 'students' ? 'students' : 'teachers';

  // --- 1. Load Data ---
  const loadData = useCallback(async () => {
    try {
      const res = await fetch("/api/generate_dashboard_data", { cache: "no-store" });
      const json = await res.json();
      if (json.success) {
        setTeachers(json.data.Teacher || []);
        setStudents(json.data.Student || []);
        setDropdownSubjects(json.data.Unique_sub || []);
        setDropdownYear_branch(json.data.dropdown_data || []);
      }
    } catch (err) {
      console.error("Failed to load dashboard data", err);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Reset search when changing tabs
  useEffect(() => {
    setSearchTerm('');
  }, [activeTab]);

  // --- 2. Memoized Table Logic (Performance) ---
  const data = useMemo(() => {
    return activeTab === 'teachers' ? teachers : students;
  }, [activeTab, teachers, students]);

  const columns = useMemo(() => {
    if (data.length > 0) {
      return Object.keys(data[0]);
    }
    return [];
  }, [data]);

  const handleEditClick = (row) => {
    setEditData(row);
    setShowAddModal(true);
  };

  const formatHeader = (key) => key.replace(/([a-z])([A-Z])/g, "$1 $2");

  const filteredData = useMemo(() => {
    if (!searchTerm.trim()) return data;
    const term = searchTerm.toLowerCase();

    return data.filter(row =>
      Object.values(row).some(val =>
        Array.isArray(val)
          ? val.join(" ").toLowerCase().includes(term)
          : String(val).toLowerCase().includes(term)
      )
    );
  }, [data, searchTerm]);

  // --- 3. Handlers ---
 const handleDeleteUser = async (row) => {
  // 1. Get the correct ID based on the tab
  const id = activeTab === 'teachers' ? row.TeacherID : (row.RollNo || row.StudentID);
  const role = activeTab === 'teachers' ? 'teacher' : 'student';

  if (!window.confirm(`Are you sure you want to delete ${row.username || 'this user'}?`)) return;
  console.log('Deleting user with ID:', id, 'and role:', role);
  try {
    const res = await fetch('/api/remove_user', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        Userid: String(id), // FastAPI expects a string
        role: role
      }),
    });
    
    const json = await res.json();

    if (res.ok && json.success) {
      // 2. Update UI locally for instant feedback
      if (activeTab === 'teachers') {
        setTeachers(prev => prev.filter(t => t.TeacherID !== id));
      } else {
        setStudents(prev => prev.filter(s => (s.RollNo || s.StudentID) !== id));
      }
      
      // 3. Show success message
      setSuccessMsg(json.data.message || "User removed successfully");
      setShowConfetti(true);
      setShowSuccessPopup(true);

    } else {
      setErrorMsg(json.message || "Failed to delete user");
      setShowErrorPopup(true);
    }
  } catch (error) {
    setErrorMsg("Server unreachable. Please check your connection.");
    setShowErrorPopup(true);
  }
};

  const handleAddSuccess = (msg) => {
    setSuccessMsg(msg);
    setShowAddModal(false);
    setSuccessLoading(true);
    setEditData(null);
    setShowSuccessPopup(true);
    setShowConfetti(true);

    // Refresh the table data
    loadData();

    setTimeout(() => setSuccessLoading(false), 1200);
    setTimeout(() => setShowConfetti(false), 5000);
  };

  const handleAddError = (err) => {
    setErrorMsg(err);
    setShowErrorPopup(true);
  };

  if (!columns.length && teachers.length === 0 && students.length === 0) {
    return <div className="p-10 text-text-secondary">Loading user data...</div>;
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-text-main">User Management</h1>
          <p className="text-text-secondary">Add, edit, or remove {activeTab}.</p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center px-4 py-2 bg-primary text-dark-bg rounded-lg font-bold hover:opacity-90 transition-opacity"
        >
          <FiPlus className="mr-2" /> Add {activeTab === 'teachers' ? 'Teacher' : 'Student'}
        </button>
      </div>

      {/* Tabs + Search */}
      <div className="bg-card-bg p-6 rounded-lg shadow-sm">
        <div className="flex flex-col md:flex-row justify-between items-center mb-4 gap-4">
          <div className="flex border-b border-dark-bg w-full md:w-auto">
            <button
              onClick={() => router.push('?tab=teachers')}
              className={`px-6 py-2 font-semibold transition-colors ${
                activeTab === 'teachers' ? 'text-primary border-b-2 border-primary' : 'text-text-secondary hover:text-primary'
              }`}
            >
              Teachers
            </button>
            <button
              onClick={() => router.push('?tab=students')}
              className={`px-6 py-2 font-semibold transition-colors ${
                activeTab === 'students' ? 'text-primary border-b-2 border-primary' : 'text-text-secondary hover:text-primary'
              }`}
            >
              Students
            </button>
          </div>

          <div className="relative w-full md:w-80">
            <FiSearch className="absolute top-1/2 left-3 -translate-y-1/2 text-text-secondary" />
            <input
              type="text"
              className="w-full bg-dark-bg rounded-md pl-10 pr-4 py-2 text-text-main focus:ring-2 focus:ring-primary outline-none"
              placeholder={`Search ${activeTab}...`}
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left min-w-[800px]">
            <thead className="bg-dark-bg text-xs text-text-secondary uppercase">
              <tr>
                {columns.map(col => (
                  <th key={col} className="p-3">{formatHeader(col)}</th>
                ))}
                <th className="p-3 text-center">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredData.map((row, i) => (
                <tr key={row.TeacherID || row.RollNo || i} className="border-b hover:bg-white/5 border-dark-bg transition-colors">
                  {columns.map(col => (
                    <td key={col} className="p-3 text-sm">
                      {Array.isArray(row[col]) ? row[col].join(", ") : String(row[col] ?? '')}
                    </td>
                  ))}
                  <td className="p-3">
                    <div className="flex justify-center space-x-2">
                      <button className="p-2 text-primary hover:bg-dark-bg rounded-full transition-colors" onClick={() => handleEditClick(row)} ><FiEdit /></button>
                      <button
                        className="p-2 text-red-500 hover:bg-dark-bg rounded-full transition-colors"
                        onClick={() => handleDeleteUser(row)}
                      >
                        <FiTrash2 />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {filteredData.length === 0 && (
                <tr>
                  <td colSpan={columns.length + 1} className="p-10 text-center text-text-secondary">
                    No users found matching your search.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* --- Modals and Popups --- */}
      
      <AddUserModal 
        isOpen={showAddModal}
        onClose={() => {setShowAddModal(false); setEditData(null);}}
        activeTab={activeTab}
        dropdownSubjects={dropdownSubjects}
        onSuccess={handleAddSuccess}
        onError={handleAddError}
        editData={editData}
        dropdownYear_branch={dropdownYear_branch}
      />

      {showConfetti && showSuccessPopup && (
        <Confetti width={window.innerWidth} height={window.innerHeight} numberOfPieces={250} recycle={false} />
      )}

      {/* Success Popup */}
      <AnimatePresence>
        {showSuccessPopup && (
          <motion.div 
            className="fixed top-6 left-1/2 -translate-x-1/2 z-50"
            initial={{ y: -40, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: -40, opacity: 0 }}
          >
            <div className="relative bg-green-400/20 backdrop-blur-lg border border-green-400 rounded-xl px-8 py-6 shadow-xl min-w-[320px]">
              <div className="absolute -top-3 left-4 bg-green-500 text-white px-4 py-1 rounded-full text-sm">
                {successLoading ? "Processing..." : "Success 🎉"}
              </div>
              <div className="flex flex-col items-center gap-3 mt-4">
                {successLoading ? (
                  <div className="w-10 h-10 border-4 border-green-500 border-t-transparent rounded-full animate-spin" />
                ) : (
                  <div className="text-4xl">✅</div>
                )}
                <p className="text-lg font-semibold text-center">{successMsg}</p>
                {!successLoading && (
                  <button onClick={() => setShowSuccessPopup(false)} className="mt-2 px-6 py-2 bg-green-500 text-white rounded-full">Done</button>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Error Popup */}
      <AnimatePresence>
        {showErrorPopup && (
          <motion.div 
            className="fixed top-6 left-1/2 -translate-x-1/2 z-50"
            initial={{ y: -40, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: -40, opacity: 0 }}
          >
            <div className="relative bg-red-500/20 backdrop-blur-lg border border-red-500 rounded-xl px-8 py-6 shadow-xl">
              <div className="absolute -top-3 left-4 bg-red-500 text-white px-4 py-1 rounded-full text-sm">Error ❌</div>
              <p className="text-lg font-semibold text-center mt-2 text-red-200">{errorMsg}</p>
              <div className="flex justify-center mt-4">
                <button onClick={() => setShowErrorPopup(false)} className="px-6 py-2 bg-red-500 text-white rounded-full">Close</button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AdminManageUsers;