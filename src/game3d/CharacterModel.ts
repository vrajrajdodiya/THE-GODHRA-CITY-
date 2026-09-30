import * as THREE from 'three';
import { CharacterId } from '../types/game';
import { CHARACTERS } from '../data/characters';

export class CharacterModel {
  public group: THREE.Group;
  public characterId: CharacterId;

  // Body parts for animation
  private head: THREE.Mesh;
  private torso: THREE.Mesh;
  private leftArm: THREE.Group;
  private rightArm: THREE.Group;
  private leftLeg: THREE.Group;
  private rightLeg: THREE.Group;

  // Materials for live wardrobe updates
  private shirtMat: THREE.MeshStandardMaterial;
  private pantsMat: THREE.MeshStandardMaterial;
  private skinMat: THREE.MeshStandardMaterial;
  private hairMat: THREE.MeshStandardMaterial;
  private shoesMat: THREE.MeshStandardMaterial;

  private walkCycleTime = 0;

  constructor(characterId: CharacterId) {
    this.characterId = characterId;
    this.group = new THREE.Group();

    const charData = CHARACTERS[characterId];

    // Colors
    const skinColor = 0xc68642; // Warm Indian skin tone
    const hairColor = 0x1c1917; // Deep black/dark brown hair

    this.skinMat = new THREE.MeshStandardMaterial({ color: skinColor, roughness: 0.8 });
    this.hairMat = new THREE.MeshStandardMaterial({ color: hairColor, roughness: 0.6 });
    this.shirtMat = new THREE.MeshStandardMaterial({ color: charData.outfit.topColor, roughness: 0.7 });
    this.pantsMat = new THREE.MeshStandardMaterial({ color: charData.outfit.bottomColor, roughness: 0.7 });
    this.shoesMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.5 });

    // Build Rig
    // 1. Torso
    const torsoGeo = new THREE.BoxGeometry(0.7, 0.9, 0.45);
    this.torso = new THREE.Mesh(torsoGeo, this.shirtMat);
    this.torso.position.y = 1.35;
    this.torso.castShadow = true;
    this.group.add(this.torso);

    // 2. Head & Neck
    const neck = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.14, 0.2), this.skinMat);
    neck.position.y = 0.55;
    this.torso.add(neck);

    const headGeo = new THREE.BoxGeometry(0.46, 0.5, 0.46);
    this.head = new THREE.Mesh(headGeo, this.skinMat);
    this.head.position.y = 0.4;
    neck.add(this.head);

    // Hair
    const hairGeo = new THREE.BoxGeometry(0.5, 0.22, 0.5);
    const hair = new THREE.Mesh(hairGeo, this.hairMat);
    hair.position.y = 0.26;
    this.head.add(hair);

    // Character specific head accessories:
    if (characterId === 'hemang') {
      // Glasses
      const glassesMat = new THREE.MeshBasicMaterial({ color: 0x0f172a });
      const glasses = new THREE.Mesh(new THREE.BoxGeometry(0.42, 0.1, 0.05), glassesMat);
      glasses.position.set(0, 0.05, 0.24);
      this.head.add(glasses);
    } else if (characterId === 'vraj') {
      // Cool aviator dark sunglasses
      const shadeMat = new THREE.MeshBasicMaterial({ color: 0x0284c7 });
      const shades = new THREE.Mesh(new THREE.BoxGeometry(0.44, 0.12, 0.06), shadeMat);
      shades.position.set(0, 0.06, 0.24);
      this.head.add(shades);
    } else if (characterId === 'jd') {
      // Cool snapback cap
      const capMat = new THREE.MeshStandardMaterial({ color: 0x047857 });
      const cap = new THREE.Mesh(new THREE.BoxGeometry(0.52, 0.16, 0.52), capMat);
      cap.position.y = 0.28;
      this.head.add(cap);

      const visor = new THREE.Mesh(new THREE.BoxGeometry(0.48, 0.04, 0.3), capMat);
      visor.position.set(0, 0.22, -0.3); // Backwards stylish cap
      this.head.add(visor);
    }

    // 3. Left Arm
    this.leftArm = new THREE.Group();
    this.leftArm.position.set(-0.46, 0.35, 0);
    this.torso.add(this.leftArm);

    const armGeo = new THREE.BoxGeometry(0.2, 0.75, 0.2);
    const leftArmMesh = new THREE.Mesh(armGeo, this.shirtMat);
    leftArmMesh.position.y = -0.35;
    leftArmMesh.castShadow = true;
    this.leftArm.add(leftArmMesh);

    const leftHand = new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.18, 0.18), this.skinMat);
    leftHand.position.y = -0.78;
    this.leftArm.add(leftHand);

    // 4. Right Arm
    this.rightArm = new THREE.Group();
    this.rightArm.position.set(0.46, 0.35, 0);
    this.torso.add(this.rightArm);

    const rightArmMesh = new THREE.Mesh(armGeo, this.shirtMat);
    rightArmMesh.position.y = -0.35;
    rightArmMesh.castShadow = true;
    this.rightArm.add(rightArmMesh);

    const rightHand = new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.18, 0.18), this.skinMat);
    rightHand.position.y = -0.78;
    this.rightArm.add(rightHand);

    // 5. Left Leg
    this.leftLeg = new THREE.Group();
    this.leftLeg.position.set(-0.2, -0.45, 0);
    this.torso.add(this.leftLeg);

    const legGeo = new THREE.BoxGeometry(0.25, 0.8, 0.25);
    const leftLegMesh = new THREE.Mesh(legGeo, this.pantsMat);
    leftLegMesh.position.y = -0.4;
    leftLegMesh.castShadow = true;
    this.leftLeg.add(leftLegMesh);

    const leftShoe = new THREE.Mesh(new THREE.BoxGeometry(0.26, 0.15, 0.38), this.shoesMat);
    leftShoe.position.set(0, -0.85, 0.06);
    this.leftLeg.add(leftShoe);

    // 6. Right Leg
    this.rightLeg = new THREE.Group();
    this.rightLeg.position.set(0.2, -0.45, 0);
    this.torso.add(this.rightLeg);

    const rightLegMesh = new THREE.Mesh(legGeo, this.pantsMat);
    rightLegMesh.position.y = -0.4;
    rightLegMesh.castShadow = true;
    this.rightLeg.add(rightLegMesh);

    const rightShoe = new THREE.Mesh(new THREE.BoxGeometry(0.26, 0.15, 0.38), this.shoesMat);
    rightShoe.position.set(0, -0.85, 0.06);
    this.rightLeg.add(rightShoe);
  }

  public updateOutfitColors(topColor: string, bottomColor: string) {
    this.shirtMat.color.set(topColor);
    this.pantsMat.color.set(bottomColor);
  }

  public updateAnimation(delta: number, speed: number, isGrounded: boolean, isDriving: boolean) {
    if (isDriving) {
      // Seated driving posture
      this.torso.position.y = 0.9;
      this.leftLeg.rotation.x = -Math.PI / 2.2;
      this.rightLeg.rotation.x = -Math.PI / 2.2;
      this.leftArm.rotation.x = -Math.PI / 3;
      this.rightArm.rotation.x = -Math.PI / 3;
      this.leftArm.rotation.z = 0.2;
      this.rightArm.rotation.z = -0.2;
      return;
    }

    if (!isGrounded) {
      // Jump pose
      this.torso.position.y = 1.45;
      this.leftLeg.rotation.x = -0.4;
      this.rightLeg.rotation.x = 0.3;
      this.leftArm.rotation.x = -1.2;
      this.rightArm.rotation.x = -1.2;
      return;
    }

    if (speed > 0.1) {
      // Walking / Running cycle
      this.walkCycleTime += delta * speed * 4.5;
      const angle = Math.sin(this.walkCycleTime) * 0.75;

      this.leftLeg.rotation.x = angle;
      this.rightLeg.rotation.x = -angle;

      this.leftArm.rotation.x = -angle * 0.8;
      this.rightArm.rotation.x = angle * 0.8;

      // Subtle torso bob
      this.torso.position.y = 1.35 + Math.abs(Math.sin(this.walkCycleTime * 2)) * 0.06;
    } else {
      // Idle pose
      this.leftLeg.rotation.x = 0;
      this.rightLeg.rotation.x = 0;
      this.leftArm.rotation.x = 0;
      this.rightArm.rotation.x = 0;
      this.leftArm.rotation.z = 0.05;
      this.rightArm.rotation.z = -0.05;
      this.torso.position.y = 1.35;
    }
  }
}
