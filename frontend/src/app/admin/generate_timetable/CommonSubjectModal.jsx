    'use client';
    import React, { useEffect, useState, useMemo } from "react";
    import { FiX } from "react-icons/fi";

    const CommonSubjectModal = ({
    show,
    onClose,
    onSave,
    year
    }) => {
    const [subjects, setSubjects] = useState([]);
    const [branchesByYear, setBranchesByYear] = useState({});
    const [yearBranches, setYearBranches] = useState([]);       
    const [selectedBranches, setSelectedBranches] = useState([]);
    const [selectedSubjects, setSelectedSubjects] = useState([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [loading, setLoading] = useState(false);

    const removeSubject = (sub) => {
  setSelectedSubjects(prev => prev.filter(s => s !== sub));
};

    // 🔹 Fetch subjects from API
useEffect(() => {
  if (!show || subjects.length > 0) return;

  setLoading(true); 

  fetch("/api/generate_dashboard_data", { cache: "no-store" })
    .then(res => res.json())
    .then(json => {
      setSubjects(json.data?.Unique_sub || []);
      setBranchesByYear(json.data?.dropdown_data || []); 
    })
    .catch(err => console.error(err))
    .finally(() => setLoading(false));
}, [show, subjects.length]);

useEffect(() => {
  if (!year || !branchesByYear) return;

  const branchesForYear = branchesByYear[year] || [];
  setYearBranches(branchesForYear);
  setSelectedBranches([]);
  setSelectedSubjects([]); 
}, [year, branchesByYear]);

    const toggle = (value, list, setList) => {
        setList(prev =>
        prev.includes(value)
            ? prev.filter(v => v !== value)
            : [...prev, value]
        );
    };

        const filteredSubjects = useMemo(() => {
        return subjects.filter(sub =>
        sub.toLowerCase().includes(searchTerm.toLowerCase())
        );
    }, [subjects, searchTerm]);

    const handleSave = () => {
        if (!selectedBranches.length || !selectedSubjects.length) {
        alert("Select at least one branch and subject");
        return;
        }

        onSave({
        branches: selectedBranches,
        common_sub: selectedSubjects
        });

        onClose();
    };

    if (!show) return null;
    if (!year) {
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-gray-900 p-6 rounded-lg">
        <p className="text-gray-400">Select year first</p>
        <button
          onClick={onClose}
          className="mt-4 px-4 py-2 bg-gray-600 rounded"
        >
          Close
        </button>
      </div>
    </div>
  );
}

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
        <div className="bg-gray-900 p-6 rounded-lg w-[500px] max-h-[80vh] overflow-y-auto">
            <h2 className="text-xl font-bold mb-4">Add Common Subjects</h2>

            {/* Branches */}
            <div className="mb-4">
            <p className="font-semibold mb-2">Branches</p>
            <div className="grid grid-cols-2 gap-2">
                {yearBranches.length > 0 ? (
  yearBranches.map(b => (
    <label key={b} className="flex items-center gap-2">
      <input
        type="checkbox"
        checked={selectedBranches.includes(b)}
        onChange={() =>
          toggle(b, selectedBranches, setSelectedBranches)
        }
      />
      {b}
    </label>
  ))
) : (
  <p className="text-sm text-gray-400 col-span-2">
    No branches found for selected year
  </p>
)}

                   
            </div>
            </div>

            {/* Subjects */}
<div className="mb-4">
  <p className="font-semibold mb-2">Common Subjects</p>
  {selectedSubjects.length > 0 && (
  <div className="flex flex-wrap gap-2 mb-2">

    {selectedSubjects.map(sub => (
        <span
          key={sub}
           className="absolute top-2 right-2 text-red-500 hover:text-red-600"
  title="Delete"
>
  {sub}
          </span>
      ))}
    </div>
  )}

  {/* Search */}
<input
    type="text"
    placeholder="Search subjects..."
    value={searchTerm}
    onChange={(e) => setSearchTerm(e.target.value)}
    className="w-full mb-2 px-3 py-2 rounded bg-gray-800 border border-gray-700 outline-none"
  />

  <div className="grid grid-cols-2 gap-2 overflow-y-scroll h-40">
    {loading ? (
      <div className="col-span-2 flex justify-center items-center h-full text-gray-400">
        Loading subjects...
      </div>
    ) : filteredSubjects.length > 0 ? (
      filteredSubjects.map(sub => (
        <label key={sub} className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={selectedSubjects.includes(sub)}
            onChange={() =>
              toggle(sub, selectedSubjects, setSelectedSubjects)
            }
          />
          {sub}
        </label>
      ))
    ) : (
      <p className="text-sm text-gray-400 col-span-2">
        No subjects found
      </p>
    )}
  </div>
</div>


            {/* Buttons */}
            <div className="flex justify-end gap-3">
            <button
                onClick={onClose}
                className="px-4 py-2 bg-gray-600 rounded
                "
            >
                Cancel
            </button>
            <button
                onClick={handleSave}
                disabled={loading}
  className={`px-4 py-2 rounded font-bold ${
    loading
      ? "bg-gray-600 cursor-not-allowed"
      : "bg-primary text-black"
  }`}
            >
                Save
            </button>
            </div>
        </div>
        </div>
    );
    };

    export default CommonSubjectModal;
