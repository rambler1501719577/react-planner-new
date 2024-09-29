import React from "react";
export const render2D = function (element, width, height) {
    let angle = element.rotation + 90;

    let textRotation = 0;
    if (Math.sin((angle * Math.PI) / 180) < 0) {
        textRotation = 180;
    }

    return (
        <g transform={`translate(${-width / 2},${-height / 2})`}>
            <rect
                key="1"
                x="0"
                y="0"
                width={width}
                height={height}
                style={{
                    stroke: element.selected ? "#0096fd" : "#000",
                    strokeWidth: "2px",
                    fill: "#84e1ce",
                }}
            />
            <text
                key="2"
                x="0"
                y="0"
                transform={`translate(${width / 2}, ${
                    height / 2
                }) scale(1,-1) rotate(${textRotation})`}
                style={{ textAnchor: "middle", fontSize: "11px" }}
            >
                {element.type}
            </text>
        </g>
    );
};
