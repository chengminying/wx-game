import BaseBlock from './base';
import utils from '../utils/utils';
import blockConf from '../../conf/blockConf';
import { blockShader } from '../shader/blockShader';

export default class CubeBlock extends BaseBlock {
  constructor(x, y, z, colorType, width) {
    super('cube');
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
    const texturePath = blockConf.cubeType;
    var geometry = new THREE.BoxGeometry(width, this.height, width);
    switch (type) {
      case "well":
        var material = new THREE.MeshLambertMaterial({
          map: this.loader.load(texturePath.well)
        });
        utils.mapUv(280, 428, geometry, 1, 0, 0, 280, 148);
        utils.mapUv(280, 428, geometry, 2, 0, 148, 280, 428);
        utils.mapUv(280, 428, geometry, 4, 0, 0, 280, 148, true);
        return new THREE.Mesh(geometry, material);
      case "box_bottom": 
        var material = new THREE.MeshLambertMaterial({
          map: this.loader.load(texturePath.box_bottom)
        });
        utils.mapUv(444, 150, geometry, 1, 0, 0, 148, 150);
        utils.mapUv(444, 150, geometry, 2, 148, 0, 296, 150);
        utils.mapUv(444, 150, geometry, 4, 296, 0, 444, 150);
        return new THREE.Mesh(geometry, material);
      case "box_middle": 
        var material = new THREE.MeshLambertMaterial({
          map: this.loader.load(texturePath.box_middle)
        });
        // material.map.center.set(0.5, 0.5);
        // material.map.rotation = Math.PI / 2;
        utils.mapUv(444, 150, geometry, 1, 0, 0, 148, 150);
        utils.mapUv(444, 150, geometry, 2, 148, 0, 296, 150);
        utils.mapUv(444, 150, geometry, 4, 296, 0, 444, 150);
        return new THREE.Mesh(geometry, material);
      case "express": 
        var material = new THREE.MeshLambertMaterial({
          map: this.loader.load(texturePath.express)
        });
        utils.mapUv(428, 428, geometry, 1, 0, 138, 290, 428);
        utils.mapUv(428, 428, geometry, 2, 0, 0, 290, 138);
        utils.mapUv(428, 428, geometry, 4, 280, 140, 428, 428);
        return new THREE.Mesh(geometry, material);
      case "sing": 
        var material = new THREE.MeshLambertMaterial({
          map: this.loader.load(texturePath.sing)
        });
        utils.mapUv(416, 416, geometry, 1, 0, 0, 274, 161);
        utils.mapUv(416, 416, geometry, 2, 256, 146, 416, 416);
        utils.mapUv(416, 416, geometry, 4, 0, 161, 274, 416);
        return new THREE.Mesh(geometry, material);
      case "tit": 
        var material = new THREE.MeshLambertMaterial({
          map: this.loader.load(texturePath.tit)
        });
        utils.mapUv(310, 310, geometry, 1, 0, 0, 214, 110);
        utils.mapUv(310, 310, geometry, 4, 200, 110, 310, 310);
        utils.mapUv(310, 310, geometry, 2, 0, 110, 200, 310);
        return new THREE.Mesh(geometry, material);
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

