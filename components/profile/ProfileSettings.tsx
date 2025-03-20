"use client";
import React, { useEffect, useState } from "react";
import { ChevronDown, Search, Check } from "lucide-react";
import { destroyCookie, parseCookies } from "nookies";
import { useRouter } from "next/navigation";
import useUserId from "@/hooks/useUserId";
import {
  changePassword,
  getUserPreference,
  updateUserPreference,
} from "../auth/SignIn";
import { deleteAllTodosFromDB } from "@/db/Todo";
import { clearPdfData } from "@/db/pdf/pdfFiles";
import { clearCanvasData } from "@/db/pdf/pdfAnnotations";
import { clearFileSystem } from "@/db/pdf/fileSystem";
import {
  MultiSelector,
  MultiSelectorContent,
  MultiSelectorInput,
  MultiSelectorItem,
  MultiSelectorList,
  MultiSelectorTrigger,
} from "../ui/extension/multi-select";
import { subjectOptions, colleges, examOptions } from "@/constants";

interface UserProfile {
  user_id: string;
  userName: string;
  email: string;
  College: string;
  PendingUser: string;
  toughestSubject: string;
  examPrepare: string;
  setup_completed: boolean;
}

const ProfileSettings = () => {
  const [cookies, setCookies] = useState({});
  const userId = useUserId();
  const [userData, setUserData] = useState<UserProfile>();
  const [selectedSubjects, setSelectedSubjects] = useState<string[]>([]);
  const [selectedExams, setSelectedExams] = useState<string[]>([]);
  const [isEditing, setIsEditing] = useState(false);
  const [selectedCollege, setSelectedCollege] = useState("");
  const [showCollegeDropdown, setShowCollegeDropdown] = useState(false);
  const [collegeSearchTerm, setCollegeSearchTerm] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [fullName, setFullName] = useState("");

  // Password change related states
  const [passwordData, setPasswordData] = useState({
    oldPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [passwordSuccessMessage, setPasswordSuccessMessage] = useState("");
  const [passwordErrorMessage, setPasswordErrorMessage] = useState("");
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [passwordValidationErrors, setPasswordValidationErrors] = useState({
    oldPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const router = useRouter();

  useEffect(() => {
    // Read cookies only on the client side
    setCookies(parseCookies());
  }, []);

  const getUserProfile = async (): Promise<UserProfile | null> => {
    if (!userId) return null;
    try {
      const data: UserProfile = await getUserPreference(userId);
      setUserData(data.data);

      // Initialize form data and selections based on user data
      if (data.data) {
        setSelectedCollege(data.data.College || "");
        setFullName(data.data.fullName);
        console.log(data);

        // Parse exam interests if it's a string
        if (data.data.examPrepare) {
          try {
            const examInterests =
              typeof data.data.examPrepare === "string"
                ? JSON.parse(data.data.examPrepare)
                : data.data.examPrepare;

            if (Array.isArray(examInterests)) {
              setSelectedExams(examInterests);
            } else {
              setSelectedExams([data.data.examPrepare.toString()]);
            }
          } catch (e) {
            // If parsing fails, treat it as a single string
            setSelectedExams([data.data.examPrepare.toString()]);
          }
        }

        // Parse toughest subjects if it's a string
        if (data.data.toughestSubject) {
          try {
            const subjects =
              typeof data.data.toughestSubject === "string"
                ? JSON.parse(data.data.toughestSubject)
                : data.data.toughestSubject;

            if (Array.isArray(subjects)) {
              setSelectedSubjects(subjects);
            } else {
              setSelectedSubjects([data.data.toughestSubject.toString()]);
            }
          } catch (e) {
            // If parsing fails, treat it as a single string
            setSelectedSubjects([data.data.toughestSubject.toString()]);
          }
        }
      }

      return data;
    } catch (error) {
      console.error("Error fetching user profile:", error);
      return null;
    }
  };

  useEffect(() => {
    if (!userId) return;
    getUserProfile();
  }, [userId]);

  const handleLogout = async () => {
    const cookieOptions = { path: "/" }; // Ensure it matches how cookies were set

    destroyCookie(null, "authToken", cookieOptions);
    destroyCookie(null, "accessToken", cookieOptions);
    destroyCookie(null, "refreshToken", cookieOptions);
    destroyCookie(null, "userSub", cookieOptions);
    destroyCookie(null, "userName", cookieOptions);
    destroyCookie(null, "emailVerified", cookieOptions);
    destroyCookie(null, "userEmail", cookieOptions);

    console.log("Cookies after logout:", parseCookies()); // Debugging

    await deleteAllTodosFromDB();
    await clearPdfData();
    await clearCanvasData();
    await clearFileSystem();

    router.push("/auth/signin"); // Redirect to login
  };

  const handleSaveProfile = async () => {
    if (!userId) return;

    setIsSaving(true);
    try {
      // Make a copy of userData to avoid mutation
      const updatedProfile = {
        ...(userData || {}), // Handle case where userData might be undefined
        College: selectedCollege,
        examPrepare: JSON.stringify(selectedExams),
        toughestSubject: JSON.stringify(selectedSubjects),
      };

      await updateUserPreference(
        userId,
        cookies?.userName,
        cookies?.userEmail,
        selectedCollege,
        selectedSubjects,
        selectedExams,

        fullName
      );

      setUserData(updatedProfile);
      setIsEditing(false);
      setSuccessMessage("Profile updated successfully");

      // Hide success message after 3 seconds
      setTimeout(() => {
        setSuccessMessage("");
      }, 3000);
    } catch (error) {
      console.error("Error updating profile:", error);
    } finally {
      setIsSaving(false);
    }
  };

  // Password validation function
  const validatePasswordData = () => {
    const errors = {
      oldPassword: "",
      newPassword: "",
      confirmPassword: "",
    };
    let isValid = true;

    // Validate old password
    if (!passwordData.oldPassword.trim()) {
      errors.oldPassword = "Current password is required";
      isValid = false;
    }

    // Validate new password
    if (!passwordData.newPassword.trim()) {
      errors.newPassword = "New password is required";
      isValid = false;
    } else if (passwordData.newPassword.length < 8) {
      errors.newPassword = "Password must be at least 8 characters long";
      isValid = false;
    } else if (!/(?=.*[A-Z])/.test(passwordData.newPassword)) {
      errors.newPassword =
        "Password must contain at least one uppercase letter";
      isValid = false;
    } else if (!/(?=.*[0-9])/.test(passwordData.newPassword)) {
      errors.newPassword = "Password must contain at least one number";
      isValid = false;
    } else if (!/(?=.*[!@#$%^&*])/.test(passwordData.newPassword)) {
      errors.newPassword =
        "Password must contain at least one special character (!@#$%^&*)";
      isValid = false;
    }

    // Validate password confirmation
    if (!passwordData.confirmPassword.trim()) {
      errors.confirmPassword = "Please confirm your new password";
      isValid = false;
    } else if (passwordData.newPassword !== passwordData.confirmPassword) {
      errors.confirmPassword = "Passwords don't match";
      isValid = false;
    }

    setPasswordValidationErrors(errors);
    return isValid;
  };

  // Improved password change handler
  const handlePasswordChange = async (e) => {
    e.preventDefault();

    // Clear previous messages
    setPasswordSuccessMessage("");
    setPasswordErrorMessage("");

    // Validate form
    if (!validatePasswordData()) {
      return;
    }

    setIsChangingPassword(true);

    try {
      // Call the changePassword function with proper parameters
      await changePassword(
        cookies?.accessToken,
        passwordData.oldPassword,
        cookies?.accessToken,
        passwordData.oldPassword,
        passwordData.newPassword
      );

      // Show success message
      setPasswordSuccessMessage("Password updated successfully");

      // Reset password fields
      setPasswordData({
        oldPassword: "",
        newPassword: "",
        confirmPassword: "",
      });

      // Clear success message after 3 seconds
      setTimeout(() => {
        setPasswordSuccessMessage("");
      }, 3000);
    } catch (error) {
      console.error("Error changing password:", error);
      setPasswordErrorMessage("Failed to update password. Please Login again.");
    } finally {
      setIsChangingPassword(false);
    }
  };

  const filteredColleges = collegeSearchTerm
    ? colleges.filter((college) =>
        college.toLowerCase().includes(collegeSearchTerm.toLowerCase())
      )
    : colleges;

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-8 h-full">
      {/* Profile Card Section */}
      <div className="bg-white dark:bg-[#444444] rounded-xl shadow-lg p-6 space-y-6">
        <div className="flex items-center justify-between border-b border-gray-100 dark:border-gray-700 pb-6">
          <h1 className="text-2xl font-semibold text-purple-700 dark:text-purple-300">
            Welcome, {cookies?.userName || "User"}
          </h1>
          <div className="space-x-3">
            <button
              className="px-4 py-2 bg-purple-700 dark:bg-purple-600 text-white rounded-lg hover:bg-purple-800 dark:hover:bg-purple-700 transition-colors"
              onClick={() => setIsEditing(!isEditing)}
            >
              {isEditing ? "Cancel" : "Edit Profile"}
            </button>
            <button
              className="px-4 py-2 bg-rose-600 dark:bg-rose-600 text-white rounded-lg hover:bg-rose-500 dark:hover:bg-rose-500 transition-colors"
              onClick={handleLogout}
            >
              Log out
            </button>
          </div>
        </div>

        {successMessage && (
          <div className="bg-green-100 dark:bg-green-900 border border-green-200 dark:border-green-700 text-green-800 dark:text-green-200 p-3 rounded-lg flex items-center">
            <Check className="w-5 h-5 mr-2" /> {successMessage}
          </div>
        )}

        <div className="flex items-center space-x-4 bg-gray-50 dark:bg-[#262626] p-4 rounded-lg">
          <div
            className="flex items-center p-1 hover:bg-sky-800 dark:hover:bg-sky-800
                     rounded-full transition-all duration-200 cursor-pointer"
          >
            {/* Placeholder for profile picture */}
            <span className="flex items-center justify-center text-lg font-medium text-white bg-blue-500 rounded-full w-10 h-10 bg-sky-400">
              {cookies?.userName
                ? cookies.userName.substring(0, 2).toUpperCase()
                : "U"}
            </span>
          </div>
          <div>
            <h2 className="text-lg font-medium text-gray-900 dark:text-gray-200">
              {cookies?.userName || "User Name"}
            </h2>
            <p className="text-gray-500 dark:text-gray-400">
              {cookies?.userEmail || "user@example.com"}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">
                Full Name*
              </label>
              {isEditing ? (
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => {
                    console.log(e.target.value);
                    setFullName(e.target.value);
                  }}
                  placeholder="Your Full Name"
                  className="w-full p-3 rounded-lg border border-gray-200 dark:border-gray-600 dark:bg-[#262626] dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                />
              ) : (
                <input
                  type="text"
                  value={fullName || ""}
                  placeholder="Your Full Name"
                  disabled
                  className="w-full p-3 rounded-lg border border-gray-200 dark:border-gray-600 dark:bg-[#262626] dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all disabled:opacity-70 disabled:cursor-not-allowed"
                />
              )}
            </div>
            <div>
              <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">
                College
              </label>
              {isEditing ? (
                <div className="relative">
                  <div
                    className="w-full p-3 rounded-lg border border-gray-200 dark:border-gray-600 dark:bg-[#262626] dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all flex justify-between items-center cursor-pointer"
                    onClick={() => setShowCollegeDropdown(!showCollegeDropdown)}
                  >
                    <span>{selectedCollege || "Select your college"}</span>
                    <ChevronDown className="w-5 h-5 text-gray-400 dark:text-gray-300" />
                  </div>

                  {showCollegeDropdown && (
                    <div
                      id="college-dropdown"
                      className="absolute z-10 mt-1 w-full bg-white dark:bg-[#333333] border border-gray-200 dark:border-gray-600 rounded-lg shadow-lg max-h-60 overflow-auto"
                    >
                      <div className="p-2 sticky top-0 bg-white dark:bg-[#333333]">
                        <div className="relative">
                          <Search className="absolute left-3 top-3 w-4 h-4 text-gray-400 dark:text-gray-300" />
                          <input
                            type="text"
                            placeholder="Search colleges..."
                            value={collegeSearchTerm}
                            onChange={(e) =>
                              setCollegeSearchTerm(e.target.value)
                            }
                            className="w-full p-3 pl-10 rounded-lg border border-gray-200 dark:border-gray-600 dark:bg-[#262626] dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                          />
                        </div>
                      </div>
                      <div>
                        {filteredColleges.map((college, index) => (
                          <div
                            key={index}
                            className="p-3 hover:bg-purple-50 dark:hover:bg-purple-900 cursor-pointer"
                            onClick={() => {
                              setSelectedCollege(college);
                              setShowCollegeDropdown(false);
                              setCollegeSearchTerm(""); // Clear search term after selection
                            }}
                          >
                            {college}
                          </div>
                        ))}
                        {filteredColleges.length === 0 && (
                          <div className="p-3 text-gray-500 dark:text-gray-400 text-center">
                            No colleges found
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <input
                  type="text"
                  value={userData?.College || ""}
                  placeholder="Your College Name"
                  disabled
                  className="w-full p-3 rounded-lg border border-gray-200 dark:border-gray-600 dark:bg-[#262626] dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all disabled:opacity-70 disabled:cursor-not-allowed"
                />
              )}
            </div>
          </div>
          <div className="space-y-4">
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">
                  Exams You're Preparing For
                </label>

                {isEditing ? (
                  <MultiSelector
                    values={selectedExams}
                    onValuesChange={setSelectedExams}
                    loop={false}
                  >
                    <MultiSelectorTrigger
                      className="w-full border border-gray-200
                   dark:border-gray-600
                  dark:bg-[#262626] dark:text-white rounded-lg shadow-sm"
                    >
                      <div className="flex items-center w-full justify-between">
                        <div className="flex items-center">
                          <Search className="h-4 w-4 text-gray-400 mr-2" />
                          <MultiSelectorInput placeholder="Select exams..." />
                        </div>
                        <ChevronDown
                          size={18}
                          className="text-purple-600 ml-2"
                        />
                      </div>
                    </MultiSelectorTrigger>
                    <MultiSelectorContent className="max-h-60 overflow-auto z-50">
                      <MultiSelectorList>
                        {examOptions.map((exam, i) => (
                          <MultiSelectorItem
                            key={i}
                            value={exam.value}
                            className="p-3 hover:bg-purple-50 dark:hover:bg-purple-900"
                          >
                            {exam.label}
                          </MultiSelectorItem>
                        ))}
                      </MultiSelectorList>
                    </MultiSelectorContent>
                  </MultiSelector>
                ) : (
                  <input
                    type="text"
                    value={
                      Array.isArray(selectedExams)
                        ? selectedExams.join(", ")
                        : userData?.examPrepare || ""
                    }
                    placeholder="No exams selected"
                    disabled
                    className="w-full p-3 rounded-lg border border-gray-200 dark:border-gray-600 dark:bg-[#262626] dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all disabled:opacity-70 disabled:cursor-not-allowed"
                  />
                )}
              </div>

              <div>
                <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">
                  Toughest Subjects
                </label>

                {isEditing ? (
                  <MultiSelector
                    values={selectedSubjects}
                    onValuesChange={setSelectedSubjects}
                    loop={false}
                  >
                    <MultiSelectorTrigger className="w-full border border-gray-200 dark:border-gray-600 dark:bg-[#262626] dark:text-white rounded-lg shadow-sm">
                      <div className="flex items-center w-full justify-between">
                        <div className="flex items-center">
                          <Search className="h-4 w-4 text-gray-400 mr-2" />
                          <MultiSelectorInput placeholder="Select toughest subjects..." />
                        </div>
                        <ChevronDown
                          size={18}
                          className="text-purple-600 ml-2"
                        />
                      </div>
                    </MultiSelectorTrigger>
                    <MultiSelectorContent className="max-h-60 overflow-auto z-50">
                      <MultiSelectorList>
                        {subjectOptions.map((subject, i) => (
                          <MultiSelectorItem
                            key={i}
                            value={subject.value}
                            className="p-3 hover:bg-purple-50 dark:hover:bg-purple-900"
                          >
                            {subject.label}
                          </MultiSelectorItem>
                        ))}
                      </MultiSelectorList>
                    </MultiSelectorContent>
                  </MultiSelector>
                ) : (
                  <input
                    type="text"
                    value={
                      Array.isArray(selectedSubjects)
                        ? selectedSubjects.join(", ")
                        : userData?.toughestSubject || ""
                    }
                    placeholder="No subjects selected"
                    disabled
                    className="w-full p-3 rounded-lg border border-gray-200 dark:border-gray-600 dark:bg-[#262626] dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all disabled:opacity-70 disabled:cursor-not-allowed"
                  />
                )}
              </div>
            </div>
          </div>
        </div>

        {isEditing && (
          <div className="flex justify-end mt-6">
            <button
              className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-70 disabled:cursor-not-allowed"
              onClick={handleSaveProfile}
              disabled={isSaving}
            >
              {isSaving ? "Saving..." : "Save Changes"}
            </button>
          </div>
        )}
      </div>

      {/* Password Settings Section */}
      <div className="bg-white dark:bg-[#444444] rounded-xl shadow-lg p-6 space-y-6">
        <div className="flex items-center justify-between border-b border-gray-100 dark:border-gray-700 pb-6">
          <h2 className="text-xl font-medium text-gray-900 dark:text-gray-200">
            Password Settings
          </h2>
        </div>

        <form onSubmit={handlePasswordChange} className="space-y-4">
          {passwordSuccessMessage && (
            <div className="bg-green-100 dark:bg-green-900 border border-green-200 dark:border-green-700 text-green-800 dark:text-green-200 p-3 rounded-lg flex items-center">
              <Check className="w-5 h-5 mr-2" /> {passwordSuccessMessage}
            </div>
          )}

          {passwordErrorMessage && (
            <div className="bg-red-100 dark:bg-red-900 border border-red-200 dark:border-red-700 text-red-800 dark:text-red-200 p-3 rounded-lg">
              {passwordErrorMessage}
            </div>
          )}

          <div>
            <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">
              Current Password
            </label>
            <input
              type="password"
              placeholder="Enter current password"
              value={passwordData.oldPassword}
              onChange={(e) =>
                setPasswordData({
                  ...passwordData,
                  oldPassword: e.target.value,
                })
              }
              className={`w-full p-3 rounded-lg border ${
                passwordValidationErrors.oldPassword
                  ? "border-red-500 dark:border-red-500"
                  : "border-gray-200 dark:border-gray-600"
              } dark:bg-[#262626] dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all`}
            />
            {passwordValidationErrors.oldPassword && (
              <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                {passwordValidationErrors.oldPassword}
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">
              New Password
            </label>
            <input
              type="password"
              placeholder="Enter new password"
              value={passwordData.newPassword}
              onChange={(e) =>
                setPasswordData({
                  ...passwordData,
                  newPassword: e.target.value,
                })
              }
              className={`w-full p-3 rounded-lg border ${
                passwordValidationErrors.newPassword
                  ? "border-red-500 dark:border-red-500"
                  : "border-gray-200 dark:border-gray-600"
              } dark:bg-[#262626] dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all`}
            />
            {passwordValidationErrors.newPassword && (
              <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                {passwordValidationErrors.newPassword}
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">
              Confirm New Password
            </label>
            <input
              type="password"
              placeholder="Confirm new password"
              value={passwordData.confirmPassword}
              onChange={(e) =>
                setPasswordData({
                  ...passwordData,
                  confirmPassword: e.target.value,
                })
              }
              className={`w-full p-3 rounded-lg border ${
                passwordValidationErrors.confirmPassword
                  ? "border-red-500 dark:border-red-500"
                  : "border-gray-200 dark:border-gray-600"
              } dark:bg-[#262626] dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all`}
            />
            {passwordValidationErrors.confirmPassword && (
              <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                {passwordValidationErrors.confirmPassword}
              </p>
            )}
          </div>

          <button
            type="submit"
            className="px-6 py-2 bg-green-600 dark:bg-green-700 text-white rounded-lg hover:bg-green-700 dark:hover:bg-green-800 transition-colors disabled:opacity-70 disabled:cursor-not-allowed"
            disabled={isChangingPassword}
          >
            {isChangingPassword ? "Updating..." : "Update Password"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default ProfileSettings;
