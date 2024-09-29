import React from "react";
import PropTypes from "prop-types";
import If from "../../utils/react-if";

const STYLE_CIRCLE = {
    fill: "red",
    cursor: "ew-resize",
    cursor: "ew-resize",
};
const RESIZER_BLOCK_SIZE = 10;
const RESIZER_COLOR = "red";

export default function Item({ layer, item, scene, catalog }) {
    let { x, y, rotation, width, height } = item;
    // 外操作框偏移
    const outerOffset = 10;

    let renderedItem = catalog
        .getElement(item.type)
        .render2D(item, layer, scene);

    return (
        <g
            data-element-root
            data-prototype={item.prototype}
            data-id={item.id}
            data-selected={item.selected}
            data-layer={layer.id}
            style={item.selected ? { cursor: "move" } : {}}
            transform={`translate(${x},${y}) rotate(${rotation})`}
        >
            {renderedItem}
            <If condition={item.selected}>
                <g>
                    {/* 外层选中框 */}
                    <rect
                        width={width + outerOffset * 2}
                        height={height + outerOffset * 2}
                        x={-width / 2 - outerOffset}
                        y={-height / 2 - outerOffset}
                        style={{ fill: "none", stroke: RESIZER_COLOR }}
                    />
                    {/* 旋转 */}
                    <g
                        data-element-root
                        data-prototype={item.prototype}
                        data-id={item.id}
                        data-selected={item.selected}
                        data-layer={layer.id}
                        data-part="rotation-anchor"
                    >
                        {/* <circle
                            cx="0"
                            cy={height / 2 + outerOffset + 15}
                            r={RESIZER_BLOCK_SIZE / 2}
                            style={STYLE_CIRCLE}
                        /> */}
                        <rect
                            width={RESIZER_BLOCK_SIZE}
                            height={RESIZER_BLOCK_SIZE}
                            x={-RESIZER_BLOCK_SIZE / 2}
                            y={
                                height / 2 +
                                outerOffset +
                                RESIZER_BLOCK_SIZE * 2
                            }
                            style={{ fill: RESIZER_COLOR }}
                        />
                    </g>
                    {/* 上下左右四个单向调整的块 */}
                    <g
                        data-element-root
                        data-prototype={item.prototype}
                        data-id={item.id}
                        data-selected={item.selected}
                        data-layer={layer.id}
                        data-part="resizer-direction-anchor"
                    >
                        {/* 顶中到旋转锚点的线 */}
                        <line
                            x1="0"
                            y1={height / 2 + outerOffset}
                            x2="0"
                            y2={
                                height / 2 +
                                +outerOffset +
                                RESIZER_BLOCK_SIZE * 2
                            }
                            stroke={RESIZER_COLOR}
                        />
                        {/* 左中 */}
                        <rect
                            width={RESIZER_BLOCK_SIZE}
                            height={RESIZER_BLOCK_SIZE}
                            x={
                                -width / 2 -
                                outerOffset -
                                RESIZER_BLOCK_SIZE / 2
                            }
                            y={-RESIZER_BLOCK_SIZE / 2}
                            style={{ fill: RESIZER_COLOR }}
                        />
                        {/* 右中 */}
                        <rect
                            width={RESIZER_BLOCK_SIZE}
                            height={RESIZER_BLOCK_SIZE}
                            x={width / 2 + outerOffset - RESIZER_BLOCK_SIZE / 2}
                            y={-RESIZER_BLOCK_SIZE / 2}
                            style={{ fill: RESIZER_COLOR }}
                        />
                        {/* 顶中 */}
                        <rect
                            width={RESIZER_BLOCK_SIZE}
                            height={RESIZER_BLOCK_SIZE}
                            x={-RESIZER_BLOCK_SIZE / 2}
                            y={
                                height / 2 +
                                outerOffset -
                                RESIZER_BLOCK_SIZE / 2
                            }
                            style={{ fill: RESIZER_COLOR }}
                        />
                        {/* 底中 */}
                        <rect
                            width={RESIZER_BLOCK_SIZE}
                            height={RESIZER_BLOCK_SIZE}
                            x={-RESIZER_BLOCK_SIZE / 2}
                            y={
                                -height / 2 -
                                outerOffset -
                                RESIZER_BLOCK_SIZE / 2
                            }
                            style={{ fill: RESIZER_COLOR }}
                        />
                        {/* 左上 */}
                        <rect
                            width={RESIZER_BLOCK_SIZE}
                            height={RESIZER_BLOCK_SIZE}
                            x={
                                -width / 2 -
                                outerOffset -
                                RESIZER_BLOCK_SIZE / 2
                            }
                            y={
                                height / 2 +
                                outerOffset -
                                RESIZER_BLOCK_SIZE / 2
                            }
                            style={{ fill: RESIZER_COLOR }}
                        />
                        {/* 右上 */}
                        <rect
                            width={RESIZER_BLOCK_SIZE}
                            height={RESIZER_BLOCK_SIZE}
                            x={width / 2 + outerOffset - RESIZER_BLOCK_SIZE / 2}
                            y={
                                height / 2 +
                                outerOffset -
                                RESIZER_BLOCK_SIZE / 2
                            }
                            style={{ fill: RESIZER_COLOR }}
                        />
                        {/* 左下 */}
                        <rect
                            width={RESIZER_BLOCK_SIZE}
                            height={RESIZER_BLOCK_SIZE}
                            x={
                                -width / 2 -
                                outerOffset -
                                RESIZER_BLOCK_SIZE / 2
                            }
                            y={
                                -height / 2 -
                                outerOffset -
                                RESIZER_BLOCK_SIZE / 2
                            }
                            style={{ fill: RESIZER_COLOR }}
                        />
                        {/* 右下 */}
                        <rect
                            width={RESIZER_BLOCK_SIZE}
                            height={RESIZER_BLOCK_SIZE}
                            x={width / 2 + outerOffset - RESIZER_BLOCK_SIZE / 2}
                            y={
                                -height / 2 -
                                outerOffset -
                                RESIZER_BLOCK_SIZE / 2
                            }
                            style={{ fill: RESIZER_COLOR }}
                        />
                    </g>
                </g>
            </If>
        </g>
    );
}

Item.propTypes = {
    item: PropTypes.object.isRequired,
    layer: PropTypes.object.isRequired,
    scene: PropTypes.object.isRequired,
    catalog: PropTypes.object.isRequired,
};
