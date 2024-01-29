# Simple Vue Annotation for Vue3 Composition api

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
    <button>Box Delete Button</button>
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

```javascript
interface Props {
  boxStrokeWidth?: number;
  boxStrokeColor?: string;
  boxFillColor?: string;
  boxFillOpacity?: number;
  circleRadius?: number;
  circleFillColor?: string;
  circleStrokeColor?: string;
}
```

### Default Value of Props

```javascript
const boxStrokeWidth = 1;
const boxStrokeColor = "blue";
const boxStrokeColor = "#FFCCCC";
const boxFillOpacity = 0.4;
const circleRadius = 6;
const circleFillColor = "red";
const circleStrokeColor = "black";
```
