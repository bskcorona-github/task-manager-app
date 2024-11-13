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
      
      <!-- 優先度選択をPrioritySelectコンポーネントで管理 -->
      <PrioritySelect v-model="editedPriority" />

      <input type="date" v-model="editedDueDate" /> <!-- 期日入力欄 -->

      <!-- タグ編集をTagListコンポーネントで管理し、配列として渡す -->
      <TagList v-model="editedTagsArray" :isEditing="true" />

      <button @click.stop="saveEdit">保存</button>
      <button @click.stop="cancelEdit">キャンセル</button>
    </div>

    <div v-else>
      <!-- 通常表示モード -->
      <input type="checkbox" :checked="task.status === 'done'" @change="toggleStatus" />
      <span :class="{ 'completed-text': task.status === 'done', 'overdue-text': isOverdue }">{{ task.title }}</span>
      
      <span class="priority" :class="task.priority">{{ priorityLabel }}</span>
      <span :class="['due-date', { 'overdue-text': isOverdue }]">期日: {{ formattedDueDate }}</span>
      <span class="created-date">作成日: {{ formattedCreatedAt }}</span>

      <!-- タグ表示をTagListコンポーネントで管理 -->
      <TagList :modelValue="task.tags" :isEditing="false" />

      <button @click.stop="startEdit">編集</button>
      <button @click.stop="deleteTask">削除</button>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, computed, nextTick, onMounted, onBeforeUnmount } from 'vue';
import PrioritySelect from './PrioritySelect.vue';
import TagList from './TagList.vue';
import './assets/global.css';

export default defineComponent({
  components: {
    PrioritySelect,
    TagList,
  },
  props: {
    task: {
      type: Object as () => {
        _id: string;
        title: string;
        status: 'todo' | 'in-progress' | 'done';
        priority: 'high' | 'medium' | 'low';
        dueDate?: string;
        createdAt: string;
        tags: string[];
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
    const editedTagsArray = ref([...props.task.tags]); // タグ配列としてタグを扱う
    const editInput = ref<HTMLInputElement | null>(null);
    const taskItem = ref<HTMLElement | null>(null);

    const priorityLabel = computed(() => {
      switch (props.task.priority) {
        case 'high': return '高';
        case 'medium': return '中';
        case 'low': return '低';
        default: return '';
      }
    });

    const formattedDueDate = computed(() => {
      return props.task.dueDate ? new Date(props.task.dueDate).toLocaleDateString('ja-JP') : '';
    });

    const formattedCreatedAt = computed(() => {
      return new Date(props.task.createdAt).toLocaleDateString('ja-JP');
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
        const isNearDue = dueDate.getTime() - currentDate.getTime() <= 3 * 24 * 60 * 60 * 1000;
        return {
          overdue: isOverdue.value,
          'near-due': !isOverdue.value && isNearDue,
        };
      }
      return {};
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
      editedTagsArray.value = [...props.task.tags];
    };

    const saveEdit = () => {
      emit('update-task', {
        id: props.task._id,
        title: editedTitle.value,
        priority: editedPriority.value,
        dueDate: editedDueDate.value,
        tags: editedTagsArray.value,
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
      editedTagsArray,
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
