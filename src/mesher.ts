import { Model } from "./importer";
import { CatmullRomCurve3, Mesh, TubeGeometry, Material, MeshLambertMaterial } from "three";
import { LinearCurve } from "./LinearCurve";

export function TubesMesher(model: Model) {
    const meshes: Mesh[] = [];
    const materials: { [color: number]: Material } = {};
    for (const { color, path } of model.tubes) {
        // const curve = new CatmullRomCurve3(path);
        const curve = new LinearCurve(path);
        const geom = new TubeGeometry(curve, Math.ceil(curve.getLength() / 50), 18, 6, false);
        if (!materials[color]) {
            materials[color] = new MeshLambertMaterial({ color, wireframe: false });
        }
        meshes.push(new Mesh(geom, materials[color]));
    }
    return meshes;
}
