import * as THREE from 'three';

export interface CollisionBox {
  min: THREE.Vector3;
  max: THREE.Vector3;
  type?: string;
}

export interface InteractiveTrigger {
  id: string;
  name: string;
  position: THREE.Vector3;
  radius: number;
  type: 'bed' | 'wardrobe' | 'garage' | 'food' | 'college' | 'bazaar' | 'business';
  actionPrompt: string;
}

export class CityBuilder {
  public scene: THREE.Scene;
  public collisionBoxes: CollisionBox[] = [];
  public interactiveTriggers: InteractiveTrigger[] = [];
  public streetLights: THREE.PointLight[] = [];
  public buildingMeshes: THREE.Mesh[] = [];

  constructor(scene: THREE.Scene) {
    this.scene = scene;
  }

  public buildCity() {
    this.buildGroundAndRoads();
    this.buildFriendsHome();
    this.buildCityCenter();
    this.buildMainMarket();
    this.buildFoodStreet();
    this.buildGarageArea();
    this.buildPetrolPump();
    this.buildSmallPark();
    this.buildCollegeArea();
    this.buildHighway();
    this.buildBusinessArea();
    this.addStreetVegetation();
  }

  private addCollision(x: number, z: number, width: number, depth: number, height = 8, type = 'obstacle') {
    this.collisionBoxes.push({
      min: new THREE.Vector3(x - width / 2, 0, z - depth / 2),
      max: new THREE.Vector3(x + width / 2, height, z + depth / 2),
      type,
    });
  }

  private buildGroundAndRoads() {
    // City Base Terrain (warm dusty sandstone/earth ground around roads)
    const groundGeo = new THREE.PlaneGeometry(320, 320);
    const groundMat = new THREE.MeshStandardMaterial({
      color: 0x94a3b8,
      roughness: 0.9,
      metalness: 0.1,
    });
    const ground = new THREE.Mesh(groundGeo, groundMat);
    ground.rotation.x = -Math.PI / 2;
    ground.receiveShadow = true;
    this.scene.add(ground);

    // Main Asphalt Roads
    const roadMat = new THREE.MeshStandardMaterial({
      color: 0x1e293b,
      roughness: 0.7,
      metalness: 0.1,
    });

    const sidewalkMat = new THREE.MeshStandardMaterial({
      color: 0xcfd8dc,
      roughness: 0.8,
    });

    const roadMarkingMat = new THREE.MeshBasicMaterial({ color: 0xffffff });
    const roadYellowMat = new THREE.MeshBasicMaterial({ color: 0xfbbf24 });

    // Helper to create straight road segment
    const createRoad = (x: number, z: number, w: number, d: number) => {
      const road = new THREE.Mesh(new THREE.PlaneGeometry(w, d), roadMat);
      road.rotation.x = -Math.PI / 2;
      road.position.set(x, 0.02, z);
      road.receiveShadow = true;
      this.scene.add(road);

      // Sidewalk curbs on sides
      if (w > d) {
        // East-West road
        const curbN = new THREE.Mesh(new THREE.BoxGeometry(w, 0.2, 1.4), sidewalkMat);
        curbN.position.set(x, 0.1, z - d / 2 - 0.7);
        curbN.receiveShadow = true;
        this.scene.add(curbN);

        const curbS = new THREE.Mesh(new THREE.BoxGeometry(w, 0.2, 1.4), sidewalkMat);
        curbS.position.set(x, 0.1, z + d / 2 + 0.7);
        curbS.receiveShadow = true;
        this.scene.add(curbS);

        // Center line
        const linesCount = Math.floor(w / 6);
        for (let i = 0; i < linesCount; i++) {
          const dash = new THREE.Mesh(new THREE.PlaneGeometry(3, 0.25), roadYellowMat);
          dash.rotation.x = -Math.PI / 2;
          dash.position.set(x - w / 2 + i * 6 + 3, 0.03, z);
          this.scene.add(dash);
        }
      } else {
        // North-South road
        const curbW = new THREE.Mesh(new THREE.BoxGeometry(1.4, 0.2, d), sidewalkMat);
        curbW.position.set(x - w / 2 - 0.7, 0.1, z);
        curbW.receiveShadow = true;
        this.scene.add(curbW);

        const curbE = new THREE.Mesh(new THREE.BoxGeometry(1.4, 0.2, d), sidewalkMat);
        curbE.position.set(x + w / 2 + 0.7, 0.1, z);
        curbE.receiveShadow = true;
        this.scene.add(curbE);

        // Center line
        const linesCount = Math.floor(d / 6);
        for (let i = 0; i < linesCount; i++) {
          const dash = new THREE.Mesh(new THREE.PlaneGeometry(0.25, 3), roadYellowMat);
          dash.rotation.x = -Math.PI / 2;
          dash.position.set(x, 0.03, z - d / 2 + i * 6 + 3);
          this.scene.add(dash);
        }
      }
    };

    // Main Avenue Cross (East-West and North-South intersecting at Clock Tower)
    createRoad(0, 0, 180, 10); // East-West Main St
    createRoad(0, 0, 10, 180); // North-South Main St

    // Ring Road / Roundabout at Center
    const roundaboutGeo = new THREE.RingGeometry(12, 22, 32);
    const roundabout = new THREE.Mesh(roundaboutGeo, roadMat);
    roundabout.rotation.x = -Math.PI / 2;
    roundabout.position.set(0, 0.03, 0);
    this.scene.add(roundabout);

    // Cross roads
    createRoad(-55, -10, 8, 80); // Road to Friends' Home and Park
    createRoad(50, -10, 8, 80); // Road to Market & College
    createRoad(-55, 35, 8, 50); // Road to Garage
    createRoad(0, 95, 200, 14); // Godhra Express Highway
  }

  /**
   * 1. Friends' Home (Exterior, Porch, and Interior with 3 Beds, Wardrobe, Kitchen, and Driveway)
   */
  private buildFriendsHome() {
    const homeX = -55;
    const homeZ = -45;

    // Home Base Foundation & Floor (Indian terracotta tile)
    const floorGeo = new THREE.BoxGeometry(18, 0.3, 14);
    const floorMat = new THREE.MeshStandardMaterial({ color: 0x9a3412, roughness: 0.6 });
    const floor = new THREE.Mesh(floorGeo, floorMat);
    floor.position.set(homeX, 0.15, homeZ);
    floor.receiveShadow = true;
    this.scene.add(floor);

    // Walls (Warm Gujarati cream stucco)
    const wallMat = new THREE.MeshStandardMaterial({ color: 0xfef08a, roughness: 0.8 });
    const roofMat = new THREE.MeshStandardMaterial({ color: 0xb91c1c, roughness: 0.5 }); // Gujarati red clay roof

    // Back wall
    const backWall = new THREE.Mesh(new THREE.BoxGeometry(18, 4.5, 0.6), wallMat);
    backWall.position.set(homeX, 2.4, homeZ - 7);
    this.scene.add(backWall);

    // Left wall
    const leftWall = new THREE.Mesh(new THREE.BoxGeometry(0.6, 4.5, 14), wallMat);
    leftWall.position.set(homeX - 9, 2.4, homeZ);
    this.scene.add(leftWall);

    // Right wall
    const rightWall = new THREE.Mesh(new THREE.BoxGeometry(0.6, 4.5, 14), wallMat);
    rightWall.position.set(homeX + 9, 2.4, homeZ);
    this.scene.add(rightWall);

    // Front wall with door opening
    const frontWallL = new THREE.Mesh(new THREE.BoxGeometry(6.5, 4.5, 0.6), wallMat);
    frontWallL.position.set(homeX - 5.75, 2.4, homeZ + 7);
    this.scene.add(frontWallL);

    const frontWallR = new THREE.Mesh(new THREE.BoxGeometry(6.5, 4.5, 0.6), wallMat);
    frontWallR.position.set(homeX + 5.75, 2.4, homeZ + 7);
    this.scene.add(frontWallR);

    // Roof (Slanted terracotta pitched roof)
    const roof = new THREE.Mesh(new THREE.ConeGeometry(14, 3.2, 4), roofMat);
    roof.position.set(homeX, 6.2, homeZ);
    roof.rotation.y = Math.PI / 4;
    roof.castShadow = true;
    this.scene.add(roof);

    // Front Porch "Otla" (Classic Gujarati front veranda)
    const otla = new THREE.Mesh(new THREE.BoxGeometry(10, 0.4, 4), new THREE.MeshStandardMaterial({ color: 0xd97706 }));
    otla.position.set(homeX, 0.2, homeZ + 9);
    otla.receiveShadow = true;
    this.scene.add(otla);

    // Signboard: "HEMANG · VRAJ · JD RESIDENCE"
    const signBoard = new THREE.Mesh(new THREE.BoxGeometry(5, 0.9, 0.15), new THREE.MeshStandardMaterial({ color: 0x1e3a8a }));
    signBoard.position.set(homeX, 4.2, homeZ + 7.3);
    this.scene.add(signBoard);

    // Interior Furniture:
    // 3 BEDS for Hemang, Vraj, and JD!
    const bedMatH = new THREE.MeshStandardMaterial({ color: 0xd97706 }); // Hemang amber bed
    const bedMatV = new THREE.MeshStandardMaterial({ color: 0x0284c7 }); // Vraj blue bed
    const bedMatJ = new THREE.MeshStandardMaterial({ color: 0x16a34a }); // JD green bed
    const pillowMat = new THREE.MeshStandardMaterial({ color: 0xffffff });

    const createBed = (x: number, z: number, mat: THREE.Material, label: string) => {
      const frame = new THREE.Mesh(new THREE.BoxGeometry(2.2, 0.5, 4), new THREE.MeshStandardMaterial({ color: 0x78350f }));
      frame.position.set(x, 0.4, z);
      this.scene.add(frame);

      const mattress = new THREE.Mesh(new THREE.BoxGeometry(2, 0.4, 3.8), mat);
      mattress.position.set(x, 0.7, z);
      this.scene.add(mattress);

      const pillow = new THREE.Mesh(new THREE.BoxGeometry(1.6, 0.2, 0.8), pillowMat);
      pillow.position.set(x, 0.9, z - 1.4);
      this.scene.add(pillow);
    };

    createBed(homeX - 6.5, homeZ - 4, bedMatH, 'Hemang');
    createBed(homeX - 3.5, homeZ - 4, bedMatV, 'Vraj');
    createBed(homeX - 0.5, homeZ - 4, bedMatJ, 'JD');

    // Wardrobe (Interactive: change outfits)
    const wardrobeGeo = new THREE.BoxGeometry(2.4, 3.5, 1.2);
    const wardrobeMat = new THREE.MeshStandardMaterial({ color: 0x451a03, roughness: 0.5 });
    const wardrobe = new THREE.Mesh(wardrobeGeo, wardrobeMat);
    wardrobe.position.set(homeX + 6.5, 2.0, homeZ - 5);
    this.scene.add(wardrobe);

    // Kitchen Counter & Chai Kettle
    const kitchenGeo = new THREE.BoxGeometry(4.5, 1.2, 1.6);
    const kitchenMat = new THREE.MeshStandardMaterial({ color: 0x64748b });
    const kitchen = new THREE.Mesh(kitchenGeo, kitchenMat);
    kitchen.position.set(homeX + 5.5, 0.8, homeZ + 4);
    this.scene.add(kitchen);

    // Chai brass kettle
    const kettle = new THREE.Mesh(new THREE.CylinderGeometry(0.3, 0.4, 0.6, 12), new THREE.MeshStandardMaterial({ color: 0xeab308, metalness: 0.8 }));
    kettle.position.set(homeX + 5.5, 1.6, homeZ + 4);
    this.scene.add(kettle);

    // Outdoor Driveway / Garage Shed
    const drivewayGeo = new THREE.PlaneGeometry(10, 14);
    const driveway = new THREE.Mesh(drivewayGeo, new THREE.MeshStandardMaterial({ color: 0x475569 }));
    driveway.rotation.x = -Math.PI / 2;
    driveway.position.set(homeX + 16, 0.04, homeZ);
    this.scene.add(driveway);

    // Shed roof over driveway
    const shedPillar1 = new THREE.Mesh(new THREE.CylinderGeometry(0.15, 0.15, 4), new THREE.MeshStandardMaterial({ color: 0x334155 }));
    shedPillar1.position.set(homeX + 11.5, 2, homeZ + 6);
    this.scene.add(shedPillar1);
    const shedPillar2 = new THREE.Mesh(new THREE.CylinderGeometry(0.15, 0.15, 4), new THREE.MeshStandardMaterial({ color: 0x334155 }));
    shedPillar2.position.set(homeX + 20.5, 2, homeZ + 6);
    this.scene.add(shedPillar2);

    const shedRoof = new THREE.Mesh(new THREE.BoxGeometry(10, 0.2, 14), new THREE.MeshStandardMaterial({ color: 0x0284c7, metalness: 0.4 }));
    shedRoof.position.set(homeX + 16, 4.1, homeZ);
    shedRoof.rotation.x = 0.05;
    this.scene.add(shedRoof);

    // Add Collisions for walls
    this.addCollision(homeX, homeZ - 7, 18, 1, 5); // back wall
    this.addCollision(homeX - 9, homeZ, 1, 14, 5); // left wall
    this.addCollision(homeX + 9, homeZ, 1, 14, 5); // right wall
    this.addCollision(homeX - 5.75, homeZ + 7, 6.5, 1, 5); // front wall left
    this.addCollision(homeX + 5.75, homeZ + 7, 6.5, 1, 5); // front wall right

    // Interactive Triggers
    this.interactiveTriggers.push({
      id: 'bed_rest',
      name: 'Resting Beds',
      position: new THREE.Vector3(homeX - 3.5, 1, homeZ - 4),
      radius: 4,
      type: 'bed',
      actionPrompt: 'Press E or Tap to Rest / Change Time of Day',
    });

    this.interactiveTriggers.push({
      id: 'wardrobe_change',
      name: 'Wardrobe',
      position: new THREE.Vector3(homeX + 6.5, 1, homeZ - 4),
      radius: 3.5,
      type: 'wardrobe',
      actionPrompt: 'Press E or Tap to Open Wardrobe & Customization',
    });

    this.interactiveTriggers.push({
      id: 'home_garage',
      name: 'Home Garage Driveway',
      position: new THREE.Vector3(homeX + 16, 1, homeZ),
      radius: 6,
      type: 'garage',
      actionPrompt: 'Press E or Tap to View Vehicles in Garage',
    });
  }

  /**
   * 2. City Center (Clock Tower Roundabout with Gujarati architectural dome)
   */
  private buildCityCenter() {
    const centerX = 0;
    const centerZ = 0;

    // Center Roundabout Island
    const islandGeo = new THREE.CylinderGeometry(11, 11, 0.4, 32);
    const islandMat = new THREE.MeshStandardMaterial({ color: 0x15803d, roughness: 0.9 });
    const island = new THREE.Mesh(islandGeo, islandMat);
    island.position.set(centerX, 0.2, centerZ);
    this.scene.add(island);

    // Stone base for Clock Tower
    const towerBase = new THREE.Mesh(new THREE.BoxGeometry(6, 2, 6), new THREE.MeshStandardMaterial({ color: 0x78716c, roughness: 0.7 }));
    towerBase.position.set(centerX, 1.2, centerZ);
    this.scene.add(towerBase);

    // Tall Tower Shaft
    const towerShaft = new THREE.Mesh(new THREE.BoxGeometry(4.5, 18, 4.5), new THREE.MeshStandardMaterial({ color: 0xfef3c7, roughness: 0.6 }));
    towerShaft.position.set(centerX, 11, centerZ);
    towerShaft.castShadow = true;
    this.scene.add(towerShaft);

    // Clock Face Enclosure
    const clockSection = new THREE.Mesh(new THREE.BoxGeometry(5.2, 4, 5.2), new THREE.MeshStandardMaterial({ color: 0xb45309 }));
    clockSection.position.set(centerX, 21.5, centerZ);
    this.scene.add(clockSection);

    // 4 Clock Dials (North, South, East, West)
    const dialMat = new THREE.MeshBasicMaterial({ color: 0xffffff });
    const handMat = new THREE.MeshBasicMaterial({ color: 0x000000 });

    const createClock = (x: number, y: number, z: number, rotY: number) => {
      const dial = new THREE.Mesh(new THREE.CircleGeometry(1.4, 24), dialMat);
      dial.position.set(x, y, z);
      dial.rotation.y = rotY;
      this.scene.add(dial);

      const hourHand = new THREE.Mesh(new THREE.PlaneGeometry(0.12, 0.9), handMat);
      hourHand.position.set(x, y + 0.3, z + (rotY === 0 ? 0.02 : rotY === Math.PI ? -0.02 : 0));
      hourHand.rotation.y = rotY;
      hourHand.rotation.z = Math.PI / 4;
      this.scene.add(hourHand);
    };

    createClock(centerX, 21.5, centerZ + 2.62, 0); // South
    createClock(centerX, 21.5, centerZ - 2.62, Math.PI); // North
    createClock(centerX + 2.62, 21.5, centerZ, Math.PI / 2); // East
    createClock(centerX - 2.62, 21.5, centerZ, -Math.PI / 2); // West

    // Decorative Gujarati Jali Dome on top
    const dome = new THREE.Mesh(new THREE.SphereGeometry(2.4, 16, 16, 0, Math.PI * 2, 0, Math.PI / 2), new THREE.MeshStandardMaterial({ color: 0xd97706, metalness: 0.7 }));
    dome.position.set(centerX, 23.5, centerZ);
    this.scene.add(dome);

    // Flag mast
    const mast = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.06, 3.5), new THREE.MeshStandardMaterial({ color: 0xd1d5db }));
    mast.position.set(centerX, 26.5, centerZ);
    this.scene.add(mast);

    // Indian Tricolor Flag
    const flag = new THREE.Mesh(new THREE.PlaneGeometry(1.6, 1.0), new THREE.MeshStandardMaterial({ color: 0xff9933, side: THREE.DoubleSide }));
    flag.position.set(centerX + 0.8, 27.5, centerZ);
    this.scene.add(flag);

    // Fountain around base
    const fountainRing = new THREE.Mesh(new THREE.TorusGeometry(8.5, 0.3, 8, 24), new THREE.MeshStandardMaterial({ color: 0x94a3b8 }));
    fountainRing.rotation.x = Math.PI / 2;
    fountainRing.position.set(centerX, 0.4, centerZ);
    this.scene.add(fountainRing);

    const water = new THREE.Mesh(new THREE.CircleGeometry(8.3, 24), new THREE.MeshStandardMaterial({ color: 0x38bdf8, roughness: 0.1, transparent: true, opacity: 0.8 }));
    water.rotation.x = -Math.PI / 2;
    water.position.set(centerX, 0.35, centerZ);
    this.scene.add(water);

    // Collision for Clock Tower
    this.addCollision(centerX, centerZ, 7, 7, 26);
  }

  /**
   * 3. Main Market (Bazaar with shops, textile awnings, spice crates)
   */
  private buildMainMarket() {
    const marketX = 45;
    const marketZ = -30;

    const awningColors = [0xd97706, 0xef4444, 0x059669, 0x2563eb, 0x7c3aed];

    // Row of 4 Market Shops
    for (let i = 0; i < 4; i++) {
      const sx = marketX + (i - 1.5) * 11;
      const sz = marketZ;

      // Building structure
      const shopMesh = new THREE.Mesh(
        new THREE.BoxGeometry(10, 6, 8),
        new THREE.MeshStandardMaterial({ color: 0xfde047 - i * 0x111100, roughness: 0.8 })
      );
      shopMesh.position.set(sx, 3, sz);
      shopMesh.castShadow = true;
      this.scene.add(shopMesh);
      this.addCollision(sx, sz, 10, 8, 6);

      // Awning (slanted striped canopy)
      const awning = new THREE.Mesh(
        new THREE.BoxGeometry(9.6, 0.15, 3),
        new THREE.MeshStandardMaterial({ color: awningColors[i % awningColors.length], roughness: 0.5 })
      );
      awning.position.set(sx, 3.8, sz + 4.8);
      awning.rotation.x = 0.25;
      this.scene.add(awning);

      // Signboard
      const names = ['Shree Krishna Textiles', 'Patidar Spices & Grains', 'Gujarat Gift Articles', 'Choksi Jewelers'];
      const sign = new THREE.Mesh(
        new THREE.BoxGeometry(7, 0.9, 0.2),
        new THREE.MeshStandardMaterial({ color: 0x1e1b4b })
      );
      sign.position.set(sx, 5.2, sz + 4.1);
      this.scene.add(sign);

      // Crates and sacks outside
      const crate = new THREE.Mesh(
        new THREE.BoxGeometry(1.2, 1, 1.2),
        new THREE.MeshStandardMaterial({ color: 0x92400e })
      );
      crate.position.set(sx - 2, 0.5, sz + 4.5);
      this.scene.add(crate);

      const crate2 = new THREE.Mesh(
        new THREE.CylinderGeometry(0.5, 0.5, 0.9, 8),
        new THREE.MeshStandardMaterial({ color: 0xd97706 })
      );
      crate2.position.set(sx + 2.2, 0.45, sz + 4.6);
      this.scene.add(crate2);
    }

    this.interactiveTriggers.push({
      id: 'market_trader',
      name: 'Main Bazaar Marketplace',
      position: new THREE.Vector3(marketX, 1, marketZ + 6),
      radius: 6,
      type: 'bazaar',
      actionPrompt: 'Main Bazaar: Local trading hub of Godhra',
    });
  }

  /**
   * 4. Food Street (Khavdra Gali: Fafda-Jalebi, Chai Tapri, Pav Bhaji)
   */
  private buildFoodStreet() {
    const foodX = 35;
    const foodZ = 35;

    // Ambika Fafda & Khaman Stall
    const stallBody = new THREE.Mesh(
      new THREE.BoxGeometry(7, 3.5, 4),
      new THREE.MeshStandardMaterial({ color: 0xf59e0b, roughness: 0.6 })
    );
    stallBody.position.set(foodX, 1.75, foodZ);
    this.scene.add(stallBody);
    this.addCollision(foodX, foodZ, 7, 4, 4);

    // Stall Counter Shelf
    const counter = new THREE.Mesh(
      new THREE.BoxGeometry(7.2, 1.0, 1.5),
      new THREE.MeshStandardMaterial({ color: 0x78350f })
    );
    counter.position.set(foodX, 1.0, foodZ + 2.2);
    this.scene.add(counter);

    // Huge Kadai (Indian deep frying wok for Jalebi & Fafda)
    const wok = new THREE.Mesh(
      new THREE.CylinderGeometry(1.1, 0.6, 0.4, 16),
      new THREE.MeshStandardMaterial({ color: 0x334155, metalness: 0.8 })
    );
    wok.position.set(foodX - 1.8, 1.6, foodZ + 2.2);
    this.scene.add(wok);

    // Food Signboard: "AMBIKA FAFDA - JALEBI & KHAMAN"
    const sign = new THREE.Mesh(
      new THREE.BoxGeometry(6.5, 1.0, 0.2),
      new THREE.MeshStandardMaterial({ color: 0xb91c1c })
    );
    sign.position.set(foodX, 3.6, foodZ + 2.1);
    this.scene.add(sign);

    // Chai Tapri adjacent (Cutting Tea Stall)
    const chaiTapri = new THREE.Mesh(
      new THREE.BoxGeometry(5, 3.2, 3.5),
      new THREE.MeshStandardMaterial({ color: 0x0284c7 })
    );
    chaiTapri.position.set(foodX + 8, 1.6, foodZ);
    this.scene.add(chaiTapri);
    this.addCollision(foodX + 8, foodZ, 5, 3.5, 4);

    // Brass Samovar for Chai
    const samovar = new THREE.Mesh(
      new THREE.CylinderGeometry(0.35, 0.4, 0.9, 12),
      new THREE.MeshStandardMaterial({ color: 0xeab308, metalness: 0.85 })
    );
    samovar.position.set(foodX + 8, 1.7, foodZ + 2.0);
    this.scene.add(samovar);

    // Outdoor plastic stools
    const stoolColors = [0xef4444, 0x3b82f6, 0x10b981];
    for (let s = 0; s < 3; s++) {
      const stool = new THREE.Mesh(
        new THREE.CylinderGeometry(0.4, 0.35, 0.6, 8),
        new THREE.MeshStandardMaterial({ color: stoolColors[s] })
      );
      stool.position.set(foodX + 2 + s * 1.6, 0.3, foodZ + 5);
      this.scene.add(stool);
    }

    this.interactiveTriggers.push({
      id: 'food_stall_ambika',
      name: 'Ambika Food Corner',
      position: new THREE.Vector3(foodX, 1, foodZ + 3.5),
      radius: 5,
      type: 'food',
      actionPrompt: 'Ambika Food Stall: Fresh hot Gujarati Fafda & Khaman',
    });
  }

  /**
   * 5. Garage Area (JD Auto Garage: Lift, tires, workshop)
   */
  private buildGarageArea() {
    const gx = -60;
    const gz = 35;

    // Workshop main building
    const shop = new THREE.Mesh(
      new THREE.BoxGeometry(16, 6, 12),
      new THREE.MeshStandardMaterial({ color: 0x334155, roughness: 0.7 })
    );
    shop.position.set(gx, 3, gz);
    shop.castShadow = true;
    this.scene.add(shop);
    this.addCollision(gx, gz, 16, 12, 6);

    // Open repair bay awning
    const bayRoof = new THREE.Mesh(
      new THREE.BoxGeometry(14, 0.2, 8),
      new THREE.MeshStandardMaterial({ color: 0x059669, metalness: 0.3 })
    );
    bayRoof.position.set(gx, 5.0, gz + 8.5);
    this.scene.add(bayRoof);

    // Support pillars
    const p1 = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.2, 5), new THREE.MeshStandardMaterial({ color: 0x94a3b8 }));
    p1.position.set(gx - 6, 2.5, gz + 12);
    this.scene.add(p1);

    const p2 = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.2, 5), new THREE.MeshStandardMaterial({ color: 0x94a3b8 }));
    p2.position.set(gx + 6, 2.5, gz + 12);
    this.scene.add(p2);

    // Large Neon-like Garage Signboard: "JD AUTO GARAGE"
    const sign = new THREE.Mesh(
      new THREE.BoxGeometry(12, 1.4, 0.2),
      new THREE.MeshStandardMaterial({ color: 0x047857 })
    );
    sign.position.set(gx, 5.8, gz + 6.1);
    this.scene.add(sign);

    // Hydraulic vehicle lift rack
    const liftBase = new THREE.Mesh(
      new THREE.BoxGeometry(3.5, 0.4, 5.5),
      new THREE.MeshStandardMaterial({ color: 0xd97706, metalness: 0.7 })
    );
    liftBase.position.set(gx, 0.2, gz + 8);
    this.scene.add(liftBase);

    // Stacks of Tires
    for (let t = 0; t < 3; t++) {
      const tire = new THREE.Mesh(
        new THREE.TorusGeometry(0.6, 0.25, 8, 16),
        new THREE.MeshStandardMaterial({ color: 0x0f172a, roughness: 0.9 })
      );
      tire.rotation.x = Math.PI / 2;
      tire.position.set(gx - 4, 0.25 + t * 0.4, gz + 8);
      this.scene.add(tire);
    }

    this.interactiveTriggers.push({
      id: 'jd_garage_trigger',
      name: 'JD Auto Garage Workshop',
      position: new THREE.Vector3(gx, 1, gz + 8),
      radius: 6,
      type: 'garage',
      actionPrompt: 'Press E or Tap to Tune / Repair / Upgrade Vehicles',
    });
  }

  /**
   * 6. Petrol Pump (Gujarat Fuel Station)
   */
  private buildPetrolPump() {
    const px = -20;
    const pz = 65;

    // Fuel Canopy
    const canopy = new THREE.Mesh(
      new THREE.BoxGeometry(14, 0.8, 10),
      new THREE.MeshStandardMaterial({ color: 0xef4444, roughness: 0.4 })
    );
    canopy.position.set(px, 5.5, pz);
    this.scene.add(canopy);

    // Canopy blue border trim
    const trim = new THREE.Mesh(
      new THREE.BoxGeometry(14.2, 0.2, 10.2),
      new THREE.MeshStandardMaterial({ color: 0x1d4ed8 })
    );
    trim.position.set(px, 5.8, pz);
    this.scene.add(trim);

    // 4 Support Pillars
    const pillarMat = new THREE.MeshStandardMaterial({ color: 0xffffff });
    [-5, 5].forEach((dx) => {
      [-3.5, 3.5].forEach((dz) => {
        const pillar = new THREE.Mesh(new THREE.CylinderGeometry(0.25, 0.25, 5.5), pillarMat);
        pillar.position.set(px + dx, 2.75, pz + dz);
        this.scene.add(pillar);
      });
    });

    // 2 Fuel Dispensers (Pumps)
    [-2.5, 2.5].forEach((dx) => {
      const pump = new THREE.Mesh(
        new THREE.BoxGeometry(1.2, 2.4, 0.8),
        new THREE.MeshStandardMaterial({ color: 0x1e293b })
      );
      pump.position.set(px + dx, 1.2, pz);
      this.scene.add(pump);

      // Display meter
      const meter = new THREE.Mesh(
        new THREE.PlaneGeometry(0.7, 0.5),
        new THREE.MeshBasicMaterial({ color: 0x22c55e })
      );
      meter.position.set(px + dx, 1.7, pz + 0.41);
      this.scene.add(meter);

      this.addCollision(px + dx, pz, 1.2, 0.8, 2.5);
    });

    // Station Convenience Shop in rear
    const shop = new THREE.Mesh(
      new THREE.BoxGeometry(10, 4, 6),
      new THREE.MeshStandardMaterial({ color: 0xf1f5f9 })
    );
    shop.position.set(px, 2.0, pz - 10);
    this.scene.add(shop);
    this.addCollision(px, pz - 10, 10, 6, 4);
  }

  /**
   * 7. Small Park (Shanti Baug with trees, path, fountain, benches)
   */
  private buildSmallPark() {
    const parkX = -40;
    const parkZ = -10;

    // Grass lawn
    const lawn = new THREE.Mesh(
      new THREE.PlaneGeometry(28, 28),
      new THREE.MeshStandardMaterial({ color: 0x22c55e, roughness: 0.9 })
    );
    lawn.rotation.x = -Math.PI / 2;
    lawn.position.set(parkX, 0.05, parkZ);
    this.scene.add(lawn);

    // Curved Stone Walkway
    const path = new THREE.Mesh(
      new THREE.PlaneGeometry(4, 28),
      new THREE.MeshStandardMaterial({ color: 0xe2e8f0, roughness: 0.8 })
    );
    path.rotation.x = -Math.PI / 2;
    path.position.set(parkX, 0.06, parkZ);
    this.scene.add(path);

    // Park Fountain in center
    const fountain = new THREE.Mesh(
      new THREE.CylinderGeometry(2.5, 2.5, 0.6, 16),
      new THREE.MeshStandardMaterial({ color: 0x94a3b8 })
    );
    fountain.position.set(parkX, 0.3, parkZ);
    this.scene.add(fountain);
    this.addCollision(parkX, parkZ, 5, 5, 1.5);

    // 4 Park Benches
    const benchMat = new THREE.MeshStandardMaterial({ color: 0x78350f });
    [-6, 6].forEach((bx) => {
      const bench = new THREE.Mesh(new THREE.BoxGeometry(2.2, 0.7, 0.8), benchMat);
      bench.position.set(parkX + bx, 0.35, parkZ + 5);
      this.scene.add(bench);
    });
  }

  /**
   * 8. College Area (Godhra Arts & Commerce College)
   */
  private buildCollegeArea() {
    const cx = 60;
    const cz = -70;

    // Main College Academic Hall
    const collegeHall = new THREE.Mesh(
      new THREE.BoxGeometry(32, 10, 14),
      new THREE.MeshStandardMaterial({ color: 0xede9fe, roughness: 0.7 })
    );
    collegeHall.position.set(cx, 5, cz);
    collegeHall.castShadow = true;
    this.scene.add(collegeHall);
    this.addCollision(cx, cz, 32, 14, 10);

    // Entrance portico columns (Neoclassical Indian campus style)
    const colMat = new THREE.MeshStandardMaterial({ color: 0xffffff });
    for (let c = -3; c <= 3; c += 2) {
      const col = new THREE.Mesh(new THREE.CylinderGeometry(0.35, 0.35, 7), colMat);
      col.position.set(cx + c * 2, 3.5, cz + 8);
      this.scene.add(col);
    }

    // Triangular Pediment over Portico
    const pediment = new THREE.Mesh(
      new THREE.ConeGeometry(9, 2.5, 4),
      new THREE.MeshStandardMaterial({ color: 0x7c3aed })
    );
    pediment.position.set(cx, 8.2, cz + 8);
    pediment.rotation.y = Math.PI / 4;
    this.scene.add(pediment);

    // College Gate Banner
    const gateBanner = new THREE.Mesh(
      new THREE.BoxGeometry(16, 1.2, 0.2),
      new THREE.MeshStandardMaterial({ color: 0x5b21b6 })
    );
    gateBanner.position.set(cx, 4.5, cz + 16);
    this.scene.add(gateBanner);

    // Gate pillars
    const gp1 = new THREE.Mesh(new THREE.BoxGeometry(1.2, 5, 1.2), colMat);
    gp1.position.set(cx - 8, 2.5, cz + 16);
    this.scene.add(gp1);
    this.addCollision(cx - 8, cz + 16, 1.2, 1.2, 5);

    const gp2 = new THREE.Mesh(new THREE.BoxGeometry(1.2, 5, 1.2), colMat);
    gp2.position.set(cx + 8, 2.5, cz + 16);
    this.scene.add(gp2);
    this.addCollision(cx + 8, cz + 16, 1.2, 1.2, 5);

    this.interactiveTriggers.push({
      id: 'college_gate',
      name: 'Godhra College Campus',
      position: new THREE.Vector3(cx, 1, cz + 16),
      radius: 7,
      type: 'college',
      actionPrompt: 'Godhra Arts & Commerce College Campus Gate',
    });
  }

  /**
   * 9. Highway (Godhra Express Highway with guard rails and flyover vibe)
   */
  private buildHighway() {
    const hwZ = 95;

    // Center divider / median barrier
    const barrier = new THREE.Mesh(
      new THREE.BoxGeometry(200, 0.8, 0.6),
      new THREE.MeshStandardMaterial({ color: 0xf8fafc })
    );
    barrier.position.set(0, 0.4, hwZ);
    this.scene.add(barrier);
    this.addCollision(0, hwZ, 200, 0.8, 1);

    // Green highway direction sign: "GODHRA EXPRESS -> VADODARA / AHMEDABAD"
    const signPost = new THREE.Mesh(
      new THREE.CylinderGeometry(0.2, 0.2, 6.5),
      new THREE.MeshStandardMaterial({ color: 0x94a3b8 })
    );
    signPost.position.set(-35, 3.25, hwZ + 8);
    this.scene.add(signPost);

    const highwaySign = new THREE.Mesh(
      new THREE.BoxGeometry(10, 2.2, 0.2),
      new THREE.MeshStandardMaterial({ color: 0x15803d })
    );
    highwaySign.position.set(-35, 5.5, hwZ + 8);
    this.scene.add(highwaySign);
  }

  /**
   * 10. Business Area (Commercial Plaza & Gujarat State Co-Op Bank)
   */
  private buildBusinessArea() {
    const bx = 65;
    const bz = 15;

    // Commercial Tower 1 (Glass & steel facade)
    const tower1 = new THREE.Mesh(
      new THREE.BoxGeometry(16, 24, 16),
      new THREE.MeshStandardMaterial({
        color: 0x0284c7,
        roughness: 0.1,
        metalness: 0.85,
      })
    );
    tower1.position.set(bx, 12, bz);
    tower1.castShadow = true;
    this.scene.add(tower1);
    this.addCollision(bx, bz, 16, 16, 24);

    // Commercial Tower 2 (Stone & glass corporate hub)
    const tower2 = new THREE.Mesh(
      new THREE.BoxGeometry(14, 16, 14),
      new THREE.MeshStandardMaterial({
        color: 0x475569,
        roughness: 0.4,
        metalness: 0.4,
      })
    );
    tower2.position.set(bx + 18, 8, bz);
    tower2.castShadow = true;
    this.scene.add(tower2);
    this.addCollision(bx + 18, bz, 14, 14, 16);

    // Business sign: "GODHRA TRADE & FINANCIAL PLAZA"
    const plazaSign = new THREE.Mesh(
      new THREE.BoxGeometry(12, 1.2, 0.2),
      new THREE.MeshStandardMaterial({ color: 0x0f172a })
    );
    plazaSign.position.set(bx, 2.5, bz + 9);
    this.scene.add(plazaSign);

    this.interactiveTriggers.push({
      id: 'business_tower',
      name: 'Trade & Financial Plaza',
      position: new THREE.Vector3(bx, 1, bz + 9),
      radius: 7,
      type: 'business',
      actionPrompt: 'Godhra Trade & Financial Plaza',
    });
  }

  /**
   * Indian Trees (Banyan, Neem, Ashoka) and Night Street Lamps
   */
  private addStreetVegetation() {
    const treeTrunkMat = new THREE.MeshStandardMaterial({ color: 0x5b3a1d, roughness: 0.9 });
    const neemLeafMat = new THREE.MeshStandardMaterial({ color: 0x15803d, roughness: 0.8 });
    const banyanLeafMat = new THREE.MeshStandardMaterial({ color: 0x166534, roughness: 0.7 });

    const createTree = (x: number, z: number, isBanyan = false) => {
      const trunk = new THREE.Mesh(new THREE.CylinderGeometry(0.3, 0.5, 3.5, 8), treeTrunkMat);
      trunk.position.set(x, 1.75, z);
      trunk.castShadow = true;
      this.scene.add(trunk);

      const leafGeo = isBanyan ? new THREE.SphereGeometry(3, 8, 8) : new THREE.ConeGeometry(2.4, 4.5, 8);
      const leafMat = isBanyan ? banyanLeafMat : neemLeafMat;
      const foliage = new THREE.Mesh(leafGeo, leafMat);
      foliage.position.set(x, isBanyan ? 4.8 : 4.5, z);
      foliage.castShadow = true;
      this.scene.add(foliage);

      this.addCollision(x, z, 1.2, 1.2, 4);
    };

    // Tree positions around sidewalks and park
    const treeCoords = [
      [-45, -12, true],
      [-35, -8, false],
      [-42, 2, false],
      [-25, -20, true],
      [20, 20, false],
      [25, -45, true],
      [45, -55, false],
      [-70, -25, true],
      [-50, 50, false],
      [15, -15, false],
    ] as const;

    treeCoords.forEach(([tx, tz, isBanyan]) => {
      createTree(tx, tz, isBanyan);
    });

    // Street Lamps along roads
    const lampPoleMat = new THREE.MeshStandardMaterial({ color: 0x334155, metalness: 0.6 });
    const lampBulbMat = new THREE.MeshBasicMaterial({ color: 0xfef08a });

    const lampCoords = [
      [-15, 6],
      [15, 6],
      [-15, -6],
      [15, -6],
      [6, 25],
      [6, -25],
      [-6, 25],
      [-6, -25],
      [-45, 6],
      [45, 6],
    ];

    lampCoords.forEach(([lx, lz]) => {
      const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.15, 5.5, 8), lampPoleMat);
      pole.position.set(lx, 2.75, lz);
      this.scene.add(pole);

      const arm = new THREE.Mesh(new THREE.BoxGeometry(0.8, 0.1, 0.1), lampPoleMat);
      arm.position.set(lx + (lx < 0 ? 0.35 : -0.35), 5.4, lz);
      this.scene.add(arm);

      const bulb = new THREE.Mesh(new THREE.SphereGeometry(0.2, 8, 8), lampBulbMat);
      bulb.position.set(lx + (lx < 0 ? 0.7 : -0.7), 5.2, lz);
      this.scene.add(bulb);

      const pLight = new THREE.PointLight(0xfef08a, 0.8, 18);
      pLight.position.set(lx + (lx < 0 ? 0.7 : -0.7), 5.0, lz);
      this.scene.add(pLight);
      this.streetLights.push(pLight);
    });
  }

  public setStreetLights(enable: boolean) {
    this.streetLights.forEach((light) => {
      light.intensity = enable ? 1.0 : 0.05;
    });
  }
}
