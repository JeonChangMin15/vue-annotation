import { reactive } from "vue";
import { defineStore } from "pinia";

export interface Rect {
  x: number;
  y: number;
  width: number;
  height: number;
  id: number;
}

export const useBoxStore = defineStore("box", () => {
  const globalBox = reactive<Rect[]>([]);

  const addBox = (rect: Rect) => {
    globalBox.push(rect);
  };

  const deleteBoxStore = (id: number) => {
    const index = globalBox.findIndex((box) => box.id === id);
    if (index !== -1) {
      globalBox.splice(index, 1);
    }
  };

  return { globalBox, addBox, deleteBoxStore };
});
