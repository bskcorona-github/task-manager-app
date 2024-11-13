<!-- frontend/components/TagList.vue -->
<template>
    <div class="tag-list">
      <span v-for="(tag, index) in modelValue" :key="index" class="tag">
        {{ tag }}
        <button v-if="isEditing" @click="removeTag(index)">×</button>
      </span>
      <input
        v-if="isEditing"
        v-model="newTag"
        @keyup.enter="addTag"
        placeholder="タグを追加"
      />
    </div>
  </template>
  
  <script lang="ts">
  import { defineComponent, ref } from 'vue';
  
  export default defineComponent({
    props: {
      modelValue: {
        type: Array as () => string[],
        default: () => [],
      },
      isEditing: {
        type: Boolean,
        default: false,
      },
    },
    emits: ['update:modelValue'],
    setup(props, { emit }) {
      const newTag = ref('');
  
      const addTag = () => {
        if (newTag.value.trim()) {
          emit('update:modelValue', [...props.modelValue, newTag.value.trim()]);
          newTag.value = '';
        }
      };
  
      const removeTag = (index: number) => {
        const updatedTags = [...props.modelValue];
        updatedTags.splice(index, 1);
        emit('update:modelValue', updatedTags);
      };
  
      return { newTag, addTag, removeTag };
    },
  });
  </script>
  
  <style scoped>
  .tag-list {
    display: flex;
    flex-wrap: wrap;
    gap: 5px;
  }
  .tag {
    background-color: #e0e0e0;
    padding: 5px;
    border-radius: 3px;
    display: flex;
    align-items: center;
  }
  .tag button {
    margin-left: 5px;
    border: none;
    background: none;
    cursor: pointer;
  }
  </style>
  