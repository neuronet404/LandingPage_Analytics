"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { navItems } from "@/constants";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { useRouter } from "next/navigation";
import acolyteLogo from "@/public/assets/images/acolytelogo.svg";
import { getFileSystem } from "@/db/pdf/fileSystem";
import { AnimatePresence, motion } from "framer-motion";
import PdfFile from "@/public/assets/icons/file-pdf.svg";
import FileNote from "@/public/assets/icons/notes.svg";
import { Plus } from "lucide-react";
import FolderTree1 from "./FolderTree-1";
import ChatButton from "./chat/chat-button";
import { useSettings } from "@/context/SettingsContext";

interface Props {
  fullName: string;
  avatar: string;
  email: string;
  className?: string;
}

const dropdownVariants = {
  hidden: {
    opacity: 0,
    height: 0,
    transition: { duration: 0.2, ease: "easeInOut" },
  },
  visible: {
    opacity: 1,
    height: "auto",
    transition: { duration: 0.2, ease: "easeInOut" },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: -5 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.05, duration: 0.2, ease: "easeOut" },
  }),
};

export function Sidebar({ fullName, avatar, email, className }: Props) {
  const pathname = usePathname();
  const [selectedMenu, setSelectedMenu] = useState("home");
  const [hoveredItem, setHoveredItem] = useState<string | null>(null);
  const [folders, setFolders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isOpen, setIsOpen] = useState(false);
  const [fileType, setFileType] = useState<"note" | "pdf" | undefined>();
  const [isdarkMode, setIsdarkMode] = useState(false)
  const { isDarkMode, globalDarkMode, setglobalDarkMode } = useSettings()
  const router = useRouter();

  useEffect(() => {
    const fetchFolders = async () => {
      try {
        const data = await getFileSystem();
        const formattedData = formatFolderStructure(data);
        setFolders(formattedData);
        console.log(formattedData);
      } catch (error) {
        console.error("Error fetching folders:", error);
      } finally {
        setLoading(false);
      }
    };
    const savedTheme = localStorage.getItem("theme");
    console.log(savedTheme)
    if (savedTheme === "dark") {
      setIsdarkMode(true)
    } else {
      setIsdarkMode(false)
    }


    fetchFolders();
  }, []);


  useEffect(() => {
    const savedTheme = localStorage.getItem("theme");
    console.log(savedTheme)
    if (savedTheme === "dark") {
      setIsdarkMode(true)
    } else {
      setIsdarkMode(false)
    }
  }, [globalDarkMode])

  const formatFolderStructure = (data: any[]) => {
    const folderMap: any = {};
    const rootFolders: any[] = [];

    data.forEach((item) => {
      folderMap[item.id] = {
        ...item,
        isOpen: false,
        isActive: false,
        files: [],
      };
    });

    data.forEach((item) => {
      if (item.parentId) {
        folderMap[item.parentId].files.push(folderMap[item.id]);
      } else {
        rootFolders.push(folderMap[item.id]);
      }
    });

    return rootFolders;
  };

  const getRecentFiles = (type: "note" | "pdf") => {
    const allFiles: any[] = [];
    const traverseFolder = (folder: any) => {
      folder.files.forEach((file: any) => {
        if (
          file.type === "file" &&
          file.fileType === (type === "pdf" ? "pdf" : "note")
        ) {
          allFiles.push(file);
        }
        if (file.files && file.files.length > 0) {
          traverseFolder(file);
        }
      });
    };

    folders.forEach(traverseFolder);
    return allFiles.slice(0, 3);
  };

  const handelOpenDocs = (route: string) => {
    router.push(route);
  };

  const renderDropdownItems = (type: "note" | "pdf") => {
    const recentFiles = getRecentFiles(type);
    return (
      <motion.div
        initial="hidden"
        animate="visible"
        exit="hidden"
        variants={dropdownVariants}
        className="overflow-hidden"
      >
        <div className="ml-8 mt-1 space-y-1">
          <div
            className="flex items-center justify-start gap-2 px-3 py-2 text-sm text-gray-600 hover:bg-gray-50 rounded-lg cursor-pointer"
            onClick={() => {
              setIsOpen(true);
              setFileType(type);
            }}
          >
            <Plus className="w-4 h-4" />
            Create New
          </div>

          {recentFiles.map((file, index) => (
            <motion.div key={file.id} custom={index} variants={itemVariants}>
              <div
                className="flex items-center gap-2 px-3 py-2 text-sm text-gray-600 hover:bg-gray-50 rounded-lg cursor-pointer"
                onClick={() => {
                  handelOpenDocs(
                    `/${type === "pdf" ? "pdfnote" : "note"}/${file.id}`
                  );
                }}
              >
                <Image
                  className="w-4 h-4 dark:filter dark:brightness-0 dark:invert"
                  src={type === "pdf" ? PdfFile : FileNote}
                  alt={type === "pdf" ? "PDF File" : "Note File"}
                />
                <span className="truncate">{file.name}</span>
              </div>
            </motion.div>
          ))}
          <motion.div custom={recentFiles.length} variants={itemVariants}>
            <div
              onClick={() => {
                handelOpenDocs(
                  `/dashboard/${type === "pdf" ? "pdf" : "notes"}`
                );
              }}
              className="flex items-center gap-2 px-3 py-2 text-sm text-purple-600 hover:bg-gray-50 rounded-lg cursor-pointer"
            >
              <span>View All</span>
            </div>
          </motion.div>
        </div>
      </motion.div>
    );
  };

  if (loading) {
    return (
      <div className="sidebar max-h-[80vh] md:mt-10 dark:bg-[#262626] "></div>
    );
  }

  return (
    <aside className={`sidebar max-h-[80vh] md:mt-6 dark:bg-[#262626] `}>
      <nav>
        <ul className="flex flex-1 flex-col gap-2 border-b overflow-hidden">
          {navItems.map(({ url, name, icon_light, icon_dark }) => (
            <div
              key={name}
            // onMouseEnter={() => setHoveredItem(name)}
            // onMouseLeave={() => setHoveredItem(null)}
            >
              <div
                onClick={() => {
                  router.push(url);
                  console.log(url)
                }}
                className="lg:w-full cursor-pointer"
              >
                <li
                  className={cn(
                    "sidebar-nav-item",
                    pathname === url && `bg-violet-500 `
                  )}
                >
                  <Image
                    src={pathname === url ? icon_light : icon_dark}
                    alt={name}
                    width={24}
                    height={24}
                    className={cn(
                      `${pathname === url ? "" : ""}`,
                      pathname === url && ""
                    )}
                  />
                  <p
                    className={cn(
                      "hidden lg:block dark:text-[#FFFFFF]",
                      pathname === url && "text-white"
                    )}
                  >
                    {name}
                  </p>
                </li>
              </div>
              {/* <AnimatePresence>
                {hoveredItem === name &&
                  (name === "My Notes"
                    ? renderDropdownItems("note")
                    : name === "My PDF"
                    ? renderDropdownItems("pdf")
                    : null)}
              </AnimatePresence> */}
            </div>
          ))}
        </ul>
        <div className="mt-8 h-full w-full ">
          <FolderTree1 />
        </div>
      </nav>

      {/* Profile section moved to the bottom
      <div className="absolute bottom-0 w-full">
        <Link href="/profile">
          <div className="sidebar-user-info ">
            <Image
              src={avatarPlaceholderUrl}
              alt="Avatar"
              width={44}
              height={44}
              className="sidebar-user-avatar"
            />
            <div className="hidden lg:block">
              <p className="subtitle-2 capitalize">{fullName}</p>
              <p className="caption">{email}</p>
            </div>
          </div>
        </Link>
      </div> */}
    </aside>
  );
}


// previous upadted , with icons depends on the theme

// export function Sidebar({ fullName, avatar, email, className }: Props) {
//   const pathname = usePathname();
//   const [selectedMenu, setSelectedMenu] = useState("home");
//   const [hoveredItem, setHoveredItem] = useState<string | null>(null);
//   const [folders, setFolders] = useState<any[]>([]);
//   const [loading, setLoading] = useState(true);
//   const [isOpen, setIsOpen] = useState(false);
//   const [fileType, setFileType] = useState<"note" | "pdf" | undefined>();
//   const [isdarkMode, setIsdarkMode] = useState(false)
//   const {isDarkMode,globalDarkMode, setglobalDarkMode} = useSettings()
//   const router = useRouter();

//   useEffect(() => {
//     const fetchFolders = async () => {
//       try {
//         const data = await getFileSystem();
//         const formattedData = formatFolderStructure(data);
//         setFolders(formattedData);
//         console.log(formattedData);
//       } catch (error) {
//         console.error("Error fetching folders:", error);
//       } finally {
//         setLoading(false);
//       }
//     };
//     const savedTheme = localStorage.getItem("theme");
//     console.log(savedTheme)
//     if(savedTheme === "dark"){
//       setIsdarkMode(true)
//     }else{
//       setIsdarkMode(false)
//     }


//     fetchFolders();
//   }, []);


//   useEffect(()=>{
//     const savedTheme = localStorage.getItem("theme");
//     console.log(savedTheme)
//     if(savedTheme === "dark"){
//       setIsdarkMode(true)
//     }else{
//       setIsdarkMode(false)
//     }
//   },[globalDarkMode])

//   const formatFolderStructure = (data: any[]) => {
//     const folderMap: any = {};
//     const rootFolders: any[] = [];

//     data.forEach((item) => {
//       folderMap[item.id] = {
//         ...item,
//         isOpen: false,
//         isActive: false,
//         files: [],
//       };
//     });

//     data.forEach((item) => {
//       if (item.parentId) {
//         folderMap[item.parentId].files.push(folderMap[item.id]);
//       } else {
//         rootFolders.push(folderMap[item.id]);
//       }
//     });

//     return rootFolders;
//   };

//   const getRecentFiles = (type: "note" | "pdf") => {
//     const allFiles: any[] = [];
//     const traverseFolder = (folder: any) => {
//       folder.files.forEach((file: any) => {
//         if (
//           file.type === "file" &&
//           file.fileType === (type === "pdf" ? "pdf" : "note")
//         ) {
//           allFiles.push(file);
//         }
//         if (file.files && file.files.length > 0) {
//           traverseFolder(file);
//         }
//       });
//     };

//     folders.forEach(traverseFolder);
//     return allFiles.slice(0, 3);
//   };

//   const handelOpenDocs = (route: string) => {
//     router.push(route);
//   };

//   const renderDropdownItems = (type: "note" | "pdf") => {
//     const recentFiles = getRecentFiles(type);
//     return (
//       <motion.div
//         initial="hidden"
//         animate="visible"
//         exit="hidden"
//         variants={dropdownVariants}
//         className="overflow-hidden"
//       >
//         <div className="ml-8 mt-1 space-y-1">
//           <div
//             className="flex items-center justify-start gap-2 px-3 py-2 text-sm text-gray-600 hover:bg-gray-50 rounded-lg cursor-pointer"
//             onClick={() => {
//               setIsOpen(true);
//               setFileType(type);
//             }}
//           >
//             <Plus className="w-4 h-4" />
//             Create New
//           </div>

//           {recentFiles.map((file, index) => (
//             <motion.div key={file.id} custom={index} variants={itemVariants}>
//               <div
//                 className="flex items-center gap-2 px-3 py-2 text-sm text-gray-600 hover:bg-gray-50 rounded-lg cursor-pointer"
//                 onClick={() => {
//                   handelOpenDocs(
//                     `/${type === "pdf" ? "pdfnote" : "note"}/${file.id}`
//                   );
//                 }}
//               >
//                 <Image
//                   className="w-4 h-4 dark:filter dark:brightness-0 dark:invert"
//                   src={type === "pdf" ? PdfFile : FileNote}
//                   alt={type === "pdf" ? "PDF File" : "Note File"}
//                 />
//                 <span className="truncate">{file.name}</span>
//               </div>
//             </motion.div>
//           ))}
//           <motion.div custom={recentFiles.length} variants={itemVariants}>
//             <div
//               onClick={() => {
//                 handelOpenDocs(
//                   `/dashboard/${type === "pdf" ? "pdf" : "notes"}`
//                 );
//               }}
//               className="flex items-center gap-2 px-3 py-2 text-sm text-purple-600 hover:bg-gray-50 rounded-lg cursor-pointer"
//             >
//               <span>View All</span>
//             </div>
//           </motion.div>
//         </div>
//       </motion.div>
//     );
//   };

//   if (loading) {
//     return (
//       <div className="sidebar max-h-[80vh] md:mt-10 dark:bg-[#262626] "></div>
//     );
//   }

//   return (
//     <aside className={`sidebar max-h-[80vh] md:mt-6 dark:bg-[#262626] `}>
//       <nav>
//         <ul className="flex flex-1 flex-col gap-2 border-b overflow-hidden">
//           {navItems.map(({ url, name, icon_light,icon_dark }) => (
//             <div
//               key={name}
//               // onMouseEnter={() => setHoveredItem(name)}
//               // onMouseLeave={() => setHoveredItem(null)}
//             >
//               <div
//                 onClick={() => {
//                   router.push(url);
//                   console.log(url)
//                 }}
//                 className="lg:w-full cursor-pointer"
//               >
//                 <li
//                   className={cn(
//                     "sidebar-nav-item",
//                     pathname === url && "bg-[#818cf8] "
//                   )}
//                 >
//                   <Image
//                     src={!isdarkMode?icon_dark:icon_light}
//                     alt={name}
//                     width={24}
//                     height={24}
//                     className={cn(
//                       `${pathname === url?"invert":""}`,
//                       pathname === url && ""
//                     )}
//                   />
//                   <p
//                     className={cn(
//                       "hidden lg:block dark:text-[#FFFFFF]",
//                       pathname === url && "text-white"
//                     )}
//                   >
//                     {name}
//                   </p>
//                 </li>
//               </div>
//               {/* <AnimatePresence>
//                 {hoveredItem === name &&
//                   (name === "My Notes"
//                     ? renderDropdownItems("note")
//                     : name === "My PDF"
//                     ? renderDropdownItems("pdf")
//                     : null)}
//               </AnimatePresence> */}
//             </div>
//           ))}
//         </ul>
//         <div className="mt-8 h-full w-full ">
//           <FolderTree1 />
//         </div>
//       </nav>

//       {/* Profile section moved to the bottom
//       <div className="absolute bottom-0 w-full">
//         <Link href="/profile">
//           <div className="sidebar-user-info ">
//             <Image
//               src={avatarPlaceholderUrl}
//               alt="Avatar"
//               width={44}
//               height={44}
//               className="sidebar-user-avatar"
//             />
//             <div className="hidden lg:block">
//               <p className="subtitle-2 capitalize">{fullName}</p>
//               <p className="caption">{email}</p>
//             </div>
//           </div>
//         </Link>
//       </div> */}
//     </aside>
//   );
// }
