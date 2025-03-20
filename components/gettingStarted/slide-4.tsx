"use client";
import { useState } from "react";
import { Input } from "../ui/input";
import { CheckCircle } from "lucide-react";

export default function Slide2({email, setEmail}) {

    const [inviteSent, setInviteSent] = useState(false);
    const [error, setError] = useState('');
    
    const validateEmail = (email) => {
        const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return regex.test(email);
    };
    
    const handleSendInvite = () => {
        if (!email) {
            setError('Please enter an email address');
            return;
        }
        
        if (!validateEmail(email)) {
            setError('Please enter a valid email address');
            return;
        }
        
        setError('');
        setInviteSent(true);
        
        // Reset after 3 seconds
        setTimeout(() => {
            setInviteSent(false);
            setEmail('');
        }, 3000);
    };

    return (
        <div className="flex justify-center flex-col w-full items-center">
            {/* Main Heading */}
            <h1 className="text-3xl font-semibold text-purple-800 ">
                Invite Friends
            </h1>

            {/* Subtitle */}
            <p className="text-gray-500 text-center mt-2 max-w-lg">
                Collaborate with friends, create a virtual study group
            </p>
            
            {/* Email Input Box */}
            <div className="mt-6 flex items-center w-full max-w-md border border-gray-300 rounded-lg shadow-sm">
                <Input
                    type="email"
                    placeholder="Enter your email address"
                    className="p-2 border-none"
                    value={email}
                    onChange={(e) => {
                        setEmail(e.target.value);
                        if (error) setError('');
                    }}
                />
                <button 
                    className="px-4 py-2 bg-transparent text-gray-500 hover:text-purple-700"
                    onClick={handleSendInvite}
                >
                    {inviteSent ? <CheckCircle size={20} /> : "➝"}
                </button>
            </div>
            
            {/* Error Message */}
            {error && (
                <p className="text-red-500 text-xs mt-1 w-full max-w-md">
                    {error}
                </p>
            )}
            
            {/* Page Indicator */}
        </div>
    );
}