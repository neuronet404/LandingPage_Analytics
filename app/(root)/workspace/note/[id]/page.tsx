"use client";
import { useParams } from "next/navigation";

import ExcalidrawComponent from "@/components/canvas/excalidraw/ExcalidrawComponent";
import { useEffect } from "react";
import { useSettings } from "@/context/SettingsContext";
import SyncNote from "@/app/(root)/sync/SyncNote";
import { ToggleHeader } from "@/components/ToggleHeader";

const page = () => {
  const { id }: { id: string } = useParams();
  const { setcurrentDocumentId } = useSettings();
  useEffect(() => {
    setcurrentDocumentId(id);
    console.log("current doc id  in the Note", id);
  }, [id]);
  return (
    <div>
      <div className="max-h-screen w-full overflow-hidden ">
        <div className="flex flex-col items-center   scrollbar-hide  ">
          <div
            className=""
            style={{
              height: "100vh",
              width: "100vw",
            }}
          >
            <ExcalidrawComponent id={id} />
            {/* <SyncNote currentDocumentId={id} /> */}
          </div>
          <ToggleHeader />
        </div>
      </div>
    </div>
  );
};

export default page;
