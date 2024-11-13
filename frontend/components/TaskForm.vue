<template>
  <form @submit.prevent="submitTask">
    <input v-model="taskTitle" placeholder="タスク名を入力" />
    <select v-model="taskPriority">
      <option value="high">高</option>
      <option value="medium">中</option>
      <option value="low">低</option>
    </select>
    <input v-model="taskTags" placeholder="タグをカンマで区切って入力" /> <!-- タグ入力フィールド -->
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
    const taskTags = ref(''); // タグ入力

    const submitTask = () => {
      if (taskTitle.value.trim() !== '') {
        // カンマ区切りでタグを分割し、配列に変換
        const tagsArray = taskTags.value.split(',').map(tag => tag.trim()).filter(tag => tag);
        
        // タスクデータをemitで送信
        emit('add-task', { 
          title: taskTitle.value, 
          priority: taskPriority.value, 
          dueDate: taskDueDate.value, 
          tags: tagsArray 
        });

        // フォームをリセット
        taskTitle.value = '';
        taskPriority.value = 'medium';
        taskDueDate.value = '';
        taskTags.value = ''; // タグフィールドもリセット
      }
    };

    return { taskTitle, taskPriority, taskTags, taskDueDate, submitTask };
  },
});
</script>
