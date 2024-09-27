import React from "react";
import PropTypes from "prop-types";
import If from "../../utils/react-if";

const STYLE_CIRCLE = {
    fill: "red",
    stroke: "#0096fd",
    cursor: "ew-resize",
    cursor: "ew-resize",
};

const STYLE_CIRCLE2 = {
    fill: "none",
    stroke: "#0096fd",
    cursor: "ew-resize",
};

export default function Item({ layer, item, scene, catalog }) {
    let { x, y, rotation } = item;

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
                        width="50"
                        height="50"
                        x="-25"
                        y="-25"
                        style={{ fill: "none", stroke: "red" }}
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
                        <circle cx="0" cy="150" r="10" style={STYLE_CIRCLE} />
                        {/* <circle cx="0" cy="0" r="150" style={STYLE_CIRCLE2} /> */}
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
