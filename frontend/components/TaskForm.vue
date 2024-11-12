<!-- frontend/components/TaskForm.vue -->
<template>
    <form @submit.prevent="submitTask">
      <input v-model="taskTitle" placeholder="タスク名を入力" />
      <button type="submit">追加</button>
    </form>
  </template>
  
  <script lang="ts">
  import { defineComponent, ref, Emit } from 'vue';
  
  export default defineComponent({
    emits: ['add-task'],
    setup(_, { emit }) {
      const taskTitle = ref('');
  
      const submitTask = () => {
        if (taskTitle.value.trim() !== '') {
          emit('add-task', taskTitle.value);
          taskTitle.value = ''; // フィールドをリセット
        }
      };
  
      return { taskTitle, submitTask };
    },
  });
  </script>
  