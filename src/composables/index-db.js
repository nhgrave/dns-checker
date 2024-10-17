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
    const db = await dbPromise;
    return db.get(storeName, id);
  }

  async function getAllData() {
    const db = await dbPromise;
    dnsList.value = await db.getAll(storeName);
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
    const db = await dbPromise;
    await db.delete(storeName, id);
    dnsList.value = dnsList.value.filter(item => item.url !== id);
    return id;
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
