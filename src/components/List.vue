<template>
  <div class="list">
    <Item
      v-for="dns in dnsList"
      :key="dns.url"
      :item="dns"
      class="list-item"
    />

    <div v-if="!dnsList.length" class="empty-wrapper">
      <img
        src="../assets/images/empty.png"
        alt="Empty box"
        title="Empty box"
        loading="lazy"
        class="empty-logo"
      >
      <p class="empty-text">Your list is Empty</p>
    </div>
  </div>
</template>

<script setup>
import { onMounted } from 'vue';
import { useIndexDB } from '@/composables/index-db';
import Item from './Item.vue';

const { dnsList, getAllData } = useIndexDB();

onMounted(() => {
  getAllData();

  window.addEventListener('dns-list-changed', () => {
    getAllData();
  });
});
</script>

<style lang="scss" scoped>
.list {
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
  margin: 1rem 0;
};

.list-item {
  width: 100%;

  @media (min-width: 768px) {
    width: calc(50% - 0.5rem);
  }
}

.empty-wrapper {
  text-align: center;
  width: 100%;
}

.empty-logo {
  width: 200px;
  height: 200px;
  opacity: 0.8;
}

.empty-text {
  font-size: 1.5rem;
  color: #B3B3B3;
}
</style>
