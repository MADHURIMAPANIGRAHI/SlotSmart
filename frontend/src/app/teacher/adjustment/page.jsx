'use client';
import React, { useState } from 'react';
import { FiBook, FiClock, FiInfo, FiCalendar, FiSend, FiPaperclip } from 'react-icons/fi';

// --- Request Adjustment Form Component ---
const RequestAdjustmentForm = () => {
  // This form remains unchanged
  return (
    <div className="bg-card-bg p-6 rounded-lg shadow-sm">
      <h2 className="text-xl font-bold text-text-main mb-6">Request Adjustment</h2>
      <form className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Class Select */}
          <div className="relative">
            <label className="text-sm font-medium text-text-secondary">Class</label>
            <FiBook className="absolute top-10 left-3 text-text-secondary" />
            <select className="w-full mt-1 pl-10 pr-4 py-2 bg-dark-bg border border-transparent text-text-main rounded-md focus:outline-none focus:ring-2 focus:ring-primary appearance-none">
              <option>Select class</option>
              <option>FLAT</option>
              <option>FLAT Lab</option>
             
            </select>
          </div>
          {/* Preferred Time Select */}
          <div className="relative">
            <label className="text-sm font-medium text-text-secondary">Preferred Time</label>
            <FiClock className="absolute top-10 left-3 text-text-secondary" />
            <select className="w-full mt-1 pl-10 pr-4 py-2 bg-dark-bg border border-transparent text-text-main rounded-md focus:outline-none focus:ring-2 focus:ring-primary appearance-none">
              <option>Choose time</option>
              <option>Mon 7:30 - 8:40</option>
              <option>Wed 8:40-9:50</option>
              <option>Mon 9:50-10:50</option>
              <option>Fri 7:30-8:40</option>
              <option>Fri 11:00-12:00</option>
            </select>
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Reason Select */}
          <div className="relative">
            <label className="text-sm font-medium text-text-secondary">Reason</label>
            <FiInfo className="absolute top-10 left-3 text-text-secondary" />
            <select className="w-full mt-1 pl-10 pr-4 py-2 bg-dark-bg border border-transparent text-text-main rounded-md focus:outline-none focus:ring-2 focus:ring-primary appearance-none">
              <option>Schedule conflict</option>
              <option>Appointment</option>
              <option>Other</option>
            </select>
          </div>
          {/* Date Select */}
          <div className="relative">
            <label className="text-sm font-medium text-text-secondary">Date</label>
            <FiCalendar className="absolute top-10 left-3 text-text-secondary" />
            <input type="date" className="w-full mt-1 pl-10 pr-4 py-2 bg-dark-bg border border-transparent text-text-main rounded-md focus:outline-none focus:ring-2 focus:ring-primary" />
          </div>
        </div>
        {/* Additional Notes */}
        <div>
          <label className="text-sm font-medium text-text-secondary">Additional Notes</label>
          <textarea
            rows="3"
            placeholder="Provide context for admins; they'll get notified automatically."
            className="w-full mt-1 p-3 bg-dark-bg border border-transparent text-text-main rounded-md focus:outline-none focus:ring-2 focus:ring-primary placeholder:text-sm placeholder:text-text-secondary"
          ></textarea>
        </div>
        {/* Action Buttons */}
        <div className="flex justify-end items-center gap-4 pt-2">
          <button type="reset" className="font-semibold text-text-secondary hover:text-text-main">Reset</button>
          <button type="submit" className="flex items-center gap-2 px-4 py-2 bg-primary text-dark-bg font-bold rounded-lg hover:bg-opacity-90 transition-colors">
            <FiSend /> Submit Request
          </button>
        </div>
      </form>
    </div>
  );
};

// --- Send Message Form Component (UPDATED) ---
const SendMessageForm = () => {
    const [recipient, setRecipient] = useState('admin'); // 'admin' or 'student'

    const handleRecipientChange = (type) => {
        setRecipient(type);
    };

    return (
        <div className="bg-card-bg p-6 rounded-lg shadow-sm">
            <h2 className="text-xl font-bold text-text-main mb-6">Send Message</h2>
            <form className="space-y-4">
                <div>
                    <label className="text-sm font-medium text-text-secondary">Recipients</label>
                    <div className="mt-2 flex gap-2">
                        <button 
                            type="button" 
                            onClick={() => handleRecipientChange('student')}
                            className={`px-3 py-1.5 text-sm font-bold rounded-full transition-colors ${recipient === 'student' ? 'bg-primary text-dark-bg' : 'bg-dark-bg border border-card-bg text-text-secondary'}`}
                        >
                            All Students
                        </button>
                        <button 
                            type="button" 
                            onClick={() => handleRecipientChange('admin')}
                            className={`px-3 py-1.5 text-sm font-bold rounded-full transition-colors ${recipient === 'admin' ? 'bg-primary text-dark-bg' : 'bg-dark-bg border border-card-bg text-text-secondary'}`}
                        >
                            College Admin
                        </button>
                    </div>
                </div>

                {/* --- Conditional Filters for Students --- */}
                {recipient === 'student' && (
                    <div className="bg-dark-bg p-4 rounded-md space-y-4">
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                            {/* Course Select */}
                            <div>
                                <label className="text-xs font-medium text-text-secondary">Course</label>
                                <select className="w-full mt-1 p-2 bg-card-bg border border-transparent text-text-main text-sm rounded-md focus:outline-none focus:ring-2 focus:ring-primary appearance-none">
                                    <option>All Courses</option>
                                    <option>Computer Science</option>
                                    <option>Mechanical Engineering</option>
                                </select>
                            </div>
                            {/* Branch Select */}
                            <div>
                                <label className="text-xs font-medium text-text-secondary">Branch</label>
                                <select className="w-full mt-1 p-2 bg-card-bg border border-transparent text-text-main text-sm rounded-md focus:outline-none focus:ring-2 focus:ring-primary appearance-none">
                                    <option>All Branches</option>
                                    <option>Branch A</option>
                                    <option>Branch B</option>
                                </select>
                            </div>
                            {/* Section Select */}
                            <div>
                                <label className="text-xs font-medium text-text-secondary">Section</label>
                                <select className="w-full mt-1 p-2 bg-card-bg border border-transparent text-text-main text-sm rounded-md focus:outline-none focus:ring-2 focus:ring-primary appearance-none">
                                    <option>All Sections</option>
                                    <option>Section 1</option>
                                    <option>Section 2</option>
                                </select>
                            </div>
                        </div>
                    </div>
                )}

                <div>
                    <label className="text-sm font-medium text-text-secondary">Subject</label>
                    <input type="text" className="w-full mt-1 p-3 bg-dark-bg border border-transparent text-text-main rounded-md focus:outline-none focus:ring-2 focus:ring-primary" />
                </div>
                <div>
                    <label className="text-sm font-medium text-text-secondary">Message</label>
                    <textarea
                        rows="4"
                        placeholder="You can notify students or the college regarding schedule changes, assignments, or announcements."
                        className="w-full mt-1 p-3 bg-dark-bg border border-transparent text-text-main rounded-md focus:outline-none focus:ring-2 focus:ring-primary placeholder:text-sm placeholder:text-text-secondary"
                    ></textarea>
                </div>
                <div className="flex justify-end items-center pt-2">
                    <button type="submit" className="flex items-center gap-2 px-4 py-2 bg-primary text-dark-bg font-bold rounded-lg hover:bg-opacity-90 transition-colors">
                        <FiSend /> Send
                    </button>
                </div>
            </form>
        </div>
    );
};


const TeacherActions = () => {
  return (
    <div className="space-y-8">
      <RequestAdjustmentForm />
      {/* <SendMessageForm /> */}
    </div>
  );
};

export default TeacherActions;

