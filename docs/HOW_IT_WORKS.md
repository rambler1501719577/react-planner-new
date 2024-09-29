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

# redux 数据初始化

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

# 添加元素的属性(attribute!!!)

添加的元素都在保存在 redux 的 layers 中, 在画布中添加 item(自定义)元素, 通过审查工具审查 redux 值的变化, 发现在 scene -> layer -> items 可以找到这个元素, 根据这个元素的一些特定属性(rotation)去项目中搜索, 经过推敲, 可以锁定 Item 构造函数

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

突破口在 catalog-list 这个文件, 在左侧菜单栏点击"+", 弹出候选列表, 点击元素后, 执行`select()`函数, mode 切换为 MODE_DRAWING_ITEM, 此时 `state` 中的 selectedSupport 变为当前选中元素的 currentId 和 type(为了记住当前选中的是哪个 item 以及 item 所属类别)
此时 content.jsx 根据 mode 条件判断会渲染<View2D />这个组件, 组件中绑定 mousemove 事件, 在 move 事件中会走

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

在这里面会尝试更新绘制的 item 的位置, 但是因为第一次创建, 没有 currentID, 会执行 create 函数创建一个新`item`

```javascript
// src/class/item.js
static updateDrawingItem(state, layerID, x, y) {
        if (state.hasIn(["drawingSupport", "currentID"])) {
            // 更新位置
        }else {
            // 通过new Item创建一个新Item, 并监听鼠标移动更新位置
            // this.create ==> Item静态函数create
            let { updatedState: stateI, item } = this.create(
                state, layerID, state.getIn(["drawingSupport", "type"]),
                x, y, 200, 100, 0
            );
            state = Item.select(stateI, layerID, item.id).updatedState;
        }
        return { updatedState: state };
    }
```

create 函数如下

```javascript
static create(state, layerID, type, x, y, width, height, rotation) {
        let itemID = IDBroker.acquireID();

        let item = state.catalog.factoryElement(type, {
            id: itemID,
            name: NameGenerator.generateName("items",state.catalog.getIn(["elements", type, "info", "title"])),
            type, height, width, x, y, rotation,
        });

        state = state.setIn(
            ["scene", "layers", layerID, "items", itemID], item
        );

        return { updatedState: state, item };
    }
```

这段代码创建了一个 item 并通过 state.setIn 函数, 通过 key 逐个访问 Map 并将 item 插入到指定位置
同理 state.getIn 也是一样的用法, 比如我想获取 scene.layers.defaultLayer.items.abcded 这个元素
只需要

```javascript
state.getIn(["scene", "layers", "defaultLayer", "items", "abcded"]);
```

类似 vuex 中的 mapState 辅助函数

# 扩展 width 和 height 问题

此案例以 src/catalog/catalogs/items/camera 为例
在 catalog/catalogs/item 所有 item 的 properties 添加 width 和 height 属性,

```javascript
export default {
    name: "camera",
    prototype: "items",
    properties: {
        altitude: {
            label: "altitude",
            type: "length-measure",
            defaultValue: {
                length: 100,
                unit: "cm",
            },
        },
        // NOTE: 此处增加width属性
        width: {
            label: "宽度",
            type: "length-measure",
            defaultValue: {
                length: 100,
                unit: "cm",
            },
        },
        // NOTE: 此处增加height属性
        height: {
            label: "高度",
            type: "length-measure",
            defaultValue: {
                length: 100,
                unit: "cm",
            },
        },
    },
};
```

将 item 自身渲染逻辑的宽高由文件内全局变量 WIDTH 和 HEIGHT 及 DEPTH 改为 properties 中的 height 和 width

```javascript
render2D: function (element, layer, scene) {
    let angle = element.rotation + 90;
    let textRotation = 0;
    if (Math.sin((angle * Math.PI) / 180) < 0) {
        textRotation = 180;
    }
    return (
        <g
            transform={`translate(${
                -this.properties.width.defaultValue.length / 2
            },${-this.properties.height.defaultValue.length / 2}`}
        >
            <rect
                key="1"
                x="0"
                y="0"
                width={this.properties.width.defaultValue.length}
                height={this.properties.height.defaultValuelength}
                style={{
                    stroke: element.selected ? "#0096fd" :"#000",
                    strokeWidth: "2px",
                    fill: "#84e1ce",
                }}
            />
            <text
                key="2"
                x="0"
                y="0"
                transform={`translate(${
                    this.properties.width.defaultValue.length / 2
                }, ${
                    this.properties.height.defaultValue.length /2
                }) scale(1,-1) rotate(${textRotation})`}
                style={{ textAnchor: "middle", fontSize:"11px" }}
            >
                {element.type}
            </text>
        </g>
    );
},
```

同时要修改 src/class/item 中的 updateDrawingItem/updateDrawingArea/updateDrawingHoles 等函数, 将硬编码 200, 100 的宽高改为从 redux(elements/item/如 camera/peoperties/height/defaultValue/length)中取值
js 读取代码如下

```javascript
updateDrawingItem(state, layerID, x, y) {
    if (state.hasIn(["drawingSupport", "currentID"])) {
        // 略: 更新位置信息
    } else {
        let { updatedState: stateI, item } = this.create(
            state,
            layerID,
            state.getIn(["drawingSupport", "type"]),
            x,
            y,
            state.catalog.getIn([
                "elements",
                state.getIn(["drawingSupport", "type"]),
                "properties",
                "width",
                "defaultValue",
                "length",
            ]),
            state.catalog.getIn([
                "elements",
                state.getIn(["drawingSupport", "type"]),
                "properties",
                "height",
                "defaultValue",
                "length",
            ]),
            0
        );
        state = Item.select(stateI, layerID, item.id).updatedState;
        state = state.setIn(["drawingSupport", "currentID"], item.id);
    }
    return { updatedState: state };
    }
```
