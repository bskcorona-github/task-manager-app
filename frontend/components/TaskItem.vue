<!-- frontend/components/TaskItem.vue -->
<template>
    <div :class="{ completed: task.status === 'done' }">
      <div v-if="isEditing">
        <!-- 編集モード -->
        <input
          v-model="editedTitle"
          placeholder="新しいタスク名"
          @keyup.enter="saveEdit"
          ref="editInput"
          class="edit-input"
        />
        <button @click="saveEdit">保存</button>
        <button @click="cancelEdit">キャンセル</button>
      </div>
      <div v-else>
        <!-- 通常表示モード -->
        <input
          type="checkbox"
          :checked="task.status === 'done'"
          @change="toggleStatus"
        />
        <span>{{ task.title }}</span>
        <button @click="startEdit">編集</button>
        <button @click="deleteTask">削除</button>
      </div>
    </div>
  </template>
  
  <script lang="ts">
  import { defineComponent, ref, nextTick } from 'vue';
  
  export default defineComponent({
    props: {
      task: {
        type: Object,
        required: true,
      },
    },
    emits: ['update-task', 'delete-task'],
    setup(props, { emit }) {
      const isEditing = ref(false);
      const editedTitle = ref(props.task.title);
      const editInput = ref<HTMLInputElement | null>(null);
  
      const startEdit = () => {
        isEditing.value = true;
        nextTick(() => {
          editInput.value?.focus();
        });
      };
  
      const cancelEdit = () => {
        isEditing.value = false;
        editedTitle.value = props.task.title;
      };
  
      const saveEdit = () => {
        emit('update-task', { id: props.task._id, title: editedTitle.value });
        isEditing.value = false;
      };
  
      const toggleStatus = () => {
        const newStatus = props.task.status === 'done' ? 'todo' : 'done';
        emit('update-task', { id: props.task._id, status: newStatus });
      };
  
      const deleteTask = () => {
        emit('delete-task', props.task._id);
      };
  
      return {
        isEditing,
        editedTitle,
        startEdit,
        cancelEdit,
        saveEdit,
        toggleStatus,
        deleteTask,
        editInput,
      };
    },
  });
  </script>
  
  <style scoped>
  .edit-input {
    width: 100%;
    padding: 0.5em;
    box-sizing: border-box;
    font-size: 1em;
    overflow: auto;
    word-wrap: break-word;
    white-space: pre-wrap;
  }
  .completed span {
    text-decoration: line-through;
    color: gray;
  }
  </style>
  