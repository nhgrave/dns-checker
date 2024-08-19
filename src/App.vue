<template>
  <div>
    <div class="container">
      <h1>DNS Checker</h1>
      <form @submit.prevent="addDns">
        <input v-model="newDns" placeholder="Enter DNS" required />
        <button type="submit">Add DNS</button>
      </form>

      <table class="table">
        <tbody>
          <tr v-for="dns in dnsList" :key="dns.url">
            <td>{{ dns.url }}</td>
            <td :class="[ dns.status === 'Offline' ? 'text-danger' : 'text-success']">{{ dns.status }}</td>
            <td :class="[ dns.responseTime > 1000 ? (dns.responseTime > 15000 ? 'text-danger' : 'text-warning') : '']">{{ dns.responseTime }} ms</td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { openDB } from 'idb';

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
</script>

<style lang="scss" scoped>
.container {
  max-width: 900px;
  padding: 0 15px;
  margin: 0 auto;
}

.table {
  width: 100%;

  th, td {
    padding: 6px 12px;
    background: #EEE;
  }

  tr:nth-child(even) td {
    background: #CCC;
  }
}

.text-danger {
  color: #dc3545;
}

.text-warning {
  color: #fd7e14;
}

.text-success {
  color: #198754;
}
</style>
