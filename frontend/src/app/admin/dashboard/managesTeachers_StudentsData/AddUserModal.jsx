'use client';
import React, { useState, useMemo, useEffect} from 'react';
import { motion, AnimatePresence } from "framer-motion";

const initialState = {
  username: '',
  gmail: '',
  phoneno: '',
  Subject: [],
  Course: '',
  Branch: '',
  Year: '',
  Dept: '',
  Section: '',
  Designation: '',
};
const capitalize = (name) =>
  name
    .trim()
    .toLowerCase()
    .split(' ')
    .filter(Boolean)
    .map(word => word[0].toUpperCase() + word.slice(1))
    .join(' ');

const AddUserModal = ({ isOpen, onClose, activeTab, dropdownSubjects, onSuccess, onError, editData, dropdownYear_branch}) => {
  const [subjectSearch, setSubjectSearch] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState(initialState);
  const [dropdownData, setDropdownData] = useState({});

  //set dropdown for year and branch 
const years = useMemo(() => {
  if (!dropdownYear_branch) return [];
  return Object.keys(dropdownYear_branch);
}, [dropdownYear_branch]);

const branches = useMemo(() => {
  if (activeTab !== "students") return [];
  return dropdownYear_branch?.[formData.Year] ?? [];
}, [formData.Year, dropdownYear_branch, activeTab]);

  // --- Populate form if editing ---
  useEffect(() => {
    if (editData && isOpen) {
      setFormData({
        username: editData.Name || '',
        gmail: editData.gmail || '',
        phoneno: String(editData.Contact || ''),
        // Handle Subject string from DB to array for the checkboxes
        Subject: typeof editData.Subject === 'string' 
          ? editData.Subject.split(',').map(s => s.trim()).filter(Boolean) 
          : (editData.Subject || []),
        Course: editData.Course || '',
        Branch: editData.Branch || editData.Department || '',
        Year: editData.Year || '',
        Section: editData.Section || '',
        Dept: editData.Department || '',
        Designation: editData.Designation || '',
      });
    } else if (!isOpen) {
      setFormData(initialState);
    }
  }, [editData, isOpen]);

  const resetAndClose = () => {
    setFormData(initialState);
    setSubjectSearch('');
    onClose();
  };

  const isValidEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  const isValidPhone = (phone) => /^[6-9]\d{9}$/.test(phone);

  const validateForm = () => {
    if (!formData.username.trim()) return "Name is required";
    if (!formData.gmail.trim()) return "Gmail is required";
    if (!isValidEmail(formData.gmail)) return "Enter a valid email address";
    if (!formData.phoneno) return "Phone number is required";
    if (!isValidPhone(formData.phoneno)) return "Enter a valid 10-digit mobile number starting with 6-9";
    if (!formData.Section && activeTab === "students") return "Section is required";
    return null;
  };

  const filteredSubjects = useMemo(() => {
    if (activeTab !== "teachers") return [];
    return dropdownSubjects.filter(sub =>
      sub.toLowerCase().includes(subjectSearch.toLowerCase())
    );
  }, [dropdownSubjects, subjectSearch, activeTab]);

  const handleSubmit = async () => {
    const error = validateForm();
    if (error) {
      onError(error);
      return;
    }

    setIsSubmitting(true);
    
    // Determine Endpoint
    const endpoint = editData ? '/api/update_user' : '/api/add_user';

    const payload = {
      // Include Userid only if editing
      userid: editData ? String(editData.TeacherID || editData.RollNo || editData.StudentID) : null,
      username: capitalize(formData.username),
      gmail: formData.gmail.trim(),
      phoneno: Number(formData.phoneno),
      role: activeTab === "teachers" ? "teacher" : "student",
      Dept: activeTab === "teachers" ? (formData.Dept || null) : (formData.Branch || null),
      Designation: activeTab === "teachers" ? (formData.Designation || null) : null,
      Subject: activeTab === "teachers" ? formData.Subject.join(",") : null,
      Course: activeTab === "students" ? (formData.Course || null) : null,
      Year: activeTab === "students" ? (formData.Year || null) : null,
      Workload: editData?.Workload || 0,
      Section: activeTab === "students"
    ? formData.Section?.trim().toUpperCase()
    : null,
    };
    console.log("Payload:", payload);
    try {
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const json = await res.json();

      if (res.ok && json.success) {
        onSuccess(json.data.message || (editData ? 'User updated!' : 'User added!'));
        if(!editData) setFormData(initialState); 
      } else {
        onError(json.message || 'Action failed');
      }
    } catch (err) {
      onError('Server not reachable');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    
      <motion.div 
        className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4"
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      >
        <motion.div 
          className="bg-card-bg w-full max-w-xl rounded-xl p-6 shadow-xl border border-white/10"
          initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
        >
          <h2 className="text-xl font-bold mb-4">
            {editData ? 'Edit' : 'Add'} {activeTab === 'teachers' ? 'Teacher' : 'Student'}
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input className="input" placeholder="Name" value={formData.username} onChange={e => setFormData({...formData, username: e.target.value})} />
            <input className="input" placeholder="Email" type="email" value={formData.gmail} onChange={e => setFormData({...formData, gmail: e.target.value})} />
            <input className="input" placeholder="Phone No" maxLength={10} value={formData.phoneno} onChange={e => setFormData({...formData, phoneno: e.target.value.replace(/\D/g, "")})} />
            
            {activeTab === 'teachers' ? (
              <>
                {/* <input className="input" placeholder="Department" value={formData.Dept} onChange={e => setFormData({...formData, Dept: e.target.value})} /> */}
                <select className="input" placeholder="Department" value = {formData.Dept} onChange = {e=> setFormData({...formData, Dept: e.target.value})} >
                  <option value="" disabled>Select Department</option>
                  <option value="B.Tech">CSE</option>
                  <option value="M.Tech">IT</option>
                  <option value="ECE">ECE</option>
                  <option value="EEE">EEE</option>
                  <option value="ME">ME</option>
                  <option value="Civil">Civil</option>
                </select>
                <input className="input" placeholder="Designation" value={formData.Designation} onChange={e => setFormData({...formData, Designation: e.target.value})} />
                
                <div className="md:col-span-2">
                    <p className="text-sm mb-2 text-text-secondary">Subjects</p>
                    {formData.Subject.length > 0 && (
                      <div className="flex flex-wrap gap-2 mb-3">
                        {formData.Subject.map(sub => (
                          <span key={sub} className="flex items-center gap-2 bg-primary text-dark-bg px-3 py-1 rounded-full text-xs font-bold">
                            {sub}
                            <button onClick={() => setFormData(prev => ({ ...prev, Subject: prev.Subject.filter(s => s !== sub) }))} className="hover:text-red-600">✕</button>
                          </span>
                        ))}
                      </div>
                    )}
                    <input className="input mb-2" placeholder="Search subject..." value={subjectSearch} onChange={e => setSubjectSearch(e.target.value)} />
                    <div className="max-h-32 overflow-y-auto border border-dark-bg p-2 rounded bg-dark-bg/30">
                        {filteredSubjects.map(sub => (
                            <label key={sub} className="flex items-center gap-2 p-1.5 cursor-pointer hover:bg-white/5 rounded">
                                <input type="checkbox" checked={formData.Subject.includes(sub)} 
                                    onChange={() => setFormData(p => ({...p, Subject: p.Subject.includes(sub) ? p.Subject.filter(s => s !== sub) : [...p.Subject, sub]}))}/>
                                <span className="text-sm">{sub}</span>
                            </label>
                        ))}
                    </div>
                </div>
              </>
            ) : (
              <>
             
                <select className="input" value={formData.Course} onChange={e => setFormData({...formData, Course: e.target.value})}>
                  <option value="" disabled>Select Course</option>
                  <option value="B.Tech">B.Tech</option>
                  <option value="M.Tech">M.Tech</option>
                </select>

                <select className="input" value={formData.Year} onChange={e => setFormData({...formData, Year: e.target.value,
                Branch:""
                })}>
                  <option value="" disabled>Select Year</option>
                  {years.map(year => (  
                    <option key={year} value={year}>{year}</option>
                  ))}
                </select>
                <select className="input" value={formData.Branch} onChange={e => setFormData({...formData, Branch: e.target.value})}>
                  <option value="" disabled>Select Branch</option>
                  {branches.length > 0 ? branches.map(branch => (
                    <option key={branch} value={branch}>{branch}</option>
                  )) : (
                    <option value="" disabled>No branches available</option>
                  )}
                </select>
                {editData ? (
                  <input className="input" placeholder="Section" value={formData.Section} onChange={e => setFormData({...formData, Section: e.target.value})} />
                ): null }
              
              </>
              
            )}
          </div>

          <div className="flex justify-end gap-3 mt-6">
            <button onClick={resetAndClose} className="px-4 py-2 rounded bg-dark-bg">Cancel</button>
            <button onClick={handleSubmit} disabled={isSubmitting} className="px-4 py-2 rounded bg-primary text-dark-bg font-bold">
              {isSubmitting ? "Processing....." : (editData ? "Update" : "Save")}
            </button>
          </div>
        </motion.div>
      </motion.div>
   
  );
};

export default AddUserModal;