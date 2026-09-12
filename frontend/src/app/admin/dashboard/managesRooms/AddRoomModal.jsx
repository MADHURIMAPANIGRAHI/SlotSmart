'use client';
import React, { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FiX } from "react-icons/fi";

const initialState = {
  Building: "",
  Floor: "",
  Room: "",
  Capacity: "",
  Type: "",
  Lab_type: [], // UI ARRAY
  Workload: 0,
};

const AddRoomModal = ({
  isOpen,
  onClose,
  editData,
  onSuccess,
  onError,
  Subjects = [],
}) => {
  const [formData, setFormData] = useState(initialState);
  const [search, setSearch] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // ---------- Prefill on Edit ----------
  useEffect(() => {
    if (editData && isOpen) {
      const labSubjects =
        typeof editData.Lab_type === "string" && editData.Lab_type !== "N/A"
          ? editData.Lab_type.split(",").map(s => s.trim()).filter(Boolean)
          : [];

      setFormData({
        Building: editData.Building || "",
        Floor: editData.Floor || "",
        Room: editData.Room.toUpperCase() || "",
        Capacity: editData.Capacity || "",
        Type: labSubjects.length > 0 ? "Lab" : "Classroom",
        Lab_type: labSubjects,
        Workload: editData.Workload || 0,
      });
    } else if (!isOpen) {
      setFormData(initialState);
      setSearch("");
    }
  }, [editData, isOpen]);

 

  // ---------- Helpers ----------
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(p => ({ ...p, [name]: value }));
  };

  const handleTypeChange = (e) => {
    const value = e.target.value;
    setFormData(p => ({
      ...p,
      Type: value,
      Lab_type: value === "Lab" ? [] : [],
    }));
  };

  const toggleSubject = (subject) => {
    setFormData(p => ({
      ...p,
      Lab_type: p.Lab_type.includes(subject)
        ? p.Lab_type.filter(s => s !== subject)
        : [...p.Lab_type, subject],
    }));
  };

  const filteredSubjects = useMemo(() => {
    return Subjects.filter(s =>
      s.toLowerCase().includes(search.toLowerCase())
    );
  }, [Subjects, search]);

  // ---------- Validation ----------
  const validateForm = () => {
    const required = ["Building", "Floor", "Room", "Capacity", "Type"];
    for (let field of required) {
      if (!formData[field]) return `${field} is required`;
    }
    if (formData.Type === "Lab" && formData.Lab_type.length === 0) {
      return "Select at least one lab subject";
    }

    // capacity and floor should be numbers not a letter
    if (isNaN(Number(formData.Capacity)) || Number(formData.Capacity) <= 0) {
      return "Capacity must be a positive number";
    }
    if (isNaN(Number(formData.Floor)) || Number(formData.Floor) < 0) {
      return "Floor must be a number";
    }

    return null;
  };

  // ---------- Submit ----------
  const handleSubmit = async () => {
    const error = validateForm();
    if (error) return onError(error);

    setIsSubmitting(true);

    const payload = {
      Building: formData.Building.trim(),
      Floor: formData.Floor.trim(),
      Room: formData.Room.trim(),
      Capacity: Number(formData.Capacity),
      Type: formData.Type,
      Workload: Number(formData.Workload || 0),
      Lab_type:
        formData.Type === "Classroom"
          ? "N/A"
          : formData.Lab_type.join(", "),
    };

    try {
      const res = await fetch(
        editData ? "/api/update_room" : "/api/add_room",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        }
      );

      const json = await res.json();
      if (!res.ok) throw new Error(json.message || "Operation failed");

      onSuccess(json.data?.message || editData ? "Room updated successfully" : "Room added successfully");
      if (!editData) setFormData(initialState);
    } catch (err) {
      onError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };
   if (!isOpen) return null;
  // ---------- UI ----------
  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        <motion.div
          className="bg-card-bg w-full max-w-xl rounded-xl p-6 shadow-xl border border-white/10"
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
        >
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold">
              {editData ? "Update Room" : "Add Room"}
            </h2>
            <button onClick={onClose}><FiX /></button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {["Building", "Floor", "Room", "Capacity"].map(field => (
              <input
                key={field}
                name={field}
                placeholder={field}
                value={formData[field]}
                onChange={handleChange}
                className="input"
              />
            ))}

            <select
              name="Type"
              value={formData.Type}
              onChange={handleTypeChange}
              className="input md:col-span-2"
            >
              <option value="">Select Type</option>
              <option value="Classroom">Classroom</option>
              <option value="Lab">Lab</option>
            </select>

            {formData.Type === "Lab" && (
              <div className="md:col-span-2">
                <p className="text-sm mb-2 text-text-secondary">Lab Subjects</p>

                {formData.Lab_type.length > 0 && (
                  <div className="flex flex-wrap gap-2 mb-3">
                    {formData.Lab_type.map(sub => (
                      <span
                        key={sub}
                        className="flex items-center gap-2 bg-primary text-dark-bg px-3 py-1 rounded-full text-xs font-bold"
                      >
                        {sub}
                        <button
                          onClick={() => toggleSubject(sub)}
                          className="hover:text-red-600"
                        >
                          ✕
                        </button>
                      </span>
                    ))}
                  </div>
                )}

                <input
                  className="input mb-2"
                  placeholder="Search subject..."
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                />

                <div className="max-h-32 overflow-y-auto border border-dark-bg p-2 rounded bg-dark-bg/30">
                  {filteredSubjects.map(sub => (
                    <label
                      key={sub}
                      className="flex items-center gap-2 p-1.5 cursor-pointer hover:bg-white/5 rounded"
                    >
                      <input
                        type="checkbox"
                        checked={formData.Lab_type.includes(sub)}
                        onChange={() => toggleSubject(sub)}
                      />
                      <span className="text-sm">{sub}</span>
                    </label>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="flex justify-end gap-3 mt-6">
            <button onClick={onClose} className="px-4 py-2 rounded bg-dark-bg">
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="px-4 py-2 rounded bg-primary text-dark-bg font-bold"
            >
              {isSubmitting ? "Processing..." : editData ? "Update" : "Save"}
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default AddRoomModal;
