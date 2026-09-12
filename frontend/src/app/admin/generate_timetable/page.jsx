'use client'; 
import React, { useState, useMemo, useEffect} from 'react';
import { FiUpload, FiSave, FiRefreshCw, FiCheck } from 'react-icons/fi';
import { HiMiniArrowPathRoundedSquare } from "react-icons/hi2";
import ConstraintModal from '@/components/Constraint';
import ErrorPopup from "@/components/ErrorPopup";
import { useRouter } from 'next/navigation';
import CommonSubjectModal from './CommonSubjectModal';


// --- Helper Component ---
const TimetableCell = ({ data }) => {
    if (!data || (!data.subject && !data.suject)) return <div className="h-full"></div>;
    const subjectName = data.subject || data.suject; // Handle typo 'suject'
    const isLab = subjectName?.toLowerCase().includes('lab');
    const isCb = subjectName === 'CB' || subjectName === 'Club Activity'|| subjectName ==='Club'|| subjectName ==='club activity' || subjectName ==='club'|| subjectName ==='club activities';
    
    if (subjectName === 'Lunch' || subjectName === 'lunch'|| subjectName === 'LUNCH'|| subjectName ==='Lunch breack') return <div className="h-full bg-yellow-100 text-yellow-800 font-bold flex items-center justify-center text-xs rounded-md">LUNCH</div>;
    if (isCb) return <div className="h-full bg-indigo-200 text-indigo-900 font-bold flex items-center justify-center text-xs rounded-md">Club Activity</div>;
    
    return (
        <div className={`h-full p-1.5 text-left text-sm rounded-md ${isLab ? 'bg-red-200' : 'bg-primary/20'}`}>
            <p className={`font-bold truncate ${isLab ? 'text-orange-700' : 'text-primary'}`}>{subjectName}</p>
            <p className={`truncate fw-bold ${isLab ? 'text-black' : 'text-white'}`}>{data.teacher || ''}</p>
            <p className={`truncate font-mono ${isLab ? 'text-black' : 'text-white'}`}>{data.room ? `Room: ${data.room}` : ''}</p>
        </div>
    );
};

// --- Main Component ---
const AdminTimetableGenerator = () => {
const [constraintsList, setConstraintsList] = useState([]);
const [tempConstraint, setTempConstraint] = useState({
  name: "",
  branches: [],
  fixed: true,
  days: [],
  timeslots: [],
  duration: ""
});
const [commonSubjectList, setCommonSubjectList] = useState([]);
const [tempCommonSubject, setTempCommonSubject] = useState({
    branches: [],
    common_sub:[]
});
const [selectedSlot, setSelectedSlot] = useState("");
const [data, setData] = useState(null);
const [slotRanges, setSlotRanges] = useState([]);
const [innerSlots, setInnerSlots] = useState([]);
const [days, setDays] = useState([]);
const [branches, setBranches] = useState([]);
const router = useRouter();
const [showConstraintModal, setShowConstraintModal] = useState(false);
const [showCommon_subModal, setShowCommon_subModal] = useState(false)
 useEffect(() => {
  const load = async () => {
    const res = await fetch("/api/generate_timetable", { cache: "no-store" });
    const json = await res.json();

    if (!json.success) return;

    setData(json.data);

    // ✅ correct keys
    const ranges = Object.keys(json.data);
    setSlotRanges(ranges);
  };

  load();
}, []);

const [selectedRange, setSelectedRange] = useState("");
const [course, setCourse] = useState("");

const [year, setYear] = useState('');   
const [working_hrs, setWorkingHours] = useState("");
const [courseDetailsFile, setCourseDetailsFile] = useState(null);
const [timetableData, setTimetableData] = useState(null);
const [isLoading, setIsLoading] = useState(false);
const [error, setError] = useState(null);
const [errorMessage, setErrorMessage] = useState(""); // For ErrorPopup
const [errors, setErrors] = useState({});// For form validation errors

const handleRangeChange = (e) => {
  const range = e.target.value;
  setSelectedRange(range);
    if (!data || !data[range]) return;
  const selected = data[range];

  setInnerSlots(selected.Slots);
  setDays(selected.Days);
  setBranches(selected.Branches);
};
const goToPopup = () => {
  if (!selectedSlot) return alert("Select a slot first");
  setShowConstraintModal(true);
     // 👈 MUST BE HERE
};

//common pop up
const commonSubjectPopUp= () => {
    setShowCommon_subModal(true);
};
const handleSaveConstraint = (constraint) => {
    setConstraintsList(prev => [...prev, constraint]);
    setTempConstraint({
      name: "",
      branches: [],
      fixed: true,
      days: [],
      timeslots: [],
      duration: ""
    });
    setShowConstraintModal(false);
};

const removeConstraint = (index) => {
    const updated = [...constraintsList];
    updated.splice(index, 1);
    setConstraintsList(updated);
};

const handleSaveCommonSubjectList = (commonSubject) => {
    setCommonSubjectList(prev => [...prev, commonSubject]);
    setTempCommonSubject({
        branches: [],
        common_sub:[]
    });
};

const processedTimetable = useMemo(() => {
  if (!timetableData) return null;

  const sections = Object.keys(timetableData);
  // Take the first section's day object to get the time slots
  const firstSection = timetableData[sections[0]];
  const sortedTimeSlots = firstSection?.[0] ? Object.keys(firstSection[0].schedule) : [];

  return { sections, sortedTimeSlots };
}, [timetableData]);


    const handleFileChange = (event) => setCourseDetailsFile(event.target.files[0]);

        const validateForm = () => {
  let newErrors = {};

  // Basic info
  if (!course) newErrors.courses = "Please select a course";
  if (!year) newErrors.years = "Please select a year";
  if (!working_hrs) newErrors.working_hrss = "Working hours are required";
  if (constraintsList.length === 0) {
    newErrors.constraints = "Please add at least one constraint";
  }
  setErrors(newErrors);
  return Object.keys(newErrors).length === 0;  // Returns true if no errors
};

    const handleGenerate = async () => {

        if (!validateForm()) {
            setErrorMessage("Please fill all required fields before generating the timetable!");
            return;
        }
        setErrorMessage("");
        setIsLoading(true);
        setError(null);
        setTimetableData(null);

        const requestData = {
            course, year,
            working_hrs,
            constraints: constraintsList,
            common_subject: commonSubjectList
        };
        console.log(requestData);
        try {
            const response = await fetch('/api/generate_timetable', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(requestData),
                credentials: 'include',
                cache: 'no-store',
            });

            if (!response.ok) {
                const errData = await response.json();
                throw new Error(errData.detail || 'Failed to generate timetable.');
            }

            const result = await response.json();
            setTimetableData(result.data.timetable); // Your API sends { "timetable": {...} }

        } catch (err) {
            console.error(err);
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    };

    const handleAccept = () => alert('Timetable Accepted and Published!');
    const handleRegenerate = () => confirm('Do you want to regenerate timetable?') && handleGenerate();
    
    return (
        <div className="space-y-8">
            {/* Header */}
            <div>
                <h1 className="text-3xl font-bold text-text-dark">Timetable Generator</h1>
                <p className="text-text-light">Provide constraints and generate a conflict-free schedule.</p>
            </div>

            {/* --- Input Section --- */}
            <div className="bg-card-bg p-8 rounded-lg shadow-sm">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-xl font-bold text-text-main">Scope & Constraints</h2>
                    <div>
                        <button className="text-sm font-semibold text-text-secondary hover:text-primary mr-4"><FiSave className="inline mr-2"/> Save Draft</button>
                        <button onClick={handleGenerate} disabled={isLoading} className="text-sm font-semibold bg-primary text-dark-bg px-4 py-2 rounded-md hover:bg-opacity-90 disabled:bg-gray-500">
                            {isLoading ? 'Generating...' : 'Generate'}
                            <ErrorPopup message={errorMessage} />

                        </button>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Column 1 */}
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-text-light mb-1">Course<span className="text-red-500">*</span></label>
                            
                            <select value={course} 
                            onChange={e => {
                                setCourse(e.target.value);
                                setErrors(prev => ({ ...prev, courses: null }));
                            }} 
                            className="w-full bg-dark-bg rounded-md px-4 py-2 text-text-main" required>
                                <option value={""}>Select Course</option>
                                <option value={"B.Tech"}>B.Tech</option>
                                <option value={"M.Tech"}>M.Tech</option>
                            </select>
                            {errors.courses && <p className="text-red-500 text-sm">{errors.courses}</p>}
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-text-main mb-1">Choose Common Subjects</label>
                            
                            {commonSubjectList.length > 0 && (
  <div className="mt-3 space-y-2">
    {commonSubjectList.map((item, index) => (
      <div
        key={index}
        className="bg-dark-bg rounded-md p-3 flex justify-between items-start"
      >
        <div>
          <p className="text-sm text-text-light">
            <span className="font-semibold">Branches:</span>{" "}
            {item.branches.join(", ")}
          </p>
          <p className="text-sm text-text-light">
            <span className="font-semibold">Subjects:</span>{" "}
            {item.common_sub.join(", ")}
          </p>
        </div>
        <button onClick={() =>
          setCommonSubjectList(prev =>
            prev.filter((_, i) => i !== index)
          )
        } className="text-red-500 hover:text-red-700 font-extrabold">X</button>
      </div>
    ))}
  </div>
)}
<button className = "bg-primary text-black font-bold px-4 py-2 rounded-md mt-3"
                            onClick={commonSubjectPopUp}>
                                Add Common Subject
                            </button>
                            
                        </div>
                        <div className="border border-dashed border-text-secondary/30 rounded-lg p-10 flex flex-col items-center justify-center text-center">
                             <FiUpload className="text-primary text-2xl mb-2" />
                             <label htmlFor="file-upload" className="font-semibold text-primary cursor-pointer hover:underline">
                                {courseDetailsFile ? courseDetailsFile.name : 'Click to upload'}
                             </label>
                             <input id="file-upload" name="file" type="file" className="sr-only" onChange={handleFileChange} accept=".csv" />
                            <p className="text-xs text-text-secondary mt-1">Course Details (CSV)</p>
                        </div>
                        
                    </div>
                    {/* Column 2 */}
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-text-light mb-1">Year<span className="text-red-500">*</span></label>
                            <select value={year} 
                            onChange={e =>{
                                setYear(e.target.value);
                                setErrors(prev => ({ ...prev, years: null }));
                            }}
                            className="w-full bg-dark-bg rounded-md px-4 py-2 text-text-main" required>
                                <option value={""} >Select year</option>
                                <option value ={"Year 1"}>Year 1</option>
                                <option value = {"Year 2"}>Year 2</option>
                                <option value = {"Year 3"}>Year 3</option>
                                <option value = {"Year 4"}>Year 4</option> 
                            </select> 
                            {errors.years && <p className="text-red-500 text-sm">{errors.years}</p>}                                                      
                        </div>
                        
                        
                         <div>
                             <label htmlFor="working-hours" className="block text-sm font-medium text-text-light mb-1">Working Hours<span className="text-red-500">*</span></label>
                             <select value={working_hrs}  onChange={(e) => {
                                setSelectedSlot(e.target.value);
                                handleRangeChange(e);
                                setWorkingHours(e.target.value);
                                setErrors(prev => ({ ...prev, working_hrs: null }));
                            }}
                                id="working-hours" 
                                className="w-full bg-dark-bg rounded-md px-4 py-2 text-text-main" 
                                required
                                disabled={constraintsList.length > 0}
                            >
                                <option value="">Select working hours</option>
                                {slotRanges.map((range) => (
                                    <option key={range} value={range}>{range}</option>
                                ))}
                                
                            </select>
                            {constraintsList.length > 0 && (
                                <p className="text-sm text-yellow-500 mt-1">
                                    Cannot change working hours after adding a constraint. Remove constraints first.
                                </p>
                            )}
                            {errors.working_hrs && <p className="text-red-500 text-sm">{errors.working_hrs}</p>}                          
                        </div>
                        <div className="space-y-2">
    <label className="block text-sm font-medium text-text-main mb-1" >Constraints<span className="text-red-500">*</span></label>
    {errors.constraints && <p className="text-red-500 text-sm">{errors.constraints}</p>}
    {/* List of Added Constraints */}
    {constraintsList.length > 0 && (
        <ul className="space-y-1 mb-2">
            {constraintsList.map((c, index) => (
                <li key={index} className="bg-dark-bg text-text-main p-2 rounded-md flex justify-between items-center">
                    <span>
    <p className="font-bold text-lg">{c.name}</p>
    {(c.branches || []).join(", ")} <br />

    {c.fixed ? (
        <>
            <span className="font-semibold">[Fixed]: </span>
            {c.timeslots.join(", ")} <br />
            {c.days.join(", ")}
        </>
    ) : (
        <>
            <span className="font-semibold">[Flexible]: </span>
            {c.duration}
        </>
    )}
</span>
                    <button onClick={() => removeConstraint(index)} className="text-red-500 hover:text-red-700 font-extrabold">X</button>
                </li>
            ))}
        </ul>
        
    )}
    

    <button 
        onClick={() => {
            
            goToPopup();

            setErrors(prev => ({ ...prev, constraints: null }));

        }} 
        className="px-4 py-2 bg-primary text-dark-bg rounded-md hover:bg-primary/90 font-semibold"
    required>
        Add Constraint
    </button>
</div>

{/* Modal */}
{showConstraintModal && (() => {

  

  return (
    <ConstraintModal
  show={showConstraintModal}
  onClose={() => setShowConstraintModal(false)}
  onSave={handleSaveConstraint}
  tempConstraint={tempConstraint}
  setTempConstraint={setTempConstraint}

  // ⭐ Add these
  days={days}
  branches={branches}
  timeslots={innerSlots}
  selectedSlot={selectedSlot}
  working_hrs={working_hrs}
/>


  );
  })()}
  {showCommon_subModal && (
  <CommonSubjectModal
    show={showCommon_subModal}
    onClose={() => setShowCommon_subModal(false)}
    onSave={handleSaveCommonSubjectList}
    branches={branches}
    year={year}
  />
)}
                    </div>
                </div>
            </div>

            {/* --- UI STATES --- */}
            {isLoading && (
                 <div className="text-center py-12 text-text-light">
                    <FiRefreshCw size={48} className="mx-auto mb-4 animate-spin text-primary" />
                    <p className="text-lg font-semibold">Generating timetable, please wait...</p>
                 </div>
            )}

            {error && (
                <div className="bg-red-100 border border-red-400 text-red-700 p-4 rounded-lg text-center">
                    <h3 className="font-bold">Error Generating Timetable</h3>
                    <p className="text-sm">{error}</p>
                </div>
            )}
            
            {/* --- UPDATED Output Section (Section-wise) --- */}
             {timetableData && processedTimetable && (
                <div className="bg-light-card p-8 rounded-lg shadow-sm border border-border-color">
                    <h2 className="text-2xl font-bold text-text-dark mb-6">Generated Timetable</h2>
                    {processedTimetable.sections.map(sectionName => {
                        const sectionDays = timetableData[sectionName];
                        return (
                            <div key={sectionName} className="mb-8">
                                <h3 className="text-xl font-bold text-primary mb-3">{sectionName}</h3>
                                <div className="overflow-x-auto">
                                    <table className="w-full text-center min-w-[900px]">
                                        <thead>
                                            <tr className="bg-light-bg text-xs text-text-light uppercase">
                                                <th className="p-2 font-semibold">Day / Time</th>
                                                {processedTimetable.sortedTimeSlots.map(time => <th key={time} className="p-2 font-semibold">{time}</th>)}
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {sectionDays.map(dayObj => (
                                                <tr key={dayObj.day} className="border-b border-border-color">
                                                    <td className="p-1 font-semibold bg-light-bg text-text-dark">{dayObj.day}</td>
                                                    {processedTimetable.sortedTimeSlots.map(time => (
                                                        <td key={time} className="p-1 h-20">
                                                            <TimetableCell data={dayObj.schedule[time]} />
                                                        </td>
                                                    ))}
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        );
                    })}
                    {/* Action Buttons */}
                    <div className="flex justify-end space-x-4 mt-8">
                        <button onClick={handleRegenerate} className="flex items-center px-6 py-3 bg-red-600 text-white font-bold rounded-lg hover:bg-red-900">
                           <HiMiniArrowPathRoundedSquare className="mr-2" /> Regenerate
                        </button>
                         <button onClick={handleAccept} className="flex items-center px-6 py-3 bg-green-600 text-white font-bold rounded-lg hover:bg-green-900 ">
                           <FiCheck className="mr-2" /> Accept & Publish
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminTimetableGenerator;