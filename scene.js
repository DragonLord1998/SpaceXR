// scene.js
export async function createScene(engine, canvas) {
    const scene = new BABYLON.Scene(engine);
    // Root for grouping all meshes
    const root = new BABYLON.TransformNode('root', scene);
    // Light
    new BABYLON.HemisphericLight('light', new BABYLON.Vector3(1, 1, 0), scene);

    // Sun
    const sun = BABYLON.MeshBuilder.CreateSphere('sun', { diameter: 2 }, scene);
    const sunMat = new BABYLON.StandardMaterial('sunMat', scene);
    sunMat.emissiveColor = new BABYLON.Color3(1, 1, 0);
    sun.material = sunMat;
    sun.parent = root;

    // Planets
    const planetsData = [
      { name: 'mercury', diameter: 0.4, distance: 5,  color: new BABYLON.Color3(0.5,0.5,0.5), speed: 0.005,  angle: 0 },
      { name: 'venus',   diameter: 0.9, distance: 8,  color: new BABYLON.Color3(1,0.7,0),    speed: 0.004,  angle: 0 },
      { name: 'earth',   diameter: 1,   distance: 11, color: new BABYLON.Color3(0,0.5,1),    speed: 0.003,  angle: 0 },
      { name: 'mars',    diameter: 0.7, distance: 14, color: new BABYLON.Color3(1,0,0),      speed: 0.002,  angle: 0 },
      { name: 'jupiter', diameter: 2.2, distance: 17, color: new BABYLON.Color3(1,0.6,0.2),  speed: 0.0015,angle: 0 },
      { name: 'saturn',  diameter: 1.9, distance: 21, color: new BABYLON.Color3(0.9,0.8,0.5), speed: 0.0012,angle: 0 },
      { name: 'uranus',  diameter: 1.5, distance: 25, color: new BABYLON.Color3(0.4,0.8,0.9), speed: 0.0009,angle: 0 },
      { name: 'neptune', diameter: 1.5, distance: 29, color: new BABYLON.Color3(0.3,0.3,1),   speed: 0.0007,angle: 0 }
    ];
    const planets = planetsData.map(p => {
      const mesh = BABYLON.MeshBuilder.CreateSphere(p.name, { diameter: p.diameter }, scene);
      mesh.material = new BABYLON.StandardMaterial(p.name + 'Mat', scene);
      mesh.material.diffuseColor = p.color;
      mesh.position.x = p.distance;
      mesh.parent = root;
      return { ...p, mesh };
    });
    scene.registerBeforeRender(() => {
      planets.forEach(p => {
        p.angle += p.speed;
        p.mesh.position.x = Math.cos(p.angle) * p.distance;
        p.mesh.position.z = Math.sin(p.angle) * p.distance;
      });
    });

    // Ship
    const ship = BABYLON.MeshBuilder.CreateBox('ship', { height: 0.5, width: 0.5, depth: 1 }, scene);
    ship.material = new BABYLON.StandardMaterial('shipMat', scene);
    ship.material.diffuseColor = new BABYLON.Color3(0.7, 0.7, 0.7);
    ship.position = new BABYLON.Vector3(0, 0, -10);
    ship.parent = root;
    // Nose cone
    const nose = BABYLON.MeshBuilder.CreateCylinder('noseCone', { diameterTop: 0, diameterBottom: 0.3, height: 0.7, tessellation: 16 }, scene);
    nose.rotation.x = Math.PI/2;
    nose.position = new BABYLON.Vector3(0, 0, 0.85);
    nose.parent = ship;
    // Wings
    const wingOpts = { width: 1.5, height: 0.5 };
    const wingL = BABYLON.MeshBuilder.CreatePlane('wingLeft', wingOpts, scene);
    wingL.rotation.x = Math.PI/2;
    wingL.position = new BABYLON.Vector3(-1, 0, 0);
    wingL.material = ship.material;
    wingL.parent = ship;
    const wingR = wingL.clone('wingRight');
    wingR.position.x = 1;

    // Controls
    const inputMap = {};
    scene.actionManager = new BABYLON.ActionManager(scene);
    scene.actionManager.registerAction(new BABYLON.ExecuteCodeAction(BABYLON.ActionManager.OnKeyDownTrigger, evt => inputMap[evt.sourceEvent.key.toLowerCase()] = true));
    scene.actionManager.registerAction(new BABYLON.ExecuteCodeAction(BABYLON.ActionManager.OnKeyUpTrigger, evt => inputMap[evt.sourceEvent.key.toLowerCase()] = false));
    scene.registerBeforeRender(() => {
      const speed = 0.1, rot = 0.02;
      if (inputMap['w']) ship.translate(BABYLON.Axis.Z, speed, BABYLON.Space.LOCAL);
      if (inputMap['s']) ship.translate(BABYLON.Axis.Z, -speed, BABYLON.Space.LOCAL);
      if (inputMap['a']) ship.rotate(BABYLON.Axis.Y, -rot, BABYLON.Space.LOCAL);
      if (inputMap['d']) ship.rotate(BABYLON.Axis.Y, rot, BABYLON.Space.LOCAL);
      if (inputMap['r']) ship.translate(BABYLON.Axis.Y, speed, BABYLON.Space.LOCAL);
      if (inputMap['f']) ship.translate(BABYLON.Axis.Y, -speed, BABYLON.Space.LOCAL);
    });

    // Isometric camera
    const isoCam = new BABYLON.ArcRotateCamera('isoCam', Math.PI/4, Math.PI/4, 50, BABYLON.Vector3.Zero(), scene);
    isoCam.mode = BABYLON.Camera.ORTHOGRAPHIC_CAMERA;
    const ratio = engine.getRenderWidth() / engine.getRenderHeight();
    const size = 20;
    isoCam.orthoLeft = -size * ratio;
    isoCam.orthoRight = size * ratio;
    isoCam.orthoTop = size;
    isoCam.orthoBottom = -size;
    isoCam.attachControl(canvas, true);

    return { scene, isoCam, root };
}