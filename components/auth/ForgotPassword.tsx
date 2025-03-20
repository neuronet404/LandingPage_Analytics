"use client";
import React, { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSeparator,
  InputOTPSlot,
} from "@/components/ui/input-otp";
import {
  KeyRound,
  ArrowLeft,
  Mail,
  CheckCircle,
  AlertCircle,
  LockKeyhole,
} from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import Image from "next/image";
import { useRouter } from "next/navigation";
import Loading from "@/app/loading";

// Utility function to conditionally join classNames
const cn = (...classes) => {
  return classes.filter(Boolean).join(" ");
};

const AcolyteForgotPassword = () => {
  const [step, setStep] = useState(1);
  const [username, setUsername] = useState("");
  const [code, setCode] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [timer, setTimer] = useState(60);
  const [isResendDisabled, setIsResendDisabled] = useState(true);
  const router = useRouter();
  const [isSyncing, setisSyncing] = useState(false);

  // Password validation
  const [passwordRequirements, setPasswordRequirements] = useState({
    length: false,
    uppercase: false,
    number: false,
    special: false,
  });

  // Setup timer for resend code
  useEffect(() => {
    if (timer > 0 && isResendDisabled && step === 2) {
      const interval = setInterval(() => {
        setTimer((prevTimer) => prevTimer - 1);
      }, 1000);
      return () => clearInterval(interval);
    } else if (timer === 0) {
      setIsResendDisabled(false);
    }
  }, [timer, isResendDisabled, step]);

  // Password validation
  useEffect(() => {
    if (newPassword) {
      setPasswordRequirements({
        length: newPassword.length >= 8,
        uppercase: /[A-Z]/.test(newPassword),
        number: /[0-9]/.test(newPassword),
        special: /[!@#$%^&*(),.?":{}|<>]/.test(newPassword),
      });
    }
  }, [newPassword]);

  const isPasswordValid = Object.values(passwordRequirements).every(Boolean);
  const doPasswordsMatch =
    newPassword === confirmPassword && confirmPassword !== "";

  const handleRequestCode = async (e) => {
    e.preventDefault();
    setError("");
    setMessage("");

    if (!username) {
      setError("Please enter your username.");
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_AUTH_URL}/init-forgot-password`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ identifier: username }),
        }
      );

      const data = await response.json();

      if (response.ok) {
        localStorage.setItem("username", username);
        setStep(2);
        setMessage("Code sent to your email. Please check your inbox.");
        setTimer(60);
        setIsResendDisabled(true);
      } else {
        setError(data.error || "Something went wrong.");
      }
    } catch (err) {
      setError("Network error. Please try again later.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendCode = async () => {
    setError("");
    setMessage("");
    setIsLoading(true);

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_AUTH_URL}/init-forgot-password`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            identifier: localStorage.getItem("username"),
          }),
        }
      );

      const data = await response.json();

      if (response.ok) {
        setMessage("Code resent to your email. Please check your inbox.");
        setTimer(60);
        setIsResendDisabled(true);
        setCode("");
      } else {
        setError(data.error || "Something went wrong.");
      }
    } catch (err) {
      setError("Network error. Please try again later.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyCode = () => {
    setError("");
    setMessage("");

    if (code.length !== 6) {
      setError("Please enter the 6-digit code.");
      return;
    }

    // Move to password reset step
    setStep(3);
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    setError("");
    setMessage("");

    const storedUsername = localStorage.getItem("username");

    if (!storedUsername) {
      setError("No username found. Please request a new code.");
      return;
    }

    if (!isPasswordValid) {
      setError("Please ensure your password meets all requirements.");
      return;
    }

    if (!doPasswordsMatch) {
      setError("Passwords don't match.");
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_AUTH_URL}/confirm-forgot-password`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            identifier: storedUsername,
            confirmationCode: code,
            password: newPassword,
          }),
        }
      );

      const data = await response.json();

      if (response.ok) {
        setStep(4);
        setMessage("Password reset successful! You can now log in.");
        localStorage.removeItem("username");
      } else {
        setError(data.error || "Something went wrong.");
      }
    } catch (err) {
      setError("Network error. Please try again later.");
    } finally {
      setIsLoading(false);
    }
  };

  const renderStepOne = () => (
    <>
      {isSyncing && (
        <div className="z-10 absolute inset-0 flex items-center justify-center h-screen w-full bg-gray-900/30 backdrop-blur-md">
          <Loading />
        </div>
      )}
      <div className="flex flex-col items-center justify-center mb-8">
        <div className="bg-purple-100 p-3 rounded-full mb-3">
          <KeyRound className="w-6 h-6 text-purple-700" />
        </div>
        <h2 className="text-2xl font-bold text-center mb-2 bg-gradient-to-r from-purple-700 to-purple-500 bg-clip-text text-transparent">
          Forgot Password
        </h2>
        <p className="text-center text-gray-600">
          Enter your username or email and we'll send you a verification code to
          reset your password.
        </p>
      </div>

      {error && (
        <Alert variant="destructive" className="mb-4">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <form onSubmit={handleRequestCode} className="space-y-5">
        <div className="space-y-2">
          <Label htmlFor="username" className="text-gray-600">
            Username or Email
          </Label>
          <Input
            id="username"
            type="text"
            placeholder="Enter your username or email"
            className="py-5"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            disabled={isLoading}
          />
        </div>

        <Button
          type="submit"
          className="w-full bg-purple-700 hover:bg-purple-800 py-6 relative overflow-hidden group transition-all"
          disabled={isLoading || !username}
        >
          {isLoading ? (
            <div className="flex items-center justify-center">
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
              Sending...
            </div>
          ) : (
            <span>Send Code</span>
          )}
          <div className="absolute inset-0 h-full w-full scale-0 rounded-lg transition-all duration-300 group-hover:scale-100 group-hover:bg-white/10"></div>
        </Button>

        <div className="text-center mt-4">
          <Button
            variant="link"
            className="text-purple-700"
            onClick={() => router.push("/auth/signin")}
          >
            Back to Login
          </Button>
        </div>
      </form>
    </>
  );

  const renderStepTwo = () => (
    <>
      <Button
        variant="ghost"
        className="absolute top-4 left-4 p-2"
        onClick={() => setStep(1)}
      >
        <ArrowLeft className="h-5 w-5" />
      </Button>

      <div className="flex flex-col items-center justify-center mb-6">
        <div className="bg-purple-100 p-3 rounded-full mb-3">
          <Mail className="w-6 h-6 text-purple-700" />
        </div>
        <h2 className="text-2xl font-bold text-center mb-2 bg-gradient-to-r from-purple-700 to-purple-500 bg-clip-text text-transparent">
          Verification
        </h2>
        <p className="text-center text-gray-600">
          We've sent a verification code to your email.
          <br />
          <span className="font-medium">
            Please enter the 6-digit code below.
          </span>
        </p>
      </div>

      {message && (
        <Alert className="mb-4 bg-green-50 text-green-800 border-green-200">
          <CheckCircle className="h-4 w-4 text-green-600" />
          <AlertDescription>{message}</AlertDescription>
        </Alert>
      )}

      {error && (
        <Alert variant="destructive" className="mb-4">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <div className="mb-8">
        <InputOTP
          value={code}
          onChange={setCode}
          maxLength={6}
          disabled={isLoading}
        >
          <div className="flex gap-2 items-center justify-center w-full ">
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
          </div>
        </InputOTP>
      </div>

      <Button
        className="w-full bg-purple-700 hover:bg-purple-800 py-6 relative overflow-hidden group transition-all mb-4"
        onClick={handleVerifyCode}
        disabled={code.length !== 6 || isLoading}
      >
        {isLoading ? (
          <div className="flex items-center justify-center">
            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
            Verifying...
          </div>
        ) : (
          <span>Continue</span>
        )}
        <div className="absolute inset-0 h-full w-full scale-0 rounded-lg transition-all duration-300 group-hover:scale-100 group-hover:bg-white/10"></div>
      </Button>

      <div className="text-center">
        <p className="text-gray-500 text-sm mb-1">Didn't receive a code?</p>
        <div className="flex justify-center items-center">
          <Button
            variant="link"
            className="text-purple-700 font-medium p-0"
            onClick={handleResendCode}
            disabled={isResendDisabled || isLoading}
          >
            Resend Code
          </Button>
          {isResendDisabled && (
            <span className="text-gray-500 text-sm ml-2">({timer}s)</span>
          )}
        </div>
      </div>
    </>
  );

  const renderStepThree = () => (
    <>
      <Button
        variant="ghost"
        className="absolute top-4 left-4 p-2"
        onClick={() => setStep(2)}
      >
        <ArrowLeft className="h-5 w-5" />
      </Button>

      <div className="flex flex-col items-center justify-center mb-6">
        <div className="bg-purple-100 p-3 rounded-full mb-3">
          <LockKeyhole className="w-6 h-6 text-purple-700" />
        </div>
        <h2 className="text-2xl font-bold text-center mb-2 bg-gradient-to-r from-purple-700 to-purple-500 bg-clip-text text-transparent">
          Reset Password
        </h2>
        <p className="text-center text-gray-600">
          Create a new password for your account.
        </p>
      </div>

      {error && (
        <Alert variant="destructive" className="mb-4">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <form onSubmit={handleResetPassword} className="space-y-5">
        <div className="space-y-2">
          <Label htmlFor="newPassword" className="text-gray-600">
            New Password
          </Label>
          <div className="relative">
            <Input
              id="newPassword"
              type={showPassword ? "text" : "password"}
              placeholder="Create new password"
              className="py-5"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              disabled={isLoading}
            />
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="absolute right-2 top-1/2 h-6 w-6 -translate-y-1/2 px-0"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? (
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="h-4 w-4"
                >
                  <path d="M9.88 9.88a3 3 0 1 0 4.24 4.24"></path>
                  <path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68"></path>
                  <path d="M6.61 6.61A13.526 13.526 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61"></path>
                  <line x1="2" x2="22" y1="2" y2="22"></line>
                </svg>
              ) : (
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="h-4 w-4"
                >
                  <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"></path>
                  <circle cx="12" cy="12" r="3"></circle>
                </svg>
              )}
            </Button>
          </div>

          {/* Password requirements */}
          <div className="mt-2 space-y-1 text-xs">
            <p className="font-medium text-gray-600">Password must have:</p>
            <div className="grid grid-cols-2 gap-1">
              <div
                className={`flex items-center ${
                  passwordRequirements.length
                    ? "text-green-600"
                    : "text-gray-500"
                }`}
              >
                <div
                  className={`w-3 h-3 rounded-full mr-2 ${
                    passwordRequirements.length ? "bg-green" : "bg-gray-300"
                  }`}
                ></div>
                At least 8 characters
              </div>
              <div
                className={`flex items-center ${
                  passwordRequirements.uppercase
                    ? "text-green-600"
                    : "text-gray-500"
                }`}
              >
                <div
                  className={`w-3 h-3 rounded-full mr-2 ${
                    passwordRequirements.uppercase ? "bg-green" : "bg-gray-300"
                  }`}
                ></div>
                1 uppercase letter
              </div>
              <div
                className={`flex items-center ${
                  passwordRequirements.number
                    ? "text-green-600"
                    : "text-gray-500"
                }`}
              >
                <div
                  className={`w-3 h-3 rounded-full mr-2 ${
                    passwordRequirements.number ? "bg-green" : "bg-gray-300"
                  }`}
                ></div>
                1 number
              </div>
              <div
                className={`flex items-center ${
                  passwordRequirements.special
                    ? "text-green-600"
                    : "text-gray-500"
                }`}
              >
                <div
                  className={`w-3 h-3 rounded-full mr-2 ${
                    passwordRequirements.special ? "bg-green" : "bg-gray-300"
                  }`}
                ></div>
                1 special character
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="confirmPassword" className="text-gray-600">
            Confirm Password
          </Label>
          <Input
            id="confirmPassword"
            type={showPassword ? "text" : "password"}
            placeholder="Confirm new password"
            className={cn(
              "py-5",
              confirmPassword &&
                (doPasswordsMatch
                  ? "border-green-500 focus-visible:ring-green-500"
                  : "border-red-500 focus-visible:ring-red-500")
            )}
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            disabled={isLoading}
          />
          {confirmPassword && !doPasswordsMatch && (
            <p className="text-xs text-red-500 mt-1">Passwords don't match</p>
          )}
        </div>

        <Button
          type="submit"
          className="w-full bg-purple-700 hover:bg-purple-800 py-6 relative overflow-hidden group transition-all"
          disabled={isLoading || !isPasswordValid || !doPasswordsMatch}
        >
          {isLoading ? (
            <div className="flex items-center justify-center">
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
              Resetting...
            </div>
          ) : (
            <span>Reset Password</span>
          )}
          <div className="absolute inset-0 h-full w-full scale-0 rounded-lg transition-all duration-300 group-hover:scale-100 group-hover:bg-white/10"></div>
        </Button>
      </form>
    </>
  );

  const renderStepFour = () => (
    <>
      <div className="flex flex-col items-center justify-center mb-8">
        <div className="bg-green-100 p-4 rounded-full mb-4">
          <CheckCircle className="w-8 h-8 text-green-600" />
        </div>
        <h2 className="text-2xl font-bold text-center mb-2 text-green-600">
          Password Reset Complete
        </h2>
        <p className="text-center text-gray-600 mb-6">
          Your password has been successfully reset. You can now log in with
          your new password.
        </p>

        <Button
          className="w-full bg-purple-700 hover:bg-purple-800 py-6 relative overflow-hidden group transition-all"
          onClick={() => router.push("/auth/signin")}
        >
          <span>Go to Login</span>
          <div className="absolute inset-0 h-full w-full scale-0 rounded-lg transition-all duration-300 group-hover:scale-100 group-hover:bg-white/10"></div>
        </Button>
      </div>
    </>
  );

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100 flex items-center justify-center">
      <div className="absolute top-0 left-0 w-full h-32 bg-purple-700 rounded-b-[50%] opacity-10" />

      <Card className="w-full max-w-md mx-4 shadow-lg relative overflow-hidden border-none">
        <div className="absolute top-0 right-0 w-32 h-32 bg-green-300 rounded-bl-full opacity-20" />
        <div className="absolute bottom-0 left-0 w-40 h-40 bg-purple-300 rounded-tr-full opacity-20" />

        <CardContent className="pt-8 px-8 pb-10 relative z-10">
          {/* Logo */}
          <div className="flex justify-center mb-6">
            <Image
              src={"/acolytelogo.svg"}
              alt="logo"
              className="object-contain"
              width={100}
              height={100}
            />
          </div>

          {/* Steps indicator */}
          {step < 4 && (
            <div className="flex justify-center mb-6">
              <div className="flex items-center space-x-2">
                {[1, 2, 3].map((s) => (
                  <React.Fragment key={s}>
                    <div
                      className={cn(
                        "w-8 h-8 rounded-full flex items-center justify-center text-xs font-medium",
                        s === step
                          ? "bg-purple-700 text-white"
                          : s < step
                          ? "bg-green-100 text-green-600 border border-green-600"
                          : "bg-gray-100 text-gray-400 border border-gray-300"
                      )}
                    >
                      {s < step ? <CheckCircle className="w-4 h-4" /> : s}
                    </div>
                    {s < 3 && (
                      <div
                        className={cn(
                          "w-12 h-0.5",
                          s < step ? "bg-green-500" : "bg-gray-300"
                        )}
                      ></div>
                    )}
                  </React.Fragment>
                ))}
              </div>
            </div>
          )}

          {step === 1 && renderStepOne()}
          {step === 2 && renderStepTwo()}
          {step === 3 && renderStepThree()}
          {step === 4 && renderStepFour()}
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

export default AcolyteForgotPassword;
