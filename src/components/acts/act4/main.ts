import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { RoundedBoxGeometry } from "three/addons/geometries/RoundedBoxGeometry.js";
import { EffectComposer } from "three/addons/postprocessing/EffectComposer.js";
import { RenderPass } from "three/addons/postprocessing/RenderPass.js";
import { UnrealBloomPass } from "three/addons/postprocessing/UnrealBloomPass.js";
import { OutputPass } from "three/addons/postprocessing/OutputPass.js";
import { RectAreaLightUniformsLib } from "three/addons/lights/RectAreaLightUniformsLib.js";

export type Category =
  | "motherboard"
  | "cpu"
  | "memory"
  | "storage"
  | "psu"
  | "gpu"
  | "fans";
export type ScenePart = {
  name: string;
  color: string;
  accent: string;
  sticks?: number;
  count?: number;
};
export type PcWorkbench = {
  updateSelection: (selected: Partial<Record<Category, ScenePart>>) => void;
  setActiveCategory: (category: Category) => void;
  dispose: () => void;
};

RectAreaLightUniformsLib.init();

const order: Category[] = [
  "motherboard",
  "cpu",
  "memory",
  "storage",
  "psu",
  "gpu",
  "fans",
];
const labels: Record<Category, string> = {
  motherboard: "Motherboard",
  cpu: "CPU",
  memory: "RAM",
  storage: "Storage",
  psu: "PSU",
  gpu: "GPU",
  fans: "Fans",
};
const slotPositions: Record<Category, [number, number, number]> = {
  motherboard: [-0.45, 0.42, -0.39],
  cpu: [-0.84, 1.08, -0.2],
  memory: [0.18, 0.94, -0.18],
  storage: [-0.38, 0.02, -0.18],
  psu: [0.62, -1.78, 0.09],
  gpu: [-0.05, -0.67, 0.15],
  fans: [1.66, 0.28, 0.03],
};
const slotSizes: Record<Category, [number, number, number]> = {
  motherboard: [2.62, 3.48, 0.16],
  cpu: [0.68, 0.68, 0.17],
  memory: [0.72, 1.62, 0.17],
  storage: [1.08, 0.3, 0.14],
  psu: [1.55, 0.78, 1.38],
  gpu: [2.82, 0.78, 0.52],
  fans: [0.58, 3.45, 0.2],
};
const casePosition: [number, number, number] = [0, 0, 0];
const caseRotation: [number, number, number] = [0, 0, 0];

const glassRotation: [number, number, number] = [0, -.5, 0];
const idleSlotOpacity = 0.01;
const hoverSlotOpacity = 0.05;
const activeSlotOpacity = 0.15;
const componentGlowIntensity = 0.2;
const cpuGlowIntensity = 0.3;
const ramGlowIntensity = 0.3;
const ramSlotGlowOpacity = 0.3;

const material = (
  color: string,
  emissive?: string,
  emissiveIntensity = componentGlowIntensity,
) =>
  new THREE.MeshStandardMaterial({
    color,
    roughness: 0.36,
    metalness: 0.68,
    emissive: emissive ?? "#000",
    emissiveIntensity: emissive ? emissiveIntensity : 0,
  });
const mesh = (
  geometry: THREE.BufferGeometry,
  mat: THREE.Material,
  position: [number, number, number] = [0, 0, 0],
) => {
  const item = new THREE.Mesh(geometry, mat);
  item.position.set(...position);
  item.castShadow = true;
  item.receiveShadow = true;
  return item;
};
const cylinder = (
  parent: THREE.Object3D,
  radius: number,
  height: number,
  color: string,
  position: [number, number, number],
) => {
  const item = mesh(
    new THREE.CylinderGeometry(radius, radius, height, 20),
    material(color),
    position,
  );
  item.rotation.x = Math.PI / 2;
  parent.add(item);
  return item;
};

function fan(parent: THREE.Object3D, radius: number, accent: string, y = 0) {
  const group = new THREE.Group();
  group.position.y = y;
  group.add(
    mesh(
      new THREE.TorusGeometry(radius, radius * 0.07, 10, 32),
      material("#05080d", accent),
    ),
  );
  for (let index = 0; index < 6; index += 1) {
    const blade = mesh(
      new THREE.BoxGeometry(radius * 0.14, radius * 0.72, radius * 0.06),
      material("#17202d"),
      [0, radius * 0.28, 0.02],
    );
    blade.rotation.z = (index * Math.PI) / 3;
    group.add(blade);
  }
  parent.add(group);
  return group;
}

function partModel(
  parent: THREE.Object3D,
  category: Category,
  part: ScenePart,
) {
  if (category === "motherboard") {
    parent.add(
      mesh(
        new RoundedBoxGeometry(2.55, 3.38, 0.085, 8, 0.04),
        material(part.color),
      ),
    );
    parent.add(
      mesh(
        new RoundedBoxGeometry(0.72, 0.72, 0.06, 6, 0.035),
        material("#cfd7e6"),
        [-0.39, 0.66, 0.07],
      ),
    );
    parent.add(
      mesh(
        new RoundedBoxGeometry(0.52, 0.52, 0.035, 5, 0.025),
        material("#05070a"),
        [-0.39, 0.66, 0.115],
      ),
    );
    for (let index = 0; index < 4; index += 1) {
      parent.add(
        mesh(
          new RoundedBoxGeometry(0.09, 1.36, 0.07, 4, 0.025),
          material("#0a0f17"),
          [0.58 + index * 0.16, 0.58, 0.075],
        ),
      );
      parent.add(
        mesh(
          new RoundedBoxGeometry(0.035, 1.48, 0.035, 3, 0.012),
          material(
            index % 2 ? "#18283a" : part.accent,
            index % 2 ? undefined : part.accent,
          ),
          [0.58 + index * 0.16, 0.58, 0.118],
        ),
      );
    }
    for (let index = 0; index < 3; index += 1)
      parent.add(
        mesh(
          new RoundedBoxGeometry(1.65, 0.095, 0.07, 4, 0.025),
          material("#080b10"),
          [-0.12, -0.58 - index * 0.32, 0.075],
        ),
      );
    parent.add(
      mesh(
        new RoundedBoxGeometry(1.03, 0.22, 0.065, 4, 0.025),
        material("#283241"),
        [-0.2, -0.04, 0.085],
      ),
    );
    for (const [x, y, width, height] of [
      [-0.86, 1.34, 0.48, 0.38],
      [-0.12, 1.36, 0.68, 0.3],
      [-1, 0.52, 0.28, 0.92],
      [0.72, -1.18, 0.76, 0.28],
    ] as const) {
      parent.add(
        mesh(
          new RoundedBoxGeometry(width, height, 0.12, 5, 0.025),
          material("#182231"),
          [x, y, 0.11],
        ),
      );
      for (let fin = 0; fin < 5; fin += 1)
        parent.add(
          mesh(
            new RoundedBoxGeometry(width * 0.82, 0.012, 0.045, 2, 0.004),
            material("#111721"),
            [x, y - height * 0.34 + fin * height * 0.17, 0.19],
          ),
        );
    }
    for (let index = 0; index < 6; index += 1)
      cylinder(parent, 0.055, 0.035, "#f7c96d", [
        index % 2 ? 1.08 : -1.1,
        index < 2 ? 1.5 : index < 4 ? -1.5 : 0.02,
        0.11,
      ]);
  } else if (category === "cpu")
    parent.add(
      mesh(
        new RoundedBoxGeometry(0.62, 0.62, 0.16, 5, 0.03),
        material("#cfd7df", part.accent, cpuGlowIntensity),
      ),
    );
  else if (category === "memory")
    for (let index = 0; index < (part.sticks ?? 2); index += 1)
      parent.add(
        mesh(
          new RoundedBoxGeometry(0.12, 1.45, 0.12, 5, 0.02),
          material(part.color, part.accent, ramGlowIntensity),
          [-0.18 + index * 0.36, 0, 0],
        ),
      );
  else if (category === "storage")
    {
      parent.add(
        mesh(
          new RoundedBoxGeometry(0.92, 0.16, 0.045, 4, 0.015),
          new THREE.MeshStandardMaterial({
            color: part.color,
            roughness: 0.5,
            metalness: 0.25,
          }),
        ),
      );
      for (let index = 0; index < 4; index += 1)
        parent.add(
          mesh(
            new RoundedBoxGeometry(0.13, 0.1, 0.035, 3, 0.01),
            new THREE.MeshStandardMaterial({
              color: "#05070a",
              roughness: 0.85,
              metalness: 0.05,
            }),
            [-0.3 + index * 0.18, 0, 0.04],
          ),
        );
      parent.add(
        mesh(
          new RoundedBoxGeometry(0.55, 0.19, 0.05, 4, 0.015),
          new THREE.MeshStandardMaterial({
            color: "#273447",
            roughness: 0.24,
            metalness: 0.92,
          }),
          [0.15, 0, 0.072],
        ),
      );
    }
  else if (category === "psu") {
    parent.add(
      mesh(
        new RoundedBoxGeometry(1.46, 0.66, 1.28, 8, 0.06),
        material(part.color),
      ),
    );
    const f = fan(parent, 0.34, part.accent);
    f.rotation.x = -Math.PI / 2;
    f.position.z = 0.66;
  } else if (category === "gpu") {
    parent.add(
      mesh(
        new RoundedBoxGeometry(2.66, 0.62, 0.36, 8, 0.06),
        material(part.color),
      ),
    );
    parent.add(
      mesh(
        new RoundedBoxGeometry(2.45, 0.48, 0.05, 5, 0.025),
        material("#1f2937"),
        [0.05, 0, -0.22],
      ),
    );
    for (const x of [-0.82, 0, 0.82]) {
      const f = fan(parent, 0.24, part.accent);
      f.position.x = x;
      f.position.z = 0.23;
    }
    parent.add(
      mesh(
        new RoundedBoxGeometry(2.24, 0.055, 0.055, 5, 0.022),
        material(part.accent, part.accent),
        [0, 0.3, 0.1],
      ),
    );
    parent.add(
      mesh(
        new RoundedBoxGeometry(0.08, 0.82, 0.22, 5, 0.02),
        material("#111721"),
        [-1.45, 0, 0.04],
      ),
    );
  } else for (const y of [-1.05, 0, 1.05]) fan(parent, 0.39, part.accent, y);
}

export function initPcWorkbench(
  canvas: HTMLCanvasElement,
  selected: Partial<Record<Category, ScenePart>>,
  onInstalled: (category: Category) => void,
) {
    let currentSelection = selected;
    const host = canvas.parentElement;
    const width = () => Math.max(host?.clientWidth || canvas.clientWidth, 1);
    const height = () => Math.max(host?.clientHeight || canvas.clientHeight, 1);
    const scene = new THREE.Scene();
    scene.background = new THREE.Color("#08101c");
    scene.fog = new THREE.FogExp2("#08101c", 0.035);
    const camera = new THREE.PerspectiveCamera(42, width() / height(), 0.1, 100);
    camera.position.set(0, 2, 10);
    const renderer = new THREE.WebGLRenderer({
        canvas,
        antialias: true,
        powerPreference: "high-performance",
    });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.85));
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.12;
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    const controls = new OrbitControls(camera, canvas);
    controls.enableDamping = true;
    controls.enablePan = false;
    controls.target.set(0, -0.05, 0);
    controls.minDistance = 4.1;
    controls.maxDistance = 12;
    scene.add(new THREE.HemisphereLight("#bfeaff", "#17111d", 1.2));
    const key = new THREE.DirectionalLight("#eaf7ff", 3.2);
    key.position.set(3.4, 6.5, 4.3);
    key.castShadow = true;
    key.shadow.mapSize.set(2048, 2048);
    key.shadow.camera.left = -6;
    key.shadow.camera.right = 6;
    key.shadow.camera.top = 6;
    key.shadow.camera.bottom = -6;
    key.shadow.camera.near = 0.5;
    key.shadow.camera.far = 18;
    key.shadow.bias = -0.00008;
    key.shadow.normalBias = 0.02;
    scene.add(key);
    const rim = new THREE.DirectionalLight("#a46cff", 2.2);
    rim.position.set(-4, 2.7, -3.5);
    scene.add(rim);
    const rect1 = new THREE.RectAreaLight("#57e9ff", 4.5, 4, 2.2);
    rect1.position.set(-2.6, 3.5, 2.8);
    rect1.lookAt(0, 0, 0);
    scene.add(rect1);
    const rect2 = new THREE.RectAreaLight("#ff6bd6", 2.8, 2.4, 2.8);
    rect2.position.set(3.2, 1.4, 2.2);
    rect2.lookAt(0.1, -0.1, 0);
    scene.add(rect2);
    const rect3 = new THREE.RectAreaLight("#57e9ff", 4.5, 4, 2.2);
    rect3.position.set(1, 1, 1);
    rect3.lookAt(0, 0, 0);
    scene.add(rect3);
    const rect4 = new THREE.RectAreaLight("#ff6bd6", 4.5, 4, 2.2);
    rect4.position.set(-1.5, 1, 1);
    rect4.lookAt(0, 0, 0);
    scene.add(rect4);
    const insideA = new THREE.PointLight("#38f8ff", 1.2, 4.6, 2);
    insideA.position.set(-0.9, 1.2, 0.6);
    const insideB = new THREE.PointLight("#ff62d8", 1.0, 4.8, 2);
    insideB.position.set(1.3, -0.8, 0.55);
    scene.add(insideA, insideB);
    const root = new THREE.Group();
    scene.add(root);
    const caseGroup = new THREE.Group();
    caseGroup.position.set(...casePosition);
    caseGroup.rotation.set(...caseRotation);
    root.add(caseGroup);
    const floor = mesh(
        new THREE.PlaneGeometry(24, 18),
        material("#070a10"),
        [0, -2.82, 0],
    );
    floor.rotation.x = -Math.PI / 2;
    floor.receiveShadow = true;
    root.add(floor);
    caseGroup.add(
        mesh(
        new RoundedBoxGeometry(4.25, 5.35, 0.11, 8, 0.07),
        material("#0d1320"),
        [0, -0.02, -0.72],
        ),
    );
    caseGroup.add(
        mesh(
        new RoundedBoxGeometry(3.35, 4.35, 0.05, 8, 0.06),
        material("#0a1019"),
        [-0.25, 0.12, -0.64],
        ),
    );
    for (const [x, y, z, w, h, d] of [
        [-2.18, -0.03, 0.05, 0.16, 5.55, 1.95],
        [2.18, -0.03, 0.05, 0.16, 5.55, 1.95],
        [0, 2.76, 0.05, 4.55, 0.18, 1.95],
        [0, -2.78, 0.05, 4.55, 0.18, 1.95],
    ] as const)
        caseGroup.add(
        mesh(new RoundedBoxGeometry(w, h, d, 8, 0.08), material("#0d1320"), [
            x,
            y,
            z,
        ]),
        );
    caseGroup.add(
        mesh(
        new RoundedBoxGeometry(3.7, 0.75, 1.72, 8, 0.07),
        material("#0a0d13"),
        [0.05, -1.94, 0.12],
        ),
    );
    caseGroup.add(
        mesh(
        new RoundedBoxGeometry(0.1, 4.92, 1.64, 8, 0.08),
        new THREE.MeshPhysicalMaterial({
            color: "#6be8ff",
            roughness: 0.12,
            transmission: 0.15,
            opacity: 0.16,
            transparent: true,
        }),
        [2.09, 0.05, 0.08],
        ),
    );
    const glass = mesh(
        new RoundedBoxGeometry(3.5, 5.3, 0.02, 8, 0.06),
        new THREE.MeshPhysicalMaterial({
            color: "#ccefff",
            roughness: 0.05,
            transmission: 0.35,
            opacity: 0.22,
            transparent: true,
        }),
        [3.8, 0, 1.7],
    );
      glass.rotation.set(...glassRotation);
      caseGroup.add(glass);
    for (let index = 0; index < 14; index += 1)
        caseGroup.add(
        mesh(
            new RoundedBoxGeometry(0.055, 0.035, 1.35, 4, 0.015),
            material("#05070a"),
            [-1.55 + index * 0.24, 2.66, 0.07],
        ),
        );
    const composer = new EffectComposer(renderer);
    composer.addPass(new RenderPass(scene, camera));
    const bloom = new UnrealBloomPass(
        new THREE.Vector2(width(), height()),
        0.05,
        0.5,
        0.16,
    );
    composer.addPass(bloom);
    composer.addPass(new OutputPass());
    const installed = new THREE.Group();
    const slots = new THREE.Group();
    caseGroup.add(installed, slots);
    const hitboxes: THREE.Mesh[] = [];
    const slotMaterials = new Map<Category, THREE.LineBasicMaterial>();
    const installedCategories = new Set<Category>();
    let activeCategory: Category = "motherboard";
    let hoverCategory: Category | null = null;
    let frame = 0;
    order.forEach((category) => {
        const group = new THREE.Group();
        group.position.set(...slotPositions[category]);
        const [slotWidth, slotHeight, slotDepth] = slotSizes[category];
        const slotMaterial = new THREE.LineBasicMaterial({
        color: "#18f4ff",
        transparent: true,
        opacity: 0.16,
        });
        const box = new THREE.LineSegments(
        new THREE.EdgesGeometry(
            new RoundedBoxGeometry(slotWidth, slotHeight, slotDepth, 6, 0.04),
        ),
        slotMaterial,
        );
        box.userData.category = category;
        const hitbox = mesh(
        new THREE.BoxGeometry(
            slotWidth + 0.08,
            slotHeight + 0.08,
            Math.max(slotDepth, 0.42),
        ),
        new THREE.MeshBasicMaterial({ transparent: true, opacity: 0 }),
        );
        hitbox.userData.category = category;
        group.add(box, hitbox);
        slots.add(group);
        hitboxes.push(hitbox);
        slotMaterials.set(category, slotMaterial);
    });
    const install = (category: Category) => {
        const part = currentSelection[category];
        if (!part || installedCategories.has(category)) return;
        const index = order.indexOf(category);
        if (index > 0 && !installedCategories.has(order[index - 1])) return;
        const group = new THREE.Group();
        partModel(group, category, part);
        group.position.set(...slotPositions[category]);
        group.scale.setScalar(0.2);
        installed.add(group);
        installedCategories.add(category);
        const start = performance.now();
        const animateIn = (now: number) => {
        const progress = Math.min((now - start) / 500, 1);
        group.scale.setScalar(0.2 + progress * 0.8);
        if (progress < 1) requestAnimationFrame(animateIn);
        };
        requestAnimationFrame(animateIn);
        onInstalled(category);
    };
    const raycaster = new THREE.Raycaster();
    const pointer = new THREE.Vector2();
    const getHit = (event: PointerEvent) => {
        const rect = canvas.getBoundingClientRect();
        pointer.set(
        ((event.clientX - rect.left) / rect.width) * 2 - 1,
        -((event.clientY - rect.top) / rect.height) * 2 + 1,
        );
        raycaster.setFromCamera(pointer, camera);
        return raycaster.intersectObjects(hitboxes)[0]?.object.userData.category as
        | Category
        | undefined;
    };
    const pointerMove = (event: PointerEvent) => {
        hoverCategory = getHit(event) ?? null;
        canvas.style.cursor = hoverCategory ? "pointer" : "grab";
    };
    const pointerDown = (event: PointerEvent) => {
        const hit = getHit(event);
      if (hit && currentSelection[hit]) {
        activeCategory = hit;
        install(hit);
        }
    };
    canvas.addEventListener("pointermove", pointerMove);
    canvas.addEventListener("pointerdown", pointerDown);
    const resize = () => {
        camera.aspect = width() / height();
        camera.updateProjectionMatrix();
        renderer.setSize(width(), height(), false);
        composer.setSize(width(), height());
        bloom.setSize(width(), height());
    };
    const observer = new ResizeObserver(resize);
    observer.observe(host ?? canvas);
    resize();
    const animate = () => {
        controls.update();
        slots.rotation.y = Math.sin(performance.now() * 0.00008) * 0.025;
        const pulse = 0.11 + (Math.sin(performance.now() * 0.0042) + 1) * 0.07;
        slotMaterials.forEach((slotMaterial, category) => {
        const installed = installedCategories.has(category);
        const active = category === activeCategory && Boolean(currentSelection[category]);
        slotMaterial.opacity = installed
            ? 0
          : active
            ? pulse + (category === "memory" ? ramSlotGlowOpacity : activeSlotOpacity)
            : category === hoverCategory
                ? hoverSlotOpacity
                : idleSlotOpacity;
        slotMaterial.color.set(
          active || category === hoverCategory
            ? "#ffffff"
            : "#18f4ff",
        );
        });
        composer.render();
        frame = requestAnimationFrame(animate);
    };
    animate();
    const dispose = () => {
        cancelAnimationFrame(frame);
        observer.disconnect();
        canvas.removeEventListener("pointermove", pointerMove);
        canvas.removeEventListener("pointerdown", pointerDown);
        controls.dispose();
        scene.traverse((object) => {
        if (
            object instanceof THREE.Mesh ||
            object instanceof THREE.LineSegments
        ) {
            object.geometry.dispose();
            const materials = Array.isArray(object.material)
            ? object.material
            : [object.material];
            materials.forEach((current) => current.dispose());
        }
        });
        composer.dispose();
        renderer.dispose();
    };
    return {
        updateSelection: (nextSelection: Partial<Record<Category, ScenePart>>) => {
        currentSelection = nextSelection;
        },
      setActiveCategory: (category: Category) => {
      activeCategory = category;
      },
        dispose,
    };
}

export { labels };