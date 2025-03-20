"use client";
import { useState } from "react";
import { Search, ChevronDown } from "lucide-react";
import {
    MultiSelector,
    MultiSelectorTrigger,
    MultiSelectorInput,
    MultiSelectorContent,
    MultiSelectorList,
    MultiSelectorItem
} from "@/components/ui/extension/multi-select";
import { subjectOptions } from "@/constants";

export default function MedicalSubjectsSlide({ selectedSubject, setSelectedSubject }) {


    const handleSubjectChange = (values: string[]) => {
        setSelectedSubject(values);
    };

    // Function to get the selected subject label
    const getSelectedSubjectLabel = () => {
        if (selectedSubject.length === 0) return "";

        const subject = subjectOptions.find(s => s.value === selectedSubject[0]);
        return subject ? subject.label : "";
    };

    return (
        <div className="flex flex-col items-center justify-center p-6  w-full max-w-md mx-auto">
            {/* Heading */}
            <h1 className="text-2xl font-semibold text-purple-800 text-center">
                Which Subject challenges you the most?
            </h1>

            {/* Subtitle */}
            <p className="text-gray-500 text-center mt-2 mb-6">
                Select the medical subject you find most difficult
            </p>

            {/* MultiSelector for subject selection */}
            <div className="w-full mb-6">
                <MultiSelector
                    values={selectedSubject}
                    onValuesChange={handleSubjectChange}
                    loop={false}
                >
                    <MultiSelectorTrigger className="w-full p-3 border border-purple-200 rounded-lg shadow-sm">
                        <div className="flex items-center w-full justify-between">
                            <div className="flex items-center w-full relative">
                                <Search className="h-4 w-4 text-gray-400 mr-2" />
                                <MultiSelectorInput placeholder="Select a subject..." className=" w-full z-10" />
                                <ChevronDown size={18} className="text-purple-600 ml-2 cursor-pointer absolute right-0" />
                            </div>

                        </div>
                    </MultiSelectorTrigger>
                    <MultiSelectorContent
                        className="max-h-60 overflow-auto z-50"
                    >
                        <MultiSelectorList>
                            {subjectOptions.map((subject, i) => (
                                <MultiSelectorItem
                                    key={i}
                                    value={subject.value}
                                    className="p-3 hover:bg-purple-50"
                                >
                                    {subject.label}
                                </MultiSelectorItem>
                            ))}
                        </MultiSelectorList>
                    </MultiSelectorContent>
                </MultiSelector>
            </div>

            {/* Display selection feedback */}

        </div>
    );
}