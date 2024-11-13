<!-- frontend/components/StatusToggle.vue -->
<template>
    <input type="checkbox" :checked="isCompleted" @change="toggleStatus" />
  </template>
  
  <script lang="ts">
  import { defineComponent, computed } from 'vue';
  
  export default defineComponent({
    props: {
      status: {
        type: String,
        default: 'todo',
      },
    },
    emits: ['update:status'],
    setup(props, { emit }) {
      const isCompleted = computed(() => props.status === 'done');
  
      const toggleStatus = () => {
        const newStatus = isCompleted.value ? 'todo' : 'done';
        emit('update:status', newStatus);
      };
  
      return { isCompleted, toggleStatus };
    },
  });
  </script>
  