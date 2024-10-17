import { ref } from 'vue';
import { openDB } from 'idb';

export function useIndexDB(dbName = 'dns-checker', storeName = 'dns') {
  const dnsList = ref([]);

  const dbPromise = openDB(dbName, 1, {
    upgrade(db) {
      db.createObjectStore(storeName, { keyPath: 'url' });
    },
  });

  async function getData(id) {
    return db.getData(id);
  }

  async function getAllData() {
    const db = await dbPromise;
    dnsList.value = await db.getAll('dns');
  }

  async function addData(data) {
    const db = await dbPromise;
    await db.put(storeName, data);
    dnsList.value.push(data);

    return data;
  }

  async function updateData(data) {
    const db = await dbPromise;
    await db.put(storeName, data);
    dnsList.value.push(data);

    return data;
  }

  async function deleteData(id) {
    return db.deleteData(id);
  }

  return {
    dnsList,
    getAllData,
    getData,
    addData,
    updateData,
    deleteData,
  };
}
