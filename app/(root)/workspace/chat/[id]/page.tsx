"use client"
import { ChatInterface } from "@/components/chatinterface/chat-interface";
import Sidebar from "@/components/pdfcomponents/sidebar";
import { useSettings } from "@/context/SettingsContext";
import { useParams } from "next/navigation";
import { useEffect } from "react";

export default function Page() {
  const { id }: { id: string } = useParams();
  const { setcurrentDocumentId } = useSettings();
  useEffect(() => {
    setcurrentDocumentId(id);
    console.log("current doc id  in the PDF", id)
  }, [id]);
  return (

    <div className="flex flex-col w-full min-h-screen">
      <div className="flex flex-1 w-full">
        <ChatInterface id={id} />
      </div>
    </div>

  );
}
