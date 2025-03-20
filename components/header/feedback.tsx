import { Button } from "@/components/ui/button"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import Image from "next/image";
import textquestion from "@/public/assets/icons/textquestion.svg";
import { useEffect, useState } from "react";
import Select from "react-select";
import useUserId from "@/hooks/useUserId";
import axios from "axios";
import { toast, ToastContainer } from 'react-toastify';
// import { toast } from "sonner"
// import { ToastAction } from "@/components/ui/toast"


export function FeedBackForm() {
    const [selectedRating, setSelectedRating] = useState<number | null>(null);
    const [selectedFeatureType, setSelectedFeatureType] = useState<string | undefined>(undefined);
    const [feature, setFeature] = useState("");
    const [comment, setComment] = useState("");
    const [open, setOpen] = useState(false);
    const userId = useUserId()


    const ratings = [
        { id: 1, label: "Worst", emoji: "😖" },
        { id: 2, label: "Not Good", emoji: "🙁" },
        { id: 3, label: "Fine", emoji: "😐" },
        { id: 4, label: "Look Good", emoji: "🙂" },
        { id: 5, label: "Very Good", emoji: "😍" },
    ];

    const featureTypeOptions = [
        { value: "notes", label: "Notes" },
        { value: "pdfViewer", label: "PDF Viewer" },
        { value: "acolyteAi", label: "Acolyte AI" },
        { value: "analytics", label: "Analytics" },
        { value: "fileManager", label: "File Manager" },
        { value: "other", label: "Other" },
    ];

    async function submitUserFeedback() {
        const url = `${process.env.NEXT_PUBLIC_AUTH_URL}/userfeedback`;
        const data = {
            userId: userId,
            featureType: selectedFeatureType,
            content: comment,
            feature: feature,
            rating: selectedRating
        };

        try {
            const response = await axios.post(url, data, {
                headers: {
                    "Content-Type": "application/json"
                }
            });

            if (response.status === 200) {
                toast.success("Feedback submitted successfully! 🎉");
            }
            console.log("Response:", response);
        } catch (error) {
            console.error("Error submitting feedback:", error);
            toast.error("Feedback was not submitted, try again!");
        }
    }

    useEffect(() => {
        setSelectedRating(null)
        setSelectedFeatureType(undefined)
        setFeature("")
        setComment("")
    }, [open])


    const handleSubmit = () => {
        setSelectedRating(null)
        setSelectedFeatureType(undefined)
        setFeature("")
        setComment("")
        setOpen(false)


        submitUserFeedback();
    };

    return (
        <Dialog open={open} onOpenChange={setOpen} >
            <DialogTrigger asChild >
                <button
                    className="text-left px-2 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center justify-center rounded-md"
                    onClick={() => setOpen(true)}
                >
                    <Image src={textquestion} className="w-5 h-5" alt="Help" />
                    {/* <span className="text-sm">Help</span> */}
                </button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]  dark:bg-slate-800  bg-white">
                <DialogHeader>
                    <DialogTitle>
                        <h3 className="text-base font-semibold leading-loose text-violet-900 dark:text-violet-600">How was your experience?</h3>
                    </DialogTitle>
                    <DialogDescription>

                    </DialogDescription>
                </DialogHeader>
                <div className="h-full space-y-5 ">

                    {/* Feature Selection Dropdown */}
                    <div className="flex flex-col">
                        <Select
                            options={featureTypeOptions}
                            placeholder="Select feature type"
                            isSearchable
                            className="mb-3 rounded-lg text-sm text-black"
                            onChange={(e) => {
                                setSelectedFeatureType(e?.value);
                                // Reset feature input when changing feature type
                                if (e?.value !== "other") {
                                    setFeature("");
                                }
                            }}
                        />
                    </div>

                    {/* Other Feature Input - Only shown when "Other" is selected */}
                    {selectedFeatureType === "other" && (
                        <div className="flex flex-col">
                            <input
                                type="text"
                                placeholder="Describe the feature..."
                                className="w-full border p-2 rounded-lg text-sm focus:outline-none focus:ring focus:ring-purple-300"
                                value={feature}
                                onChange={(e) => setFeature(e.target.value)}
                            />
                        </div>
                    )}

                    {/* Comments Input */}
                    <textarea
                        placeholder="Add your comments..."
                        className="w-full border p-2 rounded-lg text-sm text-black
                         focus:outline-none focus:ring focus:ring-purple-300"
                        rows={3}
                        value={comment}
                        onChange={(e) => setComment(e.target.value)}
                    />

                    {/* Rating Section */}
                    <div className="flex justify-between my-4">
                        {ratings.map((item) => (
                            <div
                                key={item.id}
                                className={`flex flex-col items-center cursor-pointer ${selectedRating === item.id ? "text-purple-600 font-semibold filter-none" : "text-gray-400 grayscale"
                                    }`}
                                onClick={() => setSelectedRating(item.id)}
                            >
                                <span className="text-3xl">{item.emoji}</span>
                                <span className="text-sm font-sans">{item.label}</span>
                            </div>
                        ))}
                    </div>
                </div>
                <DialogFooter>
                    <Button type="submit"
                        disabled={selectedRating === null || comment.trim().length === 0 || selectedFeatureType === undefined}
                        className="w-full bg-violet-800 dark:bg-violet-600 dark:text-white text-white py-2 mt-3 rounded-md hover:bg-purple-700 transition"
                        onClick={handleSubmit}> SUBMIT</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}