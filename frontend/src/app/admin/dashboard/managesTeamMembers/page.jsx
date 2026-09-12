'use client'; 

import React, { useState, useMemo } from 'react';
import { FiPlus, FiEdit, FiTrash2, FiSearch, FiX, FiShield, FiMail, FiPhone } from 'react-icons/fi';

// --- Placeholder Data for the Admin Team ---
const initialAdmins = [
    { id: 'A01', name: 'Dr. Evelyn Reed', email: 'owner@example.com', phone: '9999999999', role: 'Owner' },
    { id: 'A02', name: 'Mr. David Chen', email: 'admin1@example.com', phone: '8888888888', role: 'Admin' },
    { id: 'A03', name: 'Ms. Priya Singh', email: 'admin2@example.com', phone: '7777777777', role: 'Admin' },
];

// --- Add/Edit Admin Modal ---
const AdminModal = ({ admin, onClose, onSave }) => {
    const [formData, setFormData] = useState(admin || {});

    const handleChange = (e) => {
        const { id, value } = e.target;
        setFormData(prev => ({ ...prev, [id]: value }));
    };

    const handleSave = () => {
        onSave(formData);
    };

    return (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
            <div className="bg-card-bg p-8 rounded-lg shadow-xl w-full max-w-lg">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-bold text-text-main">{admin ? 'Edit Admin' : 'Add New Admin'}</h2>
                    <button onClick={onClose} className="text-text-secondary hover:text-primary"><FiX size={24} /></button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-text-secondary mb-1">Full Name</label>
                        <input id="name" type="text" value={formData.name || ''} onChange={handleChange} className="w-full bg-dark-bg rounded-md px-4 py-2 text-text-main" />
                    </div>
                     <div>
                        <label className="block text-sm font-medium text-text-secondary mb-1">Admin ID</label>
                        <input id="id" type="text" value={formData.id || ''} onChange={handleChange} className="w-full bg-dark-bg rounded-md px-4 py-2 text-text-main" readOnly={!!admin} />
                    </div>
                     <div>
                        <label className="block text-sm font-medium text-text-secondary mb-1">Email</label>
                        <input id="email" type="email" value={formData.email || ''} onChange={handleChange} className="w-full bg-dark-bg rounded-md px-4 py-2 text-text-main" />
                    </div>
                     <div>
                        <label className="block text-sm font-medium text-text-secondary mb-1">Phone</label>
                        <input id="phone" type="tel" value={formData.phone || ''} onChange={handleChange} className="w-full bg-dark-bg rounded-md px-4 py-2 text-text-main" />
                    </div>
                </div>
                <div className="flex justify-end pt-6">
                    <button onClick={handleSave} className="px-6 py-2 bg-primary text-dark-bg font-bold rounded-lg hover:bg-opacity-90">
                        Save Admin
                    </button>
                </div>
            </div>
        </div>
    );
};

// --- NEW Admin Card Component ---
const AdminCard = ({ admin, onEdit, onDelete }) => (
    <div className="bg-gray-800 p-5 rounded-lg shadow-lg flex flex-col">
        <div className="flex-grow">
            <div className="flex justify-between items-start">
                <h3 className="text-lg font-bold text-text-main">{admin.name}</h3>
                <span className={`text-xs font-bold px-2 py-1 rounded-full ${admin.role === 'Owner' ? 'bg-accent/20 text-accent' : 'bg-primary/20 text-primary'}`}>
                    {admin.role}
                </span>
            </div>
            <p className="text-sm text-text-secondary font-mono mb-4">{admin.id}</p>
            <div className="space-y-2 text-sm">
                <div className="flex items-center text-text-secondary">
                    <FiMail className="mr-2" />
                    <span>{admin.email}</span>
                </div>
                <div className="flex items-center text-text-secondary">
                    <FiPhone className="mr-2" />
                    <span>{admin.phone}</span>
                </div>
            </div>
        </div>
        <div className="border-t border-card-bg mt-4 pt-4 flex justify-end space-x-2">
            <button onClick={() => onEdit(admin)} className="p-2 text-primary hover:bg-card-bg rounded-full"><FiEdit /></button>
            <button onClick={() => onDelete(admin.id, admin.role)} disabled={admin.role === 'Owner'} className="p-2 text-red-500 hover:bg-card-bg rounded-full disabled:text-gray-600 disabled:cursor-not-allowed"><FiTrash2 /></button>
        </div>
    </div>
);


// --- Main Page Component ---
const AdminManageTeams = () => {
    const [admins, setAdmins] = useState(initialAdmins);
    const [searchTerm, setSearchTerm] = useState('');
    const [isModalOpen, setModalOpen] = useState(false);
    const [selectedAdmin, setSelectedAdmin] = useState(null);

    const filteredData = useMemo(() => {
        return admins.filter(admin =>
            admin.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            admin.id.toLowerCase().includes(searchTerm.toLowerCase())
        );
    }, [admins, searchTerm]);

    const handleOpenModal = (admin = null) => {
        setSelectedAdmin(admin);
        setModalOpen(true);
    };
    
    const handleCloseModal = () => {
        setModalOpen(false);
        setSelectedAdmin(null);
    };

    const handleSaveAdmin = (adminData) => {
        if (selectedAdmin) { // Editing
            setAdmins(prev => prev.map(a => a.id === adminData.id ? adminData : a));
        } else { // Adding
            const newAdmin = { role: 'Admin', ...adminData, id: adminData.id || `A${Date.now()}` };
            setAdmins(prev => [...prev, newAdmin]);
        }
        handleCloseModal();
    };

    const handleDeleteAdmin = (adminId, adminRole) => {
        if (adminRole === 'Owner') {
            alert('The Owner account cannot be deleted.');
            return;
        }
        if (window.confirm('Are you sure you want to remove this admin?')) {
            setAdmins(prev => prev.filter(a => a.id !== adminId));
        }
    };

    return (
        <div className="space-y-8">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold text-text-main">Manage Admin Team</h1>
                    <p className="text-text-secondary">Add or remove members from the administrative team.</p>
                </div>
                <button onClick={() => handleOpenModal()} className="flex items-center px-4 py-2 bg-primary text-dark-bg font-bold rounded-lg hover:bg-opacity-90">
                    <FiPlus className="mr-2" /> Add New Admin
                </button>
            </div>
            
            {/* Search Bar */}
            <div className="flex justify-end">
                <div className="relative w-full md:w-1/3">
                    <FiSearch className="absolute top-1/2 left-3 -translate-y-1/2 text-text-secondary" />
                    <input type="text" placeholder="Search by name or ID..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="w-full bg-gray-700 rounded-md pl-10 border-teal-700 pr-4 py-2 text-text-main"/>
                </div>
            </div>
            
            {/* --- NEW Card Grid Layout --- */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredData.map(admin => (
                    <AdminCard 
                        key={admin.id}
                        admin={admin}
                        onEdit={handleOpenModal}
                        onDelete={handleDeleteAdmin}
                    />
                ))}
            </div>

            {isModalOpen && <AdminModal admin={selectedAdmin} onClose={handleCloseModal} onSave={handleSaveAdmin} />}
        </div>
    );
};

export default AdminManageTeams;

