import * as THREE from 'three';

export interface TrafficCar {
  mesh: THREE.Group;
  speed: number;
  direction: THREE.Vector3;
  type: 'car' | 'auto' | 'scooter';
  bounds: { minX: number; maxX: number; minZ: number; maxZ: number };
}

export class TrafficSystem {
  private scene: THREE.Scene;
  public trafficList: TrafficCar[] = [];

  constructor(scene: THREE.Scene) {
    this.scene = scene;
  }

  public initTraffic() {
    // Spawn 6 traffic vehicles across different roads
    this.spawnCar(-80, 2.5, new THREE.Vector3(1, 0, 0), { minX: -85, maxX: 85, minZ: 2, maxZ: 3 }, 'car', 0xef4444);
    this.spawnCar(70, -2.5, new THREE.Vector3(-1, 0, 0), { minX: -85, maxX: 85, minZ: -3, maxZ: -2 }, 'car', 0x3b82f6);
    this.spawnCar(2.5, -70, new THREE.Vector3(0, 0, 1), { minX: 2, maxX: 3, minZ: -85, maxZ: 85 }, 'auto', 0xf59e0b);
    this.spawnCar(-2.5, 60, new THREE.Vector3(0, 0, -1), { minX: -3, maxX: -2, minZ: -85, maxZ: 85 }, 'scooter', 0x10b981);
    this.spawnCar(-80, 93, new THREE.Vector3(1, 0, 0), { minX: -95, maxX: 95, minZ: 92, maxZ: 94 }, 'car', 0xffffff);
    this.spawnCar(80, 97, new THREE.Vector3(-1, 0, 0), { minX: -95, maxX: 95, minZ: 96, maxZ: 98 }, 'auto', 0xf59e0b);
  }

  private spawnCar(x: number, z: number, dir: THREE.Vector3, bounds: TrafficCar['bounds'], type: TrafficCar['type'], colorHex: number) {
    const group = new THREE.Group();
    group.position.set(x, 0.4, z);

    if (type === 'car') {
      const body = new THREE.Mesh(
        new THREE.BoxGeometry(1.8, 0.7, 3.6),
        new THREE.MeshStandardMaterial({ color: colorHex, roughness: 0.4 })
      );
      body.castShadow = true;
      group.add(body);

      const roof = new THREE.Mesh(
        new THREE.BoxGeometry(1.6, 0.6, 1.8),
        new THREE.MeshStandardMaterial({ color: 0x1e293b })
      );
      roof.position.set(0, 0.6, -0.2);
      group.add(roof);
    } else if (type === 'auto') {
      const lower = new THREE.Mesh(
        new THREE.BoxGeometry(1.5, 0.5, 2.4),
        new THREE.MeshStandardMaterial({ color: 0x15803d })
      );
      group.add(lower);

      const upper = new THREE.Mesh(
        new THREE.BoxGeometry(1.4, 0.8, 1.6),
        new THREE.MeshStandardMaterial({ color: 0xf59e0b })
      );
      upper.position.set(0, 0.6, -0.1);
      group.add(upper);
    } else {
      // Scooter
      const sc = new THREE.Mesh(
        new THREE.BoxGeometry(0.6, 0.5, 1.4),
        new THREE.MeshStandardMaterial({ color: colorHex })
      );
      group.add(sc);
    }

    // Orient mesh along direction
    if (dir.x > 0) group.rotation.y = Math.PI / 2;
    else if (dir.x < 0) group.rotation.y = -Math.PI / 2;
    else if (dir.z > 0) group.rotation.y = 0;
    else group.rotation.y = Math.PI;

    this.scene.add(group);

    this.trafficList.push({
      mesh: group,
      speed: 6 + Math.random() * 4,
      direction: dir,
      type,
      bounds,
    });
  }

  public update(delta: number) {
    this.trafficList.forEach((t) => {
      t.mesh.position.addScaledVector(t.direction, t.speed * delta);

      // Loop when hitting bounds
      if (t.direction.x > 0 && t.mesh.position.x > t.bounds.maxX) {
        t.mesh.position.x = t.bounds.minX;
      } else if (t.direction.x < 0 && t.mesh.position.x < t.bounds.minX) {
        t.mesh.position.x = t.bounds.maxX;
      } else if (t.direction.z > 0 && t.mesh.position.z > t.bounds.maxZ) {
        t.mesh.position.z = t.bounds.minZ;
      } else if (t.direction.z < 0 && t.mesh.position.z < t.bounds.minZ) {
        t.mesh.position.z = t.bounds.maxZ;
      }
    });
  }
}
