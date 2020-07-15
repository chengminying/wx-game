class Ground {
  constructor () {
    this.instance = null;
  }

  init () {
    const geometry = new THREE.PlaneGeometry(200, 200);
    const material = new THREE.ShadowMaterial({
      transparent: true,
      opacity: 0.3,
      color: 0x000000
    })
    this.instance = new THREE.Mesh(geometry, material);
    this.instance.receiveShadow = true;
    this.instance.name = "地面";
    this.instance.rotation.x = -Math.PI / 2;
    // this.instance.position.y = -16 / 3.2;
    this.instance.position.y = -5;
  }

  updatePosition (position) {
    this.instance.position.x = position.x;
    this.instance.position.z = position.z;
  }

  reset () {
    this.instance.position.x = 0;
    this.instance.position.z = 0;
  }
}

export default new Ground();