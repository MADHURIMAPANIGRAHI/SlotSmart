'use client';
import React, { useState } from 'react';
import { FiFilter, FiSend, FiCheck, FiX } from 'react-icons/fi';
import { dummyData } from '@/data/dummyData.js';

// --- Placeholder Data (in a real app, this would come from an API) ---
const subjects = ['FLAT', 'FLAT Lab'];



//const subjects = teacher.subjects;

const timeSlots = dummyData.admin.timetableGenerator.timeSlots;
const courses = ['B.Tech', 'M.Tech', 'B.Sc'];
const branches = ['Computer Science', 'Mechanical', 'Electronics', 'Civil'];
const sections = ['A',  'C'];
const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday','Saturday'];

const initialIncomingRequests = [
  { id: 1, subject: 'FLAT', date: '2024-09-15', slot: '10:00 AM - 11:00 AM', requestedBy: 'Mr. Johnson', status: 'Pending' },
  { id: 2, subject: 'AI', date: '2024-09-16', slot: '11:00 AM - 12:00 PM', requestedBy: 'Mr. Davis', status: 'Approved' },
  { id: 3, subject: 'Python', date: '2024-09-17', slot: '09:00 AM - 10:00 AM', requestedBy: 'Ms. Clark', status: 'Rejected' },
];

const initialOutgoingRequests = [
  { id: 4, subject: 'AI', date: '2024-09-18', slot: '01:00 PM - 02:00 PM', requestedTo: 'Mrs. White', status: 'Pending' },
];

// --- Main Swap Requests Component ---
const TeacherSwapRequest = () => {
  const [activeTab, setActiveTab] = useState('incoming');
  const [incomingRequests, setIncomingRequests] = useState(initialIncomingRequests);
  const [outgoingRequests, setOutgoingRequests] = useState(initialOutgoingRequests);
  
  // State for the form
  const [formData, setFormData] = useState({
    subject: '',
    date: '',
    timeSlot: '',
    course: '',
    branch: '',
    section: '',
    swapDay: '',
    swapSlot: '',
    swapTeacher: 'Mr. Anderson (Available)', // Placeholder for logic
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

// --- Helper Components for the form and tabs ---
const SelectInput = ({ label, name, value, onChange, options = [] }) => (
  <div>
    <label className="block text-sm font-medium text-text-secondary mb-1">{label}</label>
    <select
      name={name}
      value={value}
      onChange={onChange}
      className="w-full bg-dark-bg border border-transparent rounded-md p-2 text-text-main focus:ring-primary focus:border-primary"
    >
      <option value="" disabled>Select {label}</option>
      {(options || []).map((option, idx) => {
        if (typeof option === "string") {
          return (
            <option key={idx} value={option}>
              {option}
            </option>
          );
        }
        return (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        );
      })}
    </select>
  </div>
);




const DateInput = ({ label, name, value, onChange }) => (
  <div>
    <label htmlFor={name} className="block text-sm font-medium text-text-secondary mb-1">{label}</label>
    <input type="date" id={name} name={name} value={value} onChange={onChange} className="w-full bg-dark-bg border border-transparent rounded-md p-2 text-text-main focus:ring-primary focus:border-primary" />
  </div>
);

const TabButton = ({ label, isActive, onClick }) => (
  <button onClick={onClick} className={`px-4 py-2 text-sm font-semibold ${isActive ? 'border-b-2 border-primary text-primary' : 'text-text-secondary hover:text-text-main'}`}>
    {label}
  </button>
);

  const handleFormSubmit = (e) => {
    e.preventDefault();
    // Logic to send the request to the backend would go here
    console.log('Swap Request Submitted:', formData);
    alert('Swap request has been sent!');
  };

  const StatusBadge = ({ status }) => {
    const styles = {
      Pending: 'bg-yellow-500/20 text-yellow-500',
      Approved: 'bg-green-500/20 text-green-500',
      Rejected: 'bg-red-500/20 text-red-500',
    };
    return (
      <span className={`px-2 py-1 text-xs font-semibold rounded-full ${styles[status]}`}>
        {status}
      </span>
    );
  };

  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-bold text-text-main">Swap Requests</h1>

      {/* --- Request Swap Form --- */}
      <div className="bg-card-bg p-6 rounded-lg shadow-sm">
        <h2 className="text-xl font-bold text-text-main mb-4">Request Swap Form</h2>
        <form onSubmit={handleFormSubmit} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Form fields */}
          <SelectInput 
  label="Subject" 
  name="subject" 
  value={formData.subject} 
  onChange={handleInputChange} 
  options={subjects}
/>

          <DateInput label="Date" name="date" value={formData.date} onChange={handleInputChange} />
          <SelectInput label="Time Slot" name="timeSlot" value={formData.timeSlot} onChange={handleInputChange} options={timeSlots} />
          <SelectInput label="Course" name="course" value={formData.course} onChange={handleInputChange} options={courses} />
          <SelectInput label="Branch" name="branch" value={formData.branch} onChange={handleInputChange} options={branches} />
          <SelectInput label="Section" name="section" value={formData.section} onChange={handleInputChange} options={sections} />
          <SelectInput label="Swap to Day" name="swapDay" value={formData.swapDay} onChange={handleInputChange} options={daysOfWeek} />
          <SelectInput label="Available Swap Slot" name="swapSlot" value={formData.swapSlot} onChange={handleInputChange} options={timeSlots} />
          
          <div className="md:col-span-2 lg:col-span-4">
            <label className="block text-sm font-medium text-text-secondary mb-1">Available Teacher for Swap</label>
            <input type="text" readOnly value={formData.swapTeacher} className="w-full bg-dark-bg border border-transparent rounded-md p-2 text-text-secondary focus:ring-primary focus:border-primary" />
          </div>

          <div className="md:col-span-2 lg:col-span-4 flex justify-end">
            <button type="submit" className="flex items-center bg-primary text-dark-bg font-bold px-4 py-2 rounded-lg hover:bg-opacity-90 transition-colors">
              <FiSend className="mr-2" /> Send Request
            </button>
          </div>
        </form>
      </div>

      {/* --- Incoming & Outgoing Requests --- */}
      <div className="bg-card-bg p-6 rounded-lg shadow-sm">
        <div className="flex justify-between items-center mb-4">
          <div className="flex border-b border-dark-bg">
            <TabButton label="Incoming Requests" isActive={activeTab === 'incoming'} onClick={() => setActiveTab('incoming')} />
            <TabButton label="Outgoing Requests" isActive={activeTab === 'outgoing'} onClick={() => setActiveTab('outgoing')} />
          </div>
          <div className="flex items-center space-x-2">
            <FiFilter className="text-text-secondary" />
            <select className="bg-dark-bg border border-transparent rounded-md p-2 text-text-main focus:ring-primary focus:border-primary">
              <option>Filter by status: All</option>
              <option>Pending</option>
              <option>Approved</option>
              <option>Rejected</option>
            </select>
          </div>
        </div>
        
        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="text-xs text-text-secondary uppercase">
              <tr>
                <th className="p-2">Subject</th>
                <th className="p-2">Date</th>
                <th className="p-2">Slot</th>
                <th className="p-2">{activeTab === 'incoming' ? 'Requested By' : 'Requested To'}</th>
                <th className="p-2">Status</th>
                <th className="p-2 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="text-text-main">
              {(activeTab === 'incoming' ? incomingRequests : outgoingRequests).map(req => (
                <tr key={req.id} className="border-b border-dark-bg hover:bg-dark-bg">
                  <td className="p-2 font-semibold">{req.subject}</td>
                  <td className="p-2">{req.date}</td>
                  <td className="p-2">{req.slot}</td>
                  <td className="p-2">{activeTab === 'incoming' ? req.requestedBy : req.requestedTo}</td>
                  <td className="p-2"><StatusBadge status={req.status} /></td>
                  <td className="p-2">
                    {activeTab === 'incoming' && req.status === 'Pending' && (
                      <div className="flex justify-center space-x-2">
                        <button className="flex items-center bg-green-500/20 text-green-500 px-3 py-1 rounded-md text-sm"><FiCheck className="mr-1" /> Accept</button>
                        <button className="flex items-center bg-red-500/20 text-red-500 px-3 py-1 rounded-md text-sm"><FiX className="mr-1" /> Reject</button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default TeacherSwapRequest;
