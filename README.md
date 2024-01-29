# Simple Vue Annotation for Vue3 Composition api

### Example

![annotation](https://github.com/JeonChangMin15/vue-annotation/assets/89255072/fdea21da-ea02-4ac2-951e-71078f7c3bd0)

### Features

- Draggable and Resizeable
- Customize Box style
- Get Box Info (position, width, height)

### Install

```
npm i vue-annotation
```

### How To Use

```javascript
<script setup lang="ts">
import { useAnnotation } from "vue-annotation";
const { svgRef, globalBox, deleteBox } = useAnnotation({});
</script>

<template>
  <div>
    <button @click="deleteBox">Box Delete Button</button>
    <svg
      ref="svgRef"
      :width="200"
      :height="200"
    >
      <image href="/src/assets/images/chiwa.jpg" />
    </svg>
  </div>
</template>
```

- This library uses D3.js, so it draws boxes inside an SVG tag within a template tag. To do this, it is necessary to declare the **svgRef** from the useAnnotation composable as the ref of the SVG tag.

### useAnnotation Props

| Props             | Type   | Default |
| ----------------- | ------ | ------- |
| boxStrokeWidth    | number | 1       |
| boxStrokeColor    | string | blue    |
| boxFillColor      | string | #FFCCCC |
| boxFillOpacity    | number | 0.4     |
| circleRadius      | number | 6       |
| circleFillColor   | string | red     |
| circleStrokeColor | string | black   |
