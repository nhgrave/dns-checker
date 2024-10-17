<template>
  <div class="item d-flex flex-column" :class="item.status">
    <div class="d-flex justify-content-between">
      <a :href="item.url" target="_blank" class="title">
        {{ item.url }}
      </a>
      <span>
        <Trash class="trash-icon" @click="deleteItem"/>
      </span>
    </div>
    <div class="d-flex justify-content-between m-t-auto">
      <span class="status" :class="statusClass">
        {{ item.status }}
      </span>
      <span class="time m-l-auto" :class="timeClass">
        {{ item.responseTime }} ms
      </span>
    </div>
  </div>
</template>

<script setup>
import { computed, onMounted } from 'vue';
import { useCheckDns } from '@/composables/check-dns';
import { useIndexDB } from '@/composables/index-db';
import Trash from '@/assets/svg/trash.svg';

const { checkDns } = useCheckDns();
const { updateData, deleteData } = useIndexDB();

const props = defineProps({
  item: {
    type: Object,
    required: true,
  },
});

const statusClass = computed(() => {
  return props.item.status === 'Online' ? 'text-success' : 'text-danger';
});

const timeClass = computed(() => {
  return props.item.responseTime > 1000 ? (props.item.responseTime > 15000 ? 'text-danger' : 'text-warning') : '';
});

const nextCheckTime = computed(() => {
  return (props.item.timestamp || 0) + (5 * 60 * 1000); // 5 minutes
});

onMounted(() => {
  let timeout = nextCheckTime.value - Date.now();
  if (timeout < 0) timeout = 0;

  setTimeout(() => {
    checkDns(props.item.url)
      .then(data => {
        updateData(data);
        window.dispatchEvent(new Event('dns-list-changed'));
      });
  }, timeout);
});

function deleteItem() {
  if (confirm('Do you want to delete this item?')) {
    deleteData(props.item.url);
    window.dispatchEvent(new Event('dns-list-changed'));
  }
}
</script>

<style lang="scss" scoped>
.item {
  display: flex;
  flex-wrap: wrap;
  padding: 1rem;
  background-color: #f8f9fa;
  border-radius: 0.5rem;
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
  border-left: 5px solid #cdcdcd;
  word-break: break-word;

  &.Online {
    border-left-color: #198754;
  }
  &.Offline, &.Error {
    border-left-color: #dc3545;
  }
}

.title {
  margin: 0 0 1rem;
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

.trash-icon {
  width: 1rem;
  height: 1rem;
  color: #cdcdcd;

  &:hover {
    cursor: pointer;
    color: #dc3545;
  }
}
</style>
