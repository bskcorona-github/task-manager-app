<!-- frontend/components/TaskList.vue -->
<template>
    <div>
      <h1>タスク一覧</h1>
      
      <!-- フィルタリングボタン -->
      <div class="filter-buttons">
        <button @click="setFilter('all')" :class="{ active: statusFilter === 'all' }">すべて</button>
        <button @click="setFilter('incomplete')" :class="{ active: statusFilter === 'incomplete' }">未完了</button>
        <button @click="setFilter('completed')" :class="{ active: statusFilter === 'completed' }">完了</button>
      </div>
      
      <TaskForm @add-task="addTask" />
      
      <ul>
        <li v-for="task in filteredTasks" :key="task._id">
          <TaskItem
            :task="task"
            @update-task="updateTask"
            @delete-task="deleteTask"
          />
        </li>
      </ul>
    </div>
  </template>
  
  <script lang="ts">
  import { defineComponent, ref, computed, onMounted } from 'vue';
  import { useNuxtApp } from '#app';
  import TaskForm from '~/components/TaskForm.vue';
  import TaskItem from '~/components/TaskItem.vue';
  
  export default defineComponent({
    components: {
      TaskForm,
      TaskItem,
    },
    setup() {
      const tasks = ref([]);
      const statusFilter = ref('all'); // フィルタの状態を管理
      const { $axios } = useNuxtApp();
  
      const fetchTasks = async () => {
        try {
          const response = await $axios.get('/tasks');
          tasks.value = response.data.data;
        } catch (error) {
          console.error('タスクの取得に失敗しました:', error);
        }
      };
  
      const addTask = async (title: string) => {
        try {
          const response = await $axios.post('/tasks', { title });
          tasks.value.push(response.data.data);
        } catch (error) {
          console.error('タスクの追加に失敗しました:', error);
        }
      };
  
      const updateTask = async (updatedTask: { id: string; title?: string; status?: string }) => {
        try {
          await $axios.put(`/tasks?id=${updatedTask.id}`, updatedTask);
          const task = tasks.value.find((task) => task._id === updatedTask.id);
          if (task) {
            if (updatedTask.title) task.title = updatedTask.title;
            if (updatedTask.status) task.status = updatedTask.status;
          }
        } catch (error) {
          console.error('タスクの更新に失敗しました:', error);
        }
      };
  
      const deleteTask = async (id: string) => {
        try {
          await $axios.delete(`/tasks?id=${id}`);
          tasks.value = tasks.value.filter((task) => task._id !== id);
        } catch (error) {
          console.error('タスクの削除に失敗しました:', error);
        }
      };
  
      // フィルタ設定関数
      const setFilter = (filter: string) => {
        statusFilter.value = filter;
      };
  
      // フィルタされたタスクを取得する計算プロパティ
      const filteredTasks = computed(() => {
        if (statusFilter.value === 'all') return tasks.value;
        if (statusFilter.value === 'incomplete') {
          return tasks.value.filter(task => task.status === 'todo' || task.status === 'in-progress');
        }
        if (statusFilter.value === 'completed') {
          return tasks.value.filter(task => task.status === 'done');
        }
        return tasks.value;
      });
  
      onMounted(fetchTasks);
  
      return { tasks, addTask, updateTask, deleteTask, setFilter, filteredTasks, statusFilter };
    },
  });
  </script>
  
  <style scoped>
  .filter-buttons {
    margin-bottom: 1em;
  }
  
  .filter-buttons button {
    margin-right: 0.5em;
  }
  
  .filter-buttons .active {
    font-weight: bold;
    text-decoration: underline;
  }
  </style>
  