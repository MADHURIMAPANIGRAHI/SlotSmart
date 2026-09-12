'use client'; 
import React, { useState } from 'react';
import { FiFilter, FiCheck, FiX } from 'react-icons/fi';

// --- Placeholder Data is now inside this file ---
const initialRequests = [
    // Swap Requests
    { id: 1, type: 'Swap', from: 'Mr. Harrison', details: 'Math 101 for History 202', date: '2025-09-29', status: 'Pending' },
    { id: 5, type: 'Swap', from: 'Ms. Clark', details: 'Physics I for English Lit', date: '2025-10-02', status: 'Approved' },
    // Adjustment Requests
    { id: 2, type: 'Adjustment', from: 'Dr. Carter', details: 'Move Chem 201 to 2 PM', date: '2025-09-30', status: 'Pending' },
    // Leave Requests
    { id: 3, type: 'Leave', from: 'Prof. Lee', details: 'Full Day - Medical', date: '2025-10-01', status: 'Approved' },
    { id: 4, type: 'Leave', from: 'Dr. Jones', details: 'Half Day - Personal', date: '2025-10-03', status: 'Rejected' },
];


// --- Helper Components ---
const TabButton = ({ label, isActive, onClick }) => (
  <button onClick={onClick} className={`px-4 py-2 font-semibold ${isActive ? 'border-b-2 border-primary text-primary' : 'text-text-secondary'}`}>
    {label}
  </button>
);

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

// --- Main Page Component ---
const AdminRequestManage = () => {
    const [activeTab, setActiveTab] = useState('swaps'); // 'swaps', 'adjustments', 'leaves'
    const [requests, setRequests] = useState(initialRequests); // Using the local data

    const handleRequestUpdate = (requestId, newStatus) => {
        // This simulates updating the status of a request
        const updatedRequests = requests.map(req => 
            req.id === requestId ? { ...req, status: newStatus } : req
        );
        setRequests(updatedRequests);
        alert(`Request ID ${requestId} has been ${newStatus}.`);
    };

    // This logic now correctly filters the local initialRequests data
    const currentRequests = requests.filter(req => req.type.toLowerCase().includes(activeTab.slice(0, -1)));

    return (
        <div className="space-y-8">
            {/* Header */}
            <div>
                <h1 className="text-3xl font-bold text-text-main">Review Requests</h1>
                <p className="text-text-secondary">Approve or decline incoming requests from teachers.</p>
            </div>

            {/* Main Content Card */}
            <div className="bg-card-bg p-6 rounded-lg shadow-sm">
                {/* Tabs and Filters */}
                <div className="flex justify-between items-center mb-4">
                    <div className="flex border-b border-dark-bg">
                        <TabButton label="Swap Requests" isActive={activeTab === 'swaps'} onClick={() => setActiveTab('swaps')} />
                        <TabButton label="Adjustment Requests" isActive={activeTab === 'adjustments'} onClick={() => setActiveTab('adjustments')} />
                        <TabButton label="Leave Requests" isActive={activeTab === 'leaves'} onClick={() => setActiveTab('leaves')} />
                    </div>
                    <div className="flex items-center space-x-2">
                        <FiFilter className="text-text-secondary" />
                        <select className="bg-dark-bg rounded-md p-2 text-text-main focus:ring-primary focus:border-primary">
                            <option>Filter by status: All</option>
                            <option>Pending</option>
                            <option>Approved</option>
                            <option>Rejected</option>
                        </select>
                    </div>
                </div>

                {/* Requests Table */}
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="text-xs text-text-secondary uppercase">
                            <tr>
                                <th className="p-3">Requested By</th>
                                <th className="p-3">Details</th>
                                <th className="p-3">Date</th>
                                <th className="p-3">Status</th>
                                <th className="p-3 text-center">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="text-text-main">
                            {currentRequests.map(req => (
                                <tr key={req.id} className="border-b border-dark-bg hover:bg-dark-bg/50">
                                    <td className="p-3 font-semibold">{req.from}</td>
                                    <td className="p-3">{req.details}</td>
                                    <td className="p-3">{req.date}</td>
                                    <td className="p-3"><StatusBadge status={req.status} /></td>
                                    <td className="p-3">
                                        {req.status === 'Pending' && (
                                            <div className="flex justify-center space-x-2">
                                                <button onClick={() => handleRequestUpdate(req.id, 'Approved')} className="flex items-center bg-green-500/20 text-green-500 px-3 py-1 rounded-md text-sm hover:bg-green-500/30">
                                                    <FiCheck className="mr-1" /> Approve
                                                </button>
                                                <button onClick={() => handleRequestUpdate(req.id, 'Rejected')} className="flex items-center bg-red-500/20 text-red-500 px-3 py-1 rounded-md text-sm hover:bg-red-500/30">
                                                    <FiX className="mr-1" /> Decline
                                                </button>
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

export default AdminRequestManage;

