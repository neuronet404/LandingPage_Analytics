"use client";
import { Button } from "@/components/ui/button";
import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import emojis from "@/public/emojis.svg";
import paperclip from "@/public/paperclip.svg";
import send from "@/public/send.svg";
import { MultiStepLoader } from "./Loader";
import Markdown from "react-markdown";
import SubjectFolders from "../chat/SubjectFolders";
import { useSettings } from "@/context/SettingsContext";
import FileUpload from "../pdf/file-upload-test";
import { getAllPdfIds, getPdfById } from "@/db/pdf/pdfFiles";
import { Cloud, RefreshCw, Trash2 } from "lucide-react";
import { Card, CardContent } from "../ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
} from "@radix-ui/react-select";
import { ComboBoxResponsive } from "./IndicesSelector";
import { getFileSystem } from "@/db/pdf/fileSystem";
import useUserId from "@/hooks/useUserId";
import Loading, { TrainLoading } from "@/app/loading";

interface Message {
  id: string;
  text: string;
  sender: "user" | "bot";
  name: string;
  avatar: string;
  time: string;
}
const statuses: Status[] = [
  {
    value: "1-500",
    label: "1-500",
  },
  {
    value: "501-1000",
    label: "501-1000",
  },
  {
    value: "1001-1500",
    label: "1001-1500",
  },
  {
    value: "1501-2000",
    label: "1501-2000",
  },
  {
    value: "2001-2500",
    label: "2001-2500",
  },
];

export const ChatMemoryService = {
  // Database configuration
  dbName: "chatMemoryDB",
  storeName: "chatHistory",
  version: 1,

  // Open IndexedDB connection
  openDB: () => {
    return new Promise<IDBDatabase>((resolve, reject) => {
      const request = indexedDB.open(
        ChatMemoryService.dbName,
        ChatMemoryService.version
      );

      request.onerror = (event) => {
        console.error("IndexedDB error:", event);
        reject("Error opening database");
      };

      request.onsuccess = (event) => {
        resolve((event.target as IDBOpenDBRequest).result);
      };

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;

        // Create object store if it doesn't exist
        if (!db.objectStoreNames.contains(ChatMemoryService.storeName)) {
          const store = db.createObjectStore(ChatMemoryService.storeName, {
            keyPath: "id",
          });

          // Create indexes for faster querying
          store.createIndex("userId", "userId", { unique: false });
          store.createIndex("timestamp", "timestamp", { unique: false });
        }
      };
    });
  },

  // Save chat history to IndexedDB with timestamp
  saveChat: async (docId: string | number, messages: Message[]) => {
    try {
      const userId = localStorage.getItem("currentUserId") || "anonymous";
      const key = `chat_${userId}_${docId}`;
      const timestamp = Date.now(); // Current timestamp in milliseconds

      const db = await ChatMemoryService.openDB();
      const tx = db.transaction(ChatMemoryService.storeName, "readwrite");
      const store = tx.objectStore(ChatMemoryService.storeName);

      // Store chat data with metadata
      await store.put({
        id: key,
        userId,
        docId,
        messages,
        timestamp,
      });

      return new Promise<void>((resolve, reject) => {
        tx.oncomplete = () => {
          db.close();
          resolve();
        };

        tx.onerror = (event) => {
          console.error("Transaction error:", event);
          db.close();
          reject("Error saving chat");
        };
      });
    } catch (error) {
      console.error("Error saving chat:", error);
    }
  },

  // Load chat history from IndexedDB
  loadChat: async (docId: string | number): Promise<Message[]> => {
    try {
      const userId = localStorage.getItem("currentUserId") || "anonymous";
      const key = `chat_${userId}_${docId}`;

      const db = await ChatMemoryService.openDB();
      const tx = db.transaction(ChatMemoryService.storeName, "readonly");
      const store = tx.objectStore(ChatMemoryService.storeName);

      return new Promise<Message[]>((resolve, reject) => {
        const request = store.get(key);

        request.onsuccess = (event) => {
          const result = (event.target as IDBRequest).result;
          db.close();

          if (!result) {
            resolve([]);
            return;
          }

          resolve(result.messages || []);
        };

        request.onerror = (event) => {
          console.error("Request error:", event);
          db.close();
          reject("Error loading chat");
        };

        tx.oncomplete = () => {
          db.close();
        };
      });
    } catch (error) {
      console.error("Error loading chat:", error);
      return [];
    }
  },

  // Clear chat history from IndexedDB
  clearChat: async (docId: string | number) => {
    try {
      const userId = localStorage.getItem("currentUserId") || "anonymous";
      const key = `chat_${userId}_${docId}`;

      const db = await ChatMemoryService.openDB();
      const tx = db.transaction(ChatMemoryService.storeName, "readwrite");
      const store = tx.objectStore(ChatMemoryService.storeName);

      return new Promise<void>((resolve, reject) => {
        const request = store.delete(key);

        request.onsuccess = () => {
          db.close();
          resolve();
        };

        request.onerror = (event) => {
          console.error("Delete error:", event);
          db.close();
          reject("Error clearing chat");
        };
      });
    } catch (error) {
      console.error("Error clearing chat:", error);
    }
  },

  // Get recent chat docIds sorted by timestamp (most recent first)
  getRecentChatDocIds: async (): Promise<(string | number)[]> => {
    try {
      const userId = localStorage.getItem("currentUserId") || "anonymous";

      const db = await ChatMemoryService.openDB();
      const tx = db.transaction(ChatMemoryService.storeName, "readonly");
      const store = tx.objectStore(ChatMemoryService.storeName);
      const userIndex = store.index("userId");

      return new Promise<(string | number)[]>((resolve, reject) => {
        const request = userIndex.getAll(userId);

        request.onsuccess = (event) => {
          const results = (event.target as IDBRequest).result || [];

          // Sort by timestamp (most recent first) and extract docIds
          const sortedDocIds = results
            .sort((a, b) => b.timestamp - a.timestamp)
            .map((item) => item.docId);

          db.close();
          resolve(sortedDocIds);
        };

        request.onerror = (event) => {
          console.error("Request error:", event);
          db.close();
          reject("Error fetching chat docIds");
        };
      });
    } catch (error) {
      console.error("Error fetching chat docIds:", error);
      return [];
    }
  },

  // Get recent chats with metadata (docId, timestamp, preview)
  getRecentChatsWithMetadata: async () => {
    try {
      const userId = localStorage.getItem("currentUserId") || "anonymous";

      const db = await ChatMemoryService.openDB();
      const tx = db.transaction(ChatMemoryService.storeName, "readonly");
      const store = tx.objectStore(ChatMemoryService.storeName);
      const userIndex = store.index("userId");

      return new Promise((resolve, reject) => {
        const request = userIndex.getAll(userId);

        request.onsuccess = (event) => {
          const results = (event.target as IDBRequest).result || [];

          // Extract metadata from each chat
          const chatsWithMetadata = results.map((item) => {
            const messages = item.messages || [];

            // Create a preview from the last message
            const lastMessage =
              messages.length > 0 ? messages[messages.length - 1] : null;
            const preview = lastMessage
              ? lastMessage.content.substring(0, 50) +
                (lastMessage.content.length > 50 ? "..." : "")
              : "Empty chat";

            return {
              docId: item.docId,
              timestamp: item.timestamp || Date.now(),
              preview,
              messageCount: messages.length,
            };
          });

          // Sort by timestamp (most recent first)
          const sortedChats = chatsWithMetadata.sort(
            (a, b) => b.timestamp - a.timestamp
          );

          db.close();
          resolve(sortedChats);
        };

        request.onerror = (event) => {
          console.error("Request error:", event);
          db.close();
          reject("Error fetching chats with metadata");
        };
      });
    } catch (error) {
      console.error("Error fetching chats with metadata:", error);
      return [];
    }
  },
};

type Status = {
  value: string;
  label: string;
};
export function ChatInterface({ id }: { id: string | number }) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [processing, setProcessing] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isExpanded, setIsExpanded] = useState(true);
  const [isPdfFound, setisPdfFound] = useState(false);
  const [isCloudSynced, setIsCloudSynced] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [indices, setIndices] = useState([]);
  const [selectedStatus, setSelectedStatus] = useState<Status | null>(null);
  const [isComposing, setIsComposing] = useState(false);
  const {
    setcurrentView,
    setcurrentDocumentId,
    currentDocumentId,
    setSyncPdfAnnotations,
    isTrainingProgress
  } = useSettings();
  const [isTrained, setIsTrained] = useState(false);
  const userId = useUserId();

  // API Endpoints for chat memory
  const API_BASE_URL =
    process.env.NEXT_PUBLIC_API_URL || "https://api.yourdomain.com";

  const CloudChatMemoryService = {
    // Save chat history to DynamoDB through Lambda
    saveChat: async (docId: string | number, messages: Message[]) => {
      try {
        if (!userId) return;

        const response = await fetch(`${API_BASE_URL}/dev/chat/save`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            userId: userId,
            docId: docId.toString(),
            messages,
          }),
        });

        if (!response.ok) {
          throw new Error("Failed to save chat to cloud");
        }

        setIsCloudSynced(true);
        return await response.json();
      } catch (error) {
        console.error("Error saving chat to cloud:", error);
        setIsCloudSynced(false);
      }
    },

    // Load chat history from DynamoDB through Lambda
    loadChat: async (docId: string | number): Promise<Message[]> => {
      try {
        if (!userId) return [];

        const response = await fetch(
          `${API_BASE_URL}/dev/chat/${userId}/${docId}`,
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
            },
          }
        );

        if (!response.ok) {
          if (response.status === 404) {
            return [];
          }
          throw new Error("Failed to load chat from cloud");
        }

        const data = await response.json();
        setIsCloudSynced(true);
        return data.messages || [];
      } catch (error) {
        console.error("Error loading chat from cloud:", error);
        setIsCloudSynced(false);
        return [];
      }
    },

    // Clear chat history from DynamoDB through Lambda
    clearChat: async (docId: string | number) => {
      try {
        if (!userId) return;

        const response = await fetch(
          `${API_BASE_URL}/dev/chat/${userId}/${docId}`,
          {
            method: "DELETE",
            headers: {
              "Content-Type": "application/json",
            },
          }
        );

        if (!response.ok) {
          throw new Error("Failed to clear chat from cloud");
        }

        return await response.json();
      } catch (error) {
        console.error("Error clearing chat from cloud:", error);
      }
    },
  };

  const check = async () => {
    const res = await getAllPdfIds(); // Fetch all PDF IDs
    const pdfFound = res.includes(id); // Check if currentDocumentId exists in the response
    setisPdfFound(pdfFound); // Update state based on the result
  };

  // Save user ID for memory storage
  useEffect(() => {
    if (userId) {
      localStorage.setItem("currentUserId", userId);
    }
  }, [userId]);

  // Load messages from both sources and merge them
  const loadMessages = async () => {
    try {
      setIsSyncing(true);

      // Load from IndexedDB first (faster local access)
      const localMessages = await ChatMemoryService.loadChat(id);

      // Then try to load from cloud
      const cloudMessages = await CloudChatMemoryService.loadChat(id);

      // Use the source with more messages or more recent timestamps
      if (cloudMessages.length > 0) {
        // If we have cloud messages, use them (they're the source of truth)
        setMessages(cloudMessages);

        // If there's a mismatch and local has different content, sync local with cloud
        if (JSON.stringify(localMessages) !== JSON.stringify(cloudMessages)) {
          await ChatMemoryService.saveChat(id, cloudMessages);
        }
      } else if (localMessages.length > 0) {
        // If only local messages exist, use them and sync to cloud
        setMessages(localMessages);
        // Upload local messages to cloud in background
        await CloudChatMemoryService.saveChat(id, localMessages);
      } else {
        // No messages found in either source
        setMessages([]);
      }

      setIsSyncing(false);
    } catch (error) {
      console.error("Error loading messages:", error);
      // Fallback to local messages if cloud fails
      const localMessages = await ChatMemoryService.loadChat(id);
      setMessages(localMessages);
      setIsSyncing(false);
    }
  };

  useEffect(() => {
    const isPdfTrained = async () => {
      try {
        const fileSystem = await getFileSystem();
        console.log(fileSystem);

        const findFile = (items) => {
          for (const item of items) {
            if (item.id === id) {
              setIsTrained(item.isTrained === true);
              setSyncPdfAnnotations(item.isSynced === true);
              return item.isTrained === true;
            }
            if (item.children) {
              const found = findFile(item.children);
              if (found !== null) return found;
            }
          }
          return false;
        };

        return findFile(fileSystem);
      } catch (error) {
        console.error("Failed to check if PDF is trained:", error);
        return false;
      }
    };

    isPdfTrained();
    setcurrentDocumentId(id);
    check();
    // Load messages when document ID changes
    loadMessages();
  }, [id,isTrainingProgress]);

  // Save messages to both local and cloud storage whenever they change
  useEffect(() => {
    const syncMessages = async () => {
      const res = await fetchIndices(userId);
      setIndices(res);
      if (messages.length > 0) {
        // Save to IndexedDB first (for offline capability)
        await ChatMemoryService.saveChat(id, messages);

        // Then save to cloud in background
        CloudChatMemoryService.saveChat(id, messages).catch((error) =>
          console.error("Background cloud sync failed:", error)
        );
      }
    };

    syncMessages();
  }, [messages, id]);

  useEffect(() => {
    setcurrentView("chat");
    if (id == "null") {
      setIsExpanded(true);
    } else {
      setIsExpanded(false);
    }
  }, [id]);

  const suggestions = [
    "What is the goal of the authors?",
    "What is the main issue discussed in the text?",
    'What is the "old implicit compact" mentioned in the text?',
    "Who are the authors of the text?",
  ];

  const userAvatar = "";
  const botAvatar =
    "https://via.placeholder.com/150/FF0000/FFFFFF?Text=Bot+Avatar";

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const delay = (ms: number) =>
    new Promise((resolve) => setTimeout(resolve, ms));

  const generateResponse = async () => {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_GENERATION_URL}/query`,
        {
          method: "POST",
          headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            bucket_name: "pdf-storage-bucket-myacolyte",
            user_id: userId,
            key: `${currentDocumentId}.pdf`,
            query_text: inputMessage,
            recreate_kb: false,
            model_id: "gpt-4o-mini",
          }),
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      const data = await response.json();
      console.log("Response:", data);

      return data;
    } catch (error) {
      console.error("Error generating response:", error);
    }
  };

  const getModelResponse = async (callback: (text: string) => void) => {
    setIsGenerating(true);

    const responseText = await generateResponse();
    setIsGenerating(false);
    console.log("responededTExt", responseText);

    const words = responseText?.content.split(" ");
    let generatedText = "";

    for (const word of words) {
      generatedText += word + " ";
      callback(generatedText.trim());
      await delay(25);
    }
  };

  const handleSendMessage = async () => {
    if (inputMessage.trim() === "") return;

    const userMessage: Message = {
      id: Date.now().toString(),
      text: inputMessage,
      sender: "user",
      name: "You",
      avatar: userAvatar,
      time: new Date().toLocaleTimeString(),
    };

    setMessages((prevMessages) => [...prevMessages, userMessage]);
    setInputMessage("");

    const botMessage: Message = {
      id: (Date.now() + 1).toString(), // Ensure unique ID
      text: "",
      sender: "bot",
      name: "Acolyte",
      avatar: botAvatar,
      time: new Date().toLocaleTimeString(),
    };

    setMessages((prevMessages) => [...prevMessages, botMessage]);

    await getModelResponse((updatedText) => {
      setMessages((prevMessages) =>
        prevMessages.map((msg) =>
          msg.id === botMessage.id ? { ...msg, text: updatedText } : msg
        )
      );
    });
  };

  const resetChat = async () => {
    // Clear messages from state
    setMessages([]);
    setInputMessage("");

    // Clear from both local and cloud storage
    await ChatMemoryService.clearChat(id);
    await CloudChatMemoryService.clearChat(id);
  };

  const fetchIndices = async (userId) => {
    if (!userId) return;
    try {
      // const response = await fetch(`http://localhost:3000/dev/fetchIndices?userId=${userId}`, {
      //   method: 'GET',
      // });

      // if (!response.ok) {
      //   throw new Error(`HTTP error! Status: ${response.status}`);
      // }

      const data = [1, 2, 3, 4, 5]; //await response.json();
      return data;
    } catch (error) {
      console.error("Error fetching indices:", error);
      return null;
    }
  };

  const forceCloudSync = async () => {
    setIsSyncing(true);
    try {
      // Push current messages to cloud
      await CloudChatMemoryService.saveChat(id, messages);
      setIsCloudSynced(true);
    } catch (error) {
      console.error("Force sync failed:", error);
      setIsCloudSynced(false);
    }
    setIsSyncing(false);
  };

  return (
    <div className="flex flex-1 flex-col items-center px-4 sm:px-8 md:px-14 h-screen bg-gradient-to-b from-[#F9FAFB] to-[#F0F2F5] dark:from-[#262626] dark:to-[#1A1A1A] relative">
      {true ? (
        <>
          <div className="flex flex-1 flex-col w-full h-full pt-10 max-w-[800px]">
            {/* Chat Messages */}

            {/* Messages Area with conditional button positioning */}
            <div className="flex-1 w-full max-w-[100rem] py-4 px-4 sm:px-6 md:px-8 overflow-y-auto no-scrollbar scrollbar-hide relative">
              {messages.length === 0 ? (
                <div className="flex flex-1 flex-col justify-center items-center px-4 md:px-8 h-full">
                  <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-rubik font-medium leading-tight mb-4 text-transparent bg-gradient-to-r from-[#8468D0] to-[#000000] bg-clip-text dark:from-[#D6B3FF] dark:to-[#FFFFFF]">
                    Hello, to be Doctor.
                  </h2>
                  <p className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-rubik font-medium mb-6 text-transparent bg-gradient-to-r from-[#010101] to-[#38A169] bg-clip-text dark:from-[#FFFFFF] dark:to-[#38A169]">
                    How can I be your companion
                  </p>

                  {/* Centered Compose Button - Added smooth animation */}
                  <div
                    className={`transition-all duration-500 ease-in-out ${
                      isComposing
                        ? "opacity-0 -translate-y-10 pointer-events-none"
                        : "opacity-100 translate-y-0"
                    }`}
                  >
                    <div className="flex h-[65px] md:h-[70px] lg:h-[76px] w-[90vw] max-w-[600px] px-5 py-3 bg-white rounded-2xl border border-[#a69ac7] shadow-md justify-between items-center dark:bg-[#333333] dark:border-gray-600 focus-within:border-purple-500 focus-within:ring-2 focus-within:ring-purple-200 dark:focus-within:ring-purple-900 transition-all">
                      <input
                        type="text"
                        placeholder="Type a new message here..."
                        className="text-gray-800 font-normal font-['Rubik'] leading-relaxed p-2 bg-transparent border-none outline-none flex-1 text-base md:text-lg w-full dark:text-gray-200 placeholder:text-gray-400 dark:placeholder:text-gray-500"
                        value={inputMessage}
                        onChange={(e) => setInputMessage(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            setIsComposing(true);
                            handleSendMessage();
                          }
                        }}
                        onClick={() => setIsComposing(false)}
                        disabled={!isTrained}
                      />

                      <div className="flex items-center gap-4">
                        <Button
                          onClick={() => {
                            setIsComposing(true);
                            handleSendMessage();
                          }}
                          disabled={inputMessage.trim() === ""}
                          className={`rounded-full p-2 ${
                            inputMessage.trim() === "" ? "" : ""
                          }
              transition-colors flex items-center justify-center`}
                        >
                          <Image
                            alt="send"
                            src={send}
                            width={20}
                            height={20}
                            className={
                              inputMessage.trim() === "" ? "opacity-50" : ""
                            }
                          />
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="space-y-6">
                  {messages.map((message, index) => (
                    <div
                      key={message.id}
                      className={`flex items-start gap-4 ${
                        message.sender === "user"
                          ? "flex-row-reverse"
                          : "flex-row"
                      } ${
                        index > 0 &&
                        messages[index - 1].sender === message.sender
                          ? "mt-2"
                          : "mt-6"
                      }`}
                    >
                      {/* Avatar */}
                      <div className="flex-shrink-0">
                        {message.sender !== "user" ? (
                          <div className="w-10 h-10 rounded-full bg-purple-700 flex items-center justify-center shadow-md dark:bg-purple-800">
                            <div className="text-white text-lg font-semibold">
                              ○
                            </div>
                          </div>
                        ) : (
                          <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center shadow-md dark:bg-gray-700">
                            <div className="text-gray-600 text-lg font-semibold dark:text-gray-300">
                              Y
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Message Content with Time */}
                      <div
                        className={`flex flex-col max-w-[80%] ${
                          message.sender === "user"
                            ? "items-end mr-2"
                            : "items-start ml-2"
                        }`}
                      >
                        {/* Sender Name and Time */}
                        <div
                          className={`text-xs text-gray-500 mb-1 ${
                            message.sender === "user"
                              ? "text-right"
                              : "text-left"
                          }`}
                        >
                          {message.sender === "user" ? "You" : "Acolyte"} •{" "}
                          {message.time}
                        </div>

                        {/* Message Bubble */}
                        <div
                          className={`rounded-2xl px-5 py-3 ${
                            message.sender === "user"
                              ? "bg-purple-700 text-white dark:bg-purple-600"
                              : "bg-white text-gray-800 dark:bg-gray-800 dark:text-gray-200 shadow-sm"
                          } font-rubik`}
                        >
                          <div className="prose prose-sm max-w-none dark:prose-invert">
                            <Markdown>{message.text}</Markdown>
                          </div>
                          {message.sender !== "user" &&
                            isGenerating &&
                            index === messages.length - 1 && (
                              <div className="shimmer text-start mt-2 flex items-center gap-1">
                                <span className="inline-block w-1.5 h-1.5 bg-current rounded-full animate-pulse"></span>
                                <span className="inline-block w-1.5 h-1.5 bg-current rounded-full animate-pulse delay-75"></span>
                                <span className="inline-block w-1.5 h-1.5 bg-current rounded-full animate-pulse delay-150"></span>
                              </div>
                            )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Input Section with Clear Chat Button - Fixed at bottom when messages exist */}
            <div className="w-full px-4 pb-6 max-w-[100rem] mt-auto">
              <div className="flex flex-col w-full gap-3">
                {messages.length > 0 && (
                  <div className="flex justify-between items-center w-full px-2">
                    <div className="flex items-center gap-2">
                      <div className="text-xs text-gray-500 italic">
                        {messages.length} messages in this conversation
                      </div>
                      {/* Cloud sync status indicator */}
                      <div className="flex items-center">
                        {isSyncing ? (
                          <span className="flex items-center text-xs text-blue-500">
                            <RefreshCw className="h-3 w-3 mr-1 animate-spin" />
                            Syncing...
                          </span>
                        ) : isCloudSynced ? (
                          <span className="flex items-center text-xs text-green-500">
                            <Cloud className="h-3 w-3 mr-1" />
                            Synced
                          </span>
                        ) : (
                          <button
                            onClick={forceCloudSync}
                            className="flex items-center text-xs text-orange-500 hover:text-orange-600"
                          >
                            <Cloud className="h-3 w-3 mr-1" />
                            Sync now
                          </button>
                        )}
                      </div>
                    </div>
                    <Button
                      onClick={resetChat}
                      variant="outline"
                      size="sm"
                      className="flex items-center gap-1 text-xs text-gray-500 hover:text-red-500 hover:border-red-300 transition-colors"
                    >
                      <Trash2 />
                      Clear History
                    </Button>
                  </div>
                )}
                {/* Bottom Input - Enhanced with smooth transitions */}
                {(messages.length > 0 || isComposing === true) && (
                  <div
                    className={`flex h-[65px] md:h-[70px] lg:h-[76px] w-full px-5 py-3 bg-white rounded-2xl border border-[#a69ac7] shadow-md justify-between items-center dark:bg-[#333333] dark:border-gray-600 focus-within:border-purple-500 focus-within:ring-2 focus-within:ring-purple-200 dark:focus-within:ring-purple-900 transition-all duration-500 ease-in-out ${
                      messages.length === 0 && isComposing
                        ? "opacity-100 transform translate-y-0"
                        : ""
                    }`}
                    style={{
                      opacity: messages.length === 0 && isComposing ? 1 : 1,
                      transform: `translateY(${
                        messages.length === 0 && isComposing ? "0" : "0"
                      })`,
                      animation:
                        messages.length === 0 && isComposing
                          ? "slideInUp 0.5s ease-out forwards"
                          : "none",
                    }}
                  >
                    <input
                      type="text"
                      placeholder="Type a new message here..."
                      className="text-gray-800 font-normal font-['Rubik'] leading-relaxed p-2 bg-transparent border-none outline-none flex-1 text-base md:text-lg w-full dark:text-gray-200 placeholder:text-gray-400 dark:placeholder:text-gray-500"
                      value={inputMessage}
                      onChange={(e) => setInputMessage(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          handleSendMessage();
                        }
                      }}
                      disabled={!isTrained}
                    />

                    <div className="flex items-center gap-4">
                      <Button
                        onClick={handleSendMessage}
                        disabled={inputMessage.trim() === ""}
                        className={`rounded-full p-2 ${
                          inputMessage.trim() === ""
                            ? "bg-gray-200 text-gray-400 dark:bg-gray-700 dark:text-gray-500"
                            : " text-white"
                        }
            transition-colors flex items-center justify-center`}
                      >
                        <Image
                          alt="send"
                          src={send}
                          width={20}
                          height={20}
                          className={
                            inputMessage.trim() === "" ? "opacity-50" : ""
                          }
                        />
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Add this keyframe animation to your global CSS or within a style tag */}
            <style jsx>{`
              @keyframes slideInUp {
                from {
                  opacity: 0;
                  transform: translateY(20px);
                }
                to {
                  opacity: 1;
                  transform: translateY(0);
                }
              }

              @keyframes slideDown {
                from {
                  opacity: 1;
                  transform: translateY(0);
                }
                to {
                  opacity: 0;
                  transform: translateY(20px);
                }
              }
            `}</style>
            {/* overlay */}
            {isExpanded && (
              <SubjectFolders
                isExpanded={isExpanded}
                setIsExpanded={setIsExpanded}
              />
            )}
          </div>
        </>
      ) : (
        <div className="w-full h-full flex items-center justify-center">
          <FileUpload />
        </div>
      )}

      {(isTrainingProgress) && (
        <div className="z-10 absolute inset-0 flex items-center justify-center h-screen w-full bg-gray-900/30 backdrop-blur-md">
          <TrainLoading/>
        </div>
      )}
    </div>
  );
}
