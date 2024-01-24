import { ref } from "vue";
import { defineStore } from "pinia";

export const useRectStore = defineStore("rect", () => {
  const globalRectCount = ref(0);
  function increment() {
    globalRectCount.value++;
  }

  return { globalRectCount, increment };
});
