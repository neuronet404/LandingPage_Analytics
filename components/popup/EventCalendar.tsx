"use client";
import React, { useState, useEffect, useRef } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { motion, AnimatePresence } from "framer-motion";
import {
  Calendar as CalendarIcon,
  Paperclip,
  MoreHorizontal,
} from "lucide-react";
import { fetchTodosFromDB } from "@/db/Todo";

// Todo Component
const TodoItem = ({ todo }) => {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.9 }}
      transition={{ duration: 0.2 }}
      className="bg-white dark:bg-[#262626] rounded-2xl p-4 pl-5 mb-3 shadow-sm w-full h-auto min-h-[150px] relative"
    >
      <div className="flex justify-between items-start mb-2">
        <span
          className={`px-2 py-1 rounded-full text-xs ${todo.priority === "High"
            ? "bg-[#FFE2E5] text-[#D8727D]"
            : "bg-[#FFF5E9] text-[#D58D49]"
            }`}
        >
          {todo.priority}
        </span>
        <div className="relative">
          <button
            className="text-gray-400 hover:text-gray-600"
            onClick={() => setMenuOpen(!menuOpen)}
          >
            <MoreHorizontal size={16} />
          </button>
          {menuOpen && (
            <div className="absolute top-6 right-0 bg-white shadow-lg rounded-xl p-2 z-10">
              <button
                className="block w-full text-left px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg"
                onClick={() => {
                  setMenuOpen(false);
                }}
              >
                Edit
              </button>
              <button
                className="block w-full text-left px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg"
                onClick={() => {
                  setMenuOpen(false);
                }}
              >
                Delete
              </button>
            </div>
          )}
        </div>
      </div>

      <h3 className="font-semibold text-gray-800 text-md mb-1 dark:text-white">
        {todo.title}
      </h3>
      <p className="text-gray-500 text-xs mb-4">{todo.description}</p>

      <div className="flex items-center gap-2 justify-between">
        <div className="flex -space-x-2">
          {[...Array(todo.collaborators || 2)].map((_, i) => (
            <img
              key={i}
              className="w-4 h-4 rounded-full bg-gray-200 border-2 border-white"
              src={
                "https://images.unsplash.com/photo-1599566150163-29194dcaad36?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=3387&q=80"
              }
              alt={""}
            />
          ))}
        </div>
        <div className="flex items-center gap-3 text-gray-500 text-[10px]">
          <div className="flex items-center gap-1">
            <CalendarIcon size={14} />
            <span className="">
              Due:{" "}
              {(() => {
                const date = new Date(todo.dueDate);
                const day = date.getDate();
                const month = date.getMonth() + 1; // Months are zero-based
                const year = date.getFullYear();
                let hours = date.getHours();
                const minutes = date.getMinutes();
                const ampm = hours >= 12 ? "PM" : "AM";

                // Convert 24-hour format to 12-hour format
                hours = hours % 12 || 12;

                // Format the output string
                return `${day}/${month}/${year} ${hours}:${minutes < 10 ? "0" + minutes : minutes
                  } ${ampm}`;
              })()}
            </span>
          </div>
          <div className="flex items-center gap-0.5">
            <Paperclip size={14} />
            <span>{todo.files || 2} files</span>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

const EventCalendar = () => {
  const [date, setDate] = useState(new Date());
  const [todos, setTodos] = useState([]);
  const [selectedDay, setSelectedDay] = useState(null);
  const calendarRef = useRef(null);
  const popoverRef = useRef(null);

  // Function to navigate to previous month
  const goToPreviousMonth = () => {
    setDate(new Date(date.getFullYear(), date.getMonth() - 1, 1));
    setSelectedDay(null); // Reset selected day when changing months
  };

  // Function to navigate to next month
  const goToNextMonth = () => {
    setDate(new Date(date.getFullYear(), date.getMonth() + 1, 1));
    setSelectedDay(null); // Reset selected day when changing months
  };

  // Function to navigate to current month
  const goToCurrentMonth = () => {
    setDate(new Date());
    setSelectedDay(null); // Reset selected day when changing months
  };



  useEffect(() => {
    // Fetch todos from IndexDB when component mounts
    const fetchTodos = async () => {
      try {
        // Replace with actual fetchTodosFromDB call in production
        const data = await fetchTodosFromDB();
        setTodos(data);
        console.log(data);

        // Using sample data for now
        // setTodos(sampleTodos);
      } catch (error) {
        console.error("Error fetching todos:", error);
      }
    };

    fetchTodos();
  }, []);

  // Click outside handler for popover
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        popoverRef.current &&
        !popoverRef.current.contains(event.target) &&
        !event.target.closest(".calendar-day")
      ) {
        setSelectedDay(null);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Generate calendar grid (month view)
  const generateCalendarGrid = (currentDate) => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();

    // First day of the month
    const firstDay = new Date(year, month, 1);
    // Last day of the month
    const lastDay = new Date(year, month + 1, 0);

    // Starting day of the week (0 = Sunday, 1 = Monday, etc.)
    const startDay = firstDay.getDay();
    const daysInMonth = lastDay.getDate();

    // Create grid rows (weeks)
    const grid = [];
    let days = [];

    // Add empty cells for days before the first day of the month
    for (let i = 0; i < startDay; i++) {
      days.push(null);
    }

    // Add days of the month
    for (let i = 1; i <= daysInMonth; i++) {
      days.push(new Date(year, month, i));

      // Start a new week when we reach Sunday (0)
      if ((startDay + i) % 7 === 0) {
        grid.push(days);
        days = [];
      }
    }

    // Add empty cells for days after the last day of the month
    if (days.length > 0) {
      while (days.length < 7) {
        days.push(null);
      }
      grid.push(days);
    }

    return grid;
  };

  // Helper function to format date as YYYY-MM-DD
  const formatDate = (date) => {
    if (!date || !(date instanceof Date) || isNaN(date.getTime())) {
      return "";
    }
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  // Filter todos for a specific day
  const getTodosForDay = (day) => {
    if (!day) return [];

    const formattedDayDate = formatDate(day);

    return todos.filter((todo) => {
      // Check if todo.dueDate is a string
      if (typeof todo.dueDate !== "string") return false;

      // Parse the string date into a Date object
      const todoDate = new Date(todo.dueDate);
      if (isNaN(todoDate.getTime())) return false;

      return formatDate(todoDate) === formattedDayDate;
    });
  };

  // Get todos count for a specific day
  const getTodoCount = (day) => {
    return getTodosForDay(day).length;
  };

  // Check if a day has todos
  const hasTodos = (day) => {
    return getTodoCount(day) > 0;
  };

  // Handle day click to toggle popover
  const handleDayClick = (day) => {
    if (!day) return;

    // Toggle selected day - if clicking the same day, close the popover
    if (selectedDay && formatDate(selectedDay) === formatDate(day)) {
      setSelectedDay(null);
    } else {
      setSelectedDay(day);
    }
  };

  return (
    <div className="w-full mx-auto" ref={calendarRef}>
      <Card className="border shadow-md">
        <CardHeader className="pb-0">
          <div className="flex items-center justify-between">
            <button
              onClick={goToPreviousMonth}
              className="p-2 rounded-full hover:bg-gray-100"
              aria-label="Previous month"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M15 18l-6-6 6-6" />
              </svg>
            </button>

            <div className="flex flex-col items-center">
              <h2 className="text-lg font-semibold">
                {date.toLocaleDateString(undefined, {
                  month: "long",
                  year: "numeric",
                })}
              </h2>
              <button
                onClick={goToCurrentMonth}
                className="text-xs text-blue-600 hover:underline mt-1"
              >
                Today
              </button>
            </div>

            <button
              onClick={goToNextMonth}
              className="p-2 rounded-full hover:bg-gray-100"
              aria-label="Next month"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M9 18l6-6-6-6" />
              </svg>
            </button>
          </div>
        </CardHeader>
        <CardContent>
          <table className="w-full border-collapse">
            <thead>
              <tr>
                <th className="p-2 border-b text-center">Sun</th>
                <th className="p-2 border-b text-center">Mon</th>
                <th className="p-2 border-b text-center">Tue</th>
                <th className="p-2 border-b text-center">Wed</th>
                <th className="p-2 border-b text-center">Thu</th>
                <th className="p-2 border-b text-center">Fri</th>
                <th className="p-2 border-b text-center">Sat</th>
              </tr>
            </thead>
            <tbody>
              {generateCalendarGrid(date).map((week, weekIndex) => (
                <tr key={weekIndex}>
                  {week.map((day, dayIndex) => {
                    if (!day) {
                      return (
                        <td
                          key={dayIndex}
                          className="p-2 border text-center"
                        ></td>
                      );
                    }

                    const formattedDate = formatDate(day);
                    const isToday = formatDate(new Date()) === formattedDate;
                    const isSelected =
                      selectedDay && formatDate(selectedDay) === formattedDate;
                    const hasTodosToday = hasTodos(day);
                    const todoCount = getTodoCount(day);

                    return (
                      <td
                        key={dayIndex}
                        className={`calendar-day relative p-1 border text-center h-16 align-top cursor-pointer ${isToday ? "bg-gray-100 dark:bg-gray-500" : ""
                          } ${isSelected ? "bg-blue-100" : ""} ${hasTodosToday ? "bg-blue-50 text-blue-800" : ""
                          }`}
                        onClick={() => handleDayClick(day)}
                        id={`day-${formattedDate}`}
                      >
                        <div className="font-medium">{day.getDate()}</div>
                        {todoCount > 0 && (
                          <div className="mt-1 text-[10px] font-medium text-blue-700">
                            {todoCount} {todoCount === 1 ? "task" : "tasks"}
                          </div>
                        )}

                        {/* Day-specific popover that appears directly below each calendar cell */}
                        {isSelected && (
                          <div
                            className="absolute left-0 mt-1 bg-white dark:bg-gray-500 rounded-lg shadow-xl z-50 w-64 p-3 border border-gray-200"
                            style={{
                              top: "100%",
                              zIndex: 100,
                            }}
                          >
                            <div className="text-sm font-semibold mb-2">
                              {day.toLocaleDateString(undefined, {
                                weekday: "long",
                                month: "short",
                                day: "numeric",
                              })}
                            </div>
                            {getTodosForDay(day).length > 0 ? (
                              <div className="space-y-2 ">
                                {getTodosForDay(day).map((todo) => (
                                  <div
                                    key={todo.id}
                                    className="p-2 bg-blue-50 rounded-md"
                                  >
                                    <div className="font-medium text-sm">
                                      {todo.title}
                                    </div>
                                    <div className="text-xs text-gray-500">
                                      {todo.time}
                                    </div>
                                  </div>
                                ))}
                              </div>
                            ) : (
                              <p className="text-center py-2 text-xs text-gray-500 dark:bg-gray-500">
                                No tasks for this day
                              </p>
                            )}
                          </div>
                        )}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </CardContent>
      </Card>

      {/* Detailed popover shown at the bottom of the calendar */}
      {/* <AnimatePresence>
        {selectedDay && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="mt-4 bg-transparent rounded-lg   overflow-auto"
            ref={popoverRef}
          >
            <div className="p-4 max-h-96 overflow-y-auto ">
              {getTodosForDay(selectedDay).length > 0 ? (
                <div className="space-y-3">
                  {getTodosForDay(selectedDay).map((todo) => (
                    <TodoItem key={todo.id} todo={todo} />
                  ))}
                </div>
              ) : (
                <p className="text-center py-4 text-gray-500">
                  No tasks for this day
                </p>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence> */}
    </div>
  );
};

export default EventCalendar;
