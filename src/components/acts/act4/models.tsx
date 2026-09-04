import * as THREE from "three";
import { useEffect, useRef } from "react";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import type { Category, ScenePart } from "./main";

type ModelType = Category | "amd";
export type ProductModel = { id: string; category: Category; part: ScenePart };
const MODEL_COLORS: Record<ModelType, [string, string]> = {
  motherboard: ["#16263a", "#00e5ff"],
  cpu: ["#1d4ed8", "#60a5fa"],
  amd: ["#991b1b", "#f87171"],
  memory: ["#e9eefc", "#ff5eea"],
  storage: ["#111827", "#00ffa8"],
  psu: ["#22272f", "#f2f4f8"],
  gpu: ["#11151d", "#63ffdd"],
  fans: ["#0f172a", "#8b5cf6"],
};

export function modelType(modelId: string): ModelType {
  if (modelId.includes("intel")) return "cpu";
  if (modelId.includes("amd")) return "amd";
  if (modelId.includes("kingston") || modelId.includes("corsair"))
    return "memory";
  if (modelId.includes("ssd")) return "storage";
  if (modelId.includes("psu")) return "psu";
  if (modelId.includes("rtx") || modelId.includes("radeon")) return "gpu";
  if (modelId.includes("fans")) return "fans";
  return "motherboard";
}
const material = (color: string, emissive?: string) =>
  new THREE.MeshStandardMaterial({
    color,
    roughness: 0.36,
    metalness: 0.68,
    emissive: emissive ?? "#000",
    emissiveIntensity: emissive ? 1.5 : 0,
  });
const box = (
  scene: THREE.Object3D,
  size: [number, number, number],
  color: string,
  position: [number, number, number] = [0, 0, 0],
  accent?: string,
) => {
  const item = new THREE.Mesh(
    new THREE.BoxGeometry(...size),
    material(color, accent),
  );
  item.position.set(...position);
  item.castShadow = true;
  scene.add(item);
  return item;
};
const cylinder = (
  scene: THREE.Object3D,
  radius: number,
  height: number,
  color: string,
  position: [number, number, number],
  rotation: [number, number, number] = [Math.PI / 2, 0, 0],
) => {
  const item = new THREE.Mesh(
    new THREE.CylinderGeometry(radius, radius, height, 16),
    material(color),
  );
  item.position.set(...position);
  item.rotation.set(...rotation);
  item.castShadow = true;
  scene.add(item);
  return item;
};
function fan(
  scene: THREE.Object3D,
  radius: number,
  accent: string,
  position: [number, number, number] = [0, 0, 0],
) {
  const group = new THREE.Group();
  group.position.set(...position);
  group.add(
    new THREE.Mesh(
      new THREE.TorusGeometry(radius, radius * 0.08, 10, 36),
      material("#05080d", accent),
    ),
  );
  for (let index = 0; index < 6; index += 1) {
    const blade = new THREE.Mesh(
      new THREE.BoxGeometry(radius * 0.14, radius * 0.72, radius * 0.08),
      material("#17202d"),
    );
    blade.position.y = radius * 0.28;
    blade.rotation.z = (index * Math.PI) / 3;
    group.add(blade);
  }
  scene.add(group);
  return group;
}

export function createModel(scene: THREE.Object3D, modelId: string) {
  const type = modelType(modelId);
  const [color, accent] = MODEL_COLORS[type];
  if (type === "motherboard") {
    box(scene, [2.6, 3.35, 0.12], color);
    box(scene, [0.75, 0.75, 0.1], "#cfd7e6", [-0.4, 0.7, 0.12]);
    box(scene, [0.54, 0.54, 0.06], "#05070a", [-0.4, 0.7, 0.2]);
    for (let index = 0; index < 4; index += 1) {
      const x = 0.58 + index * 0.16;
      box(scene, [0.09, 1.36, 0.07], "#0a0f17", [x, 0.58, 0.13]);
      box(
        scene,
        [0.035, 1.48, 0.035],
        "#18283a",
        [x, 0.58, 0.18],
        index % 2 ? undefined : accent,
      );
    }
    for (let index = 0; index < 3; index += 1) {
      const y = -0.58 - index * 0.32;
      box(scene, [1.65, 0.1, 0.07], "#080b10", [-0.12, y, 0.14]);
      box(scene, [1.42, 0.018, 0.025], "#33465c", [-0.12, y, 0.19]);
    }
    box(scene, [1.05, 0.22, 0.07], "#283241", [-0.2, -0.04, 0.14]);
    box(scene, [0.92, 0.08, 0.035], accent, [-0.2, -0.04, 0.19], accent);
    for (const [x, y, width, height] of [
      [-0.86, 1.34, 0.48, 0.38],
      [-0.12, 1.36, 0.68, 0.3],
      [-1, 0.52, 0.28, 0.92],
      [0.72, -1.18, 0.76, 0.28],
    ] as const) {
      box(scene, [width, height, 0.12], "#182231", [x, y, 0.16]);
      for (let fin = 0; fin < 5; fin += 1)
        box(scene, [width * 0.82, 0.012, 0.045], "#111721", [
          x,
          y - height * 0.34 + fin * height * 0.17,
          0.24,
        ]);
    }
    for (let index = 0; index < 6; index += 1)
      cylinder(scene, 0.055, 0.035, "#f7c96d", [
        index % 2 ? 1.08 : -1.1,
        index < 2 ? 1.5 : index < 4 ? -1.5 : 0.02,
        0.17,
      ]);
    for (let index = 0; index < 8; index += 1)
      cylinder(
        scene,
        0.045,
        0.1,
        "#d8dee9",
        [-0.95 + (index % 4) * 0.55, 1.05 - Math.floor(index / 4) * 2.1, 0.2],
        [0, 0, 0],
      );
  } else if (type === "cpu" || type === "amd") {
    box(scene, [1.1, 1.1, 0.2], "#0a0d11");
    box(scene, [0.82, 0.82, 0.1], "#cfd7df", [0, 0, 0.14], accent);
  } else if (type === "memory") {
    for (const x of [-0.22, 0.22]) {
      box(scene, [0.2, 1.9, 0.16], color, [x, 0, 0]);
      box(scene, [0.06, 1.7, 0.06], accent, [x, 0, 0.12], accent);
    }
  } else if (type === "storage") {
    scene.add(
      new THREE.Mesh(
        new THREE.BoxGeometry(0.92, 0.16, 0.045),
        new THREE.MeshStandardMaterial({
          color,
          roughness: 0.5,
          metalness: 0.25,
        }),
      ),
    );
    for (let index = 0; index < 4; index += 1)
      scene.add(
        new THREE.Mesh(
          new THREE.BoxGeometry(0.13, 0.1, 0.035),
          new THREE.MeshStandardMaterial({
            color: "#05070a",
            roughness: 0.85,
            metalness: 0.05,
          }),
        ).translateX(-0.3 + index * 0.18),
      );
    const controller = new THREE.Mesh(
      new THREE.BoxGeometry(0.55, 0.19, 0.05),
      new THREE.MeshStandardMaterial({
        color: "#273447",
        roughness: 0.24,
        metalness: 0.92,
      }),
    );
    controller.position.set(0.15, 0, 0.072);
    scene.add(controller);
  } else if (type === "psu") {
    box(scene, [1.9, 1.15, 1.45], color);
    fan(scene, 0.38, accent, [0, 0, 0.76]);
  } else if (type === "gpu") {
    box(scene, [3.4, 0.85, 0.55], color);
    for (const x of [-1.05, 0, 1.05]) fan(scene, 0.3, accent, [x, 0, 0.32]);
    box(scene, [2.9, 0.08, 0.08], accent, [0, 0.4, 0.3], accent);
  } else for (const y of [-0.9, 0, 0.9]) fan(scene, 0.43, accent, [0, y, 0]);
}

function disposeScene(scene: THREE.Object3D) {
  scene.traverse((object) => {
    if (object instanceof THREE.Mesh) {
      object.geometry.dispose();
      const list = Array.isArray(object.material)
        ? object.material
        : [object.material];
      list.forEach((current) => current.dispose());
    }
  });
}
function setupScene(canvas: HTMLCanvasElement, modelId: string, large = false) {
  const scene = new THREE.Scene();
  scene.background = new THREE.Color("#11151d");
  const rect = canvas.getBoundingClientRect();
  const camera = new THREE.PerspectiveCamera(
    36,
    Math.max(rect.width, 1) / Math.max(rect.height, 1),
    0.1,
    100,
  );
  camera.position.set(0, 0.5, large ? 7 : 6);
  const renderer = new THREE.WebGLRenderer({
    canvas,
    antialias: true,
    powerPreference: "low-power",
  });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, large ? 2 : 1.25));
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.shadowMap.enabled = false;
  scene.add(new THREE.HemisphereLight("#d9f5ff", "#17111d", 2.2));
  const light = new THREE.DirectionalLight("#fff", 3.5);
  light.position.set(3, 4, 5);
  scene.add(light);
  createModel(scene, modelId);
  const controls = new OrbitControls(camera, canvas);
  controls.enableDamping = true;
  controls.enablePan = false;
  let frame = 0;
  let running = false;
  let lastW = 0;
  let lastH = 0;

  const syncSize = () => {
    const size = canvas.getBoundingClientRect();
    const w = Math.max(Math.floor(size.width), 1);
    const h = Math.max(Math.floor(size.height), 1);
    if (w === lastW && h === lastH) return;
    lastW = w;
    lastH = h;
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
  };

  const animate = () => {
    if (!running) return;
    syncSize();
    controls.update();
    renderer.render(scene, camera);
    frame = requestAnimationFrame(animate);
  };

  const start = () => {
    if (running) return;
    running = true;
    syncSize();
    frame = requestAnimationFrame(animate);
  };

  const stop = () => {
    running = false;
    cancelAnimationFrame(frame);
    frame = 0;
  };

  // Solo renderiza cuando el canvas está (casi) en pantalla
  const io = new IntersectionObserver(
    ([entry]) => {
      if (entry?.isIntersecting) start();
      else stop();
    },
    { rootMargin: "120px", threshold: 0.01 },
  );
  io.observe(canvas);

  return () => {
    stop();
    io.disconnect();
    controls.dispose();
    disposeScene(scene);
    renderer.dispose();
  };
}

export function ProductModelCanvas({
  model,
  large = false,
}: {
  model: ProductModel;
  large?: boolean;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    return setupScene(canvas, model.id, large);
  }, [model.id, large]);
  return (
    <canvas
      ref={canvasRef}
      aria-label={`Modelo 3D de ${model.part.name}`}
      className="product-model"
    />
  );
}
export function ProductModelViewer({
  model,
  onClose,
}: {
  model: ProductModel | null;
  onClose: () => void;
}) {
  if (!model) return null;
  return (
    <div
      className="product-model-modal"
      role="presentation"
      onClick={(event) => event.target === event.currentTarget && onClose()}
    >
      <div
        className="product-model-dialog"
        role="dialog"
        aria-modal="true"
        aria-labelledby="product-model-title"
      >
        <button
          className="product-model-close"
          type="button"
          aria-label="Cerrar modelo"
          onClick={onClose}
        >
          ×
        </button>
        <h2 id="product-model-title">Vista 3D: {model.part.name}</h2>
        <div className="product-model-stage">
          <ProductModelCanvas model={model} large />
        </div>
        <p>Arrastra para girar y usa la rueda para acercar.</p>
      </div>
    </div>
  );
}

export function renderProductModels(root: HTMLElement) {
  root
    .querySelectorAll<HTMLElement>(".product-thumb[data-model]")
    .forEach((thumb) => {
      const modelId = thumb.dataset.model;
      if (!modelId || thumb.querySelector("canvas")) return;
      const canvas = document.createElement("canvas");
      canvas.className = "product-model";
      thumb.replaceChildren(canvas);
      setupScene(canvas, modelId);
    });
}
export function initProductModelViewer() {
    return () => undefined;
}