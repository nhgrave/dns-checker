<template>
  <div class="container">
    <h1>DNS Checker</h1>
    <form @submit.prevent="addDns">
      <input v-model="newDns" placeholder="Enter DNS" required />
      <button type="submit" aria-label="Add DNS">
        <i class="icon pi pi-plus"></i>
      </button>
    </form>

    <div class="card-container">
      <div class="card" v-for="(dns) in dnsList" :key="dns.url" :class="{
        'offline': dns.status === 'Offline',
        'slow': dns.responseTime > 10
      }">
        <div class="card-header">
          <h3 class="card-title">{{ dns.url }}</h3>
          <button class="delete-button" @click="deleteDns(dns.url)" aria-label="Delete DNS">
            <i class="icon pi pi-trash"></i>
          </button>
        </div>

        <div class="card-info">
          <span class="status">{{ dns.status }}</span>
          <span class="response-time">{{ dns.responseTime }} ms</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { openDB } from 'idb';
import 'primeicons/primeicons.css'

const newDns = ref('');
const dnsList = ref([]);

const dbPromise = openDB('dns-checker', 1, {
  upgrade(db) {
    db.createObjectStore('dns', { keyPath: 'url' });
  },
});

onMounted(async () => {
  await loadDns();
  startChecking();
});

const loadDns = async () => {
  const db = await dbPromise;
  dnsList.value = await db.getAll('dns');
};

function startChecking() {
  checkAllDns();
  setInterval(checkAllDns, 5 * 60 * 1000); // 5 minutes
};

async function checkAllDns() {
  for (let dns of dnsList.value) {
    checkDNS(dns);
  }
};

async function checkDNS(dns) {
  try {
    const startTime = performance.now();
    const response = await fetch(dns.url, { method: 'GET' });
    const endTime = performance.now();

    dns.status = response.status === 200 ? 'Online' : 'Offline';
    dns.responseTime = parseInt(endTime - startTime);
  } catch (error) {
    dns.status = 'Error';
    dns.responseTime = 0;
  }

  const db = await dbPromise;
  const plainDns = JSON.parse(JSON.stringify(dns));
  await db.put('dns', plainDns);
};

async function addDns() {
  const db = await dbPromise;
  const dns = { url: newDns.value, status: 'Unknown', responseTime: 0 };
  await db.put('dns', dns);
  dnsList.value.push(dns);
  newDns.value = '';
  checkDNS(dns);
};

async function deleteDns(url) {
  const db = await dbPromise;
  await db.delete('dns', url);
  await loadDns();
  await checkAllDns();
}
</script>

<style lang="scss" scoped>
body {
  font-family: Arial, sans-serif;
  background-color: #f4f4f9;
  display: flex;
  justify-content: center;
  max-height: 900px;
  margin: 0;
}

h1 {
  color: #333;
  text-align: center;
  margin-bottom: 20px;
}

form {
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  width: 100%;
  max-width: 400px;
  margin: 0 auto;
  padding: 10px;
  border-radius: 5px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  background-color: #fff;
}

input {
  flex: 1;
  padding: 10px;
  border: 1px solid #ccc;
  border-radius: 3px;
  margin-right: 10px;
}

button {
  padding: 10px;
  border: none;
  border-radius: 3px;
  background-color: #4CAF50;
  color: white;
  cursor: pointer;
  transition: background-color 0.3s;

  &:hover {
    background-color: #45a049;
  }
}

.card-container {
  display: flex;
  flex-wrap: wrap;
  justify-content: space-around;
  margin-top: 20px;
}

.card {
  max-width: 300px;
  flex-basis: calc(33.33% - 20px);
  margin: 10px;
  padding: 30px;
  border-radius: 5px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  background-color: #198754;
  color: #fafafa;
}

.card.offline {
  background-color: #dc3545;
}

.card.slow {
  background-color: #fd7e14;
}

.card-title {
  font-size: 1.2rem;
  font-weight: bold;
  margin-bottom: 10px;
}

.card-info {
  display: flex;
  justify-content: space-between;
}

.info {
  color: #222;
  font-size: 36px;
}

.delete-button {
  background-color: transparent;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
</style>
