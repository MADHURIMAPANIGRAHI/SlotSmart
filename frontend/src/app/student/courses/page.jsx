'use client';
import React, { useState, useMemo } from 'react';
import { FiSearch, FiDownload, FiX } from 'react-icons/fi';
// 1. Import the central data file
import { dummyData } from '@/data/dummyData';

// 2. Use the correct path to the master list of all subjects
const subjectsData = dummyData.student.subjects;

// Helper function to get unique values (like teacher names) for the filter dropdowns
const getUniqueValues = (data, key) => [...new Set(data.map(item => item[key]))];

export default function StudentSubjects() {
    const [searchTerm, setSearchTerm] = useState('');
    const [teacherFilter, setTeacherFilter] = useState('');
    const [creditsFilter, setCreditsFilter] = useState('');

    // Automatically create a list of unique teachers and credits for the filters
    const teacherOptions = getUniqueValues(subjectsData, 'teacher');
    const creditOptions = getUniqueValues(subjectsData, 'credits');

    // Function to clear all active filters
    const handleClearFilters = () => {
        setSearchTerm('');
        setTeacherFilter('');
        setCreditsFilter('');
    };

    // This logic filters the subjects based on the search term and dropdown selections
    const filteredSubjects = useMemo(() => {
        return subjectsData.filter(subject => {
            const searchMatch = subject.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                                subject.code.toLowerCase().includes(searchTerm.toLowerCase());
            const teacherMatch = teacherFilter ? subject.teacher === teacherFilter : true;
            const creditsMatch = creditsFilter ? subject.credits === parseInt(creditsFilter) : true;
            
            return searchMatch && teacherMatch && creditsMatch;
        });
    }, [searchTerm, teacherFilter, creditsFilter]);

    return (
        <div className="space-y-8">
            {/* --- Header --- */}
            <div>
                <h1 className="text-3xl font-bold text-text-main">My Semester Subjects</h1>
                <p className="text-text-secondary">A list of all subjects offered this semester.</p>
            </div>

            {/* --- Main Content Card --- */}
            <div className="bg-card-bg p-6 rounded-lg shadow-sm">
                {/* Filter and Action Bar */}
                <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
                    {/* Search Bar */}
                    <div className="relative md:col-span-2">
                        <FiSearch className="absolute top-1/2 left-3 -translate-y-1/2 text-text-secondary" />
                        <input
                            type="text"
                            placeholder="Search by subject code or name..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full bg-dark-bg border border-transparent rounded-md pl-10 pr-4 py-2 text-text-main focus:ring-primary focus:border-primary"
                        />
                    </div>
                    {/* Filters */}
                    {/* <select value={teacherFilter} onChange={e => setTeacherFilter(e.target.value)} className="w-full bg-dark-bg border border-transparent rounded-md px-4 py-2 text-text-main focus:ring-primary focus:border-primary">
                        <option value="">Filter by Teacher</option>
                        {teacherOptions.map(teacher => <option key={teacher} value={teacher}>{teacher}</option>)}
                    </select>
                     */}
                    <select value={creditsFilter} onChange={e => setCreditsFilter(e.target.value)} className="w-full bg-dark-bg border border-transparent rounded-md px-4 py-2 text-text-main focus:ring-primary focus:border-primary">
                        <option value="">Filter by Credits</option>
                        {creditOptions.sort().map(credit => <option key={credit} value={credit}>{credit} Credits</option>)}
                    </select>
                    {/* Action Buttons */}
                    <div className="flex items-center justify-end space-x-3">
                         <button onClick={handleClearFilters} className="flex items-center text-sm font-semibold text-text-secondary hover:text-text-main space-x-4">
                            <FiX className="mr-1" /> Clear
                        </button>
                    </div>
                </div>

                {/* Subjects Table */}
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-dark-bg">
                            <tr className="text-xs text-text-secondary uppercase">
                                <th className="p-3">Subject Code</th>
                                <th className="p-3">Subject Name</th>
                                <th className="p-3">Credits</th>
                                {/* <th className="p-3">Teacher</th> */}
                                <th className="p-6">Syllabus</th>
                            </tr>
                        </thead>
                        <tbody className="text-text-main">
                            {filteredSubjects.map(subject => (
                                <tr key={subject.id} className="border-b border-dark-bg hover:bg-dark-bg/50">
                                    <td className="p-3 font-mono">{subject.code}</td>
                                    <td className="p-3 font-semibold">{subject.name}</td>
                                    <td className="p-3">{subject.credits}</td>
                                    {/* This line displays the teacher's name */}
                                    {/* <td className="p-3">{subject.teacher}</td> */}
                                    <td className="p-6">
                                        <a href={subject.syllabusUrl || '#'} className="flex items-center text-primary hover:underline font-semibold">
                                            <FiDownload className="mr-1" /> Download
                                        </a>
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

