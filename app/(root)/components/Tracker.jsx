"use client";
import React from "react";
import { Area, ResponsiveContainer, Pie, Cell,Radar,RadarChart,PolarGrid,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  PolarAngleAxis, 
  PolarRadiusAxis,   Bar,

 BarChart
 } from "recharts";

import dynamic from "next/dynamic";

const LineChart = dynamic(
  () => import("recharts").then((mod) => mod.LineChart),
  { ssr: false }
);
const AreaChart = dynamic(
  () => import("recharts").then((mod) => mod.AreaChart),
  { ssr: false }
);
const PieChart = dynamic(() => import("recharts").then((mod) => mod.PieChart), {
  ssr: false,
});

const TrackerDashboard = () => {
  // Generate smooth wave-like data for subject activity
  const activityData = Array.from({ length: 50 }, (_, i) => ({
    name: i,
    value: Math.sin(i / 8) * 0.3 + Math.sin(i / 4) * 0.2 + 0.5,
  }));

  // Smoother trend data for small charts
  const trendData = Array.from({ length: 15 }, (_, i) => ({
    name: i,
    value: Math.sin(i / 5) * 0.15 + 0.85,
  }));

  return (
    <div className="w-full">
      <h1 className="text-2xl font-semibold text-emerald-700 mb-4">Tracker</h1>



      <div className="bg-[#ecf1f0] dark:bg-[#444444] w-full
       flex justify-center items-center rounded-xl p-6 relative">
        <div className="grid grid-cols-1 lg:grid-cols-[35%_65%] gap-6
        w-full max-w-7xl p-5 xl:grid-cols-[35%_65%]
        mr-6">
          <ConceptualUsage />
          <RightColumn trendData={trendData} activityData={activityData} />

          {/* <div className="absolute inset-0 bg-gray-900/50 backdrop-blur-sm z-10 rounded-lg flex items-center justify-center">
              <div className="text-center">
                <h3 className="text-3xl md:text-4xl font-bold text-white tracking-wider">
                The more you revise
                </h3>
                <p className="mt-1 text-gray-200 text-lg">
                the more insights you unlock.
                </p>
              </div>
            </div> */}
        </div>

      </div>
    </div>
  );
};

export default TrackerDashboard;

// const CircularProgress = () => {
//   const data = [
//     { name: "Completed", value: 75 }, // Progress value
//     { name: "Remaining", value: 25 }, // Remaining value
//   ];

//   const colors = ["#10b981", "#f3f4f6"]; // Green and gray

//   return (
//     <div style={{ transform: "rotate(-90deg)" }} className="relative">
//       <PieChart width={100} height={100} >
//         <Pie
//           data={data}
//           cx="50%"
//           cy="50%"
//           innerRadius={25}
//           outerRadius={38}
//           startAngle={90}
//           endAngle={450}
//           paddingAngle={0}
//           cornerRadius={10}
//           dataKey="value"
//           className="focus:outline-none"
//         >
//           {data.map((entry, index) => (
//             <Cell key={`cell-${index}`} fill={colors[index]} />
//           ))}
//         </Pie>
//       </PieChart>
//       {/* Percentage Text */}
//       <div
//         style={{
//           position: "absolute",
//           top: "50%",
//           left: "50%",
//           transform: "translate(-50%, -50%) rotate(90deg)",
//           fontSize: "14px",
//           fontWeight: "bold",
//           color: "#111827", // Dark gray
//         }}
//       >
//         <span className="dark:text-white">{`75%`} </span>
//       </div>
//     </div>
//   );
// };
const KnowledgeGapAnalysis = () => {
  // Sample data for the radar chart
  const knowledgeData = [
    { subject: "Physiology", value: 73 },
    { subject: "Biochemistry", value: 68 },
    { subject: "Pathology", value: 65 },
    { subject: "Pharmacology", value: 55 },
    { subject: "Microbiology", value: 70 },
    { subject: "Clinical Skills", value: 63 }
  ];

  return (
    <div className="w-full h-full">
      <ResponsiveContainer width="100%" height="100%">
        <RadarChart
          cx="50%"
          cy="50%"
          outerRadius="85%"
          data={knowledgeData}
        >
          <PolarGrid gridType="polygon" stroke="#444" strokeWidth={0.5} />
          <PolarAngleAxis
            dataKey="subject"
            tick={{ fill: "#9ca3af", fontSize: "7px" }}
            tickSize={3}
          />
          <Radar
            name="Knowledge"
            dataKey="value"
            stroke="#10b981"
            fill="#10b981"
            fillOpacity={0.4}
          />
        </RadarChart>
      </ResponsiveContainer>
    </div>
  );
};
function ConceptualUsage() {
  const data = [
    {
      label: "Cardiovascular Physiology",
      mastery: 68,
      examFreq: 92,
      efficiency: "Medium efficiency",
      color: "#EAB308", // Yellow
      warning: false,
      icon: "heart"
    },
    { 
      label: "Renal Pathology", 
      mastery: 44, 
      examFreq: 88, 
      efficiency: "Low efficiency",
      color: "#EF4444", // Red
      warning: true,
      icon: "kidney"
    },
    {
      label: "Neuroanatomy",
      mastery: 51,
      examFreq: 35,
      efficiency: "Medium efficiency",
      color: "#8B5CF6", // Purple
      warning: false,
      icon: "brain"
    },
    {
      label: "Immunology",
      mastery: 76,
      examFreq: 85,
      efficiency: "High efficiency",
      color: "#10B981", // Green
      warning: false,
      icon: "shield"
    },
    {
      label: "Pharmacology - Antibiotics",
      mastery: 39,
      examFreq: 56,
      efficiency: "Low efficiency",
      color: "#3B82F6", // Blue
      warning: true,
      icon: "pill"
    }];

  // Custom SVG icons for medical subjects
  const HeartIcon = () => (
    <div className="w-5 h-5 sm:w-6 sm:h-6 flex items-center justify-center">
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4 sm:w-5 sm:h-5 text-yellow-500">
        <path d="M11.645 20.91l-.007-.003-.022-.012a15.247 15.247 0 01-.383-.218 25.18 25.18 0 01-4.244-3.17C4.688 15.36 2.25 12.174 2.25 8.25 2.25 5.322 4.714 3 7.688 3A5.5 5.5 0 0112 5.052 5.5 5.5 0 0116.313 3c2.973 0 5.437 2.322 5.437 5.25 0 3.925-2.438 7.111-4.739 9.256a25.175 25.175 0 01-4.244 3.17 15.247 15.247 0 01-.383.219l-.022.012-.007.004-.003.001a.752.752 0 01-.704 0l-.003-.001z" />
      </svg>
    </div>
  );

  const KidneyIcon = () => (
    <div className="w-5 h-5 sm:w-6 sm:h-6 flex items-center justify-center">
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4 sm:w-5 sm:h-5 text-red-500">
        <path fillRule="evenodd" d="M7.5 6a4.5 4.5 0 119 0 4.5 4.5 0 01-9 0zM3.751 20.105a8.25 8.25 0 0116.498 0 .75.75 0 01-.437.695A18.683 18.683 0 0112 22.5c-2.786 0-5.433-.608-7.812-1.7a.75.75 0 01-.437-.695z" clipRule="evenodd" />
      </svg>
    </div>
  );

  const BrainIcon = () => (
    <div className="w-5 h-5 sm:w-6 sm:h-6 flex items-center justify-center">
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4 sm:w-5 sm:h-5 text-purple-500">
        <path d="M11.25 5.337c0-.355-.186-.676-.401-.959a1.647 1.647 0 01-.349-1.003c0-1.036 1.007-1.875 2.25-1.875S15 2.34 15 3.375c0 .369-.128.713-.349 1.003-.215.283-.401.604-.401.959 0 .332.278.598.61.578 1.91-.114 3.79-.342 5.632-.676a.75.75 0 01.878.645 49.17 49.17 0 01.376 5.452.657.657 0 01-.66.664c-.354 0-.675-.186-.958-.401a1.647 1.647 0 00-1.003-.349c-1.035 0-1.875 1.007-1.875 2.25s.84 2.25 1.875 2.25c.369 0 .713-.128 1.003-.349.283-.215.604-.401.959-.401.31 0 .557.262.534.571a48.774 48.774 0 01-.595 4.845.75.75 0 01-.61.61c-1.82.317-3.673.533-5.555.642a.58.58 0 01-.611-.581c0-.355.186-.676.401-.959.221-.29.349-.634.349-1.003 0-1.035-1.007-1.875-2.25-1.875s-2.25.84-2.25 1.875c0 .369.128.713.349 1.003.215.283.401.604.401.959a.641.641 0 01-.658.643 49.118 49.118 0 01-4.708-.36.75.75 0 01-.645-.878c.293-1.614.504-3.257.629-4.924A.53.53 0 005.337 15c-.355 0-.676.186-.959.401-.29.221-.634.349-1.003.349-1.036 0-1.875-1.007-1.875-2.25s.84-2.25 1.875-2.25c.369 0 .713.128 1.003.349.283.215.604.401.959.401a.656.656 0 00.659-.663 47.703 47.703 0 00-.31-4.82.75.75 0 01.83-.832c1.343.155 2.703.254 4.077.294a.64.64 0 00.657-.642z" />
      </svg>
    </div>
  );

  const ShieldIcon = () => (
    <div className="w-5 h-5 sm:w-6 sm:h-6 flex items-center justify-center">
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4 sm:w-5 sm:h-5 text-green-500">
        <path fillRule="evenodd" d="M12.516 2.17a.75.75 0 00-1.032 0 11.209 11.209 0 01-7.877 3.08.75.75 0 00-.722.515A12.74 12.74 0 002.25 9.75c0 5.942 4.064 10.933 9.563 12.348a.75.75 0 00.374 0c5.499-1.415 9.563-6.406 9.563-12.348 0-1.39-.223-2.73-.635-3.985a.75.75 0 00-.722-.516l-.143.001c-2.996 0-5.717-1.17-7.734-3.08zm3.094 8.016a.75.75 0 10-1.22-.872l-3.236 4.53L9.53 12.22a.75.75 0 00-1.06 1.06l2.25 2.25a.75.75 0 001.14-.094l3.75-5.25z" clipRule="evenodd" />
      </svg>
    </div>
  );

  const PillIcon = () => (
    <div className="w-5 h-5 sm:w-6 sm:h-6 flex items-center justify-center">
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4 sm:w-5 sm:h-5 text-blue-500">
        <path d="M11.25 3v4.046a3 3 0 00-4.277 4.204H1.5v-6A2.25 2.25 0 013.75 3h7.5zM12.75 3v4.011a3 3 0 014.239 4.239H22.5v-6A2.25 2.25 0 0020.25 3h-7.5zM22.5 12.75h-8.983a4.125 4.125 0 004.108 3.75.75.75 0 010 1.5 5.623 5.623 0 01-4.875-2.817V21h7.5a2.25 2.25 0 002.25-2.25v-6zM11.25 21v-5.817A5.623 5.623 0 016.375 18a.75.75 0 010-1.5 4.126 4.126 0 004.108-3.75H1.5v6A2.25 2.25 0 003.75 21h7.5z" />
        <path d="M11.085 10.354c.03.297.038.575.036.805a7.484 7.484 0 01-.805-.036c-.833-.084-1.677-.325-2.195-.843a1.5 1.5 0 012.122-2.12c.517.517.759 1.36.842 2.194zM12.877 10.354c-.03.297-.038.575-.036.805.23.002.508-.006.805-.036.833-.084 1.677-.325 2.195-.843A1.5 1.5 0 0013.72 8.16c-.518.518-.76 1.362-.843 2.194z" />
      </svg>
    </div>
  );

  const renderIcon = (iconType) => {
    switch (iconType) {
      case 'heart':
        return <HeartIcon />;
      case 'kidney':
        return <KidneyIcon />;
      case 'brain':
        return <BrainIcon />;
      case 'shield':
        return <ShieldIcon />;
      case 'pill':
        return <PillIcon />;
      default:
        return null;
    }
  };

  return (
    <div className="">
      <div className="bg-white dark:bg-[#262626] rounded-2xl p-6 shadow-lg h-full w-full mx-auto">
        <div className="mx-auto">
          <h2 className="text-xl text-gray-700 dark:text-[#FFFFFF] font-bold mb-6 text-center sm:text-left">
            Priority Study Topics         
          </h2>
          <div className="space-y-4 overflow-auto">
            {data.map((item, index) => (
              <div key={index} className="space-y-1">
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-2">
                    {renderIcon(item.icon)}
                    <span className="text-gray-700 lg:text-sm xl:text-md text-xs dark:text-[#FFFFFF] font-medium">
                      {item.label}
                    </span>
                  </div>
                  <span className="text-xs text-gray-500 dark:text-gray-400">
                    {item.examFreq}% exam frequency
                  </span>
                </div>
                
                <div className="flex gap-4 items-center">
                  <div className="h-2 bg-gray-100 dark:bg-gray-700 w-full rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{
                        width: `${item.mastery}%`,
                        backgroundColor: item.color,
                      }}
                    />
                  </div>

                  <span
                    style={{ color: item.color }}
                    className="lg:text-sm xl:text-md text-xs font-semibold"
                  >
                    {item.mastery}%
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
        {/* <div className="mt-6 text-gray-500 dark:text-gray-400 text-xs text-center sm:text-left">
          Based on your performance data and exam patterns
        </div> */}
      </div>
    </div>
  );
}

function RightColumn({ trendData, activityData }) {
  const trackerData = [
    { week: "12 wks out", yourProgress: 25, targetPath: 30 },
    { week: "10 wks out", yourProgress: 38, targetPath: 45 },
    { week: "8 wks out", yourProgress: 48, targetPath: 55 },
    { week: "6 wks out", yourProgress: 63, targetPath: 70 },
    { week: "4 wks out", yourProgress: 78, targetPath: 85 },
    { week: "2 wks out", yourProgress: 92, targetPath: 95 },
    { week: "Current", yourProgress: 96, targetPath: 100 }
  ];

  const customTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-gray-800 p-2 border border-gray-700 rounded-md text-xs">
          <p className="font-medium text-white">{`${label}`}</p>
          <p className="text-teal-400">{`Your Progress: ${payload[0].value}%`}</p>
          <p className="text-yellow-400">{`Target Path: ${payload[1].value}%`}</p>
        </div>
      );
    }
    return null;
  };
  
  const efficiencyData = [
    { day: "Mon", morning: 80, afternoon: 60, evening: 40 },
    { day: "Tue", morning: 85, afternoon: 65, evening: 45 },
    { day: "Wed", morning: 75, afternoon: 70, evening: 50 },
    { day: "Thu", morning: 90, afternoon: 75, evening: 55 },
    { day: "Fri", morning: 85, afternoon: 65, evening: 60 },
    { day: "Sat", morning: 70, afternoon: 80, evening: 65 },
    // { day: "Sun", morning: 75, afternoon: 85, evening: 45 }
  ];

  const customTooltip2 = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-gray-800 p-2 border border-gray-700 rounded-md text-xs">
          <p className="font-medium text-white mb-1">{`${label}`}</p>
          {payload.map((entry, index) => (
            <p 
              key={index} 
              style={{ color: entry.color }}
              className="flex justify-between gap-2"
            >
              <span>{entry.name === "morning" ? "Morning" : entry.name === "afternoon" ? "Afternoon" : "Evening"}</span>
              <span className="font-medium">{`${entry.value}%`}</span>
            </p>
          ))}
        </div>
      );
    }
    return null;
  };
  
  return (
    <div className="w-full">
      {/* First row with adjusted column widths */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-6 mb-6">
        {/* Cumulative Progress - 1 column width */}
        <div className="sm:col-span-1 bg-white dark:bg-[#262626] rounded-2xl pt-4 w-full h-[160px] shadow-lg">
  <h4 className="text-gray-700 mb-1 text-center font-bold lg:text-sm xl:text-md text-xs dark:text-[#FFFFFF]">
    Knowledge Analysis
  </h4>
  {/* The critical fix: setting a specific height for this container */}
  <div className="h-[120px] w-full">
    <KnowledgeGapAnalysis />
  </div>
</div>

        {/* Daily Study Efficiency Patterns - 3 columns width */}
        <div className="sm:col-span-3 bg-white dark:bg-[#262626] rounded-2xl p-4 shadow-lg w-full h-[160px]">
        <h4 className="text-gray-700 mb-1 text-center font-bold lg:text-sm xl:text-md text-xs dark:text-[#FFFFFF]">
        Daily Study Efficiency Patterns
          </h4>
          <div className="h-24 sm:h-24 md:h-24 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={efficiencyData}
                margin={{ top: 20, right: 10, left: -20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#444" vertical={false} />
                <XAxis 
                  dataKey="day" 
                  tick={{ fill: "#9ca3af", fontSize: 12 }} 
                  axisLine={{ stroke: "#444" }}
                  tickLine={{ stroke: "#444" }}
                />
                <YAxis 
                  tick={{ fill: "#9ca3af", fontSize: 12 }}
                  axisLine={{ stroke: "#444" }}
                  tickLine={{ stroke: "#444" }}
                  domain={[0, 100]}
                  ticks={[0, 25, 50, 75, 100]}
                />
                <Tooltip content={customTooltip2} />
                <Bar dataKey="morning" fill="#4ade80" name="morning" radius={[4, 4, 0, 0]} />
                <Bar dataKey="afternoon" fill="#fbbf24" name="afternoon" radius={[4, 4, 0, 0]} />
                <Bar dataKey="evening" fill="#f87171" name="evening" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Exam Readiness Tracker (Second row) */}
      <div className="bg-white dark:bg-[#262626] rounded-2xl p-4 shadow-lg w-full h-[240px]">
      <h4 className="text-gray-700 mb-1 text-center font-bold lg:text-sm xl:text-md text-xs dark:text-[#FFFFFF]">
      Exam Readiness Tracker
        </h4>
        <div className="h-[180px] w-full overflow-hidden">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={trackerData}
              margin={{ top: 5, right: 20, left: -20, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#444" vertical={false} />
              <XAxis 
                dataKey="week" 
                tick={{ fill: "#9ca3af", fontSize: 12 }} 
                axisLine={{ stroke: "#444" }}
                tickLine={{ stroke: "#444" }}
              />
              <YAxis 
                tick={{ fill: "#9ca3af", fontSize: 12 }} 
                axisLine={{ stroke: "#444" }}
                tickLine={{ stroke: "#444" }}
                domain={[0, 100]}
                ticks={[0, 25, 50, 75, 100]}
              />
              <Tooltip content={customTooltip} />
              <Legend 
                iconType="circle" 
                wrapperStyle={{ 
                  paddingTop: 5,
                  fontSize: 12
                }}
                formatter={(value) => {
                  return <span style={{ color: value === 'yourProgress' ? '#2DD4BF' : '#F59E0B' }}>
                    {value === 'yourProgress' ? 'Your Progress' : 'Target Path'}
                  </span>
                }}
              />
              <Line 
                type="monotone" 
                dataKey="yourProgress" 
                stroke="#2DD4BF" 
                strokeWidth={2}
                dot={{ r: 4, fill: "#2DD4BF", stroke: "#2DD4BF" }}
                activeDot={{ r: 6, fill: "#2DD4BF", stroke: "#fff" }}
                name="yourProgress"
              />
              <Line 
                type="monotone" 
                dataKey="targetPath" 
                stroke="#F59E0B" 
                strokeWidth={2} 
                strokeDasharray="5 5"
                dot={{ r: 4, fill: "#F59E0B", stroke: "#F59E0B" }}
                activeDot={{ r: 6, fill: "#F59E0B", stroke: "#fff" }}
                name="targetPath"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}

