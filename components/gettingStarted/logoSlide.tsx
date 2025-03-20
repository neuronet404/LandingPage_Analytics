"use client";
import Image from "next/image";
import Logo from "../../public/acolytelogo.svg";
import { ArrowLeftIcon, ArrowRightIcon } from "lucide-react";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Title from "./title";
import Slide2 from "./slide-2";
import Slide3 from "./slide-3";
import Slide4 from "./slide-4";
import Slide5 from "./slide-5";
import GettingStarted from "./gettingStarted";
import useUserId from "@/hooks/useUserId";
import { parseCookies } from "nookies";
import Loading from "./loading";

export default function LogoSlide() {
  const router = useRouter();
  const [cookies, setCookies] = useState({});

  useEffect(() => {
    // Read cookies only on the client side
    setCookies(parseCookies());
  }, []);
  const [selectedSubject, setSelectedSubject] = useState<string[]>([]);
  const [selectedExam, setSelectedExam] = useState<string[]>([]);
  const [customExam, setCustomExam] = useState("");
  const [selectedCollege, setSelectedCollege] = useState("");
  const [email, setEmail] = useState("");
  const userId = useUserId();
  const [selectOptions, setSelectOptions] = useState({
    slide1: true,
    slide2: false,
    slide3: false,
    slide4: false,
    slide5: false,
  });
  const [isSyncing, setisSyncing] = useState(false)

  const [intro, setIntro] = useState(true);

  const [fullName, setFullName] = useState("");

  useEffect(() => {
    if (typeof window !== "undefined") {
      setFullName(localStorage.getItem("fullName") || "");
    }
  }, []);

  // Function to update slides
  const updateSlide = (newSlide) => {
    setSelectOptions({
      slide1: newSlide === 1,
      slide2: newSlide === 2,
      slide3: newSlide === 3,
      slide4: newSlide === 4,
      slide5: newSlide === 5,
    });
  };

  // Get current active slide
  const activeSlide = Object.values(selectOptions).indexOf(true) + 1;

  // Handle Next Button
  const handleNext = () => {
    if (activeSlide < 5) {
      updateSlide(activeSlide + 1);
    }
  };

  // Handle Previous Button
  const handlePrev = () => {
    if (activeSlide > 1) {
      updateSlide(activeSlide - 1);
    }
  };

  async function updateUserPreference() {
    const url = `${process.env.NEXT_PUBLIC_AUTH_URL}/userPreference`;
    const payload = {
      user_id: userId,
      userName: cookies?.userName,
      email: cookies?.userEmail,
      College: selectedCollege,
      PendingUser: "Yes",
      toughestSubject: selectedSubject,
      examPrepare: selectedExam,
      setup_completed: true,
      fullName: fullName,
    };
    setisSyncing(true)

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
      router.push("/dashboard");

      return data;
    } catch (error) {
      console.error("Error:", error.message);
    }
    finally {
      setisSyncing(false)
    }
  }

  // Handle Dashboard Navigation
  const handleDashboardRedirect = async () => {
    await updateUserPreference();
  };

  useEffect(() => {
    // Start timeout
    const introTime = setTimeout(() => setIntro(false), 2000);

    // Cleanup function to clear timeout on unmount
    return () => clearTimeout(introTime);
  }, []);

  return (
    <div className="flex flex-col items-center ">
      {/* Carousel content */}
      {isSyncing && <div className="z-10 absolute inset-0 flex items-center justify-center h-screen w-full bg-gray-900/30 backdrop-blur-md">
        <Loading />
      </div>}

      {intro ? (
        <GettingStarted />
      ) : (
        <div
          className="grid grid-cols-1 grid-rows-5 justify-center  items-center
                    bg-white p-4 lg:w-[57rem] lg:h-[27rem] md:w-[37rem]
                    gap-3 md:h-[27rem] mx-auto  relative"
        >
          <div className=" row-span-3 flex justify-center mt-3 animate-scale-down col-span-1 items-center">
            <Image
              src={Logo}
              height={150}
              width={150}
              alt="waving hand w-28 h-28"
            />
          </div>

          <div className="w-full  col-span-1 ">
            {selectOptions.slide1 && <Title />}
            {selectOptions.slide2 && (
              <Slide2
                selectedSubject={selectedSubject}
                setSelectedSubject={setSelectedSubject}
              />
            )}
            {selectOptions.slide3 && (
              <Slide3
                customExam={customExam}
                setCustomExam={setCustomExam}
                selectedExam={selectedExam}
                setSelectedExam={setSelectedExam}
              />
            )}
            {selectOptions.slide5 && (
              <Slide4 email={email} setEmail={setEmail} />
            )}
            {selectOptions.slide4 && (
              <Slide5
                selectedCollege={selectedCollege}
                setSelectedCollege={setSelectedCollege}
              />
            )}
          </div>

          <div className="text-violet-600 absolute z-40 bottom-0 flex justify-between pb-3 w-full col-span-1">
            {/* Previous Button */}
            <button
              className={`flex items-center pl-3 ${activeSlide === 1 ? "opacity-50 cursor-not-allowed" : ""
                }`}
              onClick={handlePrev}
              disabled={activeSlide === 1}
            >
              <ArrowLeftIcon className="w-5 h-5" /> <p>Previous</p>
            </button>

            {/* Next Button or Welcome Button */}
            {activeSlide === 5 ? (
              <button
                className="flex pr-3 text-white bg-purple-600 px-4 py-1 rounded-lg "
                onClick={handleDashboardRedirect}
              >
                <p>Welcome to Acolyte</p>{" "}
                <ArrowRightIcon className="w-5 h-5 ml-1" />
              </button>
            ) : (
              <button className="flex pr-3 items-center" onClick={handleNext}>
                <p>Next</p> <ArrowRightIcon className="w-5 h-5" />
              </button>
            )}
          </div>

          {/* Navigation Dots - Completely outside the carousel */}
          {!intro && (
            <div className="flex w-full justify-center gap-10 mb-8 absolute -bottom-36 col-span-1 items-center">
              <div
                className={`w-5 h-5 bg-gray-400 rounded-full active:w-7 active:bg-purple-500 transition-all ${selectOptions.slide1 ? "w-7 bg-purple-500" : ""
                  }`}
                onClick={() => {
                  setSelectOptions({
                    slide1: true,
                    slide2: false,
                    slide3: false,
                    slide4: false,
                    slide5: false,
                  });
                }}
              ></div>
              <div
                className={`w-5 h-5 bg-gray-400 rounded-full active:w-7 active:bg-purple-500 transition-all ${selectOptions.slide2 ? "w-7 bg-purple-500" : ""
                  }`}
                onClick={() => {
                  setSelectOptions({
                    slide1: false,
                    slide2: true,
                    slide3: false,
                    slide4: false,
                    slide5: false,
                  });
                }}
              ></div>
              <div
                className={`w-5 h-5 bg-gray-400 rounded-full active:w-7 active:bg-purple-500 transition-all ${selectOptions.slide3 ? "w-7 bg-purple-500" : ""
                  }`}
                onClick={() => {
                  setSelectOptions({
                    slide1: false,
                    slide2: false,
                    slide3: true,
                    slide4: false,
                    slide5: false,
                  });
                }}
              ></div>
              <div
                className={`w-5 h-5 bg-gray-400 rounded-full active:w-7 active:bg-purple-500 transition-all ${selectOptions.slide4 ? "w-7 bg-purple-500" : ""
                  }`}
                onClick={() => {
                  setSelectOptions({
                    slide1: false,
                    slide2: false,
                    slide3: false,
                    slide4: true,
                    slide5: false,
                  });
                }}
              ></div>
              <div
                className={`w-5 h-5 bg-gray-400 rounded-full active:w-7 active:bg-purple-500 transition-all ${selectOptions.slide5 ? "w-7 bg-purple-500" : ""
                  }`}
                onClick={() => {
                  setSelectOptions({
                    slide1: false,
                    slide2: false,
                    slide3: false,
                    slide4: false,
                    slide5: true,
                  });
                }}
              ></div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}