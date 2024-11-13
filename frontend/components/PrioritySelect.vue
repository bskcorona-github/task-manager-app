<!-- frontend/components/PrioritySelect.vue -->
<template>
    <select v-model="modelValue">
      <option value="high">高</option>
      <option value="medium">中</option>
      <option value="low">低</option>
    </select>
  </template>
  
  <script lang="ts">
  import { defineComponent } from 'vue';
  
  export default defineComponent({
    props: {
      modelValue: {
        type: String,
        default: 'medium',
      },
    },
    emits: ['update:modelValue'],
    watch: {
      modelValue(newVal) {
        this.$emit('update:modelValue', newVal);
      }
    }
  });
  </script>
  