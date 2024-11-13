<template>
  <div :class="['task-item', taskClass]" ref="taskItem">
    <div v-if="isEditing">
      <!-- 編集モード -->
      <input
        v-model="editedTitle"
        placeholder="新しいタスク名"
        @keyup.enter="saveEdit"
        @click.stop
        ref="editInput"
        class="edit-input"
      />
      <select v-model="editedPriority">
        <option value="high">高</option>
        <option value="medium">中</option>
        <option value="low">低</option>
      </select>
      <input type="date" v-model="editedDueDate" /> <!-- 期日入力欄 -->
      <button @click.stop="saveEdit">保存</button>
      <button @click.stop="cancelEdit">キャンセル</button>
    </div>
    <div v-else>
      <!-- 通常表示モード -->
      <input
        type="checkbox"
        :checked="task.status === 'done'"
        @change="toggleStatus"
      />
      <span :class="{ 'completed-text': task.status === 'done', 'overdue-text': isOverdue }">
        {{ task.title }}
      </span>
      <span class="priority" :class="task.priority">{{ priorityLabel }}</span>
      <span :class="['due-date', { 'overdue-text': isOverdue }]">期日: {{ formattedDueDate }}</span>
      <span class="created-date">作成日: {{ formattedCreatedAt }}</span>
      <button @click.stop="startEdit">編集</button>
      <button @click.stop="deleteTask">削除</button>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, computed, nextTick, onMounted, onBeforeUnmount } from 'vue';

export default defineComponent({
  props: {
    task: {
      type: Object as () => {
        _id: string;
        title: string;
        status: 'todo' | 'in-progress' | 'done';
        priority: 'high' | 'medium' | 'low';
        dueDate?: string;
        createdAt: string;
      },
      required: true,
    },
  },
  emits: ['update-task', 'delete-task'],
  setup(props, { emit }) {
    const isEditing = ref(false);
    const editedTitle = ref(props.task.title);
    const editedPriority = ref(props.task.priority);
    const editedDueDate = ref(props.task.dueDate || '');
    const editInput = ref<HTMLInputElement | null>(null);
    const taskItem = ref<HTMLElement | null>(null);

    const priorityLabel = computed(() => {
      switch (props.task.priority) {
        case 'high':
          return '高';
        case 'medium':
          return '中';
        case 'low':
          return '低';
        default:
          return '';
      }
    });

    const isOverdue = computed(() => {
      const currentDate = new Date();
      const dueDate = props.task.dueDate ? new Date(props.task.dueDate) : null;
      return dueDate ? dueDate < currentDate && props.task.status !== 'done' : false;
    });

    const taskClass = computed(() => {
      const currentDate = new Date();
      const dueDate = props.task.dueDate ? new Date(props.task.dueDate) : null;
      if (dueDate) {
        const isNearDue = dueDate.getTime() - currentDate.getTime() <= 3 * 24 * 60 * 60 * 1000; // 3日以内
        return {
          overdue: isOverdue.value,
          'near-due': !isOverdue.value && isNearDue,
        };
      }
      return {};
    });

    const formattedDueDate = computed(() => {
      if (props.task.dueDate) {
        const date = new Date(props.task.dueDate);
        return date.toLocaleDateString('ja-JP');
      }
      return '';
    });

    const formattedCreatedAt = computed(() => {
      const date = new Date(props.task.createdAt);
      return date.toLocaleDateString('ja-JP');
    });

    const startEdit = () => {
      isEditing.value = true;
      nextTick(() => {
        editInput.value?.focus();
      });
    };

    const cancelEdit = () => {
      isEditing.value = false;
      editedTitle.value = props.task.title;
      editedPriority.value = props.task.priority;
      editedDueDate.value = props.task.dueDate || '';
    };

    const saveEdit = () => {
      emit('update-task', {
        id: props.task._id,
        title: editedTitle.value,
        priority: editedPriority.value,
        dueDate: editedDueDate.value,
      });
      isEditing.value = false;
    };

    const toggleStatus = () => {
      const newStatus = props.task.status === 'done' ? 'todo' : 'done';
      emit('update-task', { id: props.task._id, status: newStatus });
    };

    const deleteTask = () => {
      emit('delete-task', props.task._id);
    };

    const handleClickOutside = (event: MouseEvent) => {
      if (isEditing.value && taskItem.value && !taskItem.value.contains(event.target as Node)) {
        saveEdit();
      }
    };

    onMounted(() => {
      document.addEventListener('click', handleClickOutside);
    });

    onBeforeUnmount(() => {
      document.removeEventListener('click', handleClickOutside);
    });

    return {
      isEditing,
      editedTitle,
      editedPriority,
      editedDueDate,
      startEdit,
      cancelEdit,
      saveEdit,
      toggleStatus,
      deleteTask,
      editInput,
      taskItem,
      priorityLabel,
      taskClass,
      isOverdue,
      formattedDueDate,
      formattedCreatedAt,
    };
  },
});
</script>

<style scoped>
.task-item {
  padding: 1em;
  border-radius: 5px;
  margin-bottom: 10px;
}
.edit-input {
  width: 100%;
  padding: 0.5em;
}
.completed-text {
  text-decoration: line-through;
  color: gray;
}
.overdue-text {
  font-weight: bold;
}
.priority.high {
  color: red;
}
.priority.medium {
  color: orange;
}
.priority.low {
  color: green;
}
.overdue {
  background-color: #ffdddd;
  border-left: 5px solid red;
}
.near-due {
  background-color: #fff0cc;
  border-left: 5px solid orange;
}
.due-date, .created-date {
  margin-left: 8px;
  font-size: 0.8em;
  color: gray;
}
.due-date.overdue-text {
  font-weight: bold;
}
</style>
