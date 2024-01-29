import { ref, onMounted, reactive, onUnmounted } from "vue";
import { useMouseInElement } from "@vueuse/core";
import { throttle } from "lodash";
import * as d3 from "d3";

interface Circle {
  x: number;
  y: number;
  width: number;
  height: number;
  id: number;
}

interface Rect {
  x: number;
  y: number;
  width: number;
  height: number;
  id: number;
}

type ChangePosition = "leftUp" | "leftDown" | "rightUp" | "rightDown" | "";

interface Props {
  boxStrokeWidth?: number;
  boxStrokeColor?: string;
  boxFillColor?: string;
  boxFillOpacity?: number;
  circleRadius?: number;
  circleFillColor?: string;
  circleStrokeColor?: string;
}

export const useAnnotation = ({
  boxFillColor,
  boxFillOpacity,
  boxStrokeColor,
  boxStrokeWidth,
  circleFillColor,
  circleRadius,
  circleStrokeColor,
}: Props) => {
  const BOX_STROKE_WIDTH = boxStrokeWidth ? boxStrokeWidth : 1;
  const BOX_STROKE_COLOR = boxStrokeColor ? boxStrokeColor : "blue";
  const BOX_FILL_COLOR = boxFillColor ? boxFillColor : "#FFCCCC";
  const BOX_FILL_OPACITY = boxFillOpacity ? boxFillOpacity : 0.4;
  const CIRCLE_RADIUS = circleRadius ? circleRadius : 6;
  const CIRCLE_FILL_COLOR = circleFillColor ? circleFillColor : "red";
  const CIRCLE_STROKE_COLOR = circleStrokeColor ? circleStrokeColor : "black";

  const startPosition = reactive({ x: 0, y: 0 });
  const svgRef = ref<SVGAElement | null>(null);
  const selectedBoxId = ref<null | number>(null);
  const isClicked = ref(false);
  const isWidthHeightChanged = ref(false);
  const changePosition = ref<ChangePosition>("");

  const globalBox = reactive<Rect[]>([]);
  const globalRectCount = ref(1);
  const { elementX, elementY } = useMouseInElement(svgRef);

  const addBox = (rect: Rect) => {
    globalBox.push(rect);
  };

  const deleteBoxStore = (id: number) => {
    const index = globalBox.findIndex((box) => box.id === id);
    if (index !== -1) {
      globalBox.splice(index, 1);
    }
  };

  const increment = () => {
    globalRectCount.value++;
  };

  const deleteBox = () => {
    if (selectedBoxId.value === null) return;
    const position = ["leftup", "leftdown", "rightup", "rightdown"];
    position.forEach((pos) =>
      d3.select(`#circle-${pos}-${selectedBoxId.value}`).remove()
    );

    d3.select(`#rect-${selectedBoxId.value}`).remove();
    deleteBoxStore(selectedBoxId.value);
    selectedBoxId.value = null;
  };

  const checkBoxArea = (curX: number, curY: number) => {
    for (const { x, y, width, height, id } of globalBox) {
      const isMouseInBox =
        curX > x - CIRCLE_RADIUS &&
        curX < x + width + CIRCLE_RADIUS &&
        curY > y - CIRCLE_RADIUS &&
        curY < y + height + CIRCLE_RADIUS;

      if (isMouseInBox) {
        selectedBoxId.value = id;
        return true;
      }
    }

    return false;
  };

  // 박스를 생성했을때 모서리에 원 생성
  const drawCircles = (circle: Circle) => {
    const { x, y, height, width, id } = circle;

    const circlesInfo = [
      { position: "leftup", coordinate: [x, y], cursor: "nwse-resize" },
      {
        position: "leftdown",
        coordinate: [x, y + height],
        cursor: "nesw-resize",
      },
      {
        position: "rightup",
        coordinate: [x + width, y],
        cursor: "nesw-resize",
      },
      {
        position: "rightdown",
        coordinate: [x + width, y + height],
        cursor: "nwse-resize",
      },
    ];

    circlesInfo.forEach(({ position, coordinate, cursor }) => {
      d3.select(svgRef.value)
        .append("circle")
        .attr("id", `circle-${position}-${id}`)
        .attr("class", "circle-hover")
        .attr("cx", coordinate[0])
        .attr("cy", coordinate[1])
        .attr("r", CIRCLE_RADIUS)
        .attr("stroke", CIRCLE_STROKE_COLOR)
        .attr("fill", CIRCLE_FILL_COLOR)
        .style("cursor", cursor);
    });
  };

  // 생성된 박스의 위치만 변경될때 해당 박스의 모서리 원도 같이 움직이도록 하는 함수
  const circleMovePosition = (circle: Circle) => {
    const { x, y, width, height, id } = circle;
    const deltaX = elementX.value - startPosition.x;
    const deltaY = elementY.value - startPosition.y;

    d3.select(`#circle-leftup-${id}`)
      .attr("cx", x + deltaX)
      .attr("cy", y + deltaY);

    d3.select(`#circle-leftdown-${id}`)
      .attr("cx", x + deltaX)
      .attr("cy", y + deltaY + height);

    d3.select(`#circle-rightup-${id}`)
      .attr("cx", x + deltaX + width)
      .attr("cy", y + deltaY);

    d3.select(`#circle-rightdown-${id}`)
      .attr("cx", x + deltaX + width)
      .attr("cy", y + deltaY + height);
  };

  // 박스의 너비 높이를 조절할때 모서리 원들의 위치를 조절하는 함수
  const circleMoveWidthHeight = (circle: Circle) => {
    const { x, y, height, width, id } = circle;

    d3.select(`#circle-leftup-${id}`).attr("cx", x).attr("cy", y);

    d3.select(`#circle-leftdown-${id}`)
      .attr("cx", x)
      .attr("cy", y + height);

    d3.select(`#circle-rightup-${id}`)
      .attr("cx", x + width)
      .attr("cy", y);

    d3.select(`#circle-rightdown-${id}`)
      .attr("cx", x + width)
      .attr("cy", y + height);
  };

  // store에 저장된 rect를 먼저 그려주는 함수
  const drawPrevRect = () => {
    if (!globalBox.length) return;

    globalBox.forEach(({ x, y, width, height, id }) => {
      d3.select(svgRef.value)
        .append("rect")
        .attr("id", `rect-${id}`)
        .attr("width", width)
        .attr("height", height)
        .attr("x", x)
        .attr("y", y)
        .attr("stroke", BOX_STROKE_COLOR)
        .attr("fill-opacity", 0)
        .attr("stroke-width", BOX_STROKE_WIDTH);

      drawCircles({ x, y, width, height, id });
    });
  };

  const fillSelectedBox = (id: number) => {
    if (id === selectedBoxId.value) {
      d3.select(`#rect-${id}`)
        .attr("fill", BOX_FILL_COLOR)
        .attr("fill-opacity", BOX_FILL_OPACITY);
    } else {
      d3.select(`#rect-${id}`).attr("fill-opacity", 0);
    }
  };

  /**
   * 마우스가 클릭됐을때 마우스 좌표값얻어서
   * 해당 마우스 위치에 박스가 있는지 검사하고 있으면 rect생성안함
   * 박스가 있는 공간이면 해당 박스의 색깔을 넣어주고 아니면 모든 박스의 opacity -> 0
   */
  const mouseDownEvent = () => {
    startPosition.x = elementX.value;
    startPosition.y = elementY.value;
    isClicked.value = true;
    isWidthHeightChanged.value = false;
    selectedBoxId.value = null;
    changePosition.value = "";
    const isBoxArea = checkBoxArea(startPosition.x, startPosition.y);

    if (isBoxArea) {
      globalBox.forEach(({ id }) => fillSelectedBox(id));
      return;
    } else {
      globalBox.forEach(({ id }) =>
        d3.select(`#rect-${id}`).attr("fill-opacity", 0)
      );
    }

    d3.select(svgRef.value)
      .append("rect")
      .attr("id", `rect-${globalRectCount.value}`)
      .attr("x", startPosition.x)
      .attr("y", startPosition.y)
      .attr("width", 0)
      .attr("height", 0)
      .attr("stroke", BOX_STROKE_COLOR)
      .attr("fill-opacity", 0)
      .attr("stroke-width", BOX_STROKE_WIDTH);
  };

  const handleSelectedBoxWidthHeight = ({
    x,
    y,
    width,
    height,
    id,
  }: Circle) => {
    d3.select(`#rect-${id}`)
      .attr("width", Math.abs(width))
      .attr("height", Math.abs(height))
      .attr("x", x)
      .attr("y", y);

    circleMoveWidthHeight({
      x,
      y,
      width: Math.abs(width),
      height: Math.abs(height),
      id: id,
    });
  };

  // 만들어진 박스를 움직일때 발생되는 이벤트
  const selectedBoxMove = () => {
    if (!isClicked.value || selectedBoxId.value === null) return;

    const info = globalBox.filter((v) => v.id === selectedBoxId.value)[0];

    // 선택한 박스의 너비, 높이를 조절할때 적용되는 코드
    if (
      Math.abs(info.x + info.width - startPosition.x) < CIRCLE_RADIUS &&
      Math.abs(info.y + info.height - startPosition.y) < CIRCLE_RADIUS
    ) {
      isWidthHeightChanged.value = true;
      changePosition.value = "rightDown";

      const width = info.width + (elementX.value - startPosition.x);
      const height = info.height + (elementY.value - startPosition.y);
      const x = width > 0 ? info.x : elementX.value;
      const y = height > 0 ? info.y : elementY.value;
      handleSelectedBoxWidthHeight({ x, y, width, height, id: info.id });
      return;
    }

    if (
      Math.abs(info.x + info.width - startPosition.x) < CIRCLE_RADIUS &&
      Math.abs(info.y - startPosition.y) < CIRCLE_RADIUS
    ) {
      isWidthHeightChanged.value = true;
      changePosition.value = "rightUp";

      const width = info.width + (elementX.value - startPosition.x);
      const height = info.height - (elementY.value - startPosition.y);
      const x = width > 0 ? info.x : elementX.value;
      const y = height > 0 ? elementY.value : info.y + info.height;
      handleSelectedBoxWidthHeight({ x, y, width, height, id: info.id });
      return;
    }

    if (
      Math.abs(info.x - startPosition.x) < CIRCLE_RADIUS &&
      Math.abs(info.y + info.height - startPosition.y) < CIRCLE_RADIUS
    ) {
      isWidthHeightChanged.value = true;
      changePosition.value = "leftDown";

      const width = info.width - (elementX.value - startPosition.x);
      const height = info.height + (elementY.value - startPosition.y);
      const x = width > 0 ? elementX.value : info.x + info.width;
      const y = height > 0 ? info.y : elementY.value;
      handleSelectedBoxWidthHeight({ x, y, width, height, id: info.id });
      return;
    }

    if (
      Math.abs(info.x - startPosition.x) < CIRCLE_RADIUS &&
      Math.abs(info.y - startPosition.y) < CIRCLE_RADIUS
    ) {
      isWidthHeightChanged.value = true;
      changePosition.value = "leftUp";

      const width = info.width - (elementX.value - startPosition.x);
      const height = info.height - (elementY.value - startPosition.y);
      const x = width > 0 ? elementX.value : info.x + info.width;
      const y = height > 0 ? elementY.value : info.y + info.height;
      handleSelectedBoxWidthHeight({ x, y, width, height, id: info.id });
      return;
    }

    // 선택한 박스의 위치를 조절하는 코드
    d3.select(`#rect-${info.id}`)
      .attr("x", info.x + (elementX.value - startPosition.x))
      .attr("y", info.y + (elementY.value - startPosition.y));

    circleMovePosition({
      x: info.x,
      y: info.y,
      width: info.width,
      height: info.height,
      id: info.id,
    });
  };

  const newBoxMoveEvent = () => {
    if (!isClicked.value || selectedBoxId.value !== null) return;

    // 새로운 박스를 생성하는 코드
    d3.select(`#rect-${globalRectCount.value}`)
      .attr("width", Math.abs(startPosition.x - elementX.value))
      .attr("height", Math.abs(startPosition.y - elementY.value))
      .attr("x", Math.min(startPosition.x, elementX.value))
      .attr("y", Math.min(startPosition.y, elementY.value));
  };

  // 이미 만들어진 박스를 움직이고 마우스를 땠을때
  const selectedBoxMouseUp = () => {
    if (selectedBoxId.value === null) return;

    const index = globalBox.findIndex(
      (rect) => rect.id === selectedBoxId.value
    );
    if (index === -1) return;

    // 높이 너비 조절한 경우 전역스토어 저장하는 코드
    if (isWidthHeightChanged.value && changePosition.value === "rightDown") {
      const width = globalBox[index].width + (elementX.value - startPosition.x);
      const height =
        globalBox[index].height + (elementY.value - startPosition.y);
      const x = width > 0 ? globalBox[index].x : elementX.value;
      const y = height > 0 ? globalBox[index].y : elementY.value;

      globalBox[index] = {
        ...globalBox[index],
        width: Math.abs(width),
        height: Math.abs(height),
        x,
        y,
      };
    }

    if (isWidthHeightChanged.value && changePosition.value === "rightUp") {
      const width = globalBox[index].width + (elementX.value - startPosition.x);
      const height =
        globalBox[index].height - (elementY.value - startPosition.y);
      const x = width > 0 ? globalBox[index].x : elementX.value;
      const y =
        height > 0
          ? elementY.value
          : globalBox[index].y + globalBox[index].height;

      globalBox[index] = {
        ...globalBox[index],
        width: Math.abs(width),
        height: Math.abs(height),
        x,
        y,
      };
    }

    if (isWidthHeightChanged.value && changePosition.value === "leftDown") {
      const width = globalBox[index].width - (elementX.value - startPosition.x);
      const height =
        globalBox[index].height + (elementY.value - startPosition.y);
      const x =
        width > 0
          ? elementX.value
          : globalBox[index].x + globalBox[index].width;
      const y = height > 0 ? globalBox[index].y : elementY.value;

      globalBox[index] = {
        ...globalBox[index],
        width: Math.abs(width),
        height: Math.abs(height),
        x,
        y,
      };
    }

    if (isWidthHeightChanged.value && changePosition.value === "leftUp") {
      const width = globalBox[index].width - (elementX.value - startPosition.x);
      const height =
        globalBox[index].height - (elementY.value - startPosition.y);
      const x =
        width > 0
          ? elementX.value
          : globalBox[index].x + globalBox[index].width;
      const y =
        height > 0
          ? elementY.value
          : globalBox[index].y + globalBox[index].height;

      globalBox[index] = {
        ...globalBox[index],
        width: Math.abs(width),
        height: Math.abs(height),
        x,
        y,
      };
    }

    // 위치를 조절한 경우 전역스토어에 저장하는 코드
    if (!isWidthHeightChanged.value) {
      globalBox[index] = {
        ...globalBox[index],
        x: globalBox[index].x + (elementX.value - startPosition.x),
        y: globalBox[index].y + (elementY.value - startPosition.y),
      };
    }

    isClicked.value = false;
    return;
  };

  //새로운 박스를 생성한거 였으면 새로운 박스 정보를 생성후 추가
  const newBoxMouseUp = () => {
    if (selectedBoxId.value !== null) return;

    const x = Math.min(startPosition.x, elementX.value);
    const y = Math.min(startPosition.y, elementY.value);
    const width = Math.abs(startPosition.x - elementX.value);
    const height = Math.abs(startPosition.y - elementY.value);

    d3.select(`#rect-${globalRectCount.value}`)
      .attr("width", width)
      .attr("height", height)
      .attr("x", x)
      .attr("y", y);

    // 단순 클릭했을때 rect 생성방지코드
    if (width > 5 && height > 5) {
      addBox({ x, y, width, height, id: globalRectCount.value });
      drawCircles({ x, y, width, height, id: globalRectCount.value });
    } else d3.select(`#rect-${globalRectCount.value}`).remove();

    isClicked.value = false;
    increment();
  };

  const selectedBoxMoveEvent = throttle(selectedBoxMove, 10); // 10ms throttle
  const newBoxEventMoveEvent = throttle(newBoxMoveEvent, 10);

  onMounted(() => {
    drawPrevRect();

    svgRef.value?.addEventListener("mousedown", mouseDownEvent);
    svgRef.value?.addEventListener("mousemove", newBoxEventMoveEvent);
    svgRef.value?.addEventListener("mousemove", selectedBoxMoveEvent);
    svgRef.value?.addEventListener("mouseup", selectedBoxMouseUp);
    svgRef.value?.addEventListener("mouseup", newBoxMouseUp);
  });

  onUnmounted(() => {
    svgRef.value?.removeEventListener("mousedown", mouseDownEvent);
    svgRef.value?.removeEventListener("mousemove", newBoxEventMoveEvent);
    svgRef.value?.removeEventListener("mousemove", selectedBoxMoveEvent);
    svgRef.value?.removeEventListener("mouseup", selectedBoxMouseUp);
    svgRef.value?.removeEventListener("mouseup", newBoxMouseUp);
  });

  return { svgRef, deleteBox, globalBox };
};
