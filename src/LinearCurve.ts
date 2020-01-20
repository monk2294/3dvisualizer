import { Curve, Vector3 } from "three";

export class LinearCurve extends Curve<Vector3> {
    private len: number | null = null;

    constructor(private path: Vector3[]) {
        super();
    }

    getPoint(t: number, optionalTarget?: Vector3) {
        const result = optionalTarget || new Vector3();
        const point = (this.path.length - 1) * t;
        const p1 = Math.floor(point);
        const p2 = Math.ceil(point);
        const w = point - p1;
        const v1 = this.path[p1];
        const v2 = this.path[p2];
        result.copy(v1);
        if (p1 === p2) {
            return result;
        }
        result.lerp(v2, w);
        return result;
    }

    getLength() {
        if (!this.len) {
            this.len = 0;
            for (let i = 1; i < this.path.length; i++) {
                this.len += this.path[i].distanceTo(this.path[i - 1]);
            }
        }
        return this.len;
    }
}