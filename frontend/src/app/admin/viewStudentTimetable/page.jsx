'use client';

import React, { useState, useEffect } from 'react';
import { FiUsers, FiCalendar, FiSearch } from 'react-icons/fi';

// --- Reusable Class Cell ---
const ClassCard = ({ data }) => {
    // Handle the typo 'suject' from your backend data
    const subjectName = data.subject || data.suject;

    if (!subjectName) return <div className="text-text-secondary h-full">-</div>;
    if (subjectName === 'Lunch') return <div className="h-full p-3 bg-yellow-100 text-yellow-800 font-bold flex items-center justify-center text-xs rounded-md">LUNCH</div>;
    if (subjectName === 'CB') return <div className="h-full bg-indigo-100 text-indigo-800 font-bold flex items-center justify-center text-xs rounded-md">Club</div>;

    const isLab = typeof subjectName === 'string' && subjectName.toLowerCase().includes('lab');

    return (
       <div className={`h-full p-1.5 text-left text-sm rounded-md ${isLab ? 'bg-red-200' : 'bg-primary/20'}`}>
            <p className={`font-bold truncate ${isLab ? 'text-orange-700' : 'text-primary'}`}>{subjectName}</p>
            <p className={`truncate fw-bold ${isLab ? 'text-black' : 'text-white'}`}>{data.teacher || 'N/A'}</p>
            <p className={`truncate font-mono ${isLab ? 'text-black' : 'text-white'}`}>{data.room ? `Room: ${data.room}` : ''}</p>
        </div>
    );
};

// --- Main Page Component ---
const AdminViewStudentTimetable = () => {
    // State for the filters
    const [selectedCourse, setSelectedCourse] = useState("");
    const [selectedBranch, setSelectedBranch] = useState("");
    const [selectedYear, setSelectedYear] = useState("");
    const [selectedSection, setSelectedSection] = useState("");
    const [scheduleData, setScheduleData] = useState(null); // Will hold the API response
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);
    const [data, setData] = useState({});
    const [years, setYears] = useState([]);
    const [branches, setBranches] = useState([]);
    const [sections, setSections] = useState([]);

    //get all data for dropdowns
    useEffect(() => {
        const fetchData = async () => {
            try {
                const res = await fetch("/api/get_class_timetable", {
                    method: "GET",
                    
  credentials: 'include',
  cache: 'no-store',

                });
                const result_get = await res.json();
                if (!result_get.success || !result_get.data) return;
                const data1 = result_get.data[0];
                setData(data1);
                const years = Object.keys(data1);
                setYears(years);
                // const branches11Set = new Set();
                // const sectionsSet = new Set();
                // years.forEach((year) => {
                //     const yearData = data[year];
                //     Object.keys(yearData).forEach((branche) => {
                //         branchesSet.add(branche);
                //         yearData[branche].forEach((section) => {
                //             sectionsSet.add(section);
                //         });
                //     });
                

            //     })
             }
            catch (err) {
                console.error("Error fetching student data:", err);
            }
        };
        fetchData();
    }, []);
                
    // This function calls your new API route
    const handleFetchTimetable = async () => {
  setIsLoading(true);
  setError(null);
  setScheduleData(null);

  try {
    const response = await fetch('/api/get_class_timetable', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        course: selectedCourse,
        year: selectedYear,
        branch: selectedBranch,
        section: selectedSection
      }),
      cache: 'no-store'
    });

    if (!response.ok) {
      throw new Error("Failed to fetch timetable");
    }

    const result = await response.json();

    const timetableObj = result.data.timetable;
    const key = Object.keys(timetableObj)[0];
    const rawData = timetableObj[key];

    const timeSlots = Array.from(
      new Set(rawData.flatMap(day => Object.keys(day.schedule)))
    );

    const tableData = [
      ["Day/Time", ...timeSlots],
      ...rawData.map(day => [
        day.day,
        ...timeSlots.map(slot => day.schedule[slot] || {})
      ])
    ];

    setScheduleData({ name: key, data: tableData });

  } catch (err) {
    setError(err.message);
  } finally {
    setIsLoading(false);
  }
};


    return (
        <div className="space-y-8">
            {/* Header */}
            <div>
                <h1 className="text-3xl font-bold text-text-dark">View Student Timetables</h1>
                <p className="text-text-light">Filter by course, year, branch and section to view a specific group's schedule.</p>
            </div>

            {/* Main Content Card */}
            <div className="bg-card-bg p-6 rounded-lg shadow-sm">
                {/* Filters */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-2.5 mb-8">
                    <select value={selectedCourse} onChange={(e) => setSelectedCourse(e.target.value)} className="w-full bg-dark-bg rounded-md px-4 py-2 text-text-main focus:ring-primary focus:border-primary">
                        <option value="">Select Course</option>
                        <option value="B.Tech">B.Tech</option>
                        <option value="M.Tech">M.Tech</option>

                    </select>
                    
                    <select value={selectedYear} 
                    onChange={(e) => {
  const year = e.target.value;

  setSelectedYear(year);
  setSelectedBranch("");
  setSelectedSection("");

  setBranches(Object.keys(data?.[year] || {}));
  setSections([]);
}}
                    className="w-full bg-dark-bg rounded-md px-4 py-2 text-text-main focus:ring-primary focus:border-primary">
                        <option value="">Select Year</option>
                        {years.map((yr) =>                             
                            <option key = {yr} value = {yr}> {yr} </option>
                        )}
                    </select>
                    <select value={selectedBranch}
                   onChange={(e) => {
  const branch = e.target.value;

  setSelectedBranch(branch);
  setSelectedSection("");

  setSections(data?.[selectedYear]?.[branch] || []);
}}
                className="w-full bg-dark-bg rounded-md px-4 py-2 text-text-main focus:ring-primary focus:border-primary">
                        <option value="">Select Branch</option>
                        {branches.map((br) => {
                            
                            return <option key={br} value={br}>{br}</option>;
                        })}
                    </select>
                    <select value={selectedSection} onChange={(e) => setSelectedSection(e.target.value)} className="w-full bg-dark-bg rounded-md px-4 py-2 text-text-main focus:ring-primary focus:border-primary">
                        <option value="">Select Section</option>
                        {sections.map((sec) =>
                            <option key={sec} value={sec}>{sec}</option>
                        )}
                    </select>
                    <button onClick={handleFetchTimetable} disabled={isLoading} className="w-full flex items-center justify-center bg-primary text-black font-semibold py-2 px-4 rounded-md hover:bg-primary-hover disabled:bg-gray-400">
                        <FiSearch className="mr-2"/>
                        {isLoading ? 'Loading...' : 'View Timetable'}
                    </button>
                </div>

                {/* --- UI STATES --- */}
                {isLoading && (
                    <div className="text-center py-12 text-text-light">
                        <FiCalendar size={48} className="mx-auto mb-4 animate-spin text-primary" />
                        <p className="text-lg font-semibold">Fetching timetable...</p>
                    </div>
                )}
                {error && (
                    <div className="bg-red-100 border border-red-400 text-red-700 p-4 rounded-lg text-center">
                        <h3 className="font-bold">Error</h3>
                        <p className="text-sm">{error}</p>
                    </div>
                )}
                
                {/* Timetable Display */}
                {scheduleData && (
                    <div>
                        <h2 className="text-2xl font-bold text-text-main mb-4 flex items-center">
                            <FiUsers className="mr-3 text-primary" />
                            {scheduleData.name}
                        </h2>
                        <div className="overflow-x-auto">
                            <table className="w-full text-left min-w-[700px]">
                                <thead className="text-xs text-text-main uppercase">
                                    <tr>
                                        {/* Render table headers from the received data */}
                                        {scheduleData.data[0].map(header => <th key={header} className="p-3 font-semibold">{header}</th>)}
                                    </tr>
                                </thead>
                                <tbody>
                                    {/* Render table rows (skipping the header row [0]) */}
                                    {scheduleData.data.slice(1).map((row, rowIndex) => (
                                        <tr key={rowIndex} className="border-t border-border-color">
                                            {row.map((cell, cellIndex) => (
                                                <td key={cellIndex} className="p-2 align-top h-24">
                                                    {cellIndex === 0 ? (
                                                        <span className="font-semibold text-text-main">{cell}</span>
                                                    ) : (
                                                        <ClassCard data={cell} />
                                                    )}
                                                </td>
                                            ))}
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default AdminViewStudentTimetable;