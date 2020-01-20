import { Vector3 } from 'three';

interface Tube {
    color: number;
    path: Vector3[];
}

interface TubeRaw {
    color: number;
    path: number[]; // Index of point in point dictionary
}

export interface Model {
    tubes: Tube[];
    controlPoints: Vector3[];
}

const colors = [
    0xf6ff2d, // yellow
    0x00ff18, // green
    0x735802, // brown
    0xe91b1b, // red
    0x1916e5, // blue
    0xf59e05, // orange
    0x7005f5, // violet
    0xe616d6, // pink
];
function getColor(index: number) {
    return colors[index % colors.length];
}

export function importModel(raw: string, scaleFactor = 0.1): Model {
    const result: Model = {
        tubes: [],
        controlPoints: [],
    };
    // First of all, split model into lines
    const lines = raw.split("\n").filter(i => i);
    const blocks: number[][] = [];
    let startBlock: number = 0;
    for (let i = 0; i < lines.length; i++) {
        if (lines[i].startsWith("*")) {
            startBlock = i;
        } else if (lines[i].indexOf("$$$") !== -1) {
            blocks.push([startBlock, i - 1]);
        }
    }
    blocks.push([startBlock, lines.length - 1]);
    const points: { [k: number]: Vector3 } = {};
    const lineSector: { [k: number]: number } = {};
    const lineSegments: number[][] = [];
    const tubes: TubeRaw[] = [];
    for (const [a, b] of blocks) {
        const blockName = lines[a];
        switch (blockName.trim()) {
            case "*NODE": {
                for (let i = a + 1; i <= b; i++) {
                    const [id, x, y, z] = parseNode(lines[i]);
                    points[id] = new Vector3(
                        (x - 15336999) * scaleFactor,
                        (y - 118782) * scaleFactor,
                        (z - 18549217) * scaleFactor

                    );
                }
                break;
            }
            case "*SET_NODE_LIST_TITLE": {
                break;
            }
            case "*ELEMENT": {
                for (let i = a + 1; i <= b; i++) {
                    const [lineId, sectorId, a, b] = parseElement(lines[i]);
                    let isNew = true;
                    for (const { path: segment } of tubes) {
                        if (segment[0] === a) {
                            if (segment.indexOf(b) === -1) {
                                segment.splice(0, 0, b);
                                isNew = false;
                                break;
                            }
                        } else if (segment[segment.length - 1] === a) {
                            if (segment.indexOf(b) === -1) {
                                segment.push(b);
                                isNew = false;
                                break;
                            }
                        } else if (segment[0] === b) {
                            if (segment.indexOf(a) === -1) {
                                segment.splice(0, 0, a);
                                isNew = false;
                                break;
                            }
                        } else if (segment[segment.length - 1] === b) {
                            if (segment.indexOf(a) === -1) {
                                segment.push(a);
                                isNew = false;
                                break;
                            }
                        }
                    }
                    if (isNew) {
                        tubes.push({
                            color: getColor(sectorId),
                            path: [a, b]
                        });
                    }
                }
                break;
            }
            default:
        }
    }
    const alpha = Math.PI / 2;
    for (const { color, path } of tubes) {
        const joints = path.map(point => points[point]);
        for (let i = 2; i < joints.length; i += 1) {
            const a = joints[i - 1].clone().sub(joints[i - 2]);
            const b = joints[i].clone().sub(joints[i - 1]);
            if (a.length() === 0 || b.length() === 0) {
                continue;
            }
            if (a.angleTo(b) < alpha) {
                const point1 = a.negate().normalize().multiplyScalar(5).add(joints[i - 1]);
                const point2 = b.normalize().multiplyScalar(5).add(joints[i - 1]);
                joints[i - 1].copy(point1);
                joints.splice(i, 0, point2);
                i += 2;
            }
        }
        result.tubes.push({
            color,
            path: joints
        });
    }
    return result;
    // return lineSegments.map(pointIds => {
    //     const geom = new Geometry();
    //     for (const pointId of pointIds) {
    //         geom.vertices.push(points[pointId]);
    //     }
    //     return geom;
    // });
}

function parseNode(line: string) {
    const result: number[] = [];
    result.push(parseInt(line.substr(0, 8), 10));
    result.push(parseFloat(line.substr(8, 16)));
    result.push(parseFloat(line.substr(24, 16)));
    result.push(parseFloat(line.substr(40, 16)));
    return result;
}

function parseElement(line: string) {
    const result: number[] = [];
    result.push(parseInt(line.substr(0, 8), 10));
    result.push(parseInt(line.substr(8, 8), 10));
    result.push(parseInt(line.substr(16, 8), 10));
    result.push(parseInt(line.substr(24, 8), 10));
    return result;
}

function angleBetweenJoints(v1: Vector3, v2: Vector3, v3: Vector3) {
    const base = v2.sub(v1);
    return base.angleTo(v3.sub(v2));
}
