import * as Three from "three";
import { loadGltfWithTextures } from "../../utils/load-gltf";

import React from "react";
import convert from "convert-units";

let cached3DTaster = null;

export default {
  name: "taster",
  prototype: "items",

  info: {
    title: "taster",
    tag: ["furnishing", "electronics"],
    description: "测试3D模型",
    image: require("./taster.png"),
  },

  properties: {
    altitude: {
      label: "Altitude",
      type: "length-measure",
      defaultValue: {
        length: 0,
      },
    },
  },

  render2D: function (element, layer, scene) {
    let width = { length: 1.6, unit: "ft" };
    let depth = { length: 0.59, unit: "ft" };

    let newWidth = convert(width.length).from(width.unit).to(scene.unit);
    let newDepth = convert(depth.length).from(depth.unit).to(scene.unit);

    let angle = element.rotation + 90;

    let textRotation = 0;
    if (Math.sin((angle * Math.PI) / 180) < 0) {
      textRotation = 180;
    }

    let style = {
      stroke: element.selected ? "#0096fd" : "#000",
      strokeWidth: "2px",
      fill: "#84e1ce",
    };
    let arrow_style = {
      stroke: element.selected ? "#0096fd" : null,
      strokeWidth: "2px",
      fill: "#84e1ce",
    };

    return (
      <g transform={`translate(${-newWidth / 2},${-newDepth / 2})`}>
        <rect
          key="1"
          x="0"
          y="0"
          width={newWidth}
          height={newDepth}
          style={style}
        />
        <line
          key="2"
          x1={newWidth / 2}
          x2={newWidth / 2}
          y1={newDepth}
          y2={1.5 * newDepth}
          style={arrow_style}
        />
        <line
          key="3"
          x1={0.35 * newWidth}
          x2={newWidth / 2}
          y1={1.2 * newDepth}
          y2={1.5 * newDepth}
          style={arrow_style}
        />
        <line
          key="4"
          x1={newWidth / 2}
          x2={0.65 * newWidth}
          y1={1.5 * newDepth}
          y2={1.2 * newDepth}
          style={arrow_style}
        />
        <text
          key="5"
          x="0"
          y="0"
          transform={`translate(${newWidth / 2}, ${
            newDepth / 2
          }) scale(1,-1) rotate(${textRotation})`}
          style={{ textAnchor: "middle", fontSize: "11px" }}
        >
          {element.type}
        </text>
      </g>
    );
  },

  // 这里应该可以通过gltf-loader加载相应的贴图, 应用材质
  render3D: function (element, layer, scene) {
    let width = { length: 1.6, unit: "ft" };
    let depth = { length: 0.59, unit: "ft" };
    let height = { length: 1.05, unit: "ft" };

    // 加载后对模型进行位置,缩放调整
    let onLoadItem = (object) => {
      // 转换kuangaoshen
      let newWidth = convert(width.length).from(width.unit).to(scene.unit);
      let newHeight = convert(height.length).from(height.unit).to(scene.unit);
      let newDepth = convert(depth.length).from(depth.unit).to(scene.unit);

      let newAltitude = element.properties.get("altitude").get("length");

      // 选中后增加立方体线框盒子
      if (element.selected) {
        let box = new Three.BoxHelper(object, 0x99c3fb);
        box.material.linewidth = 2;
        box.material.depthTest = false;
        box.renderOrder = 1000;
        object.add(box);
      }

      // 增加缩放
      // object.scale.set(
      //   newWidth / width.length,
      //   newHeight / height.length,
      //   newDepth / depth.length
      // );
      object.scale.set(20, 20, 20);

      // Normalize the origin of the object
      let boundingBox = new Three.Box3().setFromObject(object);

      let center = [
        (boundingBox.max.x - boundingBox.min.x) / 2 + boundingBox.min.x,
        (boundingBox.max.y - boundingBox.min.y) / 2 + boundingBox.min.y,
        (boundingBox.max.z - boundingBox.min.z) / 2 + boundingBox.min.z,
      ];

      object.position.x -= center[0];
      object.position.y -=
        center[1] - (boundingBox.max.y - boundingBox.min.y) / 2;
      object.position.z -= center[2];

      object.position.y += newAltitude;

      object.rotation.y = Math.PI;

      return object;
    };

    if (cached3DTaster) {
      return Promise.resolve(onLoadItem(cached3DTaster.clone()));
    }

    // 模型描述文件
    let gltf = require("./taster.gltf");

    // 模型二进制文件
    require("./taster.bin");

    // 加载textures(webpack -> file-loader配置)
    // require("./Image_0.png");
    // require("./Image_1.png");
    // require("./Image_2.png");
    // require("./Image_2-1.png");
    // require("./Image_3.png");
    // require("./Image_3-1.png");
    // require("./Image_4.png");
    // require("./Image_5.jpg");
    // require("./Image_6.jpg");
    // require("./Image_7.png");

    // obj + mtl方式加载模型和贴图
    // TODO: 这里需要加载texture贴图, 通过gltf-loader加载模型, 以及bin文件
    return loadGltfWithTextures(gltf).then((gltf) => {
      cached3DTaster = gltf.scene;
      console.log(gltf.scene);
      return onLoadItem(cached3DTaster.clone());
    });
  },
};
