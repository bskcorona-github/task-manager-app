<!-- frontend/components/DueDatePicker.vue -->
<template>
    <input type="date" v-model="modelValue" />
  </template>
  
  <script lang="ts">
  import { defineComponent } from 'vue';
  
  export default defineComponent({
    props: {
      modelValue: {
        type: String,
        default: '',
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
  