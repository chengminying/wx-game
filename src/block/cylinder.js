import BaseBlock from './base';
import blockConf from '../../conf/blockConf';
import { blockShader } from '../shader/blockShader';

export default class CylinderBlock extends BaseBlock {
  constructor(x, y, z, colorType, width) {
    super('cylinder');
    const w = width || this.width;
    this.loader = new THREE.TextureLoader();
    width = width || this.width;
    colorType = colorType || "color";
    this.instance = this.getMesh(colorType, width);
    this.instance.receiveShadow = true;
    this.instance.castShadow = true;
    this.instance.name = "block";
    this.x = x;
    this.y = y;
    this.z = z;
    this.instance.position.set(this.x, this.y, this.z);
  }

  getMesh (type, width) {
    var geometry = new THREE.CylinderBufferGeometry(width / 2, width / 2, this.height, 30);
    switch (type) {
      case "paper":
        var material1 = new THREE.MeshLambertMaterial({
          map: this.loader.load(blockConf.cylinderType[type][0])
        });
        var material2 = new THREE.MeshLambertMaterial({
          map: this.loader.load(blockConf.cylinderType[type][1])
        });
        var mesh = new THREE.Mesh(geometry, [material2, material1]);
        mesh.rotation.y = Math.PI + 0.5;
        return mesh;
      case "color": 
        const seed = Math.floor(Math.random() * 6);
        var material = blockShader();
        material.lights = true;
        material.uniforms["u_innerColor"].value = new THREE.Color(blockConf.innerColor);
        material.uniforms["u_outColor"].value = new THREE.Color(blockConf.colors[seed]);
        material.uniforms["u_innerH"].value = blockConf.innerH;
        return new THREE.Mesh(geometry, material);
      default:
        var material = new THREE.MeshPhongMaterial({color: 0xffffff });
        return new THREE.Mesh(geometry, material);
    }
  }
}