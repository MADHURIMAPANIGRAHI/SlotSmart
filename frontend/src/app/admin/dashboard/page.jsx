'use client'; 
import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { FiUsers, FiBookOpen, FiHome, FiArrowRight, FiClock, FiCheckSquare, FiCalendar, FiUserPlus, FiSend, FiFileText } from 'react-icons/fi';

// --- Reusable Components for the Dashboard ---

// A clickable card for displaying key statistics
const StatCard = ({ title, value, icon, linkTo }) => (
    <Link href={linkTo} className="block">
    <div className="bg-card-bg p-6 rounded-lg shadow-sm">
        <div className="flex items-center justify-between">
            <div>
                <p className="text-sm font-medium text-text-secondary">{title}</p>
                <p className="text-3xl font-bold text-text-main">{value}</p>
            </div>
            <div className="text-primary">{icon}</div>
        </div>
        <p className="text-sm font-semibold text-primary mt-4 inline-block hover:underline">
            View All →
        </p>
    </div>
    </Link>
);

// A clickable card for primary admin actions - NEW STYLE
const QuickActionCard = ({ title, description, icon, linkTo, colorClass }) => (
    <Link href={linkTo} className={`p-6 rounded-lg text-white shadow-lg hover:-translate-y-1 transition-transform flex flex-col justify-between ${colorClass}`}>
        <div>
            <div className="flex justify-between items-start">
                <div className="bg-white/20 p-2 rounded-md mb-4">{icon}</div>
                <FiArrowRight size={24} className="text-white/70" />
            </div>
            <h3 className="font-bold text-lg">{title}</h3>
        </div>
        <p className="text-sm mt-2 text-white/80">{description}</p>
    </Link>
);

// --- Main Admin Dashboard Component ---
const AdminDashboard = () => {
    // --- Placeholder Data (to be replaced with API calls) ---

    const [countTeacher, setTeacherCount] = useState(0);
    const [countStudent, setStudentCount] = useState(0);
    const [countSubject, setSubjectCount] = useState(0);
    const [countRoom, setRoomCount] = useState(0);
    useEffect(() => {
    const fetchData = async () => {
        try {
            const res = await fetch('/api/generate_dashboard_data', { cache: 'no-store' });
            const json = await res.json();

            if (!json.success) return;

            setTeacherCount(json.data.Teacher?.length || 0);
            setStudentCount(json.data.Student?.length || 0);
            setSubjectCount(json.data.Subject?.length || 0);
            setSubjectCount(json.data.Count || 0);
            setRoomCount(json.data.Room?.length || 0);
        } catch (err) {
            console.error("Dashboard fetch error:", err);
        }
    };

    fetchData();
}, []);

    const stats = [
        { title: 'Total Teachers', value: countTeacher, icon: <FiUsers size={32} />, linkTo: '/admin/dashboard/managesTeachers_StudentsData?tab=teachers' },
        { title: 'Total Students', value: countStudent, icon: <FiUsers size={32} />, linkTo: '/admin/dashboard/managesTeachers_StudentsData?tab=students' },
        { title: 'Total Subjects', value: countSubject, icon: <FiBookOpen size={32} />, linkTo: '/admin/dashboard/managesSubjects' },
        { title: 'Rooms Available', value: countRoom, icon: <FiHome size={32} />, linkTo: '/admin/dashboard/managesRooms' },
    ];
                
            



    const quickActions = [
        { title: "New Timetable", description: "Create a new automated timetable.", icon: <FiCalendar size={24} />, linkTo: "/admin/generate_timetable", colorClass: "bg-indigo-600" },
        { title: "Substitutions", description: "Manage absences and assign substitutes.", icon: <FiUsers size={24} />, linkTo: "/admin/dashboard/managesRequests", colorClass: "bg-orange-500" },
        { title: "Leave Management", description: "Track and approve staff leave requests.", icon: <FiFileText size={24} />, linkTo: "/admin/dashboard/managesRequests", colorClass: "bg-purple-600" },
        { title: "Manage Team", description: "Add, edit, and manage all users.", icon: <FiUserPlus size={24} />, linkTo: "/admin/dashboard/managesTeamMembers", colorClass: "bg-green-600" }
    ];

    const pendingRequests = [
        { type: 'Swap Request', from: 'Mr. Harrison', details: 'Math 101, Mon 9 AM', id: 1 },
        { type: 'Adjustment', from: 'Dr. Carter', details: 'Chem 201, Wed 11 AM', id: 2 },
        { type: 'Leave Request', from: 'Prof. Lee', details: 'Full Day - Sep 25th', id: 3 },
    ];

    // --- State for the Mailing System ---
    const [recipient, setRecipient] = useState('all-teachers');
    const [message, setMessage] = useState('');

    const handleSendMessage = (e) => {
        e.preventDefault();
        // In a real app, this would trigger an API call
        console.log({ recipient, message });
        alert('Notification sent successfully!');
        setMessage('');
    };

    return (
        <div className="space-y-8">
            {/* Header */}
            <div>
                {/* <h1 className="text-3xl font-bold text-text-main">Admin Dashboard</h1> */}
                <h1 className="text-3xl font-bold text-text-main">Welcome back, Admin!</h1>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {stats.map(stat => <StatCard key={stat.title} {...stat} />)}
            </div>

            {/* Quick Actions Section - UPDATED */}
            <div>
                <h2 className="text-2xl font-bold text-text-main mb-4">Quick Actions</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {quickActions.map(action => <QuickActionCard key={action.title} {...action} />)}
                </div>
            </div>

            {/* Main Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Pending Requests */}
                <div className="lg:col-span-2 bg-card-bg p-6 rounded-lg shadow-sm">
                    <h2 className="text-xl font-bold text-text-main mb-4">Pending Requests</h2>
                    <div className="space-y-4">
                        {pendingRequests.map(req => (
                             <div key={req.id} className="flex items-center justify-between bg-dark-bg p-4 rounded-md">
                                <div className="flex items-center">
                                     <div className={`p-2 rounded-full mr-4 ${req.type === 'Swap Request' ? 'bg-accent/20 text-accent' : 'bg-primary/20 text-primary'}`}>
                                         {req.type === 'Swap Request' ? <FiClock /> : <FiCheckSquare />}
                                     </div>
                                     <div>
                                         <p className="font-semibold text-text-main">{req.type}</p>
                                         <p className="text-sm text-text-secondary">{`From ${req.from} - ${req.details}`}</p>
                                     </div>
                                 </div>
                                 <Link href="/admin/dashboard/manageRequests" className="flex items-center text-sm font-semibold text-primary hover:underline">
                                     Review <FiArrowRight className="ml-1" />
                                 </Link>
                             </div>
                        ))}
                    </div>
                </div>

                {/* Mailing System */}
                <div className="lg:col-span-1 bg-card-bg p-6 rounded-lg shadow-sm">
                    <h2 className="text-xl font-bold text-text-main mb-4">Send Notification</h2>
                    <form onSubmit={handleSendMessage} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-text-secondary mb-1">Recipient Group</label>
                            <select value={recipient} onChange={e => setRecipient(e.target.value)} className="w-full bg-dark-bg rounded-md px-4 py-2 text-text-main focus:ring-primary focus:border-primary">
                                <option value="all-teachers">All Teachers</option>
                                <option value="all-students">All Students</option>
                                <option value="everyone">Everyone</option>
                            </select>
                        </div>
                        <div>
                             <label className="block text-sm font-medium text-text-secondary mb-1">Message</label>
                            <textarea 
                                value={message} 
                                onChange={e => setMessage(e.target.value)}
                                required 
                                rows="5" 
                                placeholder="Type your announcement here..."
                                className="w-full bg-dark-bg rounded-md px-4 py-2 text-text-main focus:ring-primary focus:border-primary"
                            ></textarea>
                        </div>
                        <button type="submit" className="w-full flex items-center justify-center font-semibold bg-primary text-dark-bg px-4 py-3 rounded-md hover:bg-opacity-90">
                            <FiSend className="mr-2" /> Send Message
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default AdminDashboard;

