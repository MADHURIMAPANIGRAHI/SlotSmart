'use client';

import React, { useState } from 'react';
import { FiCalendar, FiLoader } from 'react-icons/fi';

// --- CLASS CELL RENDER ---
const ClassCard = ({ entry }) => {
    if (!entry || !entry.subject) return <div className="text-text-light">-</div>;

    const isLab = entry.subject.toLowerCase().includes("lab");

    return (
        <div className={`p-1.5 text-xs rounded-md ${isLab ? 'bg-orange-100 text-orange-700' : 'bg-primary/10 text-primary'}`}>
            <p className="font-bold truncate">{entry.subject}</p>
            <p className="text-text-light truncate">{entry.Sec || ""}</p>
            <p className="text-text-light truncate">{entry.room || ""}</p>
        </div>
    );
};

const AdminViewTeacherTimetable = () => {
    const [teacher_id, setteacher_id] = useState('');
    const [teacherSchedule, setTeacherSchedule] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);

    // MAIN FETCH
    const handleTeacherId = async () => {
        if (!teacher_id) return;

        setIsLoading(true);
        setError(null);
        setTeacherSchedule(null);

        try {
            const response = await fetch('/api/get_teacher_timetable', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ teacher_id }),
                cache: "no-store",
            });
            console.log("API Response Status:", response.status);
            if (!response.ok) throw new Error("Failed to fetch schedule");

            const result = await response.json();
console.log("Raw API Data:", result);

const timetableObj = result.data?.timetable;
if (!timetableObj) throw new Error("No timetable found");


const teacherName = Object.keys(timetableObj)[0];
if (!teacherName) throw new Error("Teacher not found");


const timetable = timetableObj[teacherName];
if (!Array.isArray(timetable)) throw new Error("Invalid timetable format");


const timeSlots = Object.keys(timetable[0].schedule);
const table = [];

table.push(["Day", ...timeSlots]);

timetable.forEach(dayObj => {
  const row = [dayObj.day];
  timeSlots.forEach(ts => row.push(dayObj.schedule[ts]));
  table.push(row);
});


setTeacherSchedule({
  name: teacherName,
  schedule: table
});
            console.log(table);
        } catch (err) {
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="space-y-4 p-6">
            <h1 className="text-3xl font-bold">View Teacher Timetables</h1>
            <p className="text-text-light mt-1">Enter a teacher's ID to view their timetable.</p>
            
           <div className="bg-card-bg p-6 rounded-lg shadow-sm">

                {/* teacher_id Input */}
                
                <input
                    type="text"
                    placeholder="Enter Teacher teacher_id"
                    value={teacher_id}
                    onChange={e => setteacher_id(e.target.value)}
                    className="w-80 mr-4 bg-dark-bg rounded-md px-4 py-2 text-text-main border border-transparent focus:outline-none focus:border-primary focus:ring-primary focus:ring-1"/>

                <button
                    onClick={handleTeacherId}
                    className="mt-4 px-4 py-2 bg-primary text-dark-bg font-bold rounded-md"
                >
                    View Timetable
                </button>

                {isLoading && (
                    <div className="text-center py-12">
                        <FiLoader className="mx-auto mb-4 animate-spin text-primary" size={40} />
                        <p>Loading...</p>
                    </div>
                )}

                {error && (
                    <p className="text-red-500 mt-4">{error}</p>
                )}

                {teacherSchedule && (
                    <div className="mt-6">
                        <h2 className="text-2xl font-bold flex items-center">
                            <FiCalendar className="mr-3 text-primary" />
                            Schedule for {teacherSchedule.name}
                        </h2>

                        <div className="overflow-x-auto mt-4">
                            <table className="w-full min-w-[700px] text-left">
                                <thead className="bg-primary/30">
                                    <tr>
                                        {teacherSchedule.schedule[0].map((h, i) => (
                                            <th key={i} className="p-3 font-semibold">{h}</th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody>
                                    {teacherSchedule.schedule.slice(1).map((row, rIndex) => (
                                        <tr key={rIndex} className="border-t">
                                            {row.map((cell, cIndex) => (
                                                <td key={cIndex} className="p-2 h-20 align-top">
                                                    {cIndex === 0 ? (
                                                        <span className="font-semibold">{cell}</span>
                                                    ) : (
                                                        <ClassCard entry={cell} />
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

export default AdminViewTeacherTimetable;
