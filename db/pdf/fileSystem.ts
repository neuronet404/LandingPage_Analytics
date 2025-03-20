import { openDB, IDBPDatabase } from 'idb';
import { parseCookies } from 'nookies';

interface FileSystemItem {
  id: string;
  name: string;
  type: 'file' | 'folder';
  children?: FileSystemItem[];
}

interface FileSystemData {
  id: 'root';
  fileSystem: FileSystemItem[];
}

const DB_NAME = 'fileSystemDB';
const STORE_NAME = 'fileSystem';
const DB_VERSION = 1;

let dbInstance: IDBPDatabase | null = null;

export const initDB = async () => {
  if (dbInstance) return dbInstance;

  try {
    dbInstance = await openDB(DB_NAME, DB_VERSION, {
      upgrade(db) {
        if (!db.objectStoreNames.contains(STORE_NAME)) {
          db.createObjectStore(STORE_NAME, { keyPath: 'id' });
        }
      },
    });
    return dbInstance;
  } catch (error) {
    console.error('Failed to initialize database:', error);
    throw new Error('Failed to initialize database');
  }
};

export const saveFileSystem = async (fileSystem: FileSystemItem[]) => {
  try {
    const db = await initDB();
    // Get user ID from cookies
    const cookies = parseCookies();
    const userId = cookies.userSub;
    if(fileSystem.length===0) return

    if (userId) {
      await uploadFileSystem(userId, fileSystem);
    }
    await db.put(STORE_NAME, { id: 'root', fileSystem });
  } catch (error) {
    console.error('Failed to save file system:', error);
    throw new Error('Failed to save file system');
  }
};

export const getFileSystem = async (): Promise<FileSystemItem[]> => {
  try {
    const db = await initDB();
    const data = await db.get(STORE_NAME, 'root');
    return data?.fileSystem || [];
  } catch (error) {
    console.error('Failed to get file system:', error);
    return [];
  }
};

export const getFileById = async (id: string): Promise<FileSystemItem | null> => {
  try {
    const fileSystem = await getFileSystem();
    
    const findFile = (items: FileSystemItem[]): FileSystemItem | null => {
      for (const item of items) {
        if (item.id === id) return item;
        if (item.children) {
          const found = findFile(item.children);
          if (found) return found;
        }
      }
      return null;
    };
    
    return findFile(fileSystem);
  } catch (error) {
    console.error('Failed to get file by ID:', error);
    return null;
  }
};

// Optional: Add a cleanup function to close the database connection
export const closeDB = async () => {
  if (dbInstance) {
    dbInstance.close();
    dbInstance = null;
  }
};


const uploadFileSystem = async (userId, fileSystem) => {
  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/dev/createUserFilesystem`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, contents: fileSystem }),
      }
    );
    if (!response.ok) throw new Error("Failed to upload filesystem");
  } catch (error) {
    console.error("Error uploading filesystem:", error);
  }
};



export const markPdfAsTrained = async (documentId) => {
  try {
    const db = await initDB();
    const fileSystem = await getFileSystem();

    const updateFile = (items) => {
      for (const item of items) {
        if (item.id === documentId) {
          item.isTrained = true;
          return true;
        }
        if (item.children) {
          const found = updateFile(item.children);
          if (found) return true;
        }
      }
      return false;
    };

    if (updateFile(fileSystem)) {
      await saveFileSystem(fileSystem);
    } else {
      throw new Error('File not found');
    }
  } catch (error) {
    console.error('Failed to mark PDF as trained:', error);
    throw new Error('Failed to mark PDF as trained');
  }
};



export const markPdfAsSynced = async (documentId) => {
  try {
    const db = await initDB();
    const fileSystem = await getFileSystem();

    const updateFile = (items) => {
      for (const item of items) {
        if (item.id === documentId) {
          item.isSynced = true;
          return true;
        }
        if (item.children) {
          const found = updateFile(item.children);
          if (found) return true;
        }
      }
      return false;
    };

    if (updateFile(fileSystem)) {
      await saveFileSystem(fileSystem);
    } else {
      throw new Error('File not found');
    }
  } catch (error) {
    console.error('Failed to mark PDF as synced:', error);
    throw new Error('Failed to mark PDF as synced');
  }
};



export const clearFileSystem = async () => {
  try {
    const db = await initDB();
    await db.delete(STORE_NAME, 'root');
    console.log('File system cleared successfully');
  } catch (error) {
    console.error('Failed to clear file system:', error);
    throw new Error('Failed to clear file system');
  }
};



