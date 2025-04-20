// main.js
import { createScene } from './scene.js';

window.addEventListener('DOMContentLoaded', async () => {
    const canvas = document.getElementById('renderCanvas');
    const engine = new BABYLON.Engine(canvas, true);
    const { scene, isoCam, root } = await createScene(engine, canvas);

    // UI buttons
    const enterAR = document.getElementById('enterAR');
    const exitAR = document.getElementById('exitAR');
    let xrHelper = null;

    // Disable AR if not secure or unsupported
    if (!window.isSecureContext) {
        enterAR.disabled = true;
        enterAR.textContent = 'AR requires HTTPS';
    } else if (navigator.xr) {
        navigator.xr.isSessionSupported('immersive-ar').then(supported => {
            if (!supported) {
                enterAR.disabled = true;
                enterAR.textContent = 'AR not supported';
            }
        });
    }

    // Enter AR
    enterAR.addEventListener('click', async () => {
        try {
            xrHelper = await scene.createDefaultXRExperienceAsync({
                uiOptions: { sessionMode: 'immersive-ar' },
                optionalFeatures: true
            });
            const hitTest = xrHelper.baseExperience.featuresManager.enableFeature(
                BABYLON.WebXRHitTest, 'latest', {
                    offsetRay: new BABYLON.Ray(new BABYLON.Vector3(0, 0, 0), new BABYLON.Vector3(0, 0, -1)),
                    preferredTrackableTypes: [BABYLON.XRHitTestTrackableType.Plane]
                }
            );
            hitTest.onHitTestResultObservable.add(results => {
                if (results.length) {
                    const m = results[0].transformationMatrix;
                    root.position.set(m.m[12], m.m[13], m.m[14]);
                    hitTest.detach();
                }
            });
            enterAR.style.display = 'none';
            exitAR.style.display = 'block';
        } catch (e) {
            console.error(e);
            alert('AR not supported or permission denied');
        }
    });

    // Exit AR
    exitAR.addEventListener('click', async () => {
        if (xrHelper) {
            await xrHelper.baseExperience.exitXRAsync();
            xrHelper = null;
            enterAR.style.display = 'block';
            exitAR.style.display = 'none';
            scene.activeCamera = isoCam;
        }
    });

    engine.runRenderLoop(() => scene.render());
    window.addEventListener('resize', () => engine.resize());
});