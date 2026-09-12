'use client';
import React, { useState } from 'react';

const ConstraintModal = ({
  show,
  onClose,
  onSave,
  tempConstraint,
  setTempConstraint,
  days = [],
  branches = [],
  timeslots = []
}) => {
  const [errors, setErrors] = useState({});
  if (!show) return null;

  const updateArrayField = (field, value) => {
    setTempConstraint((prev) => ({
      ...prev,
      [field]: (prev[field] || []).includes(value)
        ? (prev[field] || []).filter((item) => item !== value)
        : [...(prev[field] || []), value]
    }));
  };

  const toggleAllDays = () => {
    setTempConstraint({
      ...tempConstraint,
      days:
        (tempConstraint.days || []).length === days.length
          ? []
          : [...days]
    });
  };

  const toggleAllBranches = () => {
    setTempConstraint({
      ...tempConstraint,
      branches:
        (tempConstraint.branches || []).length === branches.length
          ? []
          : [...branches]
    });
  };

  const validateFields = () => {
    let newErrors = {};
    if (!tempConstraint.name || tempConstraint.name.trim() === "") newErrors.name = "Constraint name is required";
    if (!tempConstraint.branches || tempConstraint.branches.length === 0) newErrors.branches = "Please select at least one branch";

    if (tempConstraint.fixed) {
      if (!tempConstraint.days || tempConstraint.days.length === 0) newErrors.days = "Please select at least one day";
      if (!tempConstraint.timeslots || tempConstraint.timeslots.length === 0) newErrors.timeslots = "Please select at least one timeslot";
    } else {
      if (!tempConstraint.duration) newErrors.duration = "Please select a duration";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-dark-bg p-6 rounded-lg w-[600px] space-y-4 overflow-y-auto max-h-[90vh]">
        <h3 className="text-lg font-bold text-white">Add Constraint</h3>

        {/* Name */}
        <label className="text-text-main font-semibold">Name of Constraint:</label>
        <input
          type="text"
          placeholder="Constraint Name"
          value={tempConstraint.name}
          onChange={(e) => setTempConstraint({ ...tempConstraint, name: e.target.value })}
          className="w-full px-3 py-2 rounded-md text-text-main bg-light-bg border border-gray-300"
        />
        {errors.name && <p className="text-red-500 text-sm">{errors.name}</p>}

        {/* Branches */}
        <label className="text-text-main font-semibold mt-3">Branches:</label>
        <label className="flex items-center space-x-2 mt-2">
          <input
            type="checkbox"
            checked={branches.length > 0 && (tempConstraint.branches || []).length === branches.length}
            onChange={toggleAllBranches}
          />
          <span className="text-text-main font-semibold">All Branches</span>
        </label>
        <div className="grid grid-cols-3 gap-2 mt-2">
          {branches.map((br) => (
            <label key={br} className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={(tempConstraint.branches || []).includes(br)}
                onChange={() => updateArrayField("branches", br)}
              />
              <span className="text-text-main">{br}</span>
            </label>
          ))}
        </div>
        {errors.branches && <p className="text-red-500 text-sm">{errors.branches}</p>}

        {/* Fixed / Flexible */}
        <div className="flex items-center space-x-4 mt-3">
          <label className="flex items-center space-x-2">
            <input
              type="radio"
              checked={tempConstraint.fixed}
              onChange={() =>
                setTempConstraint({
                  ...tempConstraint,
                  fixed: true,
                  duration: "",
                  days: [],
                  timeslots: []
                })
              }
            />
            <span className="text-text-main">Fixed</span>
          </label>
          <label className="flex items-center space-x-2">
            <input
              type="radio"
              checked={!tempConstraint.fixed}
              onChange={() =>
                setTempConstraint({
                  ...tempConstraint,
                  fixed: false,
                  days: [],
                  timeslots: []
                })
              }
            />
            <span className="text-text-main">Flexible</span>
          </label>
        </div>

        {/* Fixed Mode */}
        {tempConstraint.fixed && (
          <>
            <label className="text-text-main font-semibold mt-3">Days:</label>
            <label className="flex items-center space-x-2 mt-2">
              <input
                type="checkbox"
                checked={days.length > 0 && (tempConstraint.days || []).length === days.length}
                onChange={toggleAllDays}
              />
              <span className="text-text-main font-semibold">Everyday</span>
            </label>
            <div className="grid grid-cols-3 gap-2 mt-2">
              {days.map((day) => (
                <label key={day} className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={(tempConstraint.days || []).includes(day)}
                    onChange={() => updateArrayField("days", day)}
                  />
                  <span className="text-text-main">{day}</span>
                </label>
              ))}
            </div>
            {errors.days && <p className="text-red-500 text-sm">{errors.days}</p>}

            {/* Timeslots */}
            <label className="text-text-main font-semibold mt-3">Timeslots:</label>
            <div className="grid grid-cols-1 gap-2 mt-2">
              {timeslots.map((slot) => (
                <label key={slot} className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={(tempConstraint.timeslots || []).includes(slot)}
                    onChange={() => updateArrayField("timeslots", slot)}
                  />
                  <span className="text-text-main">{slot}</span>
                </label>
              ))}
            </div>
            {errors.timeslots && <p className="text-red-500 text-sm">{errors.timeslots}</p>}
          </>
        )}

        {/* Flexible Mode */}
        {!tempConstraint.fixed && (
          <select
            value={tempConstraint.duration}
            onChange={(e) => setTempConstraint({ ...tempConstraint, duration: e.target.value })}
            className="w-full px-3 py-2 rounded-md text-text-main bg-dark-bg mt-2"
          >
            <option value="">Select Duration</option>
            <option value="1hr">1 hour</option>
            <option value="2hr">2 hours</option>
            <option value="3hr">3 hours</option>
          </select>
        )}
        {errors.duration && <p className="text-red-500 text-sm">{errors.duration}</p>}

        {/* Buttons */}
        <div className="flex justify-end space-x-2 mt-4">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700"
          >
            Cancel
          </button>
          <button
            onClick={() => {
              if (validateFields()) onSave(tempConstraint);
              
              
            }}
            className="px-4 py-2 bg-primary text-dark-bg rounded-md hover:bg-primary/90"
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConstraintModal;

