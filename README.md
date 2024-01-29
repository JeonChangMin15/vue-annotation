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

```
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
      <image ref="imageRef" href="/src/assets/images/chiwa.jpg" />
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

```
boxStrokeWidth = 1
boxStrokeColor = 'blue'
boxStrokeColor =  "#FFCCCC"
boxFillOpacity = 0.4
circleRadius = 6
circleFillColor = 'red'
circleStrokeColor = 'black'
```
