import * as THREE from 'three';
import { VehicleStats, VehicleType } from '../types/game';

export class VehicleModel {
  public group: THREE.Group;
  public stats: VehicleStats;
  public type: VehicleType;

  // Wheel meshes for rotation animation
  public wheels: THREE.Mesh[] = [];
  public steerWheels: THREE.Group[] = [];

  // Headlight spot
  public headlightSpot: THREE.SpotLight | null = null;
  public driverSeatOffset: THREE.Vector3;

  // Material references for paint upgrades
  private bodyMaterial: THREE.MeshStandardMaterial;

  constructor(stats: VehicleStats) {
    this.stats = stats;
    this.type = stats.type;
    this.group = new THREE.Group();

    this.bodyMaterial = new THREE.MeshStandardMaterial({
      color: stats.colorHex,
      metalness: this.type === 'bicycle' ? 0.3 : 0.6,
      roughness: 0.35,
    });

    this.driverSeatOffset = new THREE.Vector3(0, 0.8, 0);

    this.buildVehicle();
    this.setupHeadlights();
  }

  public updatePaintColor(colorHex: number) {
    this.bodyMaterial.color.setHex(colorHex);
  }

  private buildVehicle() {
    switch (this.type) {
      case 'bicycle':
        this.buildBicycle();
        break;
      case 'scooter':
        this.buildScooter();
        break;
      case 'motorcycle':
        this.buildMotorcycle();
        break;
      case 'car':
        this.buildCar();
        break;
      case 'autorickshaw':
        this.buildAutorickshaw();
        break;
    }
  }

  private buildBicycle() {
    this.driverSeatOffset.set(0, 0.9, -0.1);

    const metalMat = new THREE.MeshStandardMaterial({ color: 0x94a3b8, metalness: 0.8 });
    const rubberMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.9 });
    const seatMat = new THREE.MeshStandardMaterial({ color: 0x451a03, roughness: 0.6 });

    // Wheels (Front & Rear)
    const wheelGeo = new THREE.TorusGeometry(0.55, 0.06, 8, 20);

    const rearWheel = new THREE.Mesh(wheelGeo, rubberMat);
    rearWheel.position.set(0, 0.55, -0.9);
    rearWheel.castShadow = true;
    this.group.add(rearWheel);
    this.wheels.push(rearWheel);

    const frontForkGroup = new THREE.Group();
    frontForkGroup.position.set(0, 0.55, 0.9);
    this.group.add(frontForkGroup);
    this.steerWheels.push(frontForkGroup);

    const frontWheel = new THREE.Mesh(wheelGeo, rubberMat);
    frontWheel.castShadow = true;
    frontForkGroup.add(frontWheel);
    this.wheels.push(frontWheel);

    // Frame tubing
    const frameBar1 = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.04, 1.8), this.bodyMaterial);
    frameBar1.rotation.x = Math.PI / 2;
    frameBar1.position.set(0, 0.9, 0);
    this.group.add(frameBar1);

    const frameBarDown = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.04, 1.6), this.bodyMaterial);
    frameBarDown.rotation.x = Math.PI / 3.5;
    frameBarDown.position.set(0, 0.7, 0.3);
    this.group.add(frameBarDown);

    // Seat / Saddle
    const seat = new THREE.Mesh(new THREE.BoxGeometry(0.3, 0.08, 0.4), seatMat);
    seat.position.set(0, 1.05, -0.2);
    this.group.add(seat);

    // Handlebars
    const bar = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.03, 0.7), metalMat);
    bar.rotation.z = Math.PI / 2;
    bar.position.set(0, 1.25, 0.85);
    frontForkGroup.add(bar);

    // Bell
    const bell = new THREE.Mesh(new THREE.SphereGeometry(0.06, 8, 8), new THREE.MeshStandardMaterial({ color: 0xf59e0b, metalness: 0.9 }));
    bell.position.set(0.2, 1.28, 0.85);
    frontForkGroup.add(bell);
  }

  private buildScooter() {
    this.driverSeatOffset.set(0, 0.85, -0.15);

    const rubberMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.9 });
    const seatMat = new THREE.MeshStandardMaterial({ color: 0x18181b, roughness: 0.7 });
    const chromeMat = new THREE.MeshStandardMaterial({ color: 0xe2e8f0, metalness: 0.85 });

    // Main Scooter Body Shell
    const body = new THREE.Mesh(new THREE.BoxGeometry(0.7, 0.6, 1.4), this.bodyMaterial);
    body.position.set(0, 0.6, -0.2);
    body.castShadow = true;
    this.group.add(body);

    // Footboard floor
    const floor = new THREE.Mesh(new THREE.BoxGeometry(0.65, 0.1, 0.8), this.bodyMaterial);
    floor.position.set(0, 0.35, 0.4);
    this.group.add(floor);

    // Front Apron Shield
    const apron = new THREE.Mesh(new THREE.BoxGeometry(0.65, 0.9, 0.15), this.bodyMaterial);
    apron.position.set(0, 0.85, 0.8);
    apron.rotation.x = -0.15;
    this.group.add(apron);

    // Long Two-Person Seat
    const seat = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.2, 1.1), seatMat);
    seat.position.set(0, 0.95, -0.2);
    this.group.add(seat);

    // Front Steer Assembly
    const frontGroup = new THREE.Group();
    frontGroup.position.set(0, 0.35, 0.95);
    this.group.add(frontGroup);
    this.steerWheels.push(frontGroup);

    // Small Front Wheel
    const frontWheel = new THREE.Mesh(new THREE.CylinderGeometry(0.35, 0.35, 0.18, 16), rubberMat);
    frontWheel.rotation.z = Math.PI / 2;
    frontWheel.castShadow = true;
    frontGroup.add(frontWheel);
    this.wheels.push(frontWheel);

    // Handlebars with Headlight
    const handleBar = new THREE.Mesh(new THREE.BoxGeometry(0.85, 0.12, 0.18), this.bodyMaterial);
    handleBar.position.set(0, 1.0, 0);
    frontGroup.add(handleBar);

    // Round Headlight
    const headlight = new THREE.Mesh(new THREE.SphereGeometry(0.12, 12, 12), new THREE.MeshBasicMaterial({ color: 0xffffff }));
    headlight.position.set(0, 1.0, 0.1);
    frontGroup.add(headlight);

    // Rear Wheel
    const rearWheel = new THREE.Mesh(new THREE.CylinderGeometry(0.35, 0.35, 0.18, 16), rubberMat);
    rearWheel.rotation.z = Math.PI / 2;
    rearWheel.position.set(0, 0.35, -0.75);
    rearWheel.castShadow = true;
    this.group.add(rearWheel);
    this.wheels.push(rearWheel);

    // Chrome mirrors
    [-0.35, 0.35].forEach((mx) => {
      const mirror = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.06, 0.02, 12), chromeMat);
      mirror.position.set(mx, 1.18, 0.05);
      frontGroup.add(mirror);
    });
  }

  private buildMotorcycle() {
    this.driverSeatOffset.set(0, 0.9, -0.2);

    const rubberMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.9 });
    const engineMat = new THREE.MeshStandardMaterial({ color: 0x475569, metalness: 0.8 });
    const chromeMat = new THREE.MeshStandardMaterial({ color: 0xe2e8f0, metalness: 0.9 });
    const seatMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.6 });

    // Chassis frame
    const frame = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.4, 1.6), new THREE.MeshStandardMaterial({ color: 0x0f172a }));
    frame.position.set(0, 0.7, 0);
    this.group.add(frame);

    // Teardrop Fuel Tank
    const tank = new THREE.Mesh(new THREE.BoxGeometry(0.6, 0.45, 0.8), this.bodyMaterial);
    tank.position.set(0, 1.0, 0.25);
    tank.castShadow = true;
    this.group.add(tank);

    // Engine Block
    const engine = new THREE.Mesh(new THREE.BoxGeometry(0.48, 0.5, 0.6), engineMat);
    engine.position.set(0, 0.55, 0.1);
    this.group.add(engine);

    // Chrome Exhaust Pipe
    const exhaust = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.06, 1.6, 12), chromeMat);
    exhaust.rotation.x = Math.PI / 2;
    exhaust.position.set(0.3, 0.4, -0.4);
    this.group.add(exhaust);

    // Seat
    const seat = new THREE.Mesh(new THREE.BoxGeometry(0.45, 0.15, 0.9), seatMat);
    seat.position.set(0, 0.95, -0.4);
    this.group.add(seat);

    // Rear Wheel
    const rearWheel = new THREE.Mesh(new THREE.CylinderGeometry(0.48, 0.48, 0.2, 18), rubberMat);
    rearWheel.rotation.z = Math.PI / 2;
    rearWheel.position.set(0, 0.48, -0.9);
    rearWheel.castShadow = true;
    this.group.add(rearWheel);
    this.wheels.push(rearWheel);

    // Front Steering Fork & Wheel
    const frontFork = new THREE.Group();
    frontFork.position.set(0, 0.48, 0.95);
    this.group.add(frontFork);
    this.steerWheels.push(frontFork);

    const frontWheel = new THREE.Mesh(new THREE.CylinderGeometry(0.48, 0.48, 0.18, 18), rubberMat);
    frontWheel.rotation.z = Math.PI / 2;
    frontWheel.castShadow = true;
    frontFork.add(frontWheel);
    this.wheels.push(frontWheel);

    // Handlebars
    const bar = new THREE.Mesh(new THREE.CylinderGeometry(0.035, 0.035, 0.9), chromeMat);
    bar.rotation.z = Math.PI / 2;
    bar.position.set(0, 0.75, 0);
    frontFork.add(bar);

    // Round Chrome Headlight
    const headlight = new THREE.Mesh(new THREE.SphereGeometry(0.14, 12, 12), new THREE.MeshBasicMaterial({ color: 0xffffff }));
    headlight.position.set(0, 0.65, 0.2);
    frontFork.add(headlight);
  }

  private buildCar() {
    this.driverSeatOffset.set(-0.4, 0.7, 0.1);

    const rubberMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.9 });
    const glassMat = new THREE.MeshStandardMaterial({ color: 0x38bdf8, roughness: 0.1, transparent: true, opacity: 0.6 });
    const rimMat = new THREE.MeshStandardMaterial({ color: 0xd1d5db, metalness: 0.8 });

    // Lower Car Body
    const lowerBody = new THREE.Mesh(new THREE.BoxGeometry(1.9, 0.7, 3.8), this.bodyMaterial);
    lowerBody.position.set(0, 0.65, 0);
    lowerBody.castShadow = true;
    this.group.add(lowerBody);

    // Upper Cabin
    const cabin = new THREE.Mesh(new THREE.BoxGeometry(1.7, 0.65, 2.1), this.bodyMaterial);
    cabin.position.set(0, 1.25, -0.15);
    cabin.castShadow = true;
    this.group.add(cabin);

    // Windshield
    const windshield = new THREE.Mesh(new THREE.BoxGeometry(1.6, 0.55, 0.8), glassMat);
    windshield.position.set(0, 1.25, 0.55);
    windshield.rotation.x = -0.3;
    this.group.add(windshield);

    // Rear window
    const rearWindow = new THREE.Mesh(new THREE.BoxGeometry(1.6, 0.55, 0.6), glassMat);
    rearWindow.position.set(0, 1.25, -0.9);
    rearWindow.rotation.x = 0.3;
    this.group.add(rearWindow);

    // Headlights
    const lightMat = new THREE.MeshBasicMaterial({ color: 0xffffff });
    [-0.65, 0.65].forEach((lx) => {
      const hl = new THREE.Mesh(new THREE.BoxGeometry(0.35, 0.18, 0.08), lightMat);
      hl.position.set(lx, 0.75, 1.91);
      this.group.add(hl);
    });

    // Tail lights
    const tailMat = new THREE.MeshBasicMaterial({ color: 0xef4444 });
    [-0.65, 0.65].forEach((lx) => {
      const tl = new THREE.Mesh(new THREE.BoxGeometry(0.35, 0.18, 0.08), tailMat);
      tl.position.set(lx, 0.75, -1.91);
      this.group.add(tl);
    });

    // 4 Wheels
    const createWheel = (x: number, z: number, isSteering: boolean) => {
      const wheelGroup = new THREE.Group();
      wheelGroup.position.set(x, 0.4, z);
      this.group.add(wheelGroup);

      if (isSteering) {
        this.steerWheels.push(wheelGroup);
      }

      const tire = new THREE.Mesh(new THREE.CylinderGeometry(0.4, 0.4, 0.28, 16), rubberMat);
      tire.rotation.z = Math.PI / 2;
      tire.castShadow = true;
      wheelGroup.add(tire);
      this.wheels.push(tire);

      const rim = new THREE.Mesh(new THREE.CylinderGeometry(0.24, 0.24, 0.3, 12), rimMat);
      rim.rotation.z = Math.PI / 2;
      wheelGroup.add(rim);
    };

    createWheel(-0.95, 1.15, true); // Front Left
    createWheel(0.95, 1.15, true); // Front Right
    createWheel(-0.95, -1.15, false); // Rear Left
    createWheel(0.95, -1.15, false); // Rear Right
  }

  private buildAutorickshaw() {
    this.driverSeatOffset.set(0, 0.85, 0.2);

    const yellowMat = new THREE.MeshStandardMaterial({ color: 0xf59e0b, roughness: 0.4 }); // Classic auto yellow
    const greenMat = new THREE.MeshStandardMaterial({ color: 0x059669, roughness: 0.5 }); // Gujarati green bottom
    const blackHoodMat = new THREE.MeshStandardMaterial({ color: 0x18181b, roughness: 0.8 });
    const rubberMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.9 });
    const windshieldMat = new THREE.MeshStandardMaterial({ color: 0x38bdf8, transparent: true, opacity: 0.6 });

    // Lower Chassis
    const chassis = new THREE.Mesh(new THREE.BoxGeometry(1.6, 0.5, 2.6), greenMat);
    chassis.position.set(0, 0.45, 0);
    this.group.add(chassis);

    // Upper Yellow Cab
    const cab = new THREE.Mesh(new THREE.BoxGeometry(1.5, 0.9, 1.8), yellowMat);
    cab.position.set(0, 1.1, -0.2);
    this.group.add(cab);

    // Black Curved Canvas Hood Roof
    const hoodRoof = new THREE.Mesh(new THREE.BoxGeometry(1.55, 0.15, 2.2), blackHoodMat);
    hoodRoof.position.set(0, 1.6, -0.1);
    this.group.add(hoodRoof);

    // Front Windshield
    const windshield = new THREE.Mesh(new THREE.BoxGeometry(1.3, 0.6, 0.08), windshieldMat);
    windshield.position.set(0, 1.25, 0.8);
    this.group.add(windshield);

    // Single Front Wheel & Handlebar
    const frontGroup = new THREE.Group();
    frontGroup.position.set(0, 0.35, 1.1);
    this.group.add(frontGroup);
    this.steerWheels.push(frontGroup);

    const frontWheel = new THREE.Mesh(new THREE.CylinderGeometry(0.35, 0.35, 0.22, 16), rubberMat);
    frontWheel.rotation.z = Math.PI / 2;
    frontWheel.castShadow = true;
    frontGroup.add(frontWheel);
    this.wheels.push(frontWheel);

    // Center Round Headlight
    const headlight = new THREE.Mesh(new THREE.SphereGeometry(0.12, 12, 12), new THREE.MeshBasicMaterial({ color: 0xffffff }));
    headlight.position.set(0, 0.5, 0.3);
    frontGroup.add(headlight);

    // Two Rear Wheels
    [-0.8, 0.8].forEach((rx) => {
      const rWheel = new THREE.Mesh(new THREE.CylinderGeometry(0.35, 0.35, 0.22, 16), rubberMat);
      rWheel.rotation.z = Math.PI / 2;
      rWheel.position.set(rx, 0.35, -0.8);
      rWheel.castShadow = true;
      this.group.add(rWheel);
      this.wheels.push(rWheel);
    });
  }

  private setupHeadlights() {
    this.headlightSpot = new THREE.SpotLight(0xfff7ed, 0, 30, Math.PI / 6, 0.4, 1.2);
    this.headlightSpot.position.set(0, 0.8, 1.5);
    const target = new THREE.Object3D();
    target.position.set(0, 0.2, 15);
    this.group.add(target);
    this.group.add(this.headlightSpot);
    this.headlightSpot.target = target;
  }

  public setHeadlights(enabled: boolean) {
    if (this.headlightSpot) {
      this.headlightSpot.intensity = enabled ? 2.5 : 0;
    }
  }

  public updateWheels(speed: number, steerAngle: number) {
    // Spin wheels along X axis
    this.wheels.forEach((wheel) => {
      wheel.rotation.x += speed * 0.15;
    });

    // Steer front wheels along Y axis
    this.steerWheels.forEach((steer) => {
      steer.rotation.y = steerAngle;
    });
  }
}
