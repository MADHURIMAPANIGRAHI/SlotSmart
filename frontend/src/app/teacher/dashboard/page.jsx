'use client';

import React, { useEffect, useState } from 'react';
import { FiCalendar, FiLoader, FiDownload } from 'react-icons/fi';

// ---------- CLASS CARD (SAME AS ADMIN STYLE) ----------
const ClassCard = ({ entry }) => {
  if (!entry || !entry.subject)
    return <div className="text-text-light">-</div>;

  const isLab = entry.subject.toLowerCase().includes("lab");

  return (
    <div
      className={`p-1.5 text-xs rounded-md ${
        isLab
          ? 'bg-orange-100 text-orange-700'
          : 'bg-primary/10 text-primary'
      }`}
    >
      <p className="font-bold truncate">{entry.subject}</p>
      <p className="text-text-light truncate">{entry.Sec}</p>
      <p className="text-text-light truncate">{entry.room || ""}</p>
    </div>
  );
};

const TeacherDashboard = () => {
  const [username, setUsername] = useState('');
  const [scheduleTable, setScheduleTable] = useState(null);
  const [upcomingClass, setUpcomingClass] = useState(null);
  const [loading, setLoading] = useState(true);

  // ---------- FETCH DASHBOARD ----------
  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const res = await fetch('/api/generate_teacher_dashboard', {
          credentials: 'include',
          cache: 'no-store',
        });

        if (!res.ok) throw new Error('Unauthorized');

        const result = await res.json();

        setUsername(result.username);
        setUpcomingClass(result.upcoming_class);

        // --------- FORMAT SAME AS ADMIN VIEW ---------
        const timetableObj = result.teacher_timetable.timetable;
        const teacherId = Object.keys(timetableObj)[0];
        const timetable = timetableObj[teacherId];

        const timeSlots = Object.keys(timetable[0].schedule);

        const table = [];
        table.push(["Day", ...timeSlots]);

        timetable.forEach(dayObj => {
          const row = [dayObj.day];
          timeSlots.forEach(ts => row.push(dayObj.schedule[ts]));
          table.push(row);
        });

        setScheduleTable(table);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboard();
  }, []);

  if (loading) {
    return (
      <div className="text-center py-12">
        <FiLoader className="mx-auto mb-4 animate-spin text-primary" size={40} />
        <p>Loading dashboard...</p>
      </div>

      
    );
  }
  

  return (
    <div className="space-y-6 p-6">

      {/* HEADER */}
  <h1 className="text-4xl font-bold animate-bounce">
  Welcome back, 
  <span className="text-primary"> {username}</span>
</h1>
<p className="text-text-secondary">Here's your schedule for today.</p>

      {/* UPCOMING / CURRENT CLASS */}
      <div className="bg-card-bg p-6 rounded-lg">
        {/* <h2 className="text-2xl font-bold mb-3">Class Schedules</h2> */}

          {upcomingClass?.status === 'Upcoming class' && (
            <>
            <h2 className="text-2xl font-bold mb-3">Upcoming Class</h2>
    <div className="bg-dark-bg p-4 rounded border-l-4 border-green-400">
      <p className="font-bold">{upcomingClass.subject}</p>
      <p className="text-sm text-text-light">
        {upcomingClass.time_slot} • {upcomingClass.class_data}
      </p>
      <p className="text-xs text-green-400">Upcoming Class</p>
    </div>
    </>
  )}

  {/* CURRENT CLASS */}
  {upcomingClass?.status === 'Current class' && (
    <>
    <h2 className="text-2xl font-bold mb-3">Current Class</h2>
    <div className="bg-dark-bg p-4 rounded border-l-4 border-yellow-400">
      <p className="font-bold">{upcomingClass.subject}</p>
      <p className="text-sm text-text-light">
        {upcomingClass.time_slot} • {upcomingClass.sec}
      </p>
      <p className="text-xs text-yellow-400">Class in Progress</p>
    </div>
    </>
  )}

  {/* NO CLASS */}
  {upcomingClass?.status === 'No classes today' && (

  <div className="flex items-center gap-4 bg-dark-bg/60 p-5 rounded-lg border border-white/10">
    <div className="p-3 rounded-full bg-primary/20">
      <FiCalendar className="text-primary" size={20} />
    </div>

    <div>
      <p className="font-semibold text-xl">
        No class scheduled right now
      </p>
      {/* <p className="text-sm text-text-light">
        Enjoy your free time or prepare for the next session
      </p> */}
    </div>
  </div>
)}
      </div>

      {/* WEEKLY TIMETABLE (ADMIN STYLE) */}
      <div className="bg-card-bg p-6 rounded-lg">
        <div className="flex justify-between items-center mb-4">
                      <h2 className="flex items-center gap-2 text-xl font-bold text-text-main">  <FiCalendar className="text-primary"/>Weekly Timetable</h2>
                      
                      <button className="flex items-center text-sm font-semibold bg-primary text-dark-bg px-3 py-2 rounded-md hover:bg-opacity-90">
                        <FiDownload className="mr-2" /> Download Timetable
                      </button>
                    </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[700px] text-left">
            <thead className="bg-primary/30">
              <tr>
                {scheduleTable[0].map((h, i) => (
                  <th key={i} className="p-3 font-semibold">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>

            <tbody>
              {scheduleTable.slice(1).map((row, rIndex) => (
                <tr key={rIndex} className="border-t border-dark-bg">
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
    </div>
  );
};

export default TeacherDashboard;
