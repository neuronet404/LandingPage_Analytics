"use client";
import React, { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
  InputOTPSeparator,
} from "@/components/ui/input-otp";
import { Check, Mails } from "lucide-react";
import { cn } from "@/lib/utils";
import Image from "next/image";
import { useRouter } from "next/navigation";
import axios from "axios";
import Loading from "@/app/loading";

const AcolyteOTPVerification = () => {
  const [otp, setOtp] = useState("");
  const [timer, setTimer] = useState(60);
  const [isResendDisabled, setIsResendDisabled] = useState(true);
  const [isVerifying, setIsVerifying] = useState(false);
  const [isVerified, setIsVerified] = useState(false);
  const [error, setError] = useState(null);
  const [message, setMessage] = useState(null);
  const router = useRouter();
  const [isSyncing, setisSyncing] = useState(false);

  useEffect(() => {
    if (timer > 0 && isResendDisabled) {
      const interval = setInterval(() => {
        setTimer((prevTimer) => prevTimer - 1);
      }, 1000);
      return () => clearInterval(interval);
    } else if (timer === 0) {
      setIsResendDisabled(false);
    }
  }, [timer, isResendDisabled]);

  const handleResendOTP = async () => {
    setOtp("");
    setTimer(60);
    setIsResendDisabled(true);
    const username = localStorage.getItem("username");
    const password = localStorage.getItem("password");
    const email = localStorage.getItem("email");

    try {
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_AUTH_URL}/signup`,
        {
          email,
          username: username,
          password,
        },
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
    } catch (e) {
      console.log(e);
    }
  };

  async function sendWelcomeEmail(email, username) {
    const lambdaUrl = `${process.env.NEXT_PUBLIC_AUTH_URL}/signupemail`; // Replace with your API Gateway endpoint
  
    const requestBody = {
      email,
      username,
    };
  
    try {
      const response = await fetch(lambdaUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });
  
      const data = await response.json();
      console.log('Lambda Response:', data);
      return data;
    } catch (error) {
      console.error('Error sending request to Lambda:', error);
      throw error;
    }
  }


  const handleConfirm = async (e) => {
    e.preventDefault();
    const username = localStorage.getItem("username");
    if (!username) {
      setError("Username not found. Please sign up again.");
      return;
    }
    try {
      setisSyncing(true)
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_AUTH_URL}/confirm-sign-up`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ identifier: username, code: otp }),
        }
      );
      const data = await response.json();
      if (response.ok) {
        setMessage("User verified successfully!");
        const email = localStorage.getItem("email");
        const name = localStorage.getItem("fullname");
        await sendWelcomeEmail(email,name)
        router.push("/auth/signin");
      } else {
        setError(data.error || "Something went wrong");
      }
    } catch (err) {
      setError("Network error. Please try again later.");
    } finally {
      localStorage.removeItem("username");
      localStorage.removeItem("email");
      localStorage.removeItem("password");
      setisSyncing(false)
    }
  };



  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100 flex items-center justify-center">
      <Card className="w-full max-w-md mx-4 shadow-lg border-none">
        <CardContent className="pt-8 px-8 pb-10">
          <div className="flex justify-center mb-3">
            <Image src="/acolytelogo.svg" alt="logo" width={100} height={100} />
          </div>
          <h2 className="text-2xl font-bold text-center mb-3 bg-gradient-to-r from-purple-700 to-purple-500 bg-clip-text text-transparent">
            Verification
          </h2>
          <div className="flex flex-col items-center justify-center mb-8">
            <div className="bg-purple-100 p-3 rounded-full mb-3">
              <Mails className="w-6 h-6 text-purple-700" />
            </div>
            <p className="text-center text-gray-600">
              We've sent a verification code to your email.
              <br />
              <span className="font-medium">
                Please enter the 6-digit code below.
              </span>
            </p>
          </div>

          <div className="mb-8 flex justify-center items-center">
            <InputOTP value={otp} onChange={setOtp} maxLength={6}>
              <InputOTPGroup>
                <InputOTPSlot index={0} />
                <InputOTPSlot index={1} />
                <InputOTPSlot index={2} />
              </InputOTPGroup>
              <InputOTPSeparator />
              <InputOTPGroup>
                <InputOTPSlot index={3} />
                <InputOTPSlot index={4} />
                <InputOTPSlot index={5} />
              </InputOTPGroup>
            </InputOTP>
          </div>
          <Button
            className={cn(
              "w-full py-6",
              isVerified ? "bg-green-500" : "bg-purple-700"
            )}
            onClick={handleConfirm}
            disabled={otp.length !== 6 || isVerifying || isVerified}
          >
            {isVerifying ? "Verifying..." : isVerified ? "Verified!" : "Verify"}
          </Button>

          {error && (
            <p className="text-red-500 text-sm text-center mt-2">{error}</p>
          )}
          {message && (
            <p className="text-green-500 text-sm text-center mt-2">{message}</p>
          )}

          <div className="text-center mt-6">
            <p className="text-gray-500 text-sm mb-1">Didn't receive a code?</p>
            <Button
              variant="link"
              className="text-purple-700 font-medium p-0"
              onClick={handleResendOTP}
              disabled={isResendDisabled || isVerified}
            >
              Resend Code {isResendDisabled && !isVerified && `(${timer}s)`}
            </Button>
          </div>
          <p className="text-gray-400 text-xs text-center mt-8">
            This code will expire in 10 minutes for security reasons
          </p>
        </CardContent>
      </Card>
      {isSyncing && (
        <div className="z-10 absolute inset-0 flex items-center justify-center h-screen w-full bg-gray-900/30 backdrop-blur-md">
          <Loading />
        </div>
      )}
    </div>
  );
};

export default AcolyteOTPVerification;
