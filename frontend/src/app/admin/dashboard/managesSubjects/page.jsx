'use client';
import React, { useState, useMemo, useEffect } from 'react';
import {
  FiPlus,
  FiSearch,
  FiX,
  FiBookOpen,
  FiEdit,
  FiDelete,
  
   
} from 'react-icons/fi';
import { HiArrowCircleUp, HiArrowCircleDown } from "react-icons/hi";
import { AiOutlineDelete } from "react-icons/ai";
/* ---------------- FORM INPUT ---------------- */
const FormInput = ({ label, id, ...props }) => (
  <div>
    <label htmlFor={id} className="block text-sm font-medium text-text-secondary mb-1">
      {label}
    </label>
    <input
      id={id}
      {...props}
      className="w-full bg-dark-bg border border-transparent rounded-md px-4 py-2 text-text-main focus:ring-primary focus:border-primary"
    />
  </div>
);

/* ---------------- MODAL ---------------- */
const SubjectModal = ({ subject, onClose, onSave }) => {
  const [formData, setFormData] = useState(subject || {});

  const handleChange = (e) => {
    const { id, value } = e.target;
    setFormData(prev => ({ ...prev, [id]: value }));

  };

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
      <div className="bg-card-bg p-8 rounded-lg shadow-xl w-full max-w-lg">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-text-main">
            Add New Subject
          </h2>
          <button onClick={onClose} className="text-text-secondary hover:text-primary">
            <FiX size={24} />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormInput label="Subject Name" id="name" value={formData.name || ''} onChange={handleChange} />
          <FormInput label="Credits" id="credits" type="number" value={formData.credits || ''} onChange={handleChange} />
          <FormInput label="Year" id="year" value={formData.year || ''} onChange={handleChange} />
          <FormInput label="Branch" id="branch" value={formData.branch || ''} onChange={handleChange} />
          <FormInput label="Type" id="type" value={formData.type || ''} onChange={handleChange} />
        </div>

        <div className="flex justify-end pt-6">
          <button
            onClick={() => onSave(formData)}
            className="px-6 py-2 bg-primary text-dark-bg font-bold rounded-lg hover:bg-opacity-90"
          >
            Save Subject
          </button>
        </div>
      </div>
    </div>
  );
};

/* ---------------- MAIN COMPONENT ---------------- */
export default function AdminManagesSubjects() {
  const [dashboardData, setDashboardData] = useState({});
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setModalOpen] = useState(false);
  const [openYear, setOpenYear] = useState(null);
  const [openBranch, setOpenBranch] = useState(null);

  /* -------- FETCH DASHBOARD DATA -------- */
  

  useEffect(() => {
    const loadData = async () => {
      const res = await fetch("/api/generate_dashboard_data", { cache: "no-store" });
      const json = await res.json();
       
      if (!json.success) return;
  
        setDashboardData(json.data.Subject?.[0]?.Subject_data || {});
  
      };
    
    loadData();
  }, []);

  /* -------- FLATTEN DATA FOR SEARCH -------- */
  const flattenedSubjects = useMemo(() => {
    const list = [];

    Object.entries(dashboardData).forEach(([year, branches]) => {
      Object.entries(branches).forEach(([branch, types]) => {
        Object.entries(types).forEach(([type, subjects]) => {
          Object.entries(subjects).forEach(([name, credits]) => {
            list.push({
              year,
              branch,
              type,
              name,
              credits,
            });
          });
        });
      });
    });

    return list;
  }, [dashboardData]);

  /* -------- SEARCH BY NAME OR CREDITS -------- */
  const searchedSubjects = useMemo(() => {
    if (!searchTerm) return [];

    return flattenedSubjects.filter(sub =>
      sub.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      sub.credits.toString().includes(searchTerm)
    );
  }, [searchTerm, flattenedSubjects]);

  return (
    <div className="space-y-10">

      {/* HEADER */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-text-main">Manage Subjects</h1>
          <p className="text-text-secondary">
            Define all subjects, credits, and weekly hours.
          </p>
        </div>
        <button
          onClick={() => setModalOpen(true)}
          className="flex items-center px-4 py-2 bg-primary text-dark-bg font-bold rounded-lg hover:bg-opacity-90"
        >
          <FiPlus className="mr-2" /> Add New Subject
        </button>
      </div>

      {/* SEARCH */}
      <div className="bg-card-bg p-6 rounded-lg shadow-sm">
        <div className="relative w-full md:w-1/3">
          <FiSearch className="absolute top-1/2 left-3 -translate-y-1/2 text-text-secondary" />
          <input
            type="text"
            placeholder="Search by subject name or credits..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="w-full bg-dark-bg rounded-md pl-10 pr-4 py-2 text-text-main"
          />
        </div>
      </div>

      {/* SEARCH RESULTS */}
      {searchTerm && (
        <div className="bg-card-bg p-6 rounded-lg shadow-sm">
          <h3 className="text-lg font-semibold text-text-main mb-4">
            Search Results
          </h3>

          {searchedSubjects.length === 0 ? (
            <p className="text-text-secondary">No subjects found</p>
          ) : (
            <table className="w-full text-left">
              <thead className="bg-dark-bg text-xs text-text-secondary uppercase">
                <tr>
                  <th className="p-3">Year</th>
                  <th className="p-3">Branch</th>
                  <th className="p-3">Type</th>
                  <th className="p-3">Subject</th>
                  <th className="p-3">Credits</th>
                </tr>
              </thead>
              <tbody>
                {searchedSubjects.map((sub, idx) => (
                  <tr key={idx} className="border-b border-dark-bg">
                    <td className="p-3">{sub.year}</td>
                    <td className="p-3">{sub.branch}</td>
                    <td className="p-3">{sub.type}</td>
                    <td className="p-3">{sub.name}</td>
                    <td className="p-3">{sub.credits}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}

      {/* DASHBOARD COLLAPSE VIEW */}
      <div className="bg-card-bg p-6 rounded-lg shadow-sm">
        <h2 className="text-2xl font-bold text-text-main flex items-center gap-2 mb-6">
          <FiBookOpen /> Subject Structure
        </h2>

        {Object.entries(dashboardData).map(([year, branches]) => (
          <div key={year} className="mb-6">

           <div
  onClick={() => {
    setOpenYear(openYear === year ? null : year);
    setOpenBranch(null);
  }}
  className="cursor-pointer flex items-center justify-between
             bg-linear-to-r from-dark-bg to-dark-bg/80
             px-6 py-4 rounded-xl
             font-semibold text-text-main
             shadow-md hover:shadow-lg
             transition-all duration-200"
>
  <span className="text-lg tracking-wide">{year}</span>

  <span className="text-xl text-primary transition-transform duration-200">
    {openYear === year ? (
      <HiArrowCircleUp />
    ) : (
      <HiArrowCircleDown />
    )}
  </span>
</div>

            {openYear === year &&
              Object.entries(branches).map(([branch, types]) => (
                <div key={branch} className="ml-6 mt-4">

                  <div
                    className="cursor-pointer flex items-center justify-between
             bg-linear-to-r from-dark-bg/70 to-dark-bg/50
             px-6 py-4 rounded-xl
             font-semibold text-text-main
             shadow-md hover:shadow-lg
             transition-all duration-200"
                    onClick={() =>
                      setOpenBranch(openBranch === branch ? null : branch)
                    }
                  >
                     <span className="text-lg tracking-wide">{branch}</span>

  <span className="text-xl text-primary transition-transform duration-200">
    {openBranch === branch ? (
      <HiArrowCircleUp />
    ) : (
      <HiArrowCircleDown />
    )}
  </span>
                  </div>

                  {openBranch === branch && (
                    <div className="ml-6 mt-4 space-y-6">

                      {['Theory', 'Lab'].map(type => (
                        <div key={type}>
                          <h4 className="font-semibold text-text-main mb-2">
                            {type}
                          </h4>
                          <table className="w-full text-left">
                            <thead className="bg-dark-bg text-xs text-text-secondary uppercase">
                              <tr>
                                <th className="p-3">Subject Name</th>
                                <th className="p-3">Credits</th>
                                <th className="p-1">Action</th>
                              </tr>
                            </thead>
                            <tbody>
                              {Object.entries(types[type] || {}).map(([subject, credits]) => (
                                <tr key={subject} className="border-b border-dark-bg">
                                  <td className="p-3">{subject}</td>
                                  <td className="p-4">{credits}</td>
                                  <td className="p-1">
                                    <button
                                      className="text-primary font-medium hover:underline"  
                                      onClick={() => handleEdit(subject)}
                                    >
                                      <FiEdit className="inline mr-1" />
                                    </button>
                                    <button
                                      className="text-red-500 font-medium hover:underline ml-4"  
                                      onClick={() => handleDelete(subject)}
                                    >
                                      <AiOutlineDelete className="inline mr-1" />
                                    </button>
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      ))}

                    </div>
                  )}
                </div>
              ))}
          </div>
        ))}
      </div>

      {isModalOpen && (
        <SubjectModal
          onClose={() => setModalOpen(false)}
          onSave={() => setModalOpen(false)}
        />
      )}
    </div>
  );
}
