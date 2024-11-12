<!-- frontend/pages/index.vue -->
<template>
    <TaskList />
  </template>
  
  <script lang="ts">
  import TaskList from '~/components/TaskList.vue';
  
  export default {
    components: {
      TaskList,
    },
  };
  </script>
  