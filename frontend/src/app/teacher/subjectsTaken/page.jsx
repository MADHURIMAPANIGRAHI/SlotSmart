// 'use client';
// import React, {useState, useMemo} from 'react';
// import { FiSearch, FiChevronDown } from 'react-icons/fi';
// import { dummyData } from '@/data/dummyData';
// const subjectsData = dummyData.teacher.subjects;

// const TeacherSubjects = () => {
//     const [searchTerm, setSearchTerm] = useState('');
//   const [branchFilter, setBranchFilter] = useState('');
//     const filteredSubjects = useMemo(() => {
//     return subjectsData.filter(subject => {
//       const searchMatch = subject.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
//                           subject.code.toLowerCase().includes(searchTerm.toLowerCase());
//       const branchMatch = branchFilter ? subject.branch === branchFilter : true;
//       return searchMatch && branchMatch;
//     });
//   }, [searchTerm, branchFilter]);
//   return (
//     <div className="space-y-8">
//       <h1 className="text-3xl font-bold text-text-main">My Subjects</h1>
        
//       {/* Filter Bar */}
//       <div className="bg-card-bg p-4 rounded-lg flex flex-col md:flex-row items-center gap-4">
//         <div className="relative w-full md:flex-grow">
//           <FiSearch className="absolute top-1/2 left-3 -translate-y-1/2 text-text-secondary" />
//           <input
//             type="text"
//             placeholder="Search by subject or code..."
//             value={searchTerm}
//             onChange={(e) => setSearchTerm(e.target.value)}
//             className="w-full bg-dark-bg text-text-main placeholder-text-secondary pl-10 pr-4 py-2 rounded-md border border-transparent focus:outline-none focus:ring-2 focus:ring-primary"
//           />
//         </div>
//         <div className="relative w-full md:w-auto">
//            <select 
//               value={branchFilter}
//               onChange={(e) => setBranchFilter(e.target.value)}
//               className="w-full md:w-48 bg-dark-bg text-text-main pl-4 pr-10 py-2 rounded-md border border-transparent focus:outline-none focus:ring-2 focus:ring-primary appearance-none"
//            >
//               <option value="">All Branches</option>
//               <option value="B.Tech">B.Tech</option>
//               {/* Add other branches here if needed */}
//            </select>
//            <FiChevronDown className="absolute top-1/2 right-3 -translate-y-1/2 text-text-secondary pointer-events-none" />
//         </div>
//       </div>

//       {/* Subjects List - Refactored to a proper table */}
//       <div className="bg-card-bg rounded-lg shadow-sm overflow-hidden">
//         <div className="overflow-x-auto">
//             <table className="w-full text-left">
//                 <thead className="bg-dark-bg">
//                     <tr className="text-xs text-text-secondary uppercase">
//                         <th className="p-4">Subject Name</th>
//                         <th className="p-4">Code</th>
//                         <th className="p-4">Section</th>
//                         <th className="p-4">Students</th>
//                         <th className="p-4">Schedule</th>
//                     </tr>
//                 </thead>
//                 <tbody className="divide-y divide-dark-bg text-text-main">
//                     {/* 3. Access properties DIRECTLY from the 'subject' object */}
//                     {filteredSubjects.map((subject, index) => (
//                       <tr key={index} className="hover:bg-dark-bg/50">
//                           <td className="p-4 font-semibold">{subject.name}</td>
//                           <td className="p-4 font-mono">{subject.code}</td>
//                           <td className="p-4">{subject.section}</td>
//                           <td className="p-4">{subject.students}</td>
//                           <td className="p-4 text-primary font-medium">{subject.schedule}</td>
//                       </tr>
//                     ))}
//                 </tbody>
//             </table>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default TeacherSubjects;


'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { FiSearch, FiChevronDown } from 'react-icons/fi';

const TeacherSubjects = () => {
  const [subjects, setSubjects] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [branchFilter, setBranchFilter] = useState('');

  // 🔹 Fetch from API
  useEffect(() => {
  fetch('/api/teacher_subjects', { cache: 'no-store' })
    .then(res => res.json())
    .then(json => {
      if (json.success && json.data?.Subject_name) {
        const formatted = Object.entries(json.data.Subject_name).map(
          ([name, details]) => ({
            name,
            ...details,
          })
        );
        setSubjects(formatted);
      }
    })
    .catch(err => console.error(err));
}, []);

  // 🔹 Filtering
  const filteredSubjects = useMemo(() => {
    return subjects.filter(subject => {
      const searchMatch = subject.name
        .toLowerCase()
        .includes(searchTerm.toLowerCase());

      const branchMatch = branchFilter
        ? subject.Branch === branchFilter
        : true;

      return searchMatch && branchMatch;
    });
  }, [subjects, searchTerm, branchFilter]);

  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-bold text-text-main">My Subjects</h1>

      {/* Filter Bar */}
      <div className="bg-card-bg p-4 rounded-lg flex flex-col md:flex-row items-center gap-4">
        <div className="relative w-full md:grow">
          <FiSearch className="absolute top-1/2 left-3 -translate-y-1/2 text-text-secondary" />
          <input
            type="text"
            placeholder="Search subject..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-dark-bg text-text-main pl-10 pr-4 py-2 rounded-md focus:ring-2 focus:ring-primary"
          />
        </div>

        <div className="relative w-full md:w-auto">
          <select
            value={branchFilter}
            onChange={(e) => setBranchFilter(e.target.value)}
            className="w-full md:w-48 bg-dark-bg text-text-main pl-4 pr-10 py-2 rounded-md appearance-none focus:ring-2 focus:ring-primary"
          >
            <option value="">All Branches</option>
            <option value="CSE">CSE</option>
            <option value="IT">IT</option>
            <option value="ECE">ECE</option>
            <option value="ME">ME</option>
            <option value="EEE">EEE</option>
            <option value="ECS">ECS</option>
            {/* Add more branches if needed */}
          </select>
          <FiChevronDown className="absolute top-1/2 right-3 -translate-y-1/2 text-text-secondary pointer-events-none" />
        </div>
      </div>

      {/* Subjects Table */}
      <div className="bg-card-bg rounded-lg shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-cyan-900">
              <tr className="text-30 text-text-main uppercase">
                <th className="p-4">Subject Name</th>
                <th className="p-4">Year</th>
                <th className="p-4">Branch</th>
                <th className="p-4">Section</th>
                <th className="p-4">Time Slots</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-dark-bg text-text-main">
              {filteredSubjects.map((subject, index) => (
                <tr key={index} className="hover:bg-dark-bg/50">
                  <td className="p-4 font-semibold">{subject.name}</td>
                  <td className="p-4">{subject.Year}</td>
                  <td className="p-4">{subject.Branch}</td>
                  <td className="p-4">{subject.Section}</td>
                  <td className="p-4 text-text-main">
                    <ul className="space-y-1">
                      {subject.Time_slot.map((slot, i) => (
                        <li key={i}>{slot}</li>
                      ))}
                    </ul>
                  </td>
                </tr>
              ))}

              {filteredSubjects.length === 0 && (
                <tr>
                  <td colSpan="5" className="p-4 text-center text-text-secondary">
                    No subjects found
                  </td>
                </tr>
              )}
            </tbody>

          </table>
        </div>
      </div>
    </div>
  );
};

export default TeacherSubjects;
