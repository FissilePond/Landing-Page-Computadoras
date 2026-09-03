import { useEffect, useMemo, useRef, useState } from 'react'
import './act4/styles.css'
import { initPcWorkbench, type Category, type PcWorkbench, type ScenePart } from './act4/main.ts'
import { ProductModelCanvas, ProductModelViewer, type ProductModel } from './act4/models.tsx'

type ComponentName = 'Motherboard' | 'Procesador' | 'RAM' | 'Almacenamiento' | 'PSU' | 'GPU' | 'Ventiladores'
type Product = ScenePart & { name: string; details: string; id: string; price: number; socket?: string; memoryType?: string; interface?: string; capacity?: number; watts?: number }

const componentOrder: ComponentName[] = ['Motherboard', 'Procesador', 'RAM', 'Almacenamiento', 'PSU', 'GPU', 'Ventiladores']
const categoryFor: Record<ComponentName, Category> = { Motherboard: 'motherboard', Procesador: 'cpu', RAM: 'memory', Almacenamiento: 'storage', PSU: 'psu', GPU: 'gpu', Ventiladores: 'fans' }
const descriptions: Record<ComponentName, string> = { Motherboard: 'Compatibilidad y expansión.', Procesador: 'Elige la marca y la familia ideal.', RAM: 'Velocidad y capacidad suficientes.', Almacenamiento: 'SSD y capacidad para tus juegos.', PSU: 'Potencia estable y eficiente para tu equipo.', GPU: 'Rendimiento para gaming y edición.', Ventiladores: 'Mantén temperaturas óptimas y flujo de aire.' }
const products: Record<ComponentName, Product[]> = {
  Motherboard: [{ id: 'msi-pro-b660m-a', name: 'MSI PRO B660M-A', details: 'Socket LGA1700 • DDR4', socket: 'LGA1700', memoryType: 'DDR4', interface: 'M.2', price: 2499, color: '#16263a', accent: '#00e5ff' }, { id: 'asus-prime-b550m-a', name: 'ASUS Prime B550M-A', details: 'Socket AM4 • DDR4', socket: 'AM4', memoryType: 'DDR4', interface: 'M.2', price: 2199, color: '#16263a', accent: '#00e5ff' }],
  Procesador: [{ id: 'intel-core-i5-12400f', name: 'Intel Core i5-12400F', details: '6 núcleos • 12 hilos', socket: 'LGA1700', price: 2899, color: '#1d4ed8', accent: '#60a5fa' }, { id: 'amd-ryzen-5-5600x', name: 'AMD Ryzen 5 5600X', details: '6 núcleos • 12 hilos', socket: 'AM4', price: 2599, color: '#991b1b', accent: '#f87171' }],
  RAM: [{ id: 'kingston-fury-16gb', name: 'Kingston Fury Beast 16 GB', details: 'DDR4 • 3200 MHz', memoryType: 'DDR4', sticks: 2, price: 899, color: '#e9eefc', accent: '#ff5eea' }, { id: 'corsair-vengeance-32gb', name: 'Corsair Vengeance 32 GB', details: 'DDR4 • 3600 MHz', memoryType: 'DDR4', sticks: 2, price: 1599, color: '#e9eefc', accent: '#ff5eea' }],
  Almacenamiento: [{ id: 'ssd-nvme-1tb', name: 'SSD NVMe 1 TB', details: 'PCIe 4.0 • Alta velocidad', interface: 'M.2', price: 1299, color: '#111827', accent: '#00ffa8' }, { id: 'ssd-nvme-2tb', name: 'SSD NVMe 2 TB', details: 'PCIe 4.0 • Gran capacidad', interface: 'M.2', price: 2199, color: '#111827', accent: '#00ffa8' }],
  PSU: [{ id: 'psu-650w-bronze', name: 'Fuente 650W 80+ Bronze', details: 'ATX • Eficiencia 80+ Bronze', capacity: 650, price: 1299, color: '#22272f', accent: '#f2f4f8' }, { id: 'psu-750w-gold', name: 'Fuente 750W 80+ Gold', details: 'ATX • Eficiencia 80+ Gold', capacity: 750, price: 1899, color: '#22272f', accent: '#f2f4f8' }],
  GPU: [{ id: 'rtx-4060-8gb', name: 'RTX 4060 8 GB', details: 'Ray tracing • DLSS 3', watts: 115, price: 6499, color: '#11151d', accent: '#63ffdd' }, { id: 'radeon-rx-7600-8gb', name: 'Radeon RX 7600 8 GB', details: 'AMD FidelityFX • 8 GB', watts: 165, price: 5899, color: '#11151d', accent: '#63ffdd' }],
  Ventiladores: [{ id: 'rgb-fans-3-pack', name: 'Kit de 3 ventiladores RGB', details: '120 mm • Flujo de aire optimizado', count: 3, price: 799, color: '#0f172a', accent: '#8b5cf6' }, { id: 'argb-fans-5-pack', name: 'Kit de 5 ventiladores ARGB', details: '120 mm • Alto rendimiento', count: 5, price: 1299, color: '#0f172a', accent: '#8b5cf6' }],
}

export function ActPlayground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const workbenchRef = useRef<PcWorkbench | null>(null);
  const [current, setCurrent] = useState<ComponentName>("Motherboard");
  const [selected, setSelected] = useState<
    Partial<Record<ComponentName, Product>>
  >({});
  const [viewer, setViewer] = useState<ProductModel | null>(null);
  const selectedByCategory = useMemo(
    () =>
      Object.fromEntries(
        Object.entries(selected).map(([name, product]) => [
          categoryFor[name as ComponentName],
          product,
        ]),
      ) as Partial<Record<Category, ScenePart>>,
    [selected],
  );
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    workbenchRef.current = initPcWorkbench(
      canvas,
      selectedByCategory,
      (category) => {
        const index = componentOrder.indexOf(
          componentOrder.find(
            (name) => categoryFor[name] === category,
          ) as ComponentName,
        );
        if (index >= 0 && index < componentOrder.length - 1)
          setCurrent(componentOrder[index + 1]);
      },
    );
    return () => {
      workbenchRef.current?.dispose();
      workbenchRef.current = null;
    };
  }, []);
  useEffect(() => {
    workbenchRef.current?.updateSelection(selectedByCategory);
  }, [selectedByCategory]);
  useEffect(() => {
    workbenchRef.current?.setActiveCategory(categoryFor[current]);
  }, [current]);
  const choose = (product: Product) =>
    setSelected((previous) => ({ ...previous, [current]: product }));
  const compatible = (product: Product) => {
    const board = selected.Motherboard;
    const psu = selected.PSU;
    if (current === "Procesador")
      return !board || product.socket === board.socket;
    if (current === "RAM")
      return !board || product.memoryType === board.memoryType;
    if (current === "GPU")
      return !psu || (psu.capacity ?? 0) >= (product.watts ?? 0);
    return true;
  };
  const total = Object.values(selected).reduce(
    (sum, product) => sum + (product?.price ?? 0),
    0,
  );
  return (
    <>
      <section className="hero" id="inicio">
        <div className="container hero-grid">
          <div>
            <span className="eyebrow">Personaliza tu PC</span>
            <h1>Donde nace tu proxima maquina.</h1>
            <p>
              No vendemos cajas; creamos bestias hechas a tu medida. Eliges el
              poder, nosotros le damos vida para reventar juegos, trabajar sin
              que se crashee nada y para todo lo que quieras.
            </p>
            <div className="hero-actions">
              <a href="#configurador" className="btn btn-primary">
                Empezar
              </a>
              <a href="#configurador" className="btn btn-secondary">
                Ver catálogo
              </a>
            </div>
            <div className="mini-info">
              <div>
                <strong>+2,000</strong>
                <span>Equipos armados</span>
              </div>
              <div>
                <strong>24/7</strong>
                <span>Atención</span>
              </div>
              <div>
                <strong>3 años</strong>
                <span>Garantía</span>
              </div>
            </div>
          </div>
          <aside className="summary-card">
            <div className="summary-top">
              <h3>Tu configuración</h3>
              <span className="price-badge">Actual</span>
            </div>
            <div className="amount">
              ${total.toLocaleString("es-MX")} <small>MXN</small>
            </div>
            <ul className="selection-list">
              {componentOrder.map((name, index) => (
                <li key={name} className={selected[name] ? "active" : ""}>
                  <span className="step-number">{index + 1}</span>
                  <span className="selection-name">
                    {selected[name]?.name || "Pendiente"}
                  </span>
                </li>
              ))}
            </ul>
          </aside>
        </div>
      </section>
      <section className="wizard" id="configurador">
        <div className="container">
          <div className="section-head">
            <h2>Selecciona tus componentes</h2>
            <p>Haz tu PC a medida paso a paso</p>
          </div>
          <div className="catalog">
            <div className="category-panel">
              <div className="pc-app">
                <canvas
                  ref={canvasRef}
                  aria-label="Simulador 3D de armado de PC"
                />
              </div>
            </div>
            <div className="product-panel">
              <h3 className="category-name">{current}</h3>
              <p className="category-description">{descriptions[current]}</p>
              <div className="product-list">
                {products[current].map((product) => {
                  const isCompatible = compatible(product);
                  const model = {
                    id: product.id,
                    category: categoryFor[current],
                    part: product,
                  };
                  return (
                    <div
                      key={product.id}
                      className={`product-item${selected[current]?.id === product.id ? " active" : ""}${isCompatible ? "" : " is-incompatible"}`}
                      aria-disabled={!isCompatible}
                      onClick={() => isCompatible && choose(product)}
                    >
                      <div className="product-thumb" data-model={product.id}>
                        <ProductModelCanvas model={model} />
                      </div>
                      <div className="product-info">
                        <h4>{product.name}</h4>
                        <p>{product.details}</p>
                        <button
                          className="view-360"
                          type="button"
                          onClick={(event) => {
                            event.stopPropagation();
                            setViewer(model);
                          }}
                        >
                          Ver en 360°
                        </button>
                      </div>
                      <div className="price-tag">
                        ${product.price.toLocaleString("es-MX")}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </section>
      <ProductModelViewer model={viewer} onClose={() => setViewer(null)} />
    </>
  );
}
