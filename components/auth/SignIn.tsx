"use client";
import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import Image from "next/image";
import { Eye, EyeOff } from "lucide-react";
import { destroyCookie, parseCookies, setCookie } from "nookies"; // Library to manage cookies
import axios from "axios";
import Loading from "@/app/loading";

export async function getUserPreference(userId) {
  const url = `${process.env.NEXT_PUBLIC_AUTH_URL}/getUserPreference/${userId}`;

  try {
    const response = await fetch(url, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error fetching user preference:", error);
    return null;
  }
}

export async function updateUserPreference(
  userId: string,
  userName: string,
  userEmail: string,
  selectedCollege: string,
  selectedSubjects: string[],
  selectedExams: string[],
  fullName: string
): Promise<any> {
  const url = `${process.env.NEXT_PUBLIC_AUTH_URL}/userPreference`;

  const payload = {
    user_id: userId,
    userName: userName,
    email: userEmail,
    College: selectedCollege,
    PendingUser: "Yes",
    toughestSubject: selectedSubjects,
    examPrepare: selectedExams,
    setup_completed: true,
    fullName,
  };

  try {
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || "Failed to update user preference");
    }

    console.log("Success:", data);
    return data;
  } catch (error) {
    console.error("Error:", (error as Error).message);
  }
}

// JavaScript function to call the Change Password Lambda function
export async function changePassword(accessToken, oldPassword, newPassword) {
  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_AUTH_URL}/changePassword`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({ accessToken, oldPassword, newPassword }),
      }
    );

    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.error || "Failed to change password");
    }

    return data;
  } catch (error) {
    console.error("Error changing password:", error);
    throw error;
  }
}

const AcolyteSignIn = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [email, setEmail] = useState("");
  const [error, setError] = useState(null);
  const router = useRouter();
  const [isSyncing, setisSyncing] = useState(false);

  async function checkUserSetup(userId) {
    const userData = await getUserPreference(userId);

    if (!userData || !userData.data) {
      console.error("User data not found or error fetching.");
      // return;
    }

    // Check if setup_completed is false or missing
    if (!userData?.data?.setup_completed) {
      // Redirect to Getting Started page
      router.push("/gettingStarted"); // Redirect to dashboard
    } else {
      // Redirect to Dashboard
      router.push("/dashboard"); // Redirect to dashboard
    }
  }

  const handleSignIn = async (e) => {
    e.preventDefault();
    setError(null);

    try {
      setisSyncing(true);
      // const response = await fetch(
      //   `${process.env.NEXT_PUBLIC_AUTH_URL}/signin`,
      //   {
      //     method: "POST",
      //     headers: { "Content-Type": "application/json" },
      //     body: JSON.stringify({ identifier: username, password }),
      //   }
      // );

      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_AUTH_URL}/signin`,
        {
          identifier: username,
          password,
        },
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      const data = await response.data;
      // Store tokens in cookies
      setCookie(null, "authToken", data.idToken, {
        maxAge: 60 * 60 * 24, // 1 day expiration
        path: "/", // Accessible throughout the app
        secure: true, // Only send in HTTPS
        httpOnly: false, // Set to `true` if handling on server-side only
      });

      setCookie(null, "accessToken", data.accessToken, {
        maxAge: 60 * 60 * 24,
        path: "/",
        secure: true,
        httpOnly: false,
      });

      setCookie(null, "refreshToken", data.refreshToken, {
        maxAge: 60 * 60 * 24 * 7, // 7 days
        path: "/",
        secure: true,
        httpOnly: false,
      });

      // Store user attributes in cookies
      setCookie(null, "userEmail", data.userAttributes.email, {
        maxAge: 60 * 60 * 24 * 7,
        path: "/",
        secure: true,
        httpOnly: false,
      });

      setCookie(null, "emailVerified", data.userAttributes.email_verified, {
        maxAge: 60 * 60 * 24 * 7,
        path: "/",
        secure: true,
        httpOnly: false,
      });

      setCookie(null, "userName", data.userAttributes.name, {
        maxAge: 60 * 60 * 24 * 7,
        path: "/",
        secure: true,
        httpOnly: false,
      });

      setCookie(null, "userSub", data.userAttributes.sub, {
        maxAge: 60 * 60 * 24 * 7,
        path: "/",
        secure: true,
        httpOnly: false,
      });

      checkUserSetup(data.userAttributes.sub);
    } catch (err: any) {
      console.log("err message!", err);
      setError(err?.response.data.error || err?.message);
      setisSyncing(false);
    } finally {
     
    }
  };

  const handleForgotPassword = async () => {
    if (!username) {
      setError("Please enter your username to request a password reset.");
      return;
    }


    try {
      setisSyncing(true);
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_AUTH_URL}/init-forgot-password`,
        {
          identifier: username,
        },
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      localStorage.setItem("username", email);
      router.push("/auth/forgotpassword");
      // setisSyncing(false);
    } catch (err: any) {
      setError(err?.response.data.error || err?.message);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center relative">
      <div className="absolute top-0 left-0 w-full h-32 bg-purple-700 rounded-b-[50%] opacity-10" />

      <Card className="w-full max-w-md mx-4 shadow-lg relative overflow-hidden border-none">
        <div className="absolute top-0 right-0 w-32 h-32 bg-green-300 rounded-bl-full opacity-20" />
        <div className="absolute bottom-0 left-0 w-40 h-40 bg-purple-300 rounded-tr-full opacity-20" />
        <CardContent className="pt-6 px-6 pb-8">
          <div className="flex justify-center mb-3">
            <Image src="/acolytelogo.svg" alt="logo" width={100} height={100} />
          </div>
          <h2 className="text-3xl font-bold text-center mb-2">Sign in</h2>
          <p className="text-center text-gray-500 mb-6">
            <span className="text-[14px]">New to Acolyte? </span>
            <span
              onClick={() => {
                router.push("/auth/signup");
              }}
              className="text-purple-500 underline font-medium cursor-pointer"
            >
              Sign up for free
            </span>
          </p>
          <form className="space-y-4" onSubmit={handleSignIn}>
            <div className="space-y-2">
              <Label htmlFor="text" className="text-[#9794AA]">
                Username or Email
              </Label>
              <Input
                id="email"
                type="text"
                placeholder="Enter your username or email"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password" className="text-[#9794AA]">
                Password
              </Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter your password"
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
              <div className="text-right">
                <button
                  type="button"
                  className="text-gray-500 text-sm"
                  onClick={handleForgotPassword}
                >
                  Forgot password?
                </button>
              </div>
            </div>
            <Button
              type="submit"
              className="w-full bg-purple-700 hover:bg-purple-800"
            >
              Sign in
            </Button>
          </form>
          {error && (
            <p className="text-red-500 text-sm mt-2 text-gray-600 dark:text-gray-200 text-center">
              {error}
            </p>
          )}
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

export default AcolyteSignIn;
