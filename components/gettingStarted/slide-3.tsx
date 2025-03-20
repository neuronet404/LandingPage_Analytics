"use client";
import { useState } from "react";
import { Search, ChevronDown } from "lucide-react";
import { Input } from "../ui/input";
import {
    MultiSelector,
    MultiSelectorTrigger,
    MultiSelectorInput,
    MultiSelectorContent,
    MultiSelectorList,
    MultiSelectorItem
} from "@/components/ui/extension/multi-select";
import { examOptions } from "@/constants";

export default function ExamPreparationSlide({ customExam, setCustomExam, selectedExam, setSelectedExam }) {

    const [showCustomInput, setShowCustomInput] = useState(false);



    const handleExamChange = (values: string[]) => {
        setSelectedExam(values);

        // If "OTHER" is selected, show the custom entry field
        if (values.includes("OTHER")) {
            setShowCustomInput(true);
        } else {
            setShowCustomInput(false);
            setCustomExam('');
        }
    };

    // Function to get display name and description of selected exam
    const getSelectedExamInfo = () => {
        if (selectedExam.length === 0) return { name: "", description: "" };

        if (selectedExam[0] === "OTHER" && customExam) {
            return { name: customExam, description: "Custom examination" };
        }

        const exam = examOptions.find(e => e.value === selectedExam[0]);
        return exam ? { name: exam.label, description: exam.description } : { name: "", description: "" };
    };

    return (
        <div className="flex flex-col items-center justify-center p-6  w-full max-w-md mx-auto">
            {/* Heading */}
            <h1 className="text-2xl font-semibold text-purple-800 text-center">
                Which exam are you currently preparing for?
            </h1>

            {/* Subtitle */}
            <p className="text-gray-500 text-center mt-2 mb-6">
                Select the medical examination you're focused on
            </p>

            {/* MultiSelector for exam selection */}
            <div className="w-full mb-6">
                <MultiSelector
                    values={selectedExam}
                    onValuesChange={handleExamChange}
                    loop={false}
                    singleSelect
                >
                    <MultiSelectorTrigger className="w-full p-3 border border-purple-200 rounded-lg shadow-sm">
                        <div className="flex items-center w-full justify-between">
                            <div className="flex items-center relative w-full">
                                <Search className="h-4 w-4 text-gray-400 mr-2" />
                                <MultiSelectorInput placeholder="Select an exam..." className=" w-full z-10" />
                                <ChevronDown size={18} className="text-purple-600 ml-2 cursor-pointer absolute right-0" />

                            </div>
                        </div>
                    </MultiSelectorTrigger>
                    <MultiSelectorContent
                        className="max-h-60 overflow-auto z-50"
                        position="popper"
                        align="start"
                        side="bottom"
                        avoidCollisions={true}
                    >
                        <MultiSelectorList>
                            {examOptions.map((exam, i) => (
                                <MultiSelectorItem
                                    key={i}
                                    value={exam.value}
                                    className="p-3 hover:bg-purple-50"
                                >
                                    <div>
                                        <div className="font-medium">{exam.label}</div>
                                        <div className="text-sm text-gray-500">{exam.description}</div>
                                    </div>
                                </MultiSelectorItem>
                            ))}
                        </MultiSelectorList>
                    </MultiSelectorContent>
                </MultiSelector>
            </div>

            {/* Custom Exam Input (shown when "Others" is selected) */}
            {showCustomInput && (
                <div className="w-full mb-6 animate-fadeIn">
                    <Input
                        type="text"
                        placeholder="Enter your exam name"
                        className="w-full p-3 border border-purple-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-300 focus:border-purple-300"
                        value={customExam}
                        onChange={(e) => setCustomExam(e.target.value)}
                    />
                </div>
            )}


        </div>
    );
}