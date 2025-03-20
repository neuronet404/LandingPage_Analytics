"use client";

import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

import { fetchTodosFromDB, syncTodosToDB } from "@/db/Todo";

const SyncTodos = () => {
  const [todos, setTodos] = useState([]);
  const [userId, setUserId] = useState("user1234");
  const [loading, setLoading] = useState(false);

  const handleUpload = async () => {
    setLoading(true);
    try {
      const response = await fetch("http://localhost:3000/dev/createTodos", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ userId, todos }),
      });
      if (response.ok) {
        alert("Todos uploaded successfully!");
      } else {
        console.error("Failed to upload todos");
        alert("Failed to upload todos");
      }
    } catch (error) {
      console.error("Error uploading todos:", error);
      alert("Error uploading todos");
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = async () => {
    setLoading(true);
    try {
      const response = await fetch(`http://localhost:3000/dev/fetchTodos/${userId}`);
      if (response.ok) {
        const data = await response.json();
        console.log(data.todos);
        setTodos(data.todos || []);
        syncTodosToDB(data.todos || []);
        alert("Todos downloaded successfully!");
      } else {
        console.error("Failed to download todos");
        alert("Failed to download todos");
      }
    } catch (error) {
      console.error("Error downloading todos:", error);
      alert("Error downloading todos");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const fetchTodos = async () => {
      try {
        const localTodos = await fetchTodosFromDB();
        console.log(localTodos);
        setTodos(localTodos);
      } catch (error) {
        console.error("Error fetching local todos:", error);
      }
    };

    fetchTodos();
  }, [userId]);

  return (
    <div className="p-4 max-w-lg mx-auto">
      <Card>
        <CardHeader>
          <CardTitle>Todos Manager</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <label htmlFor="userId" className="block text-sm font-medium text-gray-700">
                User ID
              </label>
              <Input
                id="userId"
                value={userId}
                onChange={(e) => setUserId(e.target.value)}
                placeholder="Enter user ID"
              />
            </div>
            <div className="flex gap-4">
              <Button onClick={handleUpload} disabled={loading}>
                {loading ? "Uploading..." : "Upload Todos"}
              </Button>
              <Button onClick={handleDownload} disabled={loading}>
                {loading ? "Downloading..." : "Download Todos"}
              </Button>
            </div>
            <div>
              <h4 className="text-lg font-semibold">Current Todos:</h4>
              <pre className="bg-gray-100 p-2 rounded-md overflow-x-auto">
                {JSON.stringify(todos, null, 2)}
              </pre>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SyncTodos;
