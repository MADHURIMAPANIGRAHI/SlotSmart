'use client'; 
import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { FiPlus, FiEdit, FiTrash2, FiSearch, FiX } from 'react-icons/fi';
import { motion, AnimatePresence } from "framer-motion";

import AddRoomModal from "./AddRoomModal";
import dynamic from 'next/dynamic';

const Confetti = dynamic(() => import("react-confetti"), {
  ssr: false,
});

const FormInput = ({ label, id, ...props }) => (
    <div>
        <label htmlFor={id} className="block text-sm font-medium text-text-secondary mb-1">{label}</label>
        <input id={id} {...props} className="w-full bg-dark-bg border border-transparent rounded-md px-4 py-2 text-text-main focus:ring-primary focus:border-primary" />
    </div>
);

// --- Add/Edit Room Modal ---
const RoomModal = ({ room, onClose, onSave }) => {
    const [formData, setFormData] = useState(
        room || { features: [] }
    );

    const handleChange = (e) => {
        const { id, value } = e.target;
        setFormData(prev => ({ ...prev, [id]: value }));
    };

    const handleFeaturesChange = (e) => {
        const featuresArray = e.target.value.split(',').map(f => f.trim());
        setFormData(prev => ({ ...prev, features: featuresArray }));
    };

    const handleSave = () => {
        onSave(formData);
    };

    return (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
            <div className="bg-card-bg p-8 rounded-lg shadow-xl w-full max-w-lg">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-bold text-text-main">{room ? 'Edit Room' : 'Add New Room'}</h2>
                    <button onClick={onClose} className="text-text-secondary hover:text-primary"><FiX size={24} /></button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormInput label="Room Number" id="roomNumber" type="text" value={formData.roomNumber || ''} onChange={handleChange} />
                    <FormInput label="Capacity" id="capacity" type="number" value={formData.capacity || ''} onChange={handleChange} />
                    <FormInput label="Type (e.g., Lecture Hall, Lab)" id="type" type="text" value={formData.type || ''} onChange={handleChange} />
                    <FormInput label="Features (comma-separated)" id="features" type="text" value={Array.isArray(formData.features) ? formData.features.join(', ') : ''} onChange={handleFeaturesChange} />
                </div>
                <div className="flex justify-end pt-6">
                    <button onClick={handleSave} className="px-6 py-2 bg-primary text-dark-bg font-bold rounded-lg hover:bg-opacity-90">
                        Save Room
                    </button>
                </div>
            </div>
        </div>
    );
};

// --- Main Page Component ---
const AdminManagesRooms = () => {
    const [rooms, setRooms] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [isModalOpen, setModalOpen] = useState(false);
    const [selectedRoom, setSelectedRoom] = useState(null);
    const [showSuccessPopup, setShowSuccessPopup] = useState(false);
    const [successMsg, setSuccessMsg] = useState('');
    const [showErrorPopup, setShowErrorPopup] = useState(false);
    const [errorMsg, setErrorMsg] = useState('');
      const [showConfetti, setShowConfetti] = useState(false);
      const [successLoading, setSuccessLoading] = useState(false);
      const [editData, setEditData] = useState(null);
    const [subjects, setSubjects] = useState([]);
    const [showAddModal, setShowAddModal] = useState(false);
    const [loading, setLoading] = useState(true);

    const loadData = useCallback(async () => {
      try{
          const res = await fetch("/api/generate_dashboard_data"
    , {
  
  cache: 'no-store',
  })
  const json = await res.json();
  if(json.success){
      setRooms(Array.isArray(json.data.Room) ? json.data.Room : []);
      const subjectsWithLab = Array.isArray(json.data.Unique_sub)
        ? json.data.Unique_sub.filter(sub =>
            sub.toLowerCase().includes("lab")
          )
        : [];

      setSubjects(subjectsWithLab);
      setLoading(false);
    }}
      catch(err){
        console.error(err);
    setLoading(false);
      }
}, []);
    useEffect(() => {
      loadData();
    }, [loadData]);

    const columns = useMemo(() => {
  return rooms.length > 0 ? Object.keys(rooms[0]) : [];
}, [rooms]);

  const handleEditClick = (row) => {
    setEditData(row);
    setShowAddModal(true);
  };

  const filteredRooms = useMemo(() => {
  const term = searchTerm.toLowerCase();
  return rooms.filter(room =>
    Object.values(room).some(val =>
      String(val).toLowerCase().includes(term)
    )
  );
}, [rooms, searchTerm]);

    
    const handleCloseModal = () => {
        setModalOpen(false);
        setSelectedRoom(null);
    };

    const handleSaveRoom = (roomData) => {
        if (selectedRoom) { // Editing
            setRooms(rooms.map(r => r.id === roomData.id ? roomData : r));
        } else { // Adding
            const newRoom = { ...roomData, id: `r${Date.now()}` };
            setRooms([...rooms, newRoom]);
        }
        handleCloseModal();
    };

const handleDeleteRoom = async(row) => {
    if (!row?.Building || !row?.Room) {
    setShowErrorPopup(true);
    setErrorMsg("Invalid room data.");
    return;
  }

  const payload = {
    Building: row.Building,
    Room: row.Room ,
  };

  console.log("Delete Payload:", payload);

  if (
    window.confirm(
      `Are you sure you want to delete Room ${payload.Room} in ${payload.Building}?`
    )
  ) {
    fetch("/api/remove_room", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    })
      .then(res => res.json())
      .then(data => {
  if (data.success) {
    setRooms(prev =>
        prev.filter(
          r => !(r.Building === row.Building && r.Room === row.Room)
        )
      );

    setShowSuccessPopup(true);
    setSuccessMsg(
      data.data?.message || "Room deleted successfully."
    );
  } else {
    setShowErrorPopup(true);
    setErrorMsg(data.message || "Failed to delete room.");
  }
})
      .catch(err => {
        console.error("Error deleting room:", err);
        setShowErrorPopup(true);
        setErrorMsg("An error occurred while deleting the room.");
      });
  }
};

    const handleAddSuccess = (message) => {
        setShowSuccessPopup(true);
        setSuccessMsg(message);
        setShowAddModal(false);
        setSuccessLoading(false);
        setEditData(null);
        setShowConfetti(true);
        loadData();
        setTimeout(() => setSuccessLoading(false), 1200);
        setTimeout(() => setShowConfetti(false), 500);
    };

    const handleAddError = (message) => {
        setShowErrorPopup(true);
        setErrorMsg(message);
    };

      if (loading) {
    return <div className="p-10 text-text-secondary">Loading room data...</div>;
  }

    return (
        <div className="space-y-8">
            {/* Header */}
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold text-text-main">Manage Classrooms</h1>
                    <p className="text-text-secondary">Define all rooms, their capacity, and available features.</p>
                </div>
                <button onClick={() => {setEditData(null);

    setShowAddModal(true);}} className="flex items-center px-4 py-2 bg-primary text-dark-bg font-bold rounded-lg hover:bg-opacity-90">
                    <FiPlus className="mr-2" /> Add New Room
                </button>
            </div>

            {/* Main Content Card */}
            <div className="bg-card-bg p-6 rounded-lg shadow-sm">
                {/* Search Bar */}
                <div className="relative w-full md:w-1/3 mb-4">
                    <FiSearch className="absolute top-1/2 left-3 -translate-y-1/2 text-text-secondary" />
                    <input type="text" placeholder="Search by room number or type..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="w-full bg-dark-bg rounded-md pl-10 pr-4 py-2 text-text-main"/>
                </div>

                {/* Rooms Table */}
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-dark-bg text-xs text-text-secondary uppercase">
                            <tr>
                                {columns.map(col => (
                                    <th key={col} className="p-3 text-left">{col}</th>
                                ))}
                                <th className="p-3 text-center">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="text-text-main">
  {filteredRooms.map((room, rowIndex) => (
    <tr key={rowIndex} className="border-b border-dark-bg hover:bg-dark-bg/50">
      {columns.map(col => (
        <td key={col} className="p-3">
          {Array.isArray(room[col]) ? (
            <div className="flex flex-wrap gap-1">
              {room[col].map((item, i) => (
                <span
                  key={i}
                  className="bg-dark-bg text-text-secondary text-xs px-2 py-1 rounded-full"
                >
                  {item}
                </span>
              ))}
            </div>
          ) : (
            room[col] ?? "-"
          )}
        </td>
      ))}
      <td className="p-3 text-center">
        <div className="flex justify-center space-x-2">
          <button className="p-2 text-primary hover:bg-dark-bg rounded-full" onClick={() => handleEditClick(room)}>
            <FiEdit />
          </button>
          <button className="p-2 text-red-500 hover:bg-dark-bg rounded-full" onClick={() => handleDeleteRoom(room)}>
            <FiTrash2 />
          </button>
        </div>
      </td>
    </tr>
  ))}
</tbody>
                    </table>
                </div>
            </div>

            {isModalOpen && <RoomModal room={selectedRoom} onClose={handleCloseModal} onSave={handleSaveRoom} />}

            <AddRoomModal 
  isOpen={showAddModal}
  onClose={() => {
    setShowAddModal(false);
    setEditData(null);
  }}
  onSuccess={handleAddSuccess}
  onError={handleAddError}
  editData={editData}
  Subjects={subjects}
/>
            
                  {showConfetti && showSuccessPopup && (
                    <Confetti width={window.innerWidth} height={window.innerHeight} numberOfPieces={350} recycle={false} />
                  )}
            
                  {/* Success Popup */}
                  <AnimatePresence>
                    {showSuccessPopup && (
                      <motion.div 
                        className="fixed top-6 left-1/2 -translate-x-1/2 z-50"
                        initial={{ y: -40, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: -40, opacity: 0 }}
                      >
                        <div className="relative bg-green-400/20 backdrop-blur-lg border border-green-400 rounded-xl px-8 py-6 shadow-xl min-w-[320px]">
                          <div className="absolute -top-3 left-4 bg-green-500 text-white px-4 py-1 rounded-full text-sm">
                            {successLoading ? "Processing..." : "Success 🎉"}
                          </div>
                          <div className="flex flex-col items-center gap-3 mt-4">
                            {successLoading ? (
                              <div className="w-10 h-10 border-4 border-green-500 border-t-transparent rounded-full animate-spin" />
                            ) : (
                              <div className="text-4xl">✅</div>
                            )}
                            <p className="text-lg font-semibold text-center">{successMsg}</p>
                            {!successLoading && (
                              <button onClick={() => setShowSuccessPopup(false)} className="mt-2 px-6 py-2 bg-green-500 text-white rounded-full">Done</button>
                            )}
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
            
                  {/* Error Popup */}
                  <AnimatePresence>
                    {showErrorPopup && (
                      <motion.div 
                        className="fixed top-6 left-1/2 -translate-x-1/2 z-50"
                        initial={{ y: -40, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: -40, opacity: 0 }}
                      >
                        <div className="relative bg-red-500/20 backdrop-blur-lg border border-red-500 rounded-xl px-8 py-6 shadow-xl">
                          <div className="absolute -top-3 left-4 bg-red-500 text-white px-4 py-1 rounded-full text-sm">Error ❌</div>
                          <p className="text-lg font-semibold text-center mt-2 text-red-200">{errorMsg}</p>
                          <div className="flex justify-center mt-4">
                            <button onClick={() => setShowErrorPopup(false)} className="px-6 py-2 bg-red-500 text-white rounded-full">Close</button>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
        </div>
    );
};

export default AdminManagesRooms;
