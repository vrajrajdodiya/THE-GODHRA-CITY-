import * as THREE from 'three';

export interface NPC {
  mesh: THREE.Group;
  name: string;
  role: string;
  dialogue: string;
  startPos: THREE.Vector3;
  endPos: THREE.Vector3;
  t: number;
  speed: number;
  leftLeg: THREE.Mesh;
  rightLeg: THREE.Mesh;
}

export class NPCSystem {
  private scene: THREE.Scene;
  public npcs: NPC[] = [];

  constructor(scene: THREE.Scene) {
    this.scene = scene;
  }

  public initNPCs() {
    this.spawnNPC('Pravin Uncle', 'Shopkeeper', 'Kem chho beta! Business is picking up today.', new THREE.Vector3(42, 0, -23), new THREE.Vector3(48, 0, -23), 0xd97706);
    this.spawnNPC('Pooja', 'College Student', 'Godhra Arts college exams are approaching next week!', new THREE.Vector3(56, 0, -62), new THREE.Vector3(64, 0, -62), 0x9333ea);
    this.spawnNPC('Ramesh Bhai', 'Chai Wala', 'Have some hot cutting chai and fresh fafda!', new THREE.Vector3(34, 0, 39), new THREE.Vector3(40, 0, 39), 0x2563eb);
    this.spawnNPC('Kishan', 'Mechanic Apprentice', 'JD is the best mechanic in whole Panchmahal district!', new THREE.Vector3(-55, 0, 38), new THREE.Vector3(-55, 0, 44), 0x059669);
    this.spawnNPC('Bipin Seth', 'Businessman', 'Hemang has sharp business acumen. Keep an eye on them.', new THREE.Vector3(62, 0, 18), new THREE.Vector3(68, 0, 18), 0x334155);
  }

  private spawnNPC(name: string, role: string, dialogue: string, start: THREE.Vector3, end: THREE.Vector3, shirtColor: number) {
    const group = new THREE.Group();
    group.position.copy(start);

    const skinMat = new THREE.MeshStandardMaterial({ color: 0xc68642 });
    const shirtMat = new THREE.MeshStandardMaterial({ color: shirtColor });
    const pantMat = new THREE.MeshStandardMaterial({ color: 0x1e293b });

    // Torso
    const torso = new THREE.Mesh(new THREE.BoxGeometry(0.6, 0.8, 0.35), shirtMat);
    torso.position.y = 1.25;
    torso.castShadow = true;
    group.add(torso);

    // Head
    const head = new THREE.Mesh(new THREE.BoxGeometry(0.4, 0.45, 0.4), skinMat);
    head.position.y = 1.85;
    group.add(head);

    // Hair
    const hair = new THREE.Mesh(new THREE.BoxGeometry(0.42, 0.15, 0.42), new THREE.MeshStandardMaterial({ color: 0x18181b }));
    hair.position.y = 2.05;
    group.add(hair);

    // Legs
    const leftLeg = new THREE.Mesh(new THREE.BoxGeometry(0.2, 0.75, 0.2), pantMat);
    leftLeg.position.set(-0.16, 0.45, 0);
    leftLeg.castShadow = true;
    group.add(leftLeg);

    const rightLeg = new THREE.Mesh(new THREE.BoxGeometry(0.2, 0.75, 0.2), pantMat);
    rightLeg.position.set(0.16, 0.45, 0);
    rightLeg.castShadow = true;
    group.add(rightLeg);

    this.scene.add(group);

    this.npcs.push({
      mesh: group,
      name,
      role,
      dialogue,
      startPos: start,
      endPos: end,
      t: Math.random(),
      speed: 0.15 + Math.random() * 0.1,
      leftLeg,
      rightLeg,
    });
  }

  public update(delta: number) {
    this.npcs.forEach((npc) => {
      npc.t += delta * npc.speed;
      const pingPong = Math.abs(Math.sin(npc.t));
      npc.mesh.position.lerpVectors(npc.startPos, npc.endPos, pingPong);

      // Orient towards direction of travel
      const movingToEnd = Math.cos(npc.t) > 0;
      const angle = movingToEnd
        ? Math.atan2(npc.endPos.x - npc.startPos.x, npc.endPos.z - npc.startPos.z)
        : Math.atan2(npc.startPos.x - npc.endPos.x, npc.startPos.z - npc.endPos.z);
      npc.mesh.rotation.y = angle;

      // Leg swing animation
      const legAngle = Math.sin(npc.t * 8) * 0.5;
      npc.leftLeg.rotation.x = legAngle;
      npc.rightLeg.rotation.x = -legAngle;
    });
  }
}
