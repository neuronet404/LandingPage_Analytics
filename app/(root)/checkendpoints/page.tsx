// "use client";

// import React, { useState } from "react";

// const ApiComponent = () => {
//     const [s3BucketName, setS3BucketName] = useState("pdf-storage-bucket-myacolyte");
//     const [userId, setUserId] = useState("user_2tRrs3yPu2553eTCndHfO2IXAi5");
//     const [docId, setDocId] = useState("f9518e78-97b6-4a75-92a0-cd6385a8551a");
//     const [userQuery, setUserQuery] = useState("");
//     const [response, setResponse] = useState(null);

//     const processDocument = async () => {
//         try {
//             const res = await fetch(
//                 `http://localhost:8080/process-document?s3_bucket_name=pdf-storage-bucket-myacolyte&user_id=user_2tRrs3yPu2553eTCndHfO2IXAi5&doc_id=f9518e78-97b6-4a75-92a0-cd6385a8551a.pdf`,
//                 {
//                     method: "POST",
//                     headers: {
//                         "accept": "application/json"
//                     },
//                     // Empty body as in the curl command
//                     body: ""
//                 }
//             );

//             if (!res.ok) {
//                 throw new Error(`HTTP error! Status: ${res.status}`);
//             }

//             const data = await res.json();
//             console.log("Process Document Response:", data);
//             setResponse(data);
//         } catch (error) {
//             console.error("Error processing document:", error);
//             setResponse({ error: error.message });
//         }
//     };

//     const generateResponse = async () => {
//         try {
//             const queryParams = new URLSearchParams({
//                 s3_bucket_name: s3BucketName,
//                 user_id: userId,
//                 doc_id: docId,
//                 user_query: userQuery,
//             });

//             const res = await fetch(`http://0.0.0.0:8080/generation?${queryParams.toString()}`, {
//                 method: "GET",
//                 headers: {
//                     "Content-Type": "application/json",
//                 },
//             });

//             if (!res.ok) {
//                 throw new Error(`HTTP error! Status: ${res.status}`);
//             }

//             const data = await res.json();
//             console.log("Generation Response:", data);
//             setResponse(data);
//         } catch (error) {
//             console.error("Error generating response:", error);
//             setResponse({ error: error.message });
//         }
//     };

//     return (
//         <div>
//             <h2>API Interaction</h2>
//             <div>
//                 <input
//                     type="text"
//                     placeholder="Enter your query"
//                     value={userQuery}
//                     onChange={(e) => setUserQuery(e.target.value)}
//                 />
//             </div>
//             <div>
//                 <button onClick={processDocument}>Process Document</button>
//                 <button onClick={generateResponse}>Generate Response</button>
//             </div>
//             {response && (
//                 <pre style={{ whiteSpace: "pre-wrap", wordWrap: "break-word" }}>
//                     {JSON.stringify(response, null, 2)}
//                 </pre>
//             )}
//         </div>
//     );
// };

// export default ApiComponent;

"use client";

import AcolyteForgotPassword from "@/components/auth/ForgotPassword";
import AcolyteCarousel from "@/components/auth/GettingStarted";
import AcolyteOTPVerification from "@/components/auth/OTPVerification";
import AcolyteSignIn from "@/components/auth/SignIn";
import AcolyteSignUpUpdated from "@/components/auth/SignUp";
import React, { useState } from "react";
import { destroyCookie } from "nookies";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";

const page = () => {

const router = useRouter()

const handleLogout = () => {
  destroyCookie(null, "authToken");
  destroyCookie(null, "accessToken");
  destroyCookie(null, "refreshToken");

  router.push("/auth/signin"); // Redirect to login
};

  return (
    <div>
      {/* <AcolyteSignIn /> */}
      {/* <AcolyteSignUpUpdated/> */}
      {/* <AcolyteOTPVerification/> */}
      {/* <AcolyteForgotPassword/> */}
      <Button onClick={handleLogout}>logout</Button>
      <CreateIndexForm/>

    </div>
  );
};

export default page;





export  function CreateIndexForm() {
  const formData = {
    bucket_name: "pdf-storage-bucket-myacolyte",
    user_id: "user_2tRrs3yPu2553eTCndHfO2IXAi5",
    key: "8f632e51-1302-496e-824d-6de094c3eb24.pdf"
  };

  const [inputMessage, setInputMessage] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(
        "http://phi-ingestion-lb-1516721954.ap-south-1.elb.amazonaws.com/create-index",
        {
          method: "POST",
          headers: {
            "Accept": "application/json",
            "Content-Type": "application/json"
          },
          body: JSON.stringify(formData)
        }
      );
      const result = await response.json();
      alert("Index created successfully: " + JSON.stringify(result));
    } catch (error) {
      alert("Error creating index: " + error.message);
    }
  };

  const generateResponse = async () => {
    try {
      const response = await fetch(
        "http://phi-generation-new-lb-506556673.ap-south-1.elb.amazonaws.com/query",
        {
          method: "POST",
          headers: {
            "Accept": "application/json",
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            bucket_name: "pdf-storage-bucket-myacolyte",
            user_id: "user_2tRrs3yPu2553eTCndHfO2IXAi5",
            key: "8f632e51-1302-496e-824d-6de094c3eb24.pdf",
            query_text: inputMessage,
            recreate_kb: false,
            model_id: "gpt-4o-mini"
          })
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

  return (
    <div className="p-4 max-w-md mx-auto bg-white rounded-lg shadow-md">
      <h2 className="text-xl font-bold mb-4">Create Index</h2>
      <button
        onClick={handleSubmit}
        className="w-full bg-blue-500 text-black border-2 p-2 rounded hover:bg-blue-600"
      >
        Create Index
      </button>
      <h2 className="text-xl font-bold mt-4">Generate Response</h2>
      <input
        type="text"
        placeholder="Enter query"
        value={inputMessage}
        onChange={(e) => setInputMessage(e.target.value)}
        className="w-full p-2 border rounded mb-2"
      />
      <button
        onClick={generateResponse}
        className="w-full bg-green-500 text-black border-2 p-2 rounded hover:bg-green-600"
      >
        Generate Response
      </button>
    </div>
  );
}
