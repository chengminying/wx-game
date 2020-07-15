import sceneConf from '../../conf/sceneConf';
import TWEEN from '../../libs/tween';

class Camera {
  constructor() {
    this.instance = null;
  }

  init () {
    const aspect = window.innerHeight / window.innerWidth;
    const s = sceneConf.frustumSize;
    this.instance = new THREE.OrthographicCamera(-s, s, s * aspect, -s * aspect, -100 , 85);
    this.cameraPosition = new THREE.Vector3(-10, 10, 10)
    this.instance.position.copy(this.cameraPosition);
    // this.instance.position.set(-10, 0, 0);
    // this.instance.position.set(0, 0, 10);
    this.targetPosition = new THREE.Vector3(0, 0, 0);
    this.instance.lookAt(this.targetPosition);
   
  }

  updatePosition (position) {
    const from = {
      x: this.targetPosition.x,
      y: this.targetPosition.y,
      z: this.targetPosition.z,
      px: this.instance.position.x,
      py: this.instance.position.y,
      pz: this.instance.position.z,
    }
    const to = {
      ...position,
      px: position.x - 10,
      py: position.y + 10,
      pz: position.z + 10,
    }
    new TWEEN.Tween(from)
      .to(to, 300)
      .onUpdate(v => {
        this.instance.position.set(v.px, v.py, v.pz);
        this.instance.lookAt(v.x, v.y, v.z)
        // this.instance.updateProjectionMatrix();
      })
      .onComplete(v => {
        this.targetPosition = new THREE.Vector3(v.x, v.y, v.z);
      })
      .start();
  }

  reset () {
    this.instance.position.set(-10, 10, 10);
    this.instance.lookAt(0, 0, 0);
    this.targetPosition.set(0, 0, 0);
  }
}

export default new Camera();