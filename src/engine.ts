import { Scene, PerspectiveCamera, AmbientLight, WebGLRenderer, GridHelper, DirectionalLight, PointLight, Vector3 } from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { importModel } from './importer';
import rawModel from './model.txt';
import { TubesMesher } from './mesher';

export class Visualizer {
    private scene: Scene;
    private camera: PerspectiveCamera;
    private renderer: WebGLRenderer;

    constructor(domElement: HTMLElement, height: number, width: number) {
        this.update = this.update.bind(this);
        this.scene = new Scene();
        this.camera = new PerspectiveCamera(80, width / height, 0.1, 10000);
        this.camera.position.set(5000, 1000, 3000);
        this.camera.lookAt(5000, 1000, 0);
        this.renderer = new WebGLRenderer();
        this.renderer.setSize(width, height);
        domElement.appendChild(this.renderer.domElement);
        const animate = () => {
            requestAnimationFrame(animate);
            this.update();
            this.renderer.render(this.scene, this.camera);
        };
        this.init().then(animate);
    }

    init() {
        return new Promise(async resolve => {
            const res = await fetch(rawModel);
            const modelText = await res.text();
            // Initialization code goes here
            // Load model
            const model = importModel(modelText);
            const meshes = TubesMesher(model);
            meshes.forEach(mesh => this.scene.add(mesh));
            // Add lights
            const light = new PointLight(0xffffff, 2);
            light.position.set(5000, 1000, 0);
            this.scene.add(light);
            this.scene.add(new AmbientLight(0xffffff, 0.2));
            
            const controls = new OrbitControls(this.camera, this.renderer.domElement);
            controls.target = new Vector3(5000, 1000, 0);
            controls.minDistance = 100;
            controls.maxDistance = 10000;
            controls.update();
            resolve();
        });
    }

    update() {
        // Do something here
    }
}