"use client"
import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Upload, Trash2 } from 'lucide-react';
import { openDB } from 'idb';

const DB_NAME = 'lightragDB';
const DB_VERSION = 1;
const STORE_NAME = 'documents';

// Initialize IndexedDB
const initDB = async () => {
  return openDB(DB_NAME, DB_VERSION, {
    upgrade(db) {
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: 'documentId' });
      }
    },
  });
};

const LightRAGComponent = () => {
  const [status, setStatus] = useState('idle');
  const [error, setError] = useState(null);
  const [documents, setDocuments] = useState([]);

  useEffect(() => {
    loadDocuments();
  }, []);

  const loadDocuments = async () => {
    try {
      const db = await initDB();
      const allDocs = await db.getAll(STORE_NAME);
      setDocuments(allDocs);
    } catch (err) {
      console.error('Failed to load documents:', err);
      setError(err.message);
    }
  };

  const saveDocument = async (documentId, content) => {
    try {
      const db = await initDB();
      const timestamp = new Date().toISOString();
      await db.put(STORE_NAME, {
        documentId,
        content,
        updatedAt: timestamp,
        status: 'processed'
      });
      await loadDocuments();
    } catch (err) {
      console.error('Failed to save document:', err);
      throw err;
    }
  };

  const deleteDocument = async (documentId) => {
    try {
      setStatus('deleting');
      const db = await initDB();
      await db.delete(STORE_NAME, documentId);
      
      // Also delete from LightRAG if needed
      // await rag.delete_by_doc_id(documentId);
      
      await loadDocuments();
      setStatus('idle');
    } catch (err) {
      setError(err.message);
      setStatus('error');
    }
  };

  const handleFileUpload = async (file) => {
    try {
      setStatus('processing');
      
      // Generate a unique document ID
      const documentId = `doc-${Date.now()}`;
      
      // Read file content
      const reader = new FileReader();
      const fileContent = await new Promise((resolve, reject) => {
        reader.onload = () => resolve(reader.result);
        reader.onerror = reject;
        reader.readAsText(file);
      });
      
      // Initialize LightRAG with IndexedDB storage path
      const config = {
        working_dir: `/lightrag/${documentId}`,
        embedding_cache_config: {
          enabled: true,
          similarity_threshold: 0.95,
          use_llm_check: true
        },
        kv_storage: "JsonKVStorage",
        vector_storage: "NanoVectorDBStorage",
        graph_storage: "NetworkXStorage",
        doc_status_storage: "JsonDocStatusStorage",
      };
      
      // Save to IndexedDB
      await saveDocument(documentId, {
        filename: file.name,
        content: fileContent,
        config: config
      });
      
      setStatus('completed');
      
    } catch (err) {
      setError(err.message);
      setStatus('error');
      console.error('Failed to process file:', err);
    }
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>LightRAG Document Manager</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          <div className="flex justify-center">
            <label className="cursor-pointer">
              <input
                type="file"
                className="hidden"
                onChange={(e) => handleFileUpload(e.target.files[0])}
                accept=".txt,.pdf,.doc,.docx"
              />
              <Button className="flex items-center gap-2">
                <Upload className="w-4 h-4" />
                Upload Document
              </Button>
            </label>
          </div>
          
          {status !== 'idle' && (
            <Alert>
              <AlertDescription>
                {status === 'processing' && 'Processing document...'}
                {status === 'completed' && 'Document processed successfully!'}
                {status === 'deleting' && 'Deleting document...'}
                {status === 'error' && `Error: ${error}`}
              </AlertDescription>
            </Alert>
          )}
          
          {/* Document List */}
          <div className="space-y-4">
            {documents.map((doc) => (
              <div key={doc.documentId} className="flex items-center justify-between p-4 border rounded-lg">
                <div>
                  <h3 className="font-medium">{doc.content.filename}</h3>
                  <p className="text-sm text-gray-500">
                    Updated: {new Date(doc.updatedAt).toLocaleString()}
                  </p>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => deleteDocument(doc.documentId)}
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default LightRAGComponent;