import GLTFLoader from "./gltf-loader";

export function loadGltfWithTextures(gltfFile) {
    return new Promise((resolve) => {
        let gltfLoader = new GLTFLoader();
        gltfLoader.load(gltfFile, (gltf) => {
            resolve(gltf);
        });
    });
}
