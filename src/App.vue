<template>
  <div class="app">
    <Header />

    <div class="main">
      <div class="container">
        <NewForm />
        <List />
      </div>
    </div>
  </div>
</template>

<script setup>
import Header from './components/Header.vue';
import NewForm from './components/NewForm.vue';
import List from './components/List.vue';
</script>

<style lang="scss" scoped>
.container {
  max-width: 900px;
  padding: 0 15px;
  margin: 0 auto;
}
</style>
