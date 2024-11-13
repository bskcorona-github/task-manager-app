<template>
  <form @submit.prevent="submitTask">
    <input v-model="taskTitle" placeholder="タスク名を入力" />
    <select v-model="taskPriority">
      <option value="high">高</option>
      <option value="medium">中</option>
      <option value="low">低</option>
    </select>
    <input type="date" v-model="taskDueDate" /> <!-- 期日入力欄 -->
    <button type="submit">追加</button>
  </form>
</template>

<script lang="ts">
import { defineComponent, ref } from 'vue';

export default defineComponent({
  emits: ['add-task'],
  setup(_, { emit }) {
    const taskTitle = ref('');
    const taskPriority = ref<'high' | 'medium' | 'low'>('medium');
    const taskDueDate = ref<string>(''); // 期日入力

    const submitTask = () => {
      if (taskTitle.value.trim() !== '') {
        emit('add-task', { title: taskTitle.value, priority: taskPriority.value, dueDate: taskDueDate.value });
        taskTitle.value = '';
        taskPriority.value = 'medium';
        taskDueDate.value = '';
      }
    };

    return { taskTitle, taskPriority, taskDueDate, submitTask };
  },
});
</script>
