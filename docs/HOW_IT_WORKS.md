# 旋转实现

在 canvas 中选中一个元素时, 会渲染一个 IF 组件

```javascript
<If condition={item.selected}>
    <g
        data-element-root
        data-prototype={item.prototype}
        data-id={item.id}
        data-selected={item.selected}
        data-layer={layer.id}
        data-part="rotation-anchor"
    >
        <circle cx="0" cy="150" r="10" style={STYLE_CIRCLE} />
        <circle cx="0" cy="0" r="150" style={STYLE_CIRCLE2} />
    </g>
</If>
```

在 view2d.jsx 中对鼠标事件进行了判断, 会判断当前当前状态是否是 MODE_IDLE, 也就是说如果当前处于 MODE_ROTATING 状态时, 这些其他事件不会触发

会根据点击节点上的`data-prototype={item.prototype}`判断选中元素类型, 如果是 item 类型(自定义), 且点击节点的 data-part 属性为 rotation-anchor 时, 则证明点击了旋转的锚点, 此时会将当前状态改为<MODE_ROTATING_ITEM>

在 mousemove 事件的处理函数中, 会根据 x, y 值判断移动了多少角度, 在接近 90° 倍数时, 会自动吸附

# redux 数据梳理

1. src/renderer.jsx 中

```javascript
let AppState = Map({
    "react-planner": new PlannerModels.State(),
});
```

这个 AppState 后来被用来实例化 reducer, 也就是 reducer 初始值来源, 这个 AppState 被 Map 包裹, 变成不可变属性(后来值的更改都是通过 merge 在拷贝一份新的出来)
AppState 实质就是一个 map, 其中最重要也是唯一的 react-planner 是 PlannerModels.State 的实例, 见 src/models 的 State 声明

```javascript
// Record是个工厂函数, 函数返回一个class
export class State extends Record {}
```

在实例化 State 的时候没传任何参数, 构造函数的 json, 估计是 react-planner 项目导入导出使用的

所有初始化默认值都在 Record 工厂函数的参数中

```javascript
export class State extends Record(
    {
        mode: MODE_IDLE,
        scene: new Scene(),
        sceneHistory: new HistoryStructure(),
        catalog: new Catalog(),
        viewer2D: new Map(),
        mouse: new Map({ x: 0, y: 0 }),
        zoom: 0,
        snapMask: SNAP_MASK,
        snapElements: new List(),
        activeSnapElement: null,
        drawingSupport: new Map(),
        draggingSupport: new Map(),
        rotatingSupport: new Map(),
        errors: new List(),
        warnings: new List(),
        clipboardProperties: new Map(),
        selectedElementsHistory: new List(),
        misc: new Map(), //additional info
        alterate: false,
    },
    "State"
) {}
```

# 添加元素的属性

添加的元素都在保存在 redux 的 layers 中, 在画布中添加 item(自定义)元素, 通过审查工具审查 redux 值的变化, 发现在 scene -> layer -> items 可以找到这个元素, 根据这个元素的一些特定属性去项目中搜索, 经过推敲, 可以锁定 Item 构造函数

```javascript
export class Item extends Record(
    {
        ...sharedAttributes,
        prototype: "items",
        x: 0,
        y: 0,
        rotation: 0,
    },
    "Item"
) {
    constructor(json = {}) {
        super({
            ...json,
            properties: fromJS(json.properties || {}),
        });
    }
}
```

根据命名可以推断公用属性在 sharedAttributes, 经过验证果然如此, 大部分组件都有这些属性, 扩展的属性在各自构造函数中添加, 如 items 有 x, y, rotation 等属性

```javascript
const sharedAttributes = {
    id: "",
    type: "",
    prototype: "",
    name: "",
    misc: new Map(),
    selected: false,
    properties: new Map(),
    visible: true,
};
```

# 添加节点原理

突破口在 catalog-list 这个文件, 点击"+", 弹出候选列表, 点击元素后, mode 切换为 MODE_DRAWING_ITEM, 此时 state 中的 selectedSupport 变为当前选中元素的 currentId 和 type, 此时所有属性都可以通过 id 和 type 进行查询.
选中某个 "元素" 后, mode 转为 MODE_DRAWING_ITEM, 此时 content.jsx 根据条件判断会渲染<View2D />这个组件, 组件中绑定 mousemove 事件, 在 move 事件中会走

```javascript
let onMouseMove = (viewerEvent) => {
    switch (mode) {
        // 我选中的是item, 因此会走这个分支
        case constants.MODE_DRAWING_ITEM:
            itemsActions.updateDrawingItem(layerID, x, y);
            break;
    }
};
```
