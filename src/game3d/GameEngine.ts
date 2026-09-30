import * as THREE from 'three';
import { CharacterId, TimeOfDay, VehicleStats, WeatherType } from '../types/game';
import { soundManager } from '../audio/SoundManager';
import { DISTRICTS, DistrictData } from '../data/districtChatter';
import { CityBuilder, CollisionBox, InteractiveTrigger } from './CityBuilder';
import { CharacterModel } from './CharacterModel';
import { VehicleModel } from './VehicleModel';
import { TrafficSystem } from './TrafficSystem';
import { NPC, NPCSystem } from './NPCSystem';

export interface GameEngineCallbacks {
  onNearTrigger: (trigger: InteractiveTrigger | null) => void;
  onNearVehicle: (vehicle: VehicleModel | null) => void;
  onNearNPC: (npc: NPC | null) => void;
  onDistrictChange: (district: DistrictData) => void;
  onPedestrianChatter: (chatter: { speaker: string; text: string; districtName: string }) => void;
  onUpdateHUD: (data: {
    health: number;
    stamina: number;
    speed: number;
    playerPos: [number, number, number];
    playerHeading: number;
    isDriving: boolean;
    vehicleType?: string;
  }) => void;
  onMissionStepReached: (pos: [number, number, number]) => void;
}

export class GameEngine {
  public container: HTMLElement;
  public scene: THREE.Scene;
  public camera: THREE.PerspectiveCamera;
  public renderer: THREE.WebGLRenderer;
  private animationFrameId: number | null = null;
  private clock: THREE.Clock;

  // City & Systems
  public cityBuilder: CityBuilder;
  public trafficSystem: TrafficSystem;
  public npcSystem: NPCSystem;

  // Lighting & Environment
  private sunLight: THREE.DirectionalLight;
  private ambientLight: THREE.AmbientLight;
  private rainParticles: THREE.Points | null = null;

  // Characters
  public activeCharId: CharacterId = 'vraj';
  public characterModels: Map<CharacterId, CharacterModel> = new Map();
  public companions: Map<CharacterId, THREE.Group> = new Map();

  // Vehicles
  public worldVehicles: VehicleModel[] = [];
  public currentVehicle: VehicleModel | null = null;
  public isDriving: boolean = false;

  // Player Kinematics
  public playerPosition = new THREE.Vector3(-55, 0, -40); // Start at Friends' Home driveway
  public playerVelocity = new THREE.Vector3();
  public playerHeading = 0;
  public isGrounded = true;
  public health = 100;
  public stamina = 100;
  public isSprinting = false;

  // Vehicle Dynamics
  private vehicleSpeed = 0;
  private vehicleSteerAngle = 0;

  // Inputs
  public inputVector = { x: 0, z: 0 };
  public isJumpPressed = false;
  public isSprintPressed = false;
  private cameraAngle = 0; // Horizontal orbit
  private cameraPitch = 0.35; // Vertical pitch
  private cameraDistance = 6.5;

  // Callbacks
  private callbacks: GameEngineCallbacks;

  // Time & Weather
  private timeOfDay: TimeOfDay = 'morning';
  private weather: WeatherType = 'sunny';

  // Mission Objective Target
  public activeObjectivePos: THREE.Vector3 | null = null;
  private objectiveMarkerMesh: THREE.Mesh | null = null;

  // District Ambient & Pedestrian Chatter System
  public currentDistrict: DistrictData | null = null;
  private chatterCooldownTimer = 4.0; // Trigger initial atmospheric chatter soon after launch

  constructor(container: HTMLElement, callbacks: GameEngineCallbacks) {
    this.container = container;
    this.callbacks = callbacks;
    this.clock = new THREE.Clock();

    // Scene
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0x93c5fd);
    this.scene.fog = new THREE.FogExp2(0x93c5fd, 0.007);

    // Camera
    this.camera = new THREE.PerspectiveCamera(
      60,
      container.clientWidth / container.clientHeight,
      0.1,
      600
    );

    // Renderer
    this.renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: 'high-performance' });
    this.renderer.setSize(container.clientWidth, container.clientHeight);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    container.appendChild(this.renderer.domElement);

    // Sunlight
    this.sunLight = new THREE.DirectionalLight(0xfff7ed, 1.4);
    this.sunLight.position.set(60, 100, 40);
    this.sunLight.castShadow = true;
    this.sunLight.shadow.mapSize.width = 1024;
    this.sunLight.shadow.mapSize.height = 1024;
    this.sunLight.shadow.camera.near = 0.5;
    this.sunLight.shadow.camera.far = 280;
    this.sunLight.shadow.camera.left = -90;
    this.sunLight.shadow.camera.right = 90;
    this.sunLight.shadow.camera.top = 90;
    this.sunLight.shadow.camera.bottom = -90;
    this.scene.add(this.sunLight);

    // Ambient
    this.ambientLight = new THREE.AmbientLight(0xffedd5, 0.65);
    this.scene.add(this.ambientLight);

    // Systems
    this.cityBuilder = new CityBuilder(this.scene);
    this.cityBuilder.buildCity();

    this.trafficSystem = new TrafficSystem(this.scene);
    this.trafficSystem.initTraffic();

    this.npcSystem = new NPCSystem(this.scene);
    this.npcSystem.initNPCs();

    // Init Characters
    this.initCharacters();

    // Init World Vehicles
    this.spawnWorldVehicles();

    // Objective Marker
    this.setupObjectiveMarker();

    // Weather particles
    this.setupRainParticles();

    // Listeners
    window.addEventListener('resize', this.onResize);
    this.setupTouchAndMouseOrbit();

    // Start Loop
    this.animate();
  }

  private initCharacters() {
    (['hemang', 'vraj', 'jd'] as CharacterId[]).forEach((id) => {
      const model = new CharacterModel(id);
      this.characterModels.set(id, model);

      if (id === this.activeCharId) {
        model.group.position.copy(this.playerPosition);
        this.scene.add(model.group);
      } else {
        // Place other friends near the home veranda
        const offset = id === 'hemang' ? new THREE.Vector3(-58, 0, -42) : new THREE.Vector3(-52, 0, -42);
        model.group.position.copy(offset);
        this.scene.add(model.group);
        this.companions.set(id, model.group);
      }
    });
  }

  public switchCharacter(newCharId: CharacterId) {
    if (this.activeCharId === newCharId || this.isDriving) return;

    soundManager.playClick();

    const oldActiveModel = this.characterModels.get(this.activeCharId);
    const newActiveModel = this.characterModels.get(newCharId);

    if (oldActiveModel && newActiveModel) {
      const currentPos = this.playerPosition.clone();
      this.activeCharId = newCharId;

      // Position new character at active position
      newActiveModel.group.position.copy(currentPos);

      // Reposition old character to companion spot or current spot
      oldActiveModel.group.position.set(currentPos.x - 1.5, currentPos.y, currentPos.z - 1.5);
      this.companions.set(oldActiveModel.characterId, oldActiveModel.group);
    }
  }

  private spawnWorldVehicles() {
    // 1. Bicycle at Home Driveway
    const bike = new VehicleModel({
      id: 'world_bike',
      type: 'bicycle',
      name: 'Desi Classic Bicycle',
      unlocked: true,
      topSpeed: 14,
      acceleration: 8,
      handling: 9,
      health: 100,
      maxHealth: 100,
      color: '#0284c7',
      colorHex: 0x0284c7,
      upgradeEngine: 0,
      upgradeBrakes: 0,
      upgradeTires: 0,
      price: 0,
    });
    bike.group.position.set(-53, 0, -41);
    bike.group.rotation.y = Math.PI / 4;
    this.scene.add(bike.group);
    this.worldVehicles.push(bike);

    // 2. Scooter at Home Shed
    const scooter = new VehicleModel({
      id: 'world_scooter',
      type: 'scooter',
      name: 'Godhra Chetak 125',
      unlocked: true,
      topSpeed: 23,
      acceleration: 15,
      handling: 8.5,
      health: 100,
      maxHealth: 100,
      color: '#e11d48',
      colorHex: 0xe11d48,
      upgradeEngine: 0,
      upgradeBrakes: 0,
      upgradeTires: 0,
      price: 1200,
    });
    scooter.group.position.set(-39, 0, -45);
    scooter.group.rotation.y = -Math.PI / 2;
    this.scene.add(scooter.group);
    this.worldVehicles.push(scooter);

    // 3. Compact Hatchback Car on road edge
    const car = new VehicleModel({
      id: 'world_car',
      type: 'car',
      name: 'City Swift Hatchback',
      unlocked: true,
      topSpeed: 30,
      acceleration: 17,
      handling: 7.5,
      health: 100,
      maxHealth: 100,
      color: '#ea580c',
      colorHex: 0xea580c,
      upgradeEngine: 0,
      upgradeBrakes: 0,
      upgradeTires: 0,
      price: 5000,
    });
    car.group.position.set(-55, 0, -22);
    car.group.rotation.y = Math.PI;
    this.scene.add(car.group);
    this.worldVehicles.push(car);

    // 4. Motorcycle at JD Auto Garage
    const moto = new VehicleModel({
      id: 'world_moto',
      type: 'motorcycle',
      name: 'Thumper 350 Cruiser',
      unlocked: true,
      topSpeed: 32,
      acceleration: 20,
      handling: 8.0,
      health: 100,
      maxHealth: 100,
      color: '#0f172a',
      colorHex: 0x0f172a,
      upgradeEngine: 0,
      upgradeBrakes: 0,
      upgradeTires: 0,
      price: 2500,
    });
    moto.group.position.set(-56, 0, 42);
    this.scene.add(moto.group);
    this.worldVehicles.push(moto);

    // 5. Auto-rickshaw parked near Food Street
    const auto = new VehicleModel({
      id: 'world_auto',
      type: 'autorickshaw',
      name: 'Gujarati Rickshaw Express',
      unlocked: true,
      topSpeed: 21,
      acceleration: 13,
      handling: 9.0,
      health: 100,
      maxHealth: 100,
      color: '#eab308',
      colorHex: 0xeab308,
      upgradeEngine: 0,
      upgradeBrakes: 0,
      upgradeTires: 0,
      price: 3200,
    });
    auto.group.position.set(40, 0, 24);
    auto.group.rotation.y = Math.PI / 2;
    this.scene.add(auto.group);
    this.worldVehicles.push(auto);
  }

  private setupObjectiveMarker() {
    const markerGeo = new THREE.ConeGeometry(0.8, 2.2, 16);
    const markerMat = new THREE.MeshBasicMaterial({ color: 0xf59e0b, wireframe: false });
    this.objectiveMarkerMesh = new THREE.Mesh(markerGeo, markerMat);
    this.objectiveMarkerMesh.rotation.x = Math.PI; // Point down
    this.objectiveMarkerMesh.visible = false;
    this.scene.add(this.objectiveMarkerMesh);

    // Ground ring
    const ring = new THREE.Mesh(
      new THREE.RingGeometry(1.6, 2.0, 24),
      new THREE.MeshBasicMaterial({ color: 0xf59e0b, side: THREE.DoubleSide, transparent: true, opacity: 0.7 })
    );
    ring.rotation.x = -Math.PI / 2;
    ring.position.y = 0.1;
    this.objectiveMarkerMesh.add(ring);
  }

  public setObjectiveTarget(pos: [number, number, number] | null) {
    if (!pos) {
      this.activeObjectivePos = null;
      if (this.objectiveMarkerMesh) this.objectiveMarkerMesh.visible = false;
    } else {
      this.activeObjectivePos = new THREE.Vector3(pos[0], pos[1], pos[2]);
      if (this.objectiveMarkerMesh) {
        this.objectiveMarkerMesh.position.set(pos[0], pos[1] + 3.5, pos[2]);
        this.objectiveMarkerMesh.visible = true;
      }
    }
  }

  public enterVehicle(vehicle: VehicleModel) {
    if (this.isDriving) return;
    this.isDriving = true;
    this.currentVehicle = vehicle;
    this.vehicleSpeed = 0;

    soundManager.playDoorEnter();
    if (vehicle.type === 'bicycle') {
      soundManager.playBicycleBell();
    } else {
      soundManager.startEngineSound(vehicle.type);
    }

    const activeModel = this.characterModels.get(this.activeCharId);
    if (activeModel) {
      vehicle.group.add(activeModel.group);
      activeModel.group.position.copy(vehicle.driverSeatOffset);
      activeModel.group.rotation.set(0, 0, 0);
      activeModel.updateAnimation(0, 0, true, true);
    }
  }

  public exitVehicle() {
    if (!this.isDriving || !this.currentVehicle) return;

    soundManager.stopEngineSound();
    soundManager.playDoorEnter();

    const activeModel = this.characterModels.get(this.activeCharId);
    const vehiclePos = this.currentVehicle.group.position.clone();
    const vehicleRot = this.currentVehicle.group.rotation.y;

    if (activeModel) {
      this.scene.add(activeModel.group);
      // Place character to left side of vehicle
      const exitOffset = new THREE.Vector3(-1.8, 0, 0).applyAxisAngle(new THREE.Vector3(0, 1, 0), vehicleRot);
      this.playerPosition.copy(vehiclePos).add(exitOffset);
      this.playerPosition.y = 0;
      activeModel.group.position.copy(this.playerPosition);
      activeModel.updateAnimation(0, 0, true, false);
    }

    this.isDriving = false;
    this.currentVehicle = null;
    this.vehicleSpeed = 0;
  }

  public toggleHorn() {
    if (this.isDriving && this.currentVehicle) {
      if (this.currentVehicle.type === 'bicycle') {
        soundManager.playBicycleBell();
      } else {
        soundManager.playVehicleHorn(this.currentVehicle.type === 'scooter');
      }
    }
  }

  public toggleHeadlights() {
    if (this.isDriving && this.currentVehicle) {
      const spot = this.currentVehicle.headlightSpot;
      if (spot) {
        this.currentVehicle.setHeadlights(spot.intensity === 0);
      }
    }
  }

  public setTimeOfDay(time: TimeOfDay) {
    this.timeOfDay = time;
    switch (time) {
      case 'morning':
        this.scene.background = new THREE.Color(0xfde68a);
        this.scene.fog = new THREE.FogExp2(0xfde68a, 0.006);
        this.sunLight.color.setHex(0xffedd5);
        this.sunLight.intensity = 1.3;
        this.sunLight.position.set(70, 45, 50);
        this.ambientLight.color.setHex(0xfef3c7);
        this.ambientLight.intensity = 0.7;
        this.cityBuilder.setStreetLights(false);
        break;
      case 'afternoon':
        this.scene.background = new THREE.Color(0x7dd3fc);
        this.scene.fog = new THREE.FogExp2(0x7dd3fc, 0.005);
        this.sunLight.color.setHex(0xffffff);
        this.sunLight.intensity = 1.6;
        this.sunLight.position.set(20, 120, 20);
        this.ambientLight.color.setHex(0xe0f2fe);
        this.ambientLight.intensity = 0.8;
        this.cityBuilder.setStreetLights(false);
        break;
      case 'evening':
        this.scene.background = new THREE.Color(0xf97316);
        this.scene.fog = new THREE.FogExp2(0xf97316, 0.007);
        this.sunLight.color.setHex(0xfb923c);
        this.sunLight.intensity = 1.1;
        this.sunLight.position.set(-80, 30, -50);
        this.ambientLight.color.setHex(0xffedd5);
        this.ambientLight.intensity = 0.55;
        this.cityBuilder.setStreetLights(true);
        break;
      case 'night':
        this.scene.background = new THREE.Color(0x090d16);
        this.scene.fog = new THREE.FogExp2(0x090d16, 0.009);
        this.sunLight.color.setHex(0x38bdf8);
        this.sunLight.intensity = 0.25;
        this.sunLight.position.set(-40, 80, -40);
        this.ambientLight.color.setHex(0x1e293b);
        this.ambientLight.intensity = 0.35;
        this.cityBuilder.setStreetLights(true);
        break;
    }
  }

  public setWeather(weather: WeatherType) {
    this.weather = weather;
    if (weather === 'rain') {
      soundManager.startRainAmbience();
      if (this.rainParticles) this.rainParticles.visible = true;
    } else {
      soundManager.stopRainAmbience();
      if (this.rainParticles) this.rainParticles.visible = false;
    }
  }

  private setupRainParticles() {
    const count = 1200;
    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(count * 3);

    for (let i = 0; i < count; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 160;
      positions[i * 3 + 1] = Math.random() * 40;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 160;
    }

    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    const material = new THREE.PointsMaterial({
      color: 0x93c5fd,
      size: 0.15,
      transparent: true,
      opacity: 0.7,
    });

    this.rainParticles = new THREE.Points(geometry, material);
    this.rainParticles.visible = false;
    this.scene.add(this.rainParticles);
  }

  private updateRain(delta: number) {
    if (!this.rainParticles || !this.rainParticles.visible) return;
    const posAttr = this.rainParticles.geometry.attributes.position as THREE.BufferAttribute;
    const arr = posAttr.array as Float32Array;

    for (let i = 0; i < arr.length; i += 3) {
      arr[i + 1] -= delta * 38; // Fall speed
      if (arr[i + 1] < 0) {
        arr[i + 1] = 40;
        arr[i] = this.playerPosition.x + (Math.random() - 0.5) * 100;
        arr[i + 2] = this.playerPosition.z + (Math.random() - 0.5) * 100;
      }
    }
    posAttr.needsUpdate = true;
  }

  private setupTouchAndMouseOrbit() {
    let isMouseDown = false;
    let prevMouseX = 0;
    let prevMouseY = 0;

    const onPointerDown = (e: MouseEvent | TouchEvent) => {
      // Ignore if clicking on HUD controls
      if ((e.target as HTMLElement)?.closest('.game-hud-interactive')) return;
      isMouseDown = true;
      const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
      const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
      prevMouseX = clientX;
      prevMouseY = clientY;
    };

    const onPointerMove = (e: MouseEvent | TouchEvent) => {
      if (!isMouseDown) return;
      const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
      const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
      const dx = clientX - prevMouseX;
      const dy = clientY - prevMouseY;
      prevMouseX = clientX;
      prevMouseY = clientY;

      this.cameraAngle -= dx * 0.008;
      this.cameraPitch = Math.max(0.1, Math.min(1.1, this.cameraPitch + dy * 0.006));
    };

    const onPointerUp = () => {
      isMouseDown = false;
    };

    this.container.addEventListener('mousedown', onPointerDown);
    window.addEventListener('mousemove', onPointerMove);
    window.addEventListener('mouseup', onPointerUp);

    this.container.addEventListener('touchstart', onPointerDown, { passive: true });
    window.addEventListener('touchmove', onPointerMove, { passive: true });
    window.addEventListener('touchend', onPointerUp);
  }

  private updatePlayer(delta: number) {
    const activeModel = this.characterModels.get(this.activeCharId);
    if (!activeModel) return;

    // Stamina & Sprinting
    this.isSprinting = this.isSprintPressed && this.stamina > 10;
    if (this.isSprinting) {
      this.stamina = Math.max(0, this.stamina - delta * 20);
    } else {
      this.stamina = Math.min(100, this.stamina + delta * 12);
    }

    // Base speeds
    const baseWalkSpeed = 6.5;
    const speed = (this.isSprinting ? 11.5 : baseWalkSpeed) * (this.activeCharId === 'vraj' ? 1.08 : 1.0);

    // Camera relative movement
    const forward = new THREE.Vector3(-Math.sin(this.cameraAngle), 0, -Math.cos(this.cameraAngle)).normalize();
    const right = new THREE.Vector3(Math.cos(this.cameraAngle), 0, -Math.sin(this.cameraAngle)).normalize();

    const moveDir = new THREE.Vector3()
      .addScaledVector(forward, -this.inputVector.z)
      .addScaledVector(right, this.inputVector.x);

    const inputMagnitude = Math.min(1, Math.hypot(this.inputVector.x, this.inputVector.z));

    if (inputMagnitude > 0.05) {
      moveDir.normalize();
      this.playerHeading = Math.atan2(moveDir.x, moveDir.z);

      const targetX = this.playerPosition.x + moveDir.x * speed * inputMagnitude * delta;
      const targetZ = this.playerPosition.z + moveDir.z * speed * inputMagnitude * delta;

      // Collision test
      if (!this.checkCollision(targetX, this.playerPosition.z)) {
        this.playerPosition.x = Math.max(-120, Math.min(120, targetX));
      }
      if (!this.checkCollision(this.playerPosition.x, targetZ)) {
        this.playerPosition.z = Math.max(-120, Math.min(120, targetZ));
      }

      // Footstep sound on interval
      if (Math.random() < delta * 4) {
        soundManager.playFootstep();
      }
    }

    // Jump / Gravity
    if (this.isJumpPressed && this.isGrounded && this.stamina >= 10) {
      this.playerVelocity.y = 7.5;
      this.isGrounded = false;
      this.stamina -= 8;
    }

    if (!this.isGrounded) {
      this.playerVelocity.y -= 22 * delta; // Gravity
      this.playerPosition.y += this.playerVelocity.y * delta;

      if (this.playerPosition.y <= 0) {
        this.playerPosition.y = 0;
        this.playerVelocity.y = 0;
        this.isGrounded = true;
      }
    }

    activeModel.group.position.copy(this.playerPosition);
    activeModel.group.rotation.y = this.playerHeading;
    activeModel.updateAnimation(delta, inputMagnitude * (this.isSprinting ? 2 : 1), this.isGrounded, false);
  }

  private updateDriving(delta: number) {
    if (!this.currentVehicle) return;

    const stats = this.currentVehicle.stats;
    const isVrajBonus = this.activeCharId === 'vraj';

    const maxSpeed = (stats.topSpeed + (isVrajBonus ? 4 : 0)) * (1 + stats.upgradeEngine * 0.15);
    const accel = (stats.acceleration + (isVrajBonus ? 3 : 0)) * (1 + stats.upgradeEngine * 0.15);
    const steerAgility = (stats.handling + (isVrajBonus ? 1.5 : 0)) * 0.35;

    // Accelerate / Brake input
    if (this.inputVector.z < -0.1) {
      // Forward
      this.vehicleSpeed = Math.min(maxSpeed, this.vehicleSpeed + accel * delta * Math.abs(this.inputVector.z));
    } else if (this.inputVector.z > 0.1) {
      // Reverse / Brake
      if (this.vehicleSpeed > 1) {
        this.vehicleSpeed = Math.max(0, this.vehicleSpeed - accel * 1.8 * delta);
      } else {
        this.vehicleSpeed = Math.max(-maxSpeed * 0.4, this.vehicleSpeed - accel * 0.8 * delta);
      }
    } else {
      // Friction slowdown
      this.vehicleSpeed = THREE.MathUtils.lerp(this.vehicleSpeed, 0, delta * 1.5);
    }

    // Steering input
    const targetSteer = -this.inputVector.x * 0.55;
    this.vehicleSteerAngle = THREE.MathUtils.lerp(this.vehicleSteerAngle, targetSteer, delta * 8);

    // Apply turning when moving
    if (Math.abs(this.vehicleSpeed) > 0.1) {
      const turnSign = this.vehicleSpeed > 0 ? 1 : -1;
      this.currentVehicle.group.rotation.y += this.vehicleSteerAngle * steerAgility * (this.vehicleSpeed / maxSpeed) * delta * turnSign;
    }

    // Move forward along vehicle forward vector
    const heading = this.currentVehicle.group.rotation.y;
    const forward = new THREE.Vector3(Math.sin(heading), 0, Math.cos(heading));
    const nextPos = this.currentVehicle.group.position.clone().addScaledVector(forward, this.vehicleSpeed * delta);

    // Collisions for vehicle
    if (!this.checkCollision(nextPos.x, this.currentVehicle.group.position.z, 2.0)) {
      this.currentVehicle.group.position.x = Math.max(-125, Math.min(125, nextPos.x));
    } else {
      this.vehicleSpeed *= -0.2; // Bounce
    }

    if (!this.checkCollision(this.currentVehicle.group.position.x, nextPos.z, 2.0)) {
      this.currentVehicle.group.position.z = Math.max(-125, Math.min(125, nextPos.z));
    } else {
      this.vehicleSpeed *= -0.2;
    }

    this.playerPosition.copy(this.currentVehicle.group.position);
    this.playerHeading = heading;

    // Update wheels and audio
    this.currentVehicle.updateWheels(this.vehicleSpeed, this.vehicleSteerAngle);
    soundManager.updateEnginePitch(Math.abs(this.vehicleSpeed) / maxSpeed, this.currentVehicle.type);
  }

  private checkCollision(x: number, z: number, padding = 0.8): boolean {
    for (const box of this.cityBuilder.collisionBoxes) {
      if (
        x >= box.min.x - padding &&
        x <= box.max.x + padding &&
        z >= box.min.z - padding &&
        z <= box.max.z + padding
      ) {
        return true;
      }
    }
    return false;
  }

  private checkProximities(delta: number) {
    // 1. Interactive triggers
    let nearestTrigger: InteractiveTrigger | null = null;
    let minDist = 999;
    for (const tr of this.cityBuilder.interactiveTriggers) {
      const d = this.playerPosition.distanceTo(tr.position);
      if (d < tr.radius && d < minDist) {
        nearestTrigger = tr;
        minDist = d;
      }
    }
    this.callbacks.onNearTrigger(nearestTrigger);

    // 2. Driveable vehicles
    let nearestVehicle: VehicleModel | null = null;
    if (!this.isDriving) {
      let minVehDist = 4.5;
      for (const veh of this.worldVehicles) {
        const d = this.playerPosition.distanceTo(veh.group.position);
        if (d < minVehDist) {
          nearestVehicle = veh;
          minVehDist = d;
        }
      }
    }
    this.callbacks.onNearVehicle(nearestVehicle);

    // 3. NPCs
    let nearestNPC: NPC | null = null;
    let minNPCDist = 4.0;
    for (const npc of this.npcSystem.npcs) {
      const d = this.playerPosition.distanceTo(npc.mesh.position);
      if (d < minNPCDist) {
        nearestNPC = npc;
        minNPCDist = d;
      }
    }
    this.callbacks.onNearNPC(nearestNPC);

    // 4. Mission Objective Target
    if (this.activeObjectivePos) {
      const d = this.playerPosition.distanceTo(this.activeObjectivePos);
      if (d < 5.0) {
        this.callbacks.onMissionStepReached([this.activeObjectivePos.x, this.activeObjectivePos.y, this.activeObjectivePos.z]);
      }
    }

    // 5. District Ambience & Pedestrian Chatter System
    this.updateDistrictAmbientAndChatter(delta);
  }

  private updateDistrictAmbientAndChatter(delta: number) {
    const px = this.playerPosition.x;
    const pz = this.playerPosition.z;

    // Find nearest district
    let nearestDistrict: DistrictData = DISTRICTS[0];
    let minDist = 9999;

    for (const d of DISTRICTS) {
      const dist = Math.hypot(px - d.center[0], pz - d.center[1]);
      if (dist < minDist) {
        minDist = dist;
        nearestDistrict = d;
      }
    }

    // If district changed, cross-fade ambient soundscape
    if (!this.currentDistrict || this.currentDistrict.id !== nearestDistrict.id) {
      this.currentDistrict = nearestDistrict;
      soundManager.setDistrictAmbience(nearestDistrict.soundType);
      this.callbacks.onDistrictChange(nearestDistrict);
    }

    // Periodic local pedestrian chatter based on district
    this.chatterCooldownTimer -= delta;
    if (this.chatterCooldownTimer <= 0) {
      // Pick random line from current district
      const lines = nearestDistrict.chatterLines;
      const line = lines[Math.floor(Math.random() * lines.length)];

      // Synthesize audio chatter
      soundManager.speakPedestrianChatter(line);

      // Notify callback to display in HUD
      this.callbacks.onPedestrianChatter({
        speaker: nearestDistrict.name,
        text: line,
        districtName: nearestDistrict.name,
      });

      // Reset timer (interval between 9 and 16 seconds)
      this.chatterCooldownTimer = 9.0 + Math.random() * 7.0;
    }
  }

  private updateCamera() {
    const target = this.playerPosition.clone().add(new THREE.Vector3(0, 1.4, 0));
    const dist = this.isDriving ? this.cameraDistance * 1.5 : this.cameraDistance;

    const camX = target.x + dist * Math.sin(this.cameraAngle) * Math.cos(this.cameraPitch);
    const camY = target.y + dist * Math.sin(this.cameraPitch);
    const camZ = target.z + dist * Math.cos(this.cameraAngle) * Math.cos(this.cameraPitch);

    this.camera.position.set(camX, camY, camZ);
    this.camera.lookAt(target);
  }

  private onResize = () => {
    if (!this.container) return;
    const w = this.container.clientWidth;
    const h = this.container.clientHeight;
    this.camera.aspect = w / h;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(w, h);
  };

  private animate = () => {
    this.animationFrameId = requestAnimationFrame(this.animate);
    const delta = Math.min(0.1, this.clock.getDelta());

    // Update Systems
    this.trafficSystem.update(delta);
    this.npcSystem.update(delta);
    this.updateRain(delta);

    // Update Player / Vehicle
    if (this.isDriving) {
      this.updateDriving(delta);
    } else {
      this.updatePlayer(delta);
    }

    // Objective Marker Bobbing
    if (this.objectiveMarkerMesh && this.objectiveMarkerMesh.visible) {
      this.objectiveMarkerMesh.position.y = 3.2 + Math.sin(this.clock.getElapsedTime() * 3) * 0.4;
      this.objectiveMarkerMesh.rotation.y += delta * 2;
    }

    this.checkProximities(delta);
    this.updateCamera();

    // Callbacks to HUD
    this.callbacks.onUpdateHUD({
      health: this.health,
      stamina: this.stamina,
      speed: Math.round(Math.abs(this.isDriving ? this.vehicleSpeed * 2.5 : Math.hypot(this.inputVector.x, this.inputVector.z) * (this.isSprinting ? 18 : 10))),
      playerPos: [this.playerPosition.x, this.playerPosition.y, this.playerPosition.z],
      playerHeading: this.playerHeading,
      isDriving: this.isDriving,
      vehicleType: this.currentVehicle?.type,
    });

    this.renderer.render(this.scene, this.camera);
  };

  public destroy() {
    if (this.animationFrameId !== null) {
      cancelAnimationFrame(this.animationFrameId);
    }
    soundManager.stopEngineSound();
    soundManager.stopRainAmbience();
    window.removeEventListener('resize', this.onResize);
    this.renderer.dispose();
    if (this.renderer.domElement.parentElement) {
      this.renderer.domElement.parentElement.removeChild(this.renderer.domElement);
    }
  }
}
