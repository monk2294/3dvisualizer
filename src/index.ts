// import { Visualizer } from "./engine";

const container = document.getElementById('container');
// if (container) {
//     const visualizer = new Visualizer(container, 720, 1280);
// }

container.innerHTML = '<canvas id="cnv" width="320" height="240"></canvas>';
const canvas = document.getElementById('cnv') as HTMLCanvasElement;
const ctx = canvas.getContext('2d');

const points = [
    [100, 100],
    [60, 100],
    [30, 120]
];

function drawPoints() {
    ctx.moveTo(points[0][0], points[0][1]);
    for (let i = 1; i < points.length; i++) {
        ctx.lineTo(points[i][0], points[i][1]);
    }
    ctx.stroke();
}

function drawPlanes() {
    for (let i = 1; i < points.length; i++) {
        drawPlane(points[i - 1], points[i]);
    }
}

function drawMediumPlane() {
    const [a, b, c] = points;
    const v1 = subtract(b, a);
    const v2 = subtract(c, b);
    const angle = angleTo(v1, v2);
    drawPlane(b, add(b, rotate(v1, angle / 2)));
}

function drawPlane(a: number[], b: number[]) {
    const diff = subtract(b, a); // Vec2 subtract
    const p1 = [a[0] - diff[1], a[1] + diff[0]];
    const p2 = [a[0] + diff[1], a[1] - diff[0]];
    ctx.moveTo(p1[0], p1[1]);
    ctx.lineTo(p2[0], p2[1]);
    ctx.stroke();
}

function angleTo(a: number[], b: number[]) {
    const cosine = (a[0] * b[0] + a[1] * b[1]) / (len(a) * len(b));
    console.log(cosine);
    return Math.acos(cosine);
}

function len(v: number[]) {
    return Math.sqrt(v[0] * v[0] + v[1] * v[1]);
}

function subtract(a: number[], b: number[]) {
    return [a[0] - b[0], a[1] - b[1]];
}

function add(a: number[], b: number[]) {
    return [a[0] + b[0], a[1] + b[1]];
}

function rotate(v: number[], angle: number) {
    return [
        Math.cos(angle) * v[0] - Math.sin(angle) * v[1],
        Math.sin(angle) * v[0] + Math.cos(angle) * v[1],
    ];
}

drawPoints();
// drawPlanes();
drawMediumPlane();