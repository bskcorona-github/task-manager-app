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

// Task インターフェースに dueDate プロパティを追加
interface Task {
  _id: string;
  title: string;
  status: 'todo' | 'in-progress' | 'done';
  priority: 'high' | 'medium' | 'low';
  dueDate?: string;
}

export default defineComponent({
  components: {
    TaskForm,
    TaskItem,
  },
  setup() {
    const tasks = ref<Task[]>([]);
    const statusFilter = ref<'all' | 'incomplete' | 'completed'>('all');
    const { $axios } = useNuxtApp() as unknown as { $axios: any };

    const fetchTasks = async () => {
      try {
        const response = await $axios.get('/tasks');
        tasks.value = response.data.data;
      } catch (error) {
        console.error('タスクの取得に失敗しました:', error);
      }
    };

    // addTask メソッドで dueDate を含める
    const addTask = async ({ title, priority, dueDate }: { title: string; priority: 'high' | 'medium' | 'low'; dueDate?: string }) => {
      try {
        const response = await $axios.post('/tasks', { title, priority, dueDate });
        tasks.value.push(response.data.data);
      } catch (error) {
        console.error('タスクの追加に失敗しました:', error);
      }
    };

    // updateTask メソッドで dueDate の更新に対応
    const updateTask = async (updatedTask: { id: string; title?: string; status?: 'todo' | 'in-progress' | 'done'; priority?: 'high' | 'medium' | 'low'; dueDate?: string }) => {
      try {
        await $axios.put(`/tasks?id=${updatedTask.id}`, updatedTask);
        const task = tasks.value.find((task) => task._id === updatedTask.id);
        if (task) {
          if (updatedTask.title) task.title = updatedTask.title;
          if (updatedTask.status) task.status = updatedTask.status;
          if (updatedTask.priority) task.priority = updatedTask.priority;
          if (updatedTask.dueDate) task.dueDate = updatedTask.dueDate;
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

    const setFilter = (filter: 'all' | 'incomplete' | 'completed') => {
      statusFilter.value = filter;
    };

    const filteredTasks = computed(() => {
      const filtered = tasks.value.filter((task) => {
        if (statusFilter.value === 'all') return true;
        if (statusFilter.value === 'incomplete') {
          return task.status === 'todo' || task.status === 'in-progress';
        }
        return task.status === 'done';
      });

      return filtered.sort((a, b) => {
        const priorityOrder = { high: 1, medium: 2, low: 3 };
        return priorityOrder[a.priority] - priorityOrder[b.priority];
      });
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
