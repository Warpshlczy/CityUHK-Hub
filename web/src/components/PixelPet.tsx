import { useEffect, useMemo, useRef, useState } from 'react';
import { useI18n } from '../i18n';

const CELL = 4;
const PET_W = 20;
const PET_H = 20;
const INFLATE = PET_W / 2 - 2;
const TOP_PADDING = 108;
const WALK_SPEED = 62;
const RUN_SPEED = 168;
const ACCEL = 520;
const CURSOR_NOTICE_RANGE = 190;
const CURSOR_COOLDOWN = 7000;

const PIXEL_COLORS: Record<string, string> = {
  B: '#000000',
  W: '#ffffff',
};

const CAT_WALK_A = [
  '..B....B..',
  '..BW..WB..',
  '.BBBBBBBB.',
  '.BBBBBBBB.',
  '.BWWBBWWB.',
  'BBBBBBBBBB',
  'BBBBBBBBBB',
  'BBBBBBBBBB',
  'BBBBBBBBBB',
  '.BB....BBB',
];

const CAT_WALK_B = [
  '..B....B..',
  '..BW..WB..',
  '.BBBBBBBB.',
  '.BBBBBBBB.',
  '.BWWBBWWB.',
  'BBBBBBBBBB',
  'BBBBBBBBBB',
  'BBBBBBBBBB',
  'BBBBBBBBBB',
  '..BB..BB.B',
];

const CAT_SIT = [
  '..........',
  '..B....B..',
  '..BW..WB..',
  '.BBBBBBBB.',
  '.BBBBBBBB.',
  '.BWWBBWWB.',
  'BBBBBBBBBB',
  'BBBBBBBBBB',
  'BBBBBBBBBB',
  '.BBBBBBBBB',
];

const CAT_FRAMES = [CAT_WALK_A, CAT_WALK_B, CAT_SIT];
const SPEECH = ['MIAO~', 'ニャー', 'PURR~', 'MEOW!', 'POKE!', 'PET ME!'];
type Pose = 'idle' | 'walk' | 'run' | 'jump';
type Mode = 'idle' | 'wander' | 'chase-cursor' | 'poke' | 'flee' | 'stuck';
interface NavGrid {
cols: number;
rows: number;
blocked: Uint8Array;
/** 复用的 A* 缓冲，避免每次寻路都重新分配 */
gScore: Float32Array;
fScore: Float32Array;
cameFrom: Int32Array;
closed: Uint8Array;
}
const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));
function createMinHeap() {
const items: number[] = [];
const priorities: number[] = [];
const swap = (a: number, b: number) => {
const item = items[a];
items[a] = items[b];
items[b] = item;
const priority = priorities[a];
priorities[a] = priorities[b];
priorities[b] = priority;
  };
return {
size: () => items.length,
push(item: number, priority: number) {
items.push(item);
priorities.push(priority);
let index = items.length - 1;
while (index > 0) {
const parent = (index - 1) >> 1;
if (priorities[parent] <= priorities[index]) break;
swap(index, parent);
index = parent;
      }
    },
pop(): number {
const top = items[0];
const lastItem = items.pop() as number;
const lastPriority = priorities.pop() as number;
if (items.length > 0) {
items[0] = lastItem;
priorities[0] = lastPriority;
let index = 0;
for (;;) {
const left = index * 2 + 1;
const right = left + 1;
let smallest = index;
if (left < items.length && priorities[left] < priorities[smallest]) smallest = left;
if (right < items.length && priorities[right] < priorities[smallest]) smallest = right;
if (smallest === index) break;
swap(index, smallest);
index = smallest;
        }
      }
return top;
    },
  };
}
function isSolidElement(el: HTMLElement): boolean {
const rect = el.getBoundingClientRect();
if (rect.width < 8 || rect.height < 8) return false;
if (rect.bottom < TOP_PADDING || rect.top > window.innerHeight) return false;
if (rect.right < 0 || rect.left > window.innerWidth) return false;
const style = window.getComputedStyle(el);
if (style.visibility === 'hidden' || style.display === 'none' || style.opacity === '0') {
return false;
  }
const background = style.backgroundColor;
const hasBackground = background !== 'rgba(0, 0, 0, 0)' && background !== 'transparent';
const hasBorder =
parseFloat(style.borderTopWidth) >= 2 ||
parseFloat(style.borderBottomWidth) >= 2 ||
parseFloat(style.borderLeftWidth) >= 2 ||
parseFloat(style.borderRightWidth) >= 2;
const isControl = /^(IMG|SVG|BUTTON|A|INPUT|SELECT|TEXTAREA|H1|H2|H3|P)$/.test(el.tagName);
return hasBackground || hasBorder || isControl;
}
function buildNavGrid(): NavGrid {
const cols = Math.max(1, Math.ceil(window.innerWidth / CELL));
const rows = Math.max(1, Math.ceil(window.innerHeight / CELL));
const size = cols * rows;
const blocked = new Uint8Array(size);
const topRows = Math.min(rows, Math.ceil(TOP_PADDING / CELL));
blocked.fill(1, 0, topRows * cols);
const nodes = document.querySelectorAll<HTMLElement>('body *');
for (const el of nodes) {
if (el.closest('.pet-root') || el.classList.contains('pet-bubble')) continue;
if (!isSolidElement(el)) continue;
const rect = el.getBoundingClientRect();
const minCol = clamp(Math.floor((rect.left - INFLATE) / CELL), 0, cols - 1);
const maxCol = clamp(Math.floor((rect.right + INFLATE) / CELL), 0, cols - 1);
const minRow = clamp(Math.floor((rect.top - INFLATE) / CELL), 0, rows - 1);
const maxRow = clamp(Math.floor((rect.bottom + INFLATE) / CELL), 0, rows - 1);
for (let row = minRow; row <= maxRow; row += 1) {
blocked.fill(1, row * cols + minCol, row * cols + maxCol + 1);
    }
  }
return {
cols,
rows,
blocked,
gScore: new Float32Array(size),
fScore: new Float32Array(size),
cameFrom: new Int32Array(size),
closed: new Uint8Array(size),
  };
}
const isFree = (grid: NavGrid, col: number, row: number) =>
col >= 0 && row >= 0 && col < grid.cols && row < grid.rows && grid.blocked[row * grid.cols + col] === 0;
function toCol(x: number) {
return clamp(Math.floor(x / CELL), 0, Math.max(0, Math.ceil(window.innerWidth / CELL) - 1));
}
function toRow(y: number) {
return clamp(Math.floor(y / CELL), 0, Math.max(0, Math.ceil(window.innerHeight / CELL) - 1));
}
function nearestFreeCell(grid: NavGrid, col: number, row: number): number {
if (isFree(grid, col, row)) return row * grid.cols + col;
for (let radius = 1; radius <= 40; radius += 1) {
for (let offset = -radius; offset <= radius; offset += 1) {
const candidates: Array<[number, number]> = [
        [col + offset, row - radius],
        [col + offset, row + radius],
        [col - radius, row + offset],
        [col + radius, row + offset],
      ];
for (const [c, r] of candidates) {
if (isFree(grid, c, r)) return r * grid.cols + c;
      }
    }
  }
return -1;
}
const NEIGHBORS: Array<[number, number, number]> = [
  [1, 0, 1],
  [-1, 0, 1],
  [0, 1, 1],
  [0, -1, 1],
  [1, 1, Math.SQRT2],
  [1, -1, Math.SQRT2],
  [-1, 1, Math.SQRT2],
  [-1, -1, Math.SQRT2],
];
const MAX_EXPANDED = 14000;
function findPath(
grid: NavGrid,
fromCol: number,
fromRow: number,
toCol: number,
toRow: number,
): Array<{ x: number; y: number }> | null {
const start = nearestFreeCell(grid, fromCol, fromRow);
const goal = nearestFreeCell(grid, toCol, toRow);
if (start < 0 || goal < 0) return null;
if (start === goal) {
return [{ x: (goal % grid.cols) * CELL + CELL / 2, y: Math.floor(goal / grid.cols) * CELL + CELL / 2 }];
  }
const { cols, rows, blocked, gScore, fScore, cameFrom, closed } = grid;
gScore.fill(Infinity);
fScore.fill(Infinity);
cameFrom.fill(-1);
closed.fill(0);
const goalCol = goal % cols;
const goalRow = Math.floor(goal / cols);
const heuristic = (col: number, row: number) =>
Math.hypot(col - goalCol, row - goalRow) * 1.001;
const open = createMinHeap();
gScore[start] = 0;
fScore[start] = heuristic(start % cols, Math.floor(start / cols));
open.push(start, fScore[start]);
let expanded = 0;
let found = false;
while (open.size() > 0) {
const current = open.pop();
if (current === goal) {
found = true;
break;
    }
if (closed[current]) continue;
closed[current] = 1;
expanded += 1;
if (expanded > MAX_EXPANDED) return null;
const col = current % cols;
const row = Math.floor(current / cols);
for (const [dx, dy, cost] of NEIGHBORS) {
const nextCol = col + dx;
const nextRow = row + dy;
if (nextCol < 0 || nextRow < 0 || nextCol >= cols || nextRow >= rows) continue;
const next = nextRow * cols + nextCol;
if (blocked[next] || closed[next]) continue;
// 不允许贴着墙角斜穿
if (dx !== 0 && dy !== 0) {
if (blocked[row * cols + nextCol] || blocked[nextRow * cols + col]) continue;
      }
const tentative = gScore[current] + cost;
if (tentative < gScore[next]) {
gScore[next] = tentative;
fScore[next] = tentative + heuristic(nextCol, nextRow);
cameFrom[next] = current;
open.push(next, fScore[next]);
      }
    }
  }
if (!found) return null;
const cells: number[] = [];
let node = goal;
while (node !== -1) {
cells.push(node);
node = cameFrom[node];
  }
cells.reverse();
const points = cells.map((cell) => ({
x: (cell % cols) * CELL + CELL / 2,
y: Math.floor(cell / cols) * CELL + CELL / 2,
  }));
return points.length > 1 ? points.slice(1) : points;
}
function CatSprite({ map }: { map: string[] }) {
return (
<svg
viewBox={`0 0 ${map[0].length} ${map.length}`}
width={PET_W}
height={PET_H}
shapeRendering="crispEdges"
aria-hidden
>
{map.flatMap((row, y) =>
row.split('').map((char, x) => {
const fill = PIXEL_COLORS[char];
if (!fill) return null;
return <rect key={`${x}-${y}`} x={x} y={y} width={1} height={1} fill={fill} />;
        }),
      )}
</svg>
  );
}
/** 像素猫咪：在组件空隙里走动，会追光标，也会凑到卡片/按钮旁伸爪戳一下 */
export function PixelPet() {
const { t } = useI18n();
const rootRef = useRef<HTMLDivElement>(null);
const faceRef = useRef<HTMLDivElement>(null);
const frameRefs = useRef<Array<HTMLDivElement | null>>([]);
const clickRef = useRef<() => void>(() => {});
const [pose, setPose] = useState<Pose>('idle');
const [bubble, setBubble] = useState<string | null>(null);
const isMobile = useMemo(() => {
if (typeof window === 'undefined') return true;
const hasTouchScreen = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
const isSmallScreen = window.innerWidth <= 768;
const userAgent = navigator.userAgent || navigator.vendor || '';
const mobileRegex = /android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/i;
return (hasTouchScreen && isSmallScreen) || mobileRegex.test(userAgent.toLowerCase());
  }, []);
useEffect(() => {
if (isMobile) return;
const root = rootRef.current;
const face = faceRef.current;
const frames = frameRefs.current.filter((el): el is HTMLDivElement => el !== null);
if (!root || !face || frames.length !== CAT_FRAMES.length) return;
const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const started = performance.now();
let grid = buildNavGrid();
const pet = {
// x / y 是猫的中心点
x: 0,
y: 0,
vx: 0,
vy: 0,
facing: 1 as 1 | -1,
targetX: 0,
targetY: 0,
mode: 'idle' as Mode,
modeUntil: started + 1200,
running: false,
jumping: false,
pokeEl: null as HTMLElement | null,
path: [] as Array<{ x: number; y: number }>,
pathIndex: 0,
cursorCooldownUntil: 0,
mouseX: window.innerWidth / 2,
mouseY: window.innerHeight / 2,
mouseSpeed: 0,
lastMouseAt: started,
frameIndex: 2,
lastProgressAt: started,
    };
const spawnCol = toCol(window.innerWidth / 2);
const spawnRow = toRow(window.innerHeight / 2);
const spawnCell = nearestFreeCell(grid, spawnCol, spawnRow);
if (spawnCell >= 0) {
pet.x = (spawnCell % grid.cols) * CELL + CELL / 2;
pet.y = Math.floor(spawnCell / grid.cols) * CELL + CELL / 2;
    } else {
pet.x = window.innerWidth / 2;
pet.y = window.innerHeight / 2;
    }
let poseCache: Pose = 'idle';
let frameCache = 2;
let bubbleTimer = 0;
let rafId = 0;
let lastFrame = started;
let gridDirty = false;
let gridTimer = 0;
const say = (text: string, duration = 1600) => {
setBubble(text);
window.clearTimeout(bubbleTimer);
bubbleTimer = window.setTimeout(() => setBubble(null), duration);
    };
const canStand = (x: number, y: number) => isFree(grid, toCol(x), toRow(y));
/** 直线可达就不必沿格子走，减少抖动 */
const hasLineOfSight = (fromX: number, fromY: number, toX: number, toY: number) => {
const steps = Math.ceil(Math.hypot(toX - fromX, toY - fromY) / (CELL / 2));
for (let step = 1; step <= steps; step += 1) {
const t = step / steps;
if (!canStand(fromX + (toX - fromX) * t, fromY + (toY - fromY) * t)) return false;
      }
return true;
    };
const pathTo = (targetX: number, targetY: number) => {
const path = findPath(grid, toCol(pet.x), toRow(pet.y), toCol(targetX), toRow(targetY));
pet.path = path ?? [];
pet.pathIndex = 0;
pet.targetX = targetX;
pet.targetY = targetY;
pet.lastProgressAt = performance.now();
return path !== null;
    };
const rest = (now: number, min = 900, extra = 2000) => {
pet.mode = 'idle';
pet.running = false;
pet.path = [];
pet.pokeEl = null;
pet.modeUntil = now + min + Math.random() * extra;
    };
const pickWanderTarget = () => {
for (let attempt = 0; attempt < 40; attempt += 1) {
const col = 1 + Math.floor(Math.random() * Math.max(1, grid.cols - 2));
const row = Math.ceil(TOP_PADDING / CELL) + Math.floor(Math.random() * Math.max(1, grid.rows - 2));
if (!isFree(grid, col, row)) continue;
const x = col * CELL + CELL / 2;
const y = row * CELL + CELL / 2;
if (Math.hypot(x - pet.x, y - pet.y) < 60) continue;
pet.running = Math.hypot(x - pet.x, y - pet.y) > window.innerWidth * 0.35;
return pathTo(x, y);
      }
return false;
    };
const pickPokeTarget = () => {
const nodes = Array.from(
document.querySelectorAll<HTMLElement>('.cursor-target, button, .panel-brutal'),
      ).filter((el) => {
if (el.closest('.pet-root')) return false;
const rect = el.getBoundingClientRect();
return (
rect.width >= 40 &&
rect.height >= 24 &&
rect.top > TOP_PADDING &&
rect.bottom < window.innerHeight
        );
      });
if (nodes.length === 0) return false;
const el = nodes[Math.floor(Math.random() * nodes.length)];
const rect = el.getBoundingClientRect();
const centerX = rect.left + rect.width / 2;
const centerY = rect.top + rect.height / 2;
const cell = nearestFreeCell(grid, toCol(centerX), toRow(centerY));
if (cell < 0) return false;
const x = (cell % grid.cols) * CELL + CELL / 2;
const y = Math.floor(cell / grid.cols) * CELL + CELL / 2;
pet.pokeEl = el;
pet.running = Math.hypot(x - pet.x, y - pet.y) > 320;
return pathTo(x, y);
    };
const scheduleNext = (now: number) => {
const roll = Math.random();
if (roll < 0.45) {
if (pickWanderTarget()) {
pet.mode = 'wander';
return;
        }
      } else if (roll < 0.8) {
if (pickPokeTarget()) {
pet.mode = 'poke';
return;
        }
      }
rest(now);
if (Math.random() < 0.3) say(SPEECH[Math.floor(Math.random() * SPEECH.length)], 1200);
    };
const startFlee = (now: number) => {
const angle = Math.atan2(pet.y - pet.mouseY, pet.x - pet.mouseX) || 0;
const targetX = clamp(pet.x + Math.cos(angle) * 260, 12, window.innerWidth - 12);
const targetY = clamp(pet.y + Math.sin(angle) * 220, TOP_PADDING, window.innerHeight - 12);
pet.mode = pathTo(targetX, targetY) ? 'flee' : 'stuck';
pet.modeUntil = now + 1400;
pet.running = true;
    };
clickRef.current = () => {
const now = performance.now();
pet.jumping = true;
say(SPEECH[Math.floor(Math.random() * SPEECH.length)], 1200);
window.setTimeout(() => {
pet.jumping = false;
      }, 460);
startFlee(now);
    };
const poke = (el: HTMLElement | null) => {
say(SPEECH[Math.floor(Math.random() * SPEECH.length)]);
if (!el) return;
el.classList.add('pet-poked');
window.setTimeout(() => el.classList.remove('pet-poked'), 480);
    };
const updateBehavior = (now: number) => {
if (now > pet.cursorCooldownUntil && pet.mode !== 'poke' && pet.mode !== 'flee') {
const distance = Math.hypot(pet.mouseX - pet.x, pet.mouseY - pet.y);
if (distance < CURSOR_NOTICE_RANGE) {
const cell = nearestFreeCell(grid, toCol(pet.mouseX), toRow(pet.mouseY));
if (cell >= 0) {
const x = (cell % grid.cols) * CELL + CELL / 2;
const y = Math.floor(cell / grid.cols) * CELL + CELL / 2;
if (pathTo(x, y)) {
pet.mode = 'chase-cursor';
pet.modeUntil = now + 2800;
pet.cursorCooldownUntil = now + CURSOR_COOLDOWN;
pet.pokeEl = null;
pet.running = pet.mouseSpeed > 600;
return;
            }
          }
        }
      }
if (pet.mode === 'idle') {
if (now > pet.modeUntil) scheduleNext(now);
return;
      }
if (pet.mode === 'chase-cursor') {
pet.running = pet.mouseSpeed > 600;
if (now > pet.modeUntil) {
rest(now, 500, 900);
return;
        }
      }
if (now - pet.lastProgressAt > 2200) {
if (!pathTo(pet.targetX, pet.targetY)) rest(now, 600, 1200);
pet.lastProgressAt = now;
      }
    };
const integrate = (dt: number) => {
const hasTarget = pet.mode !== 'idle' && pet.path.length > 0;
const maxSpeed = pet.running ? RUN_SPEED : WALK_SPEED;
if (hasTarget) {
// 航点已被走完就取下一个；能直视更远的航点就跳过中间点（每帧最多跳 8 个）
let waypoint = pet.path[pet.pathIndex];
let skipped = 0;
while (
waypoint &&
skipped < 8 &&
pet.pathIndex + 1 < pet.path.length &&
hasLineOfSight(pet.x, pet.y, pet.path[pet.pathIndex + 1].x, pet.path[pet.pathIndex + 1].y)
        ) {
pet.pathIndex += 1;
skipped += 1;
waypoint = pet.path[pet.pathIndex];
        }
const dx = waypoint.x - pet.x;
const dy = waypoint.y - pet.y;
const distance = Math.hypot(dx, dy) || 1;
const blend = Math.min(1, (ACCEL / maxSpeed) * dt);
pet.vx += ((dx / distance) * maxSpeed - pet.vx) * blend;
pet.vy += ((dy / distance) * maxSpeed - pet.vy) * blend;
if (distance < CELL && pet.pathIndex < pet.path.length - 1) {
pet.pathIndex += 1;
pet.lastProgressAt = performance.now();
        } else if (pet.pathIndex >= pet.path.length - 1 && distance < CELL * 1.5) {
if (pet.mode === 'poke') {
poke(pet.pokeEl);
rest(performance.now(), 1200, 1200);
          } else if (pet.mode === 'wander') {
if (Math.random() < 0.25) say(SPEECH[Math.floor(Math.random() * SPEECH.length)], 1200);
rest(performance.now(), 800, 2000);
          } else {
rest(performance.now(), 500, 900);
          }
        }
      } else {
const damping = Math.min(1, 7 * dt);
pet.vx -= pet.vx * damping;
pet.vy -= pet.vy * damping;
      }
// 逐轴推进，撞到组件就停在那条轴上
const nextX = pet.x + pet.vx * dt;
const nextY = pet.y + pet.vy * dt;
if (canStand(nextX, nextY)) {
pet.x = nextX;
pet.y = nextY;
      } else if (canStand(nextX, pet.y)) {
pet.x = nextX;
pet.vy = 0;
      } else if (canStand(pet.x, nextY)) {
pet.y = nextY;
pet.vx = 0;
      } else {
pet.vx = 0;
pet.vy = 0;
      }
// 万一被新布局埋住，挪到最近的空隙
if (!canStand(pet.x, pet.y)) {
const cell = nearestFreeCell(grid, toCol(pet.x), toRow(pet.y));
if (cell >= 0) {
pet.x = (cell % grid.cols) * CELL + CELL / 2;
pet.y = Math.floor(cell / grid.cols) * CELL + CELL / 2;
pet.vx = 0;
pet.vy = 0;
        }
      }
    };
const paint = (now: number) => {
root.style.transform = `translate3d(${(pet.x - PET_W / 2).toFixed(2)}px, ${(
pet.y -
PET_H / 2
      ).toFixed(2)}px, 0)`;
const speed = Math.hypot(pet.vx, pet.vy);
if (speed > 6) {
const facing: 1 | -1 = pet.vx >= 0 ? 1 : -1;
if (facing !== pet.facing) {
pet.facing = facing;
face.style.transform = `scaleX(${facing})`;
        }
      }
const nextFrame = pet.jumping ? 0 : speed > 20 ? Math.floor(now / (pet.running ? 90 : 150)) % 2 : 2;
if (nextFrame !== frameCache) {
frames[frameCache].style.opacity = '0';
frames[nextFrame].style.opacity = '1';
frameCache = nextFrame;
pet.frameIndex = nextFrame;
      }
const nextPose: Pose = pet.jumping
? 'jump'
: speed > 110
? 'run'
: speed > 18
? 'walk'
: 'idle';
if (nextPose !== poseCache) {
poseCache = nextPose;
setPose(nextPose);
      }
    };
const rebuildGrid = () => {
grid = buildNavGrid();
// 当前位置可能变成障碍，先挪出来再重新寻路
if (!canStand(pet.x, pet.y)) {
const cell = nearestFreeCell(grid, toCol(pet.x), toRow(pet.y));
if (cell >= 0) {
pet.x = (cell % grid.cols) * CELL + CELL / 2;
pet.y = Math.floor(cell / grid.cols) * CELL + CELL / 2;
        }
      }
if (pet.mode !== 'idle') pathTo(pet.targetX, pet.targetY);
gridDirty = false;
    };
const frame = (now: number) => {
const dt = Math.min(32, now - lastFrame) / 1000;
lastFrame = now;
if (gridDirty) rebuildGrid();
if (!reducedMotion && !document.hidden) {
updateBehavior(now);
integrate(dt);
      }
paint(now);
rafId = requestAnimationFrame(frame);
    };
const moveHandler = (event: MouseEvent) => {
const now = performance.now();
const elapsed = Math.max(1, now - pet.lastMouseAt) / 1000;
pet.mouseSpeed = Math.hypot(event.clientX - pet.mouseX, event.clientY - pet.mouseY) / elapsed;
pet.mouseX = event.clientX;
pet.mouseY = event.clientY;
pet.lastMouseAt = now;
    };
// 布局可能变化：滚动、缩放、筛选后重新扫描空隙
const markDirty = () => {
window.clearTimeout(gridTimer);
gridTimer = window.setTimeout(() => {
gridDirty = true;
      }, 320);
    };
face.style.transform = `scaleX(${pet.facing})`;
frames.forEach((el, index) => {
el.style.opacity = index === pet.frameIndex ? '1' : '0';
    });
root.style.transform = `translate3d(${pet.x - PET_W / 2}px, ${pet.y - PET_H / 2}px, 0)`;
window.addEventListener('mousemove', moveHandler, { passive: true });
window.addEventListener('scroll', markDirty, { passive: true });
window.addEventListener('resize', markDirty);
rafId = requestAnimationFrame(frame);
return () => {
cancelAnimationFrame(rafId);
window.clearTimeout(bubbleTimer);
window.clearTimeout(gridTimer);
window.removeEventListener('mousemove', moveHandler);
window.removeEventListener('scroll', markDirty);
window.removeEventListener('resize', markDirty);
document.querySelectorAll('.pet-poked').forEach((el) => el.classList.remove('pet-poked'));
    };
  }, [isMobile]);
if (isMobile) return null;
const poseClass =
pose === 'run'
? 'pet-bob-fast'
: pose === 'walk'
? 'pet-bob'
: pose === 'jump'
? 'pet-jump'
: 'pet-breathe';
return (
<div ref={rootRef} className="pet-root" aria-hidden>
<div ref={faceRef} className="pet-face">
<div
className={`pet-body ${poseClass}`}
title={t('pet.title')}
onClick={() => clickRef.current()}
>
{CAT_FRAMES.map((map, index) => (
<div
key={index}
ref={(el) => {
frameRefs.current[index] = el;
              }}
className="pet-frame"
>
<CatSprite map={map} />
</div>
          ))}
</div>
</div>
{bubble && <span className="pet-bubble pixel text-[9px]">{bubble}</span>}
</div>
  );
}
