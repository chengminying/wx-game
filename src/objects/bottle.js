import bottleConf from '../../conf/bottleConf';
import blockConf from '../../conf/blockConf';
import gravity from '../../conf/gameConf';
import TWEEN from '../../libs/tween';
import audioManager from '../audio/audioManager';
import ScoreText from '../text/scoreText';

const OR = bottleConf.or;

class Bottle {
  constructor() {
    this.direction = 0;
    this.axis = null;
    this.velocity = {
      vx: 0,
      vy: 0,
    }
    this.status = "stop";
    this.scale = 1;
    this.flyTime = 0;
    this.particles = [];
  }

  init () {
    const { x, y, z } = bottleConf.position;
    const blockHeight = blockConf.height;
    
    this.group = new THREE.Group();
    this.group.name = "bottle";
    this.group.position.set(x, y + 30, z);

    const { headMaterial, topMaterial, bottomMaterial } = this.getMaterial();

    const headGeo = new THREE.OctahedronGeometry(OR);
    const head = new THREE.Mesh(headGeo, headMaterial);
    head.name = "head"
    head.castShadow = true;
    head.position.y = 3.489 * OR;
    this.head = head;

    const body = new THREE.Group();
    body.name = "body";

    const bodyBottomGeo = new THREE.CylinderGeometry(
      0.62857 * OR, 0.907143 * OR, 1.91423 * OR, 30
    );
    const bodyBottomMesh = new THREE.Mesh(bodyBottomGeo, bottomMaterial);
    bodyBottomMesh.castShadow = true;
    bodyBottomMesh.position.y = 0;

    const bodyMiddleGeo = new THREE.CylinderGeometry(
      OR / 1.4, OR / 1.4 * 0.88, OR * 1.2, 30
    );
    const bodyMiddleMesh = new THREE.Mesh(bodyMiddleGeo, bottomMaterial);
    bodyMiddleMesh.castShadow = true;
    bodyMiddleMesh.position.y = 1.3857 * OR;

    const bodyTopGeo = new THREE.SphereGeometry(OR / 1.3, 30);
    const bodyTopMesh = new THREE.Mesh(bodyTopGeo, topMaterial);
    bodyTopMesh.scale.set(1, 0.54, 1);
    bodyTopMesh.castShadow = true;
    bodyTopMesh.position.y = 1.8143 * OR;

    body.add(bodyMiddleMesh);
    body.add(bodyBottomMesh);
    body.add(bodyTopMesh);
    this.body = body;

    this.human = new THREE.Group();

    this.human.add(head);
    this.human.add(body);
    // this.bottle = new THREE.Group();
    // this.bottle.add(this.human);
    // this.bottle.position.set(2.3, 0, 0);
    // this.group.add(this.bottle);
    this.group.add(this.human);

    this.addParticle();
    this.addScoreText();
  }

  addScoreText () {
    this.scoreText = new ScoreText();
    this.scoreText.init({
      fillStyle: 0x000001
    })
    this.scoreText.instance.visible = false;
    this.scoreText.instance.rotation.y = -Math.PI / 4;
    this.scoreText.instance.scale.set(0.5, 0.5, 0.5);

    this.group.add(this.scoreText.instance)
  }

  scoreTextPopover (score) {
    const value = "+" + score;
    this.scoreText.updateScore(value);
    this.scoreText.instance.visible = true;
    this.scoreText.instance.position.y = 3;
    this.scoreText.instance.material.opacity = 1;

    const from = {y: 3, o: 1}
    const to = {y: blockConf.height + 6, o: 0}
    new TWEEN.Tween(from).to(to, 700).onUpdate(v => {
      this.scoreText.instance.material.opacity = v.o;
      this.scoreText.instance.position.y = v.y;
    }).onComplete(() => {
      this.scoreText.instance.visible = false;
    }).start();
  }

  addParticle () {
    const loader = new THREE.TextureLoader();
    const white = loader.load("res/images/white.png");
    const green = loader.load("res/images/green.png");

    for(let i = 0; i < 15; i++) {
      const geometry = new THREE.PlaneGeometry();
      const material = new THREE.MeshBasicMaterial({
        map: white,
        transparent: true,
      });
      const mesh = new THREE.Mesh(geometry, material);
      mesh.rotation.x = -Math.PI / 4;
      mesh.rotation.y = -Math.PI / 5;
      mesh.rotation.z = -Math.PI / 6;
      mesh.visible = false;
      this.particles.push(mesh);
      this.group.add(mesh);
    }

    for(let i = 0; i < 5; i++) {
      const geometry = new THREE.PlaneGeometry();
      const material = new THREE.MeshBasicMaterial({
        map: green,
        transparent: true,
      });
      const mesh = new THREE.Mesh(geometry, material);
      mesh.rotation.x = -Math.PI / 4;
      mesh.rotation.y = -Math.PI / 5;
      mesh.rotation.z = -Math.PI / 6;
      mesh.visible = false;
      this.particles.push(mesh);
      this.group.add(mesh);
    }
  }

  particleAnimation () {
    if(!this.particles.toString()) return;
    for (let i = 0; i < this.particles.length; i++) {
      this.particles[i].gathering = true;
      this.particles[i].scattering = false;
      this.gatherParticle(this.particles[i])
    }
  }

  gatherParticle (mesh) {
    mesh.scale.set(1, 1, 1);
    const minDistance = 1;
    const maxDistance = 8;
    const deltaDistance = maxDistance - minDistance;
    const signX = Math.random() > 0.5 ? 1 : -1;
    const signZ = Math.random() > 0.5 ? 1 : -1;
    mesh.position.x = Math.random() * deltaDistance * signX;
    mesh.position.y = Math.random() * deltaDistance - 3;
    mesh.position.z = Math.random() * deltaDistance * signZ;
    mesh.visible = true;
    setTimeout(() => {
      if(!mesh.gathering) return;
      const duration = 500 + Math.random() * 400;
      new TWEEN.Tween({sx: 1, sy: 1, sz: 1, ...mesh.position})
        .to({
          sx: 0.8 + Math.random(),
          sy: 0.8 + Math.random(),
          sz: 0.8 + Math.random(),
          x: Math.random() * signX,
          y: -Math.random() -3.5,
          z: Math.random() * signZ
        }, duration)
        .onUpdate(v => {
          mesh.scale.set(v.sx, v.sy, v.sz);
          mesh.position.set(v.x, v.y, v.z);
        })
        .onComplete(() => {
          if(mesh.gathering) this.gatherParticle(mesh);
        })
        .start();
    }, Math.random() * 500);
  }

  scatterAnimation () {
    if(!this.particles.toString()) return ;
    for(let i = 0; i < 10; i++) {
      this.particles[i].gathering = false;
      this.particles[i].scattering = true;
      this.scatterParticle(this.particles[i]);
    }
  }

  scatterParticle (mesh) {
    const minDistance = bottleConf.or * 0.907143;
    const maxDistance = 3;
    const deltaDistance = maxDistance - minDistance;
    const x = (minDistance + Math.random() * deltaDistance) * (1 - 2 * Math.random());
    const z = (minDistance + Math.random() * deltaDistance) * (1 - 2 * Math.random());
    mesh.scale.set(1, 1, 1);
    mesh.visible = true;
    mesh.position.x = x;
    mesh.position.y = -1;
    mesh.position.z = z;
    setTimeout(() => {
      if(!mesh.scattering) return;
      const duration = 200 + Math.random() * 100;
      new TWEEN.Tween({sx: 1, sy: 1, sz: 1, ...mesh.position})
        .to({
          sx: 1,
          sy: 1,
          sz: 1,
          x: 2 * x,
          y: Math.random(),
          z: 2 * z
        }, duration)
        .onUpdate(v => {
          mesh.scale.set(v.sx, v.sy, v.sz);
          mesh.position.set(v.x, v.y, v.z);
        })
        .onComplete(() => {
          mesh.scattering = false;
          mesh.visible = false;
        })
        .start();
    }, Math.random() * 200);
  }

  resetParticle () {
    if(!this.particles.toString()) return ;
    for(let i = 0; i < this.particles.length; i++) {
      this.particles[i].gathering = false;
      this.particles[i].scattering = false;
      this.particles[i].visible = false;
    }
  }

  getMaterial () {
    const loader = new THREE.TextureLoader();

    const bottomTexture = loader.load('res/images/bottom.png');
    const bottomMaterial =  new THREE.MeshBasicMaterial({
      map: bottomTexture
    })

    const topTexture = loader.load('res/images/top.png');
    const topMaterial = new THREE.MeshBasicMaterial({
      map: topTexture
    })

    const headTexture = loader.load('res/images/head.png');
    const headMaterial = new THREE.MeshBasicMaterial({
      map: headTexture
    })
    return {
      bottomMaterial,
      topMaterial,
      headMaterial
    }
  }

  fall () {
    this.status = "fall";
    audioManager["icon"].play();
    const from = { ...this.group.position };
    const to = {
      x: bottleConf.position.x,
      y: bottleConf.position.y + blockConf.height / 2 + OR,
      z: bottleConf.position.z,
    }
    new TWEEN.Tween(from)
      .to(to, 1000)
      .easing(TWEEN.Easing.Bounce.Out)
      .onUpdate(v => {
        this.group.position.set(v.x, v.y, v.z);
      })
      .onComplete(() => {
        this.status = "stop";
      })
      .start();
  }

  update () {
    this.head.rotation.y += 0.05;

    if(this.status === 'shrink') {
      this._shrink();
    } else if (this.status === 'jump') {
      const tickTime = Date.now() - this.lastTime;
      this._jump(tickTime);
    }
    this.lastTime = Date.now();
  }

  shrink () {
    this.status = 'shrink';
    this.particleAnimation();
  }

  stopShrink() {
    this.status = 'stop';
    this.scale = 1;
    this.flyTime = 0;

  }

  jump () {
    this.status = "jump";
    this.resetParticle();
  }

  _jump (tickTime) {
    const t = tickTime / 1000;
    //水平面匀速直线运动 运动距离
    const translate = this.velocity.vx * t;

    //竖直上抛公式算出运动距离
    const translateY = this.velocity.vy * t - 0.5 * gravity.g * t * t - gravity.g * this.flyTime * t;
    this.group.translateY(translateY);
    this.group.translateOnAxis(this.axis, translate);
    this.flyTime = this.flyTime + t;

  }

  //因为伸缩的时候头部不能发生变化，所以只改变body的scale和整体scale
  _shrink () {                                                                                                                                                                       
    const MIN_SCALE = 0.55; //最小缩小比例
    const HORIZON_DELTA_SCALE = 0.007; //水平方向伸缩
    const HEAD_DELTA = 0.03; //头部模型y轴运动距离
    const DELTA_SCALE = 0.005;  //竖直方向伸缩

    this.scale -= DELTA_SCALE;
    if(this.scale <= MIN_SCALE) {
      return ;
    }
    this.body.scale.y = this.scale;
    this.body.scale.x += HORIZON_DELTA_SCALE;
    this.body.scale.z += HORIZON_DELTA_SCALE;

    this.head.position.y -= HEAD_DELTA;

    const headDeltaY = HEAD_DELTA / 2;
    const bodyDeltaY = blockConf.height * DELTA_SCALE;
    this.human.position.y -= (headDeltaY + bodyDeltaY);
  }

  setDirection (direction, axis) {
    this.direction = direction;
    this.axis = axis;
  }

  frontFall () {
    const w = 3 * bottleConf.or;
    this.status = "frontFall";
    const x = this.group.position.x;
    const z = this.group.position.z;
    new TWEEN.Tween({rotation: 0, x, z })
      .to({ rotation: Math.PI / 2, x: x - w, z: z + w }, 1000)
      .onUpdate(v => {
        if(this.direction === 0) {
          this.group.rotation.z = v.rotation;
          this.group.position.x = v.x;
        } else {
          this.group.rotation.x = v.rotation;
          this.group.position.z = v.z;
        }
      })
      .start();
    new TWEEN.Tween({y: this.group.position.y})
      .to({y: this.group.position.y + 0.2}, 200)
      .onUpdate(v => {
        this.group.position.y = v.y;
      }).start();
    new TWEEN.Tween({y: this.group.position.y})
      .to({y: -3}, 400)
      .onUpdate(v => {
        this.group.position.y = v.y;
      })
      .delay(500)
      .start();
  }

  backFall () {
    const w = 3 * bottleConf.or;
    this.status = "backFall";
    const x = this.group.position.x;
    const z = this.group.position.z;
    new TWEEN.Tween({rotation: 0, x, z})
      .to({ rotation: -Math.PI / 2, x: x + w, z: z - w}, 1000)
      .onUpdate(v => {
        if(this.direction === 0) {
          this.group.rotation.z = v.rotation;
          this.group.position.x = v.x;
        } else {
          this.group.rotation.x = v.rotation;
          this.group.position.z = v.z;
        }
      })
      .start();
    new TWEEN.Tween({y: this.group.position.y})
      .to({y: this.group.position.y + 0.2}, 200)
      .onUpdate(v => {
        this.group.position.y = v.y;
      }).start();
    new TWEEN.Tween({ y: this.group.position.y })
      .to({y: -3}, 400)
      .onUpdate(v => {
        this.group.position.y = v.y;
      })
      .delay(350)
      .start();
  }

  verticalFal () {
    this.status = "verticalFall";
    new TWEEN.Tween({y: this.group.position.y })
      .to({y: -3}, 1000)
      .onUpdate(v => {
        this.group.position.y = v.y;
      }).start();
  }

  rotate () {
    // const groupH = bottleConf.position.y + blockConf.height / 2 + OR;
    const from = {
      scaleX: this.body.scale.x,
      scaleY: this.body.scale.y,
      scaleZ: this.body.scale.z,
      headY: this.head.position.y,
      humanY: this.human.position.y,
      rotation: 0
    }
    const to = {
      scaleX: 1,
      scaleY: 1,
      scaleZ: 1,
      headY: 3.489 * OR,
      humanY: 0,
      rotation: -Math.PI * 2
    }
    new TWEEN.Tween(from)
      .to(to, 300)
      .onUpdate(v => {
        this.body.scale.set(v.scaleX, v.scaleY, v.scaleZ);
        this.head.position.y = v.headY;
        this.human.position.y = v.humanY;
        //为0时代表x轴方向，所以旋转是根据z轴旋转, 为1时代表z轴方向，所以旋转是根据x轴旋转
        this.direction === 0 ? this.human.rotation.z = v.rotation : this.human.rotation.x = v.rotation;
      }) 
      .start();
  }

  reset () {
    const { x, y, z } = bottleConf.position;
    this.stopShrink();
    this.group.rotation.set(0, 0, 0);
    this.group.position.set(x, y + 30, z);
    this.human.rotation.set(0, 0, 0);
  }
}

export default new Bottle();