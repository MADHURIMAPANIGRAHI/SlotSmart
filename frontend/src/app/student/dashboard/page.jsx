'use client';
import { FiDownload, FiBookOpen, FiBell, FiAward, FiCalendar, FiArrowRight, FiLoader } from 'react-icons/fi';
import { dummyData } from '@/data/dummyData';
import React, { useEffect, useState } from 'react';
import { apiCall } from '../../../lib/backendFetch';

const ClassCard = ({ entry }) => {
  if (!entry || !entry.subject)
    return <div className="text-text-light">-</div>;

  const subject = entry.subject.toLowerCase();
  const isLunch = subject.includes("lunch");
  const isLab = subject.includes("lab");

  let styleClass = 'bg-primary/10 text-primary';
  if (isLunch) styleClass = 'bg-green-100 text-green-700 h-12 flex items-center justify-center';
  else if (isLab) styleClass = 'bg-orange-100 text-orange-700';

  return (
    <div className={`p-1.5 text-xs rounded-md ${styleClass}`}>
      <p className="font-bold truncate">{entry.subject}</p>
      {!isLunch && (
        <>
          <p className="text-text-light truncate">{entry.teacher}</p>
          <p className="text-text-light truncate">{entry.room || ""}</p>
        </>
      )}
    </div>
  );
};

export default function StudentDashboard() {
  const [username, setUsername]         = useState('');
  const [scheduleTable, setScheduleTable] = useState(null);
  const [upcomingClass, setUpcomingClass] = useState(null);
  const [loading, setLoading]           = useState(true);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const res = await fetch('/api/generate_student_dashboard', {
          credentials: 'include',
          cache: 'no-store',
        });

        if (!res.ok) throw new Error('Unauthorized');

        const result = await res.json();

        setUsername(result.username);
        setUpcomingClass(result.upcoming_class);

        const timetableObj   = result.student_timetable.timetable;
        const yearAndSection = Object.keys(timetableObj)[0];
        const timetable      = timetableObj[yearAndSection];
        const timeSlots      = Object.keys(timetable[0].schedule);

        const table = [["Day", ...timeSlots]];
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
    <div className="space-y-8">

      {/* Welcome Header */}
      <div>
        <h1 className="text-3xl text-text-main animate-bounce font-sans">
          Welcome back, <span className="text-primary">{username}</span>
        </h1>
        <p className="text-text-secondary">Here's your schedule for today.</p>
      </div>

      {/* Upcoming / Current Class */}
      <div className="bg-card-bg p-6 rounded-lg shadow-sm">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">

          {upcomingClass?.status === 'Upcoming class' && (
            <>
              <h2 className="text-2xl font-bold mb-2">Upcoming Class</h2>
              <div className="bg-dark-bg p-4 rounded border-l-4 border-green-400">
                <p className="font-bold">{upcomingClass.subject}</p>
                <p className="text-sm text-text-light">
                  {upcomingClass.time_slot} • {upcomingClass.room_no}
                </p>
                <h3 className="text-shadow-text-main">{upcomingClass.teacher}</h3>
                <p className="text-xs text-green-400">Upcoming Class</p>
              </div>
            </>
          )}

          {upcomingClass?.status === 'Current class' && (
            <>
              <h2 className="text-2xl font-bold mb-3">Current Class</h2>
              <div className="bg-dark-bg p-4 rounded border-l-4 border-green-400">
                <p className="font-bold">{upcomingClass.subject}</p>
                <p className="text-sm text-text-light">
                  {upcomingClass.time_slot} • {upcomingClass.room_no}
                </p>
                <h3 className="text-shadow-text-main">{upcomingClass.teacher}</h3>
                <p className="text-xs text-green-400">Class in Progress</p>
              </div>
            </>
          )}

          {upcomingClass?.status === 'No classes today' && (
            <div className="flex items-center gap-4 bg-dark-bg/60 p-5 rounded-lg border border-white/10">
              <div className="p-3 rounded-full bg-primary/20">
                <FiCalendar className="text-primary" size={20} />
              </div>
              <p className="font-semibold text-xl">No class scheduled right now</p>
            </div>
          )}

        </div>
      </div>

      {/* Full-width Weekly Timetable */}
      <div className="bg-card-bg p-6 rounded-lg shadow-sm">
        <div className="flex justify-between items-center mb-4">
          <h2 className="flex items-center gap-2 text-xl font-bold text-text-main">
            <FiCalendar className="text-primary" /> Weekly Timetable
          </h2>
          <button className="flex items-center text-sm font-semibold bg-primary text-dark-bg px-3 py-3 rounded-md hover:bg-opacity-90">
            <FiDownload className="mr-2" /> Download Timetable
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left min-w-[500px]">
            <thead className="bg-primary/30">
              <tr className="text-text-main">
                {scheduleTable[0].map((h, i) => (
                  <th key={i} className="p-2 font-medium">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {scheduleTable.slice(1).map((row, rIndex) => (
                <tr key={rIndex} className="border-t border-dark-bg">
                  {row.map((cell, cIndex) => (
                    <td key={cIndex} className="p-2 h-20 align-top">
                      {cIndex === 0
                        ? <span className="font-semibold">{cell}</span>
                        : <ClassCard entry={cell} />
                      }
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
}