"use client";
import { useState, useEffect, useRef } from "react";
import { ChevronDown, Search, X } from "lucide-react";
import { Input } from "../ui/input";
import { colleges } from "@/constants";

export default function CollegeSelectionSlide({ selectedCollege, setSelectedCollege }) {
    const [searchTerm, setSearchTerm] = useState('');

    const [customCollege, setCustomCollege] = useState('');
    const [showDropdown, setShowDropdown] = useState(false);
    const [showCustomEntry, setShowCustomEntry] = useState(false);
    const [filteredColleges, setFilteredColleges] = useState([]);
    const dropdownRef = useRef(null);
    const inputRef = useRef(null);


    // Filter colleges based on search term
    useEffect(() => {
        if (searchTerm.trim() === '') {
            setFilteredColleges([]);
            return;
        }

        const filtered = colleges.filter(college =>
            college.toLowerCase().includes(searchTerm.toLowerCase())
        ).slice(0, 50); // Limit to first 50 matches for performance

        setFilteredColleges(filtered);
    }, [searchTerm]);

    // Close dropdown when clicking outside
    useEffect(() => {
        function handleClickOutside(event) {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target) &&
                inputRef.current && !inputRef.current.contains(event.target)) {
                setShowDropdown(false);
            }
        }

        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, []);

    const handleCollegeSelect = (college) => {
        setSelectedCollege(college);
        setSearchTerm('');
        setShowDropdown(false);
    };

    const clearSelection = () => {
        setSelectedCollege('');
        setSearchTerm('');
        setCustomCollege('');
        setShowCustomEntry(false);
        if (inputRef.current) {
            inputRef.current.focus();
        }
    };

    return (
        <div className="flex justify-center flex-col w-full items-center">
            {/* Main Heading */}
            <h1 className="text-2xl font-semibold text-purple-800 text-center">
                Which college are you from?
            </h1>

            {/* Subtitle */}
            <p className="text-gray-500 text-center mt-2 max-w-lg mb-3">
                Help us connect you with peers from your institution
            </p>

            {/* Search & Selection Box */}
            <div className="mt-12 w-full max-w-[400px] relative">
                <div className="relative w-full" ref={inputRef}>
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Search className="h-4 w-4 text-gray-400" />
                    </div>

                    {selectedCollege ? (
                        <div className="flex items-center pl-10 pr-10 py-2 border border-gray-300 rounded-lg shadow-sm">
                            <p className="truncate">{selectedCollege}</p>
                            <button
                                className="absolute right-3 text-gray-400 hover:text-gray-600"
                                onClick={clearSelection}
                            >
                                <X size={16} />
                            </button>
                        </div>
                    ) : (
                        <div className="">
                        <Input
                            ref={inputRef}
                            type="text"
                            placeholder="Search for your college"
                            className="pl-14 pr-14 py-3 border border-gray-300 rounded-lg text-sm shadow-sm focus:border-purple-300 focus:ring focus:ring-purple-200 transition-all"
                            value={searchTerm}
                            onChange={(e) => {
                                setSearchTerm(e.target.value);
                                setShowDropdown(true);
                            }}
                            onFocus={() => setShowDropdown(true)}
                        />
                        <div className="absolute inset-y-0 right-0 flex items-center pr-4">
                            <ChevronDown
                                className={`h-4 w-4 text-gray-400 transition-transform ${showDropdown ? 'rotate-180' : ''}`}
                                onClick={() => setShowDropdown(!showDropdown)}
                            />
                        </div>
                    </div>
                    
                    )}
                </div>

                {/* Dropdown for colleges */}
                {showDropdown && !selectedCollege && (
                    <div
                        ref={dropdownRef}
                        className="absolute z-50 mt-1 w-full bg-white border text-sm text-gray-500 border-gray-200 rounded-md shadow-lg max-h-40 overflow-auto p-2"
                        style={{ bottom: 'auto' }} // Ensures the dropdown goes down, not up
                    >
                        {searchTerm.trim() === '' ? (
                            <>

                                {colleges.map((college, index) => (
                                    <div
                                        key={index}
                                        className="px-4 py-2 hover:bg-purple-50 cursor-pointer truncate"
                                        onClick={() => handleCollegeSelect(college)}
                                    >
                                        {college}
                                    </div>
                                ))}
                            </>
                        ) : filteredColleges.length > 0 ? (
                            <>
                                {filteredColleges.map((college, index) => (
                                    <div
                                        key={index}
                                        className="px-4 py-2 hover:bg-purple-50 cursor-pointer truncate"
                                        onClick={() => handleCollegeSelect(college)}
                                    >
                                        {college}
                                    </div>
                                ))}
                                {filteredColleges.length === 50 && (
                                    <div className="px-4 py-2 text-sm text-gray-500 italic">
                                        Continue typing to refine results...
                                    </div>
                                )}
                            </>
                        ) : (
                            <div className="px-4 py-2 text-gray-500">
                                No colleges found.
                                <button
                                    className="ml-2 text-purple-600 hover:underline"
                                    onClick={() => handleCollegeSelect(searchTerm)}
                                >
                                    Add "{searchTerm}"
                                </button>
                            </div>
                        )}
                        <div
                            className="px-4 py-2 border-t border-gray-100 text-purple-600 hover:bg-purple-50 cursor-pointer font-medium"
                            onClick={() => {
                                setSelectedCollege("Other");
                                setShowCustomEntry(true);
                            }}
                        >
                            Other
                        </div>
                    </div>
                )}
            </div>

            {/* Custom College Entry for "Other" option */}
            {showCustomEntry && (
                <div className="mt-4 w-full max-w-md animate-fadeIn">
                    <Input
                        type="text"
                        placeholder="Enter your college name"
                        className="w-full border border-purple-200 py-2 rounded-lg focus:border-purple-400"
                        value={customCollege}
                        onChange={(e) => setCustomCollege(e.target.value)}
                    />
                </div>
            )}



            {/* Page Indicator */}
            <p className="text-gray-400 text-sm mt-4 flex w-full justify-center mb-8"></p>
        </div>
    );
}