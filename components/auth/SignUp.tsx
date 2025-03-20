"use client";

import React, { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import Image from "next/image";
import { Eye, EyeOff } from "lucide-react";
import { useRouter } from "next/navigation";
import { CheckboxWithText } from "./termsAndCondition";
import axios from "axios";
import Loading from "@/app/loading";

const AcolyteSignUpUpdated = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [fullname, setFullname] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<String>("");
  const [userNameError, setUserNameError] = useState<boolean>(false);
  const [success, setSuccess] = useState<String>("");
  const [userName, setUserName] = useState("");
  const [terms, setTerms] = useState(false);
  const router = useRouter();
  const [isSyncing, setisSyncing] = useState(false);

  const [passwordRequirements, setPasswordRequirements] = useState({
    length: false,
    uppercase: false,
    number: false,
    special: false,
  });

  useEffect(() => {
    // Check password requirements whenever password changes
    const newRequirements = {
      length: password.length >= 8,
      uppercase: /[A-Z]/.test(password),
      number: /[0-9]/.test(password),
      special: /[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(password),
    };

    // Add a slight delay for a more pleasing animation effect
    const timer = setTimeout(() => {
      setPasswordRequirements(newRequirements);
    }, 150);

    return () => clearTimeout(timer);
  }, [password]);

  const isPasswordValid = () => {
    return Object.values(passwordRequirements).every(Boolean);
  };

  const handleSignUp = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!email || !fullname) {
      setError("Please fill all details");
      return;
    }

    if (!password) {
      setError("Please create a password");
      return;
    }

    if (!isPasswordValid()) {
      setError("Please meet all password requirements");
      return;
    }

    if (!validateUsername(fullname)) {
      setError("Username cannot contain spaces");
      return;
    }
    setisSyncing(true)

    localStorage.setItem("fullName", fullname);

    try {
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_AUTH_URL}/signup`,
        {
          email,
          username: userName,
          fullname: fullname,
          password,
        },
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      localStorage.setItem("username", userName);
      localStorage.setItem("password", password);
      localStorage.setItem("email", email);
      localStorage.setItem("fullname", fullname);
      setSuccess("Verification Code has been sent to your mail!");
      setisSyncing(false)
      router.push("/auth/confirmsignup");
    } catch (err: any) {
      setError(err?.response?.data?.error || err?.message);
      setisSyncing(false)
    }
  };

  const RequirementItem = ({ met, text }) => (
    <div className="flex items-center space-x-2">
      <div
        className={`h-1.5 w-1.5 rounded-full transition-all duration-300 ${
          met ? "bg-green scale-110" : "bg-gray-300"
        }`}
      />
      <span
        className={`text-xs transition-all duration-300 ${
          met ? "text-green-500" : "text-gray-400"
        }`}
      >
        {text}
      </span>
    </div>
  );

  function validateEmail(email) {
    // Regular expression for basic email validation
    const regex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

    // Test the email with the regex
    return regex.test(email);
  }

  function validateUsername(username) {
    // Check if username contains spaces
    return !username.includes(" ");
  }

  const handleValidateField = () => {
    //check email is valid
    //check full name field is not empty and no spaces
    //check password
    //check terms and condtion
    if (
      !terms ||
      !isPasswordValid() ||
      fullname.length < 1 ||
      !validateEmail(email) ||
      userNameError ||
      userName.length < 1
    ) {
      return true;
    }
  };

  const handleTermsAndCondition = (value: boolean) => {
    setTerms(value);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="absolute top-0 left-0 w-full h-32 bg-purple-700 rounded-b-[50%] opacity-10" />

      <Card className="w-full max-w-md mx-auto shadow-lg relative overflow-hidden border-none">
        <div className="absolute top-0 right-0 w-32 h-32 bg-green-300 rounded-bl-full opacity-20" />
        <div className="absolute bottom-0 left-0 w-40 h-40 bg-purple-300 rounded-tr-full opacity-20" />
        <CardContent className="pt-4 px-4 pb-6 sm:pt-6 sm:px-6 sm:pb-8">
          <div className="flex justify-center mb-4">
            <div className="w-16 h-12 sm:w-20 sm:h-16">
              <Image
                src="/acolytelogo.svg"
                alt="logo"
                className="object-contain"
                width={100}
                height={100}
              />
            </div>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-center mb-4 sm:mb-6">
            Create an account
          </h2>
          <form className="space-y-3 sm:space-y-4" onSubmit={handleSignUp}>
            <div className="space-y-1 sm:space-y-2">
              <Label htmlFor="email" className="text-gray-500 text-sm">
                Email Address
              </Label>
              <Input
                id="email"
                type="email"
                placeholder="Enter your email address"
                className="py-3 sm:py-5 text-sm"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div className="space-y-1 sm:space-y-2">
              <Label htmlFor="fullName" className="text-gray-500 text-sm">
                User Name
              </Label>
              <Input
                id="userName"
                type="text"
                placeholder="Enter your user name"
                className="py-3 sm:py-5 text-sm"
                value={userName}
                onChange={(e) => {
                  setUserName(e.target.value);
                  const hasSpace = /\s/.test(e.target.value);

                  if (hasSpace) {
                    setUserNameError(true);
                  } else {
                    setUserNameError(false);
                  }
                }}
              />
              {userNameError && (
                <p className="text-red-500 text-xs mt-1">
                  Username should not contain spaces
                </p>
              )}
            </div>
            <div className="space-y-1 sm:space-y-2">
              <Label htmlFor="fullName" className="text-gray-500 text-sm">
                Full Name
              </Label>
              <Input
                id="fullName"
                type="text"
                placeholder="Enter your full name"
                className="py-3 sm:py-5 text-sm"
                value={fullname}
                onChange={(e) => setFullname(e.target.value)}
              />
            </div>
            <div className="space-y-1 sm:space-y-2">
              <Label htmlFor="password" className="text-gray-500 text-sm">
                Password
              </Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Create your password"
                  className="py-3 sm:py-5 text-sm"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-2 top-1/2 h-6 w-6 -translate-y-1/2 px-0"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </Button>
              </div>

              <div className="mt-2 px-2 py-2 bg-gray-50 rounded-md border border-gray-100">
                <div className="grid grid-cols-2 gap-y-1 gap-x-1 sm:gap-x-2">
                  <RequirementItem
                    met={passwordRequirements.length}
                    text="8+ characters"
                  />
                  <RequirementItem
                    met={passwordRequirements.uppercase}
                    text="Uppercase letter"
                  />
                  <RequirementItem
                    met={passwordRequirements.number}
                    text="Number"
                  />
                  <RequirementItem
                    met={passwordRequirements.special}
                    text="Special character"
                  />
                </div>
              </div>

              <div className="mt-2 px-2 py-2">
                <CheckboxWithText
                  terms={terms}
                  checkFn={handleTermsAndCondition}
                />
              </div>
            </div>
            {error && (
              <p className="text-red-500 text-xs sm:text-sm text-center">
                {error}
              </p>
            )}
            {success && (
              <p className="text-green-500 text-xs sm:text-sm text-center">{success}</p>
            )}
            <Button
              type="submit"
              className="w-full bg-purple-700 hover:bg-purple-800 py-4 sm:py-6 mt-2 text-sm"
              disabled={handleValidateField()}
            >
              Create an account
            </Button>
          </form>
          <div className="text-center text-xs sm:text-sm mt-4">
            Already have an account?{" "}
            <span
              onClick={() => {
                router.push("/auth/signin");
              }}
              className="text-purple-700 font-medium cursor-pointer"
            >
              Login
            </span>
          </div>
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

export default AcolyteSignUpUpdated;