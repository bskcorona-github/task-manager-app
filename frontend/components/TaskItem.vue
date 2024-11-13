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
      <span>{{ task.title }}</span>
      <span class="priority" :class="task.priority">{{ priorityLabel }}</span>
      <span v-if="task.dueDate" class="due-date">期日: {{ formattedDueDate }}</span> <!-- 期日の表示 -->
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
      },
      required: true,
    },
  },
  emits: ['update-task', 'delete-task'],
  setup(props, { emit }) {
    const isEditing = ref(false);
    const editedTitle = ref(props.task.title);
    const editedPriority = ref(props.task.priority); // 優先度の編集用
    const editedDueDate = ref(props.task.dueDate || ''); // 期日編集用
    const editInput = ref<HTMLInputElement | null>(null);
    const taskItem = ref<HTMLElement | null>(null);

    // 日本語の優先度ラベルを取得する computed プロパティ
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

    const taskClass = computed(() => {
      const currentDate = new Date();
      const dueDate = props.task.dueDate ? new Date(props.task.dueDate) : null;
      if (dueDate) {
        const isOverdue = dueDate < currentDate && props.task.status !== 'done';
        const isNearDue = dueDate.getTime() - currentDate.getTime() <= 3 * 24 * 60 * 60 * 1000; // 3日以内
        return {
          overdue: isOverdue,
          'near-due': !isOverdue && isNearDue,
        };
      }
      return {};
    });

    // フォーマット済みの期日を取得する computed プロパティ
    const formattedDueDate = computed(() => {
      if (props.task.dueDate) {
        const date = new Date(props.task.dueDate);
        return date.toLocaleDateString('ja-JP'); // 日本語形式で日付を表示
      }
      return '';
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
        saveEdit(); // 外部クリック時に保存
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
      formattedDueDate, // フォーマット済みの日付を表示
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
.completed span {
  text-decoration: line-through;
  color: gray;
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
.due-date {
  margin-left: 8px;
  font-weight: bold;
}
</style>
