import blockConf from '../../conf/blockConf';
import TWEEN from '../../libs/tween';

export default class BaseBlock {
  constructor(type, width) {
    this.type = type;
    this.width = width || blockConf.width;
    this.height = blockConf.height;
    this.status = 'stop';
    this.scale = 1;
  }

  _shrink () {
    const DELTA_SCALE = 0.005;
    const MIN_SCALE = 0.55;
    this.scale -= DELTA_SCALE;
    if(this.scale <= MIN_SCALE) {
      this.status = 'stop';
      return ;
    }
    this.instance.scale.y = this.scale;
    const deltaY = this.height * DELTA_SCALE / 2;
    this.instance.position.y -= deltaY;
  }

  shrink () {
    this.status = 'shrink';
  }

  update () {
    if(this.status === 'shrink') {
      this._shrink();
    }
  }

  rebound () {
    this.status = 'stop';
    this.scale = 1;
    const from = {
      y: this.instance.position.y,
      s: this.instance.scale.y,
    }
    const to = {
      y: 0,
      s: 1
    }
    new TWEEN.Tween(from)
      .to(to, 300)
      .onUpdate(v => {
        this.instance.position.y = v.y;
        this.instance.scale.y = v.s;
      })
      .start();
  }

  getVertices () {
    const vertices = [];
    const cx = this.instance.position.x;
    const cz = this.instance.position.z;
    const w = this.width / 2;

    vertices.push([cx + w, cz + w]);
    vertices.push([cx + w, cz - w]);
    vertices.push([cx - w, cz - w]);
    vertices.push([cx - w, cz + w]);

    return vertices;
  }

}