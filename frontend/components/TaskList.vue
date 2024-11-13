<template>
  <div>
    <h1>タスク一覧</h1>

    <!-- 検索バー -->
    <input v-model="searchQuery" placeholder="タスクを検索" class="search-bar" />

    <!-- フィルタリングボタン -->
    <div class="filter-buttons">
      <button @click="setFilter('all')" :class="{ active: statusFilter === 'all' }">すべて</button>
      <button @click="setFilter('incomplete')" :class="{ active: statusFilter === 'incomplete' }">未完了</button>
      <button @click="setFilter('completed')" :class="{ active: statusFilter === 'completed' }">完了</button>
    </div>

    <!-- ソート順の選択 -->
    <select v-model="sortOrder" class="sort-select">
      <option value="priority">優先度順</option>
      <option value="dueDate">期日順</option>
      <option value="createdAt">作成日順</option>
    </select>

    <TaskForm @add-task="addTask" />

    <ul>
      <li v-for="task in sortedTasks" :key="task._id">
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

interface Task {
  _id: string;
  title: string;
  description?: string;
  status: 'todo' | 'in-progress' | 'done';
  priority: 'high' | 'medium' | 'low';
  dueDate?: string;
  createdAt: string;
}

export default defineComponent({
  components: {
    TaskForm,
    TaskItem,
  },
  setup() {
    const tasks = ref<Task[]>([]);
    const statusFilter = ref<'all' | 'incomplete' | 'completed'>('all');
    const searchQuery = ref(''); // 検索キーワード
    const sortOrder = ref<'priority' | 'dueDate' | 'createdAt'>('priority'); // ソート順
    const { $axios } = useNuxtApp() as unknown as { $axios: any };

    const fetchTasks = async () => {
      try {
        const response = await $axios.get('/tasks');
        tasks.value = response.data.data;
      } catch (error) {
        console.error('タスクの取得に失敗しました:', error);
      }
    };

    const addTask = async ({ title, priority, dueDate, description }: { title: string; priority: 'high' | 'medium' | 'low'; dueDate?: string; description?: string }) => {
      try {
        const response = await $axios.post('/tasks', { title, priority, dueDate, description });
        tasks.value.push(response.data.data);
      } catch (error) {
        console.error('タスクの追加に失敗しました:', error);
      }
    };

    const updateTask = async (updatedTask: { id: string; title?: string; status?: 'todo' | 'in-progress' | 'done'; priority?: 'high' | 'medium' | 'low'; dueDate?: string; description?: string }) => {
      try {
        await $axios.put(`/tasks?id=${updatedTask.id}`, updatedTask);
        const task = tasks.value.find((task) => task._id === updatedTask.id);
        if (task) {
          if (updatedTask.title) task.title = updatedTask.title;
          if (updatedTask.status) task.status = updatedTask.status;
          if (updatedTask.priority) task.priority = updatedTask.priority;
          if (updatedTask.dueDate) task.dueDate = updatedTask.dueDate;
          if (updatedTask.description) task.description = updatedTask.description;
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

    // フィルタリングと検索のロジック
    const filteredTasks = computed(() => {
      const filtered = tasks.value.filter((task) => {
        // ステータスフィルタリング
        if (statusFilter.value === 'all') return true;
        if (statusFilter.value === 'incomplete') {
          return task.status === 'todo' || task.status === 'in-progress';
        }
        return task.status === 'done';
      });

      // 検索フィルタリング
      if (searchQuery.value) {
        return filtered.filter((task) => {
          const query = searchQuery.value.toLowerCase();
          return (
            task.title.toLowerCase().includes(query) ||
            (task.description && task.description.toLowerCase().includes(query))
          );
        });
      }
      return filtered;
    });

    // ソート順の適用
    const sortedTasks = computed(() => {
  return [...filteredTasks.value].sort((a, b) => {
    const priorityOrder = { high: 1, medium: 2, low: 3 };
    
    if (sortOrder.value === 'priority') {
      // 優先度順 > 期日 > 作成日
      const priorityDifference = priorityOrder[a.priority] - priorityOrder[b.priority];
      if (priorityDifference !== 0) return priorityDifference; // 優先度が異なる場合、優先度でソート
      const dueDateDifference = new Date(a.dueDate || 0).getTime() - new Date(b.dueDate || 0).getTime();
      if (dueDateDifference !== 0) return dueDateDifference; // 優先度が同じなら期日でソート
      return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(); // 優先度と期日が同じなら作成日でソート
    } else if (sortOrder.value === 'dueDate') {
      // 期日順 > 優先度 > 作成日
      const dueDateDifference = new Date(a.dueDate || 0).getTime() - new Date(b.dueDate || 0).getTime();
      if (dueDateDifference !== 0) return dueDateDifference; // 期日が異なる場合、期日でソート
      const priorityDifference = priorityOrder[a.priority] - priorityOrder[b.priority];
      if (priorityDifference !== 0) return priorityDifference; // 期日が同じなら優先度でソート
      return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(); // 期日と優先度が同じなら作成日でソート
    } else if (sortOrder.value === 'createdAt') {
      // 作成日順
      return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
    }
    return 0;
  });
});
  

    onMounted(fetchTasks);

    return { tasks, addTask, updateTask, deleteTask, setFilter, filteredTasks, sortedTasks, statusFilter, searchQuery, sortOrder };
  },
});
</script>

<style scoped>
.search-bar {
  margin-bottom: 1em;
  padding: 0.5em;
  width: 100%;
}
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
.sort-select {
  margin-bottom: 1em;
  padding: 0.5em;
  width: 15%;
}
</style>
