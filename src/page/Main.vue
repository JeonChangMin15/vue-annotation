<script setup lang="ts">
import { ref, onMounted, reactive, watch } from "vue";
import { useAnnotation } from "@/hooks/useAnnotation";

const { svgRef, deleteBox, globalBox } = useAnnotation({ boxStrokeWidth: 2 });
const imageSize = reactive({ width: 0, height: 0 });
const imageRef = ref<HTMLImageElement | null>(null);

onMounted(() => {
  const img = new Image();
  img.onload = function () {
    imageSize.width = img.naturalWidth;
    imageSize.height = img.naturalHeight;
  };
  img.src = "/src/assets/images/chiwa.jpg";
});

watch(globalBox, () => {
  console.log(globalBox[0]);
});
</script>

<template>
  <div class="container">
    <button class="button" @click="deleteBox">박스 삭제</button>
    <svg
      id="draw"
      ref="svgRef"
      class="svg_container"
      :width="imageSize.width"
      :height="imageSize.height"
    >
      <image ref="imageRef" href="/src/assets/images/chiwa.jpg" />
    </svg>
  </div>
</template>

<style scoped>
@import "/src/scss/page/Main.scss";
</style>
