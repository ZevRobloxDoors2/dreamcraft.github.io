import * as THREE from 'three';
import { PointerLockControls } from 'three/examples/jsm/controls/PointerLockControls.js';
import { World } from './world';
import { Player } from './player';

export class Game {
    canvas: HTMLCanvasElement;
    scene!: THREE.Scene;
    camera!: THREE.PerspectiveCamera;
    renderer!: THREE.WebGLRenderer;
    clock!: THREE.Clock;
    raycaster!: THREE.Raycaster;
    centerCoords: THREE.Vector2;
    world!: World;
    player!: Player;
    handGroup!: THREE.Group;
    gameState: 'menu' | 'playing' | 'paused' = 'menu';
    selectedSlot: number;
    inventory: string[];
    isSwinging: boolean;
    swingProgress: number;
    animationFrameId: number | null = null;
    onInventoryChange?: (inv: string[]) => void;
    onStateChange?: (state: 'menu' | 'playing' | 'paused') => void;
    onHealthChange?: (h: number) => void;

    constructor(canvas: HTMLCanvasElement) {
        this.canvas = canvas;
        this.centerCoords = new THREE.Vector2(0, 0);
        this.selectedSlot = 0;
        this.inventory = ['dirt', 'stone', 'wood'];
        this.isSwinging = false;
        this.swingProgress = 0;
    }

    init(onHealthChange?: (h: number) => void) {
        if (onHealthChange) this.onHealthChange = onHealthChange;

        this.scene = new THREE.Scene();
        this.scene.background = new THREE.Color(0xFF7E47);
        this.scene.fog = new THREE.FogExp2(0xFF7E47, 0.015);

        this.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
        this.renderer = new THREE.WebGLRenderer({ canvas: this.canvas, antialias: true });
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

        const ambientLight = new THREE.AmbientLight(0xffbfa5, 0.6);
        this.scene.add(ambientLight);
        const directionalLight = new THREE.DirectionalLight(0xff8c00, 1.0);
        directionalLight.position.set(20, 10, -20);
        this.scene.add(directionalLight);

        const controls = new PointerLockControls(this.camera, document.body);
        this.world = new World(this.scene);
        this.world.generate();
        this.player = new Player(controls, this.camera, this.world, (h) => {
            if (this.onHealthChange) this.onHealthChange(h);
        });

        this.handGroup = new THREE.Group();
        this.handGroup.position.set(0.6, -0.5, -0.8);
        this.camera.add(this.handGroup);
        this.scene.add(this.camera);

        const handMesh = new THREE.Mesh(
            new THREE.BoxGeometry(0.4, 0.4, 0.4),
            this.world.materials.dirt
        );
        this.handGroup.add(handMesh);

        this.raycaster = new THREE.Raycaster();
        this.clock = new THREE.Clock();

        window.addEventListener('resize', this.onWindowResize);
        
        window.addEventListener('mousedown', (event) => {
            if (this.gameState !== 'playing') return;

            this.isSwinging = true;
            this.swingProgress = 0;

            this.raycaster.setFromCamera(this.centerCoords, this.camera);
            const intersects = this.raycaster.intersectObjects(this.world.blocks);

            if (intersects.length > 0 && intersects[0].distance <= 5.0) {
                const intersect = intersects[0];
                if (event.button === 0) {
                    const dropped = this.world.breakBlock(intersect.object as THREE.Mesh);
                    this.inventory.push(dropped);
                    if (this.onInventoryChange) this.onInventoryChange([...this.inventory]);
                } else if (event.button === 2) {
                    if (intersect.face) {
                        const pos = intersect.object.position.clone().add(intersect.face.normal);
                        const blockTypeToPlace = this.inventory[this.selectedSlot] || 'dirt';
                        this.world.placeBlock(pos.x, pos.y, pos.z, blockTypeToPlace);
                    }
                }
            }
        });

        window.addEventListener('contextmenu', (e) => {
            if (this.gameState === 'playing') e.preventDefault();
        });

        this.clock.start();
        this.animate();
    }

    onWindowResize = () => {
        if (!this.camera || !this.renderer) return;
        this.camera.aspect = window.innerWidth / window.innerHeight;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(window.innerWidth, window.innerHeight);
    };

    startGame() {
        this.gameState = 'playing';
        if (this.onStateChange) this.onStateChange('playing');
        this.camera.position.set(0, 15, 0);
        this.player.controls.lock();
        this.scene.background = new THREE.Color(0x87CEEB);
        this.scene.fog = new THREE.FogExp2(0x87CEEB, 0.02);
    }

    pauseGame() {
        this.gameState = 'paused';
        if (this.onStateChange) this.onStateChange('paused');
    }

    animate = () => {
        this.animationFrameId = requestAnimationFrame(this.animate);
        const delta = this.clock.getDelta();
        const time = Date.now() * 0.002;

        if (this.gameState === 'menu') {
            this.camera.position.x = Math.sin(time * 0.1) * 30;
            this.camera.position.z = Math.cos(time * 0.1) * 30;
            this.camera.position.y = 15;
            this.camera.lookAt(0, 5, 0);
        } else if (this.gameState === 'playing') {
            this.player.update(delta);

            if (this.isSwinging) {
                this.swingProgress += delta * 15;
                this.handGroup.rotation.x = Math.sin(this.swingProgress) * -1.0;
                if (this.swingProgress > Math.PI) {
                    this.isSwinging = false;
                    this.handGroup.rotation.x = 0;
                }
            } else {
                this.handGroup.position.y = -0.5 + Math.sin(time) * 0.05;
            }

            for (let i = this.world.particles.length - 1; i >= 0; i--) {
                const p = this.world.particles[i];
                p.userData.velocity.y -= 15.0 * delta;
                p.position.addScaledVector(p.userData.velocity, delta);
                p.scale.subScalar(delta * 0.5);
                if (p.scale.x <= 0) {
                    this.scene.remove(p);
                    this.world.particles.splice(i, 1);
                }
            }

            for (let i = this.world.droppedItems.length - 1; i >= 0; i--) {
                const item = this.world.droppedItems[i];
                item.rotation.y += delta * 2;
                item.position.y = item.userData.startY + Math.sin(time * 2) * 0.2;

                if (this.camera.position.distanceTo(item.position) < 2.0) {
                    this.inventory.push(item.userData.type);
                    if (this.onInventoryChange) this.onInventoryChange([...this.inventory]);
                    this.scene.remove(item);
                    this.world.droppedItems.splice(i, 1);
                }
            }
        }

        if (this.renderer && this.scene && this.camera) {
            this.renderer.render(this.scene, this.camera);
        }
    };

    destroy() {
        if (this.animationFrameId) cancelAnimationFrame(this.animationFrameId);
        window.removeEventListener('resize', this.onWindowResize);
        if (this.renderer) this.renderer.dispose();
    }
}
