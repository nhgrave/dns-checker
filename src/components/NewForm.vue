<template>
  <div class="form-wrapper">
    <form @submit.prevent="addDns" class="form">
      <input v-model="newDns" placeholder="Enter DNS" required />
      <button type="submit">Add DNS</button>
    </form>

    <div v-if="errorMessage" class="error">
      {{ errorMessage }}
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { useIndexDB } from '@/composables/index-db';

const { getData, addData } = useIndexDB();

const newDns = ref('');
const errorMessage = ref('');

async function addDns() {
  errorMessage.value = '';

  const dnsRegex = /^(https?:\/\/)?([a-zA-Z0-9-]+\.)+[a-zA-Z]{2,}(\/.*)?$/;

  if (!dnsRegex.test(newDns.value)) {
    errorMessage.value = 'Please enter a valid DNS with http or https';
    return;
  }

  const dnsExists = await getData(newDns.value);

  if (dnsExists) {
    errorMessage.value = 'DNS already exists';
    return;
  }

  const dns = { url: newDns.value, status: 'Unknown', responseTime: 0 };

  addData(dns)
    .then(() => {
      newDns.value = '';
      window.dispatchEvent(new Event('dns-list-changed'));
    });
};
</script>

<style lang="scss" scoped>
.form-wrapper {
  margin: 1rem 0;
}

.form {
  display: flex;
  width: 100%;
  border-radius: 4px;
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
}

input {
  width: 100%;
  line-height: 1.5rem;
  border: 1px solid #cdcdcd;
  border-radius: 4px 0px 0px 4px;
  padding: 4px 8px;
  outline: none;
}

button {
  white-space: nowrap;
  border: none;
  border: 1px solid #cdcdcd;
  border-left: none;
  border-radius: 0px 4px 4px 0px;

  &:hover {
    cursor: pointer;
    background-color: #cdcdcd;
  }
}

.error {
  margin-top: 4px;
  font-size: 0.8rem;
  color: #dc3545;
}
</style>
