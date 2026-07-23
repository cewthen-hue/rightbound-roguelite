import fs from "node:fs";
import vm from "node:vm";

class ClassListStub {
  constructor() {
    this.values = new Set();
  }

  add(...values) {
    values.forEach((value) => this.values.add(value));
  }

  remove(...values) {
    values.forEach((value) => this.values.delete(value));
  }

  toggle(value, force) {
    if (force === undefined) {
      if (this.values.has(value)) {
        this.values.delete(value);
        return false;
      }
      this.values.add(value);
      return true;
    }
    if (force) this.values.add(value);
    else this.values.delete(value);
    return force;
  }

  contains(value) {
    return this.values.has(value);
  }
}

class ElementStub {
  constructor(id = "") {
    this.id = id;
    this.style = {};
    this.classList = new ClassListStub();
    this.dataset = {};
    this.disabled = false;
    this.textContent = "";
    this.innerHTML = "";
    this.listeners = new Map();
  }

  addEventListener(type, listener) {
    this.listeners.set(type, listener);
  }

  click() {
    this.listeners.get("click")?.({ currentTarget: this, target: this });
  }

  querySelectorAll() {
    return [];
  }

  querySelector() {
    return null;
  }

  getBoundingClientRect() {
    return { width: 390, height: 600 };
  }
}

const drawingContext = new Proxy({
  createLinearGradient() {
    return { addColorStop() {} };
  },
  roundRect() {}
}, {
  get(target, property) {
    if (property in target) return target[property];
    return () => {};
  },
  set(target, property, value) {
    target[property] = value;
    return true;
  }
});

const elements = new Map();
function getElement(id) {
  if (!elements.has(id)) {
    const element = new ElementStub(id);
    if (id === "game") element.getContext = () => drawingContext;
    elements.set(id, element);
  }
  return elements.get(id);
}

const documentStub = {
  visibilityState: "visible",
  getElementById: getElement,
  createElement(tagName) {
    const element = new ElementStub(tagName);
    if (tagName === "canvas") {
      element.width = 1;
      element.height = 1;
      element.getContext = () => drawingContext;
    }
    return element;
  },
  addEventListener() {},
  dispatchEvent() {}
};

let animationFrameCallback = null;
const sandbox = {
  console,
  document: documentStub,
  window: null,
  performance: { now: () => 0 },
  requestAnimationFrame(callback) {
    animationFrameCallback = callback;
    return 1;
  },
  cancelAnimationFrame() {},
  ResizeObserver: class {
    observe() {}
  },
  CustomEvent: class {
    constructor(type, init) {
      this.type = type;
      this.detail = init?.detail;
    }
  },
  setTimeout(callback) {
    callback();
    return 1;
  },
  clearTimeout() {},
  Math,
  Object,
  Array,
  Map,
  Set,
  JSON,
  String,
  Number,
  Boolean
};

sandbox.window = sandbox;
sandbox.window.devicePixelRatio = 3;
sandbox.window.addEventListener = () => {};

vm.createContext(sandbox);
vm.runInContext(fs.readFileSync("src/game.js", "utf8"), sandbox, { filename: "src/game.js" });

if (!sandbox.RightboundPerformance) {
  throw new Error("RightboundPerformance API missing after runtime initialization.");
}

getElement("startButton").click();
for (let frame = 1; frame <= 600; frame += 1) {
  if (!animationFrameCallback) throw new Error("Animation frame callback missing.");
  animationFrameCallback(frame * 16.6667);
}

const stats = sandbox.RightboundPerformance.getStats();
if (stats.activeTier !== "high") throw new Error(`Unexpected quality tier: ${stats.activeTier}`);
if (stats.renderDpr > 1.5) throw new Error(`Mobile DPR cap failed: ${stats.renderDpr}`);
if (stats.droppedSimulationSteps !== 0) throw new Error("Stable 60 Hz simulation unexpectedly dropped steps.");

console.log("Runtime smoke test passed", stats);
