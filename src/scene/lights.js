import TWEEN from '../../libs/tween';

class Lights {
  constructor() {
    this.instance = {};
  }

  init () {
    this.ambientLight = new THREE.AmbientLight(0xffffff, 0.8);
    this.directionalLight = new THREE.DirectionalLight(0xffffff, 0.3);

    this.directionalLight.position.set(10, 30, 20);

    this.directionalLight.castShadow = true;
    this.directionalLight.shadow.camera.near = 0.1;
    this.directionalLight.shadow.camera.far = 500;
    this.directionalLight.shadow.camera.left = -100;
    this.directionalLight.shadow.camera.right = 100;
    this.directionalLight.shadow.camera.top = 100;
    this.directionalLight.shadow.camera.bottom = -100;
    this.directionalLight.shadow.mapSize.width = 1024;
    this.directionalLight.shadow.mapSize.height = 1024;

    const basicMaterial = new THREE.MeshPhongMaterial({ color: 0xff0000 });
    this.shadowTarget = new THREE.Mesh(new THREE.PlaneGeometry(0.1, 0.1, 0.1), basicMaterial);
    this.shadowTarget.visible = false;
    this.shadowTarget.name = 'shadowTarget';

    this.directionalLight.target = this.shadowTarget;

    this.instance.ambientLight = this.ambientLight;
    this.instance.DirectionalLight = this.directionalLight;
    this.instance.shadowTarget = this.shadowTarget;
  }

  updatePosition (targetPosition) {
    const from = {
      ...this.directionalLight.target.position,
      px: this.directionalLight.position.x,
      py: this.directionalLight.position.y,
      pz: this.directionalLight.position.z,
    }
    const to = {
      ...targetPosition,
      px: targetPosition.x + 10,
      py: targetPosition.y + 30,
      pz: targetPosition.z + 20,
    }
    new TWEEN.Tween(from)
      .to(to, 300)
      .onUpdate(v => {
        this.directionalLight.position.set(v.px, v.py, v.pz);
        this.shadowTarget.position.set(v.x, v.y, v.z);
      })
      .start();
  }

  reset () {
    this.directionalLight.position.set(10, 30, 20);
    this.shadowTarget.position.set(0, 0, 0);
  }
}

export default new Lights();