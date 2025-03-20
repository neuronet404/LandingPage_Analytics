import { openDB } from 'idb';

const DB_NAME = 'TodoNotesDB';
const STORE_NAME = 'todos';

// Initialize IndexedDB
const initDB = async () => {
  return openDB(DB_NAME, 2, { // Increment version if needed
    upgrade(db) {
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        console.log(`Creating object store: ${STORE_NAME}`);
        db.createObjectStore(STORE_NAME, { keyPath: 'id', autoIncrement: true });
      } else {
        console.log(`Object store already exists: ${STORE_NAME}`);
      }
    },
    blocked() {
      console.warn('Database upgrade blocked. Close other connections.');
    },
    blocking() {
      console.warn('Database upgrade in progress. Existing connection needs to close.');
    },
    terminated() {
      console.error('Database connection was unexpectedly terminated.');
    },
  });
};

// Sync todos to IndexedDB
export const syncTodosToDB = async (todos) => {
  try {
    const db = await initDB();
    const tx = db.transaction(STORE_NAME, 'readwrite');
    const store = tx.objectStore(STORE_NAME);

    console.log('Clearing existing todos...');
    await store.clear(); // Clear all existing records

    console.log('Adding todos...');
    for (const todo of todos) {
      await store.put(todo);
    }

    await tx.done;
    console.log('Todos synced to IndexedDB successfully.');
  } catch (error) {
    console.error('Error syncing todos to IndexedDB:', error);
  }
};

// Fetch todos from IndexedDB
export const fetchTodosFromDB = async () => {
  try {
    const db = await initDB();
    const tx = db.transaction(STORE_NAME, 'readonly');
    const store = tx.objectStore(STORE_NAME);

    console.log('Fetching todos...');
    const todos = await store.getAll();
    await tx.done;

    console.log('Fetched todos:', todos);
    return todos;
  } catch (error) {
    console.error('Error fetching todos from IndexedDB:', error);
    return [];
  }
};

// Utility to delete the database
export const deleteDatabase = async () => {
  await indexedDB.deleteDatabase(DB_NAME);
  console.log(`${DB_NAME} database deleted.`);
};


export const deleteAllTodosFromDB = async () => {
  try {
    const db = await initDB();
    const tx = db.transaction(STORE_NAME, 'readwrite');
    const store = tx.objectStore(STORE_NAME);

    console.log('Deleting all todos...');
    await store.clear(); // Clears all records in the object store
    await tx.done;

    console.log('All todos deleted successfully.');
    return true;
  } catch (error) {
    console.error('Error deleting all todos from IndexedDB:', error);
    return false;
  }
};
