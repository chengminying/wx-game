import { scene } from '../scene/index';
import CubeBlock from '../block/cube';
import CylinderBlock from '../block/cylinder';
import ground from '../objects/ground';
import bottle from '../objects/bottle';
import TWEEN from '../../libs/tween';
import blockConf from '../../conf/blockConf';
import bottleConf from '../../conf/bottleConf';
import gameConf from '../../conf/gameConf';
import ScoreText from '../text/scoreText';
import utils from '../utils/utils';
import audioManager from '../audio/audioManager';

//定义bottle跳跃的状态
//跳到了下个方块的 中心点
const HIT_NEXT_BLOCK_CENTER = 1;
//跳到了下个方块上，但是距离中心点比较远
const HIT_NEXT_BLOCK_NOT_CENTER = 2;
//跳到了当前的方块上, 不终止游戏，也不得分
const HIT_CURRENT_BLOCK = 3;
//跳到了下个方块的后面，游戏结束
const HIT_NEXT_BLOCK_BACK_GAME_OVER = 4;
//跳到了下个方块的前面，游戏结束
const HIT_NEXT_BLOCK_FRONT_GAME_OVER = 5;
//跳到了当前方块的后面，没有跳到下一个方块上，游戏结束
const HIT_CURRENT_BLOCK_BACK_GAME_OVER = 6;
//极端情况，当两个方块距离非常近时，bottle跳到了两个方块上
const HIT_BOTH_GAME_OVER = 7;

export default class GamePage {
  constructor(callbacks) {
    this.callbacks = callbacks;
    this.targetPosition = {};
    this.axis = null;
    this.checkingHit = false;
    this.score = 0;
    this.combo = 0;
    this.touchStatus = "end";
    this.delayScore = null;
    this.blockType = "default";
  }

  init () {
    audioManager.init();

    this.scene = scene;
    this.bottle = bottle;
    this.ground = ground;
    this.scoreText = new ScoreText();

    this.ground.init();
    this.scene.init();
    this.bottle.init();
    this.scoreText.init({
      fillStyle: 0x666699
    });

    //人物模型
    this.addBottle();

    //地面
    this.addGround();

    //添加块
    this.addBlock();

    //监听触摸事件
    this.bindTouch();

    //添加分数字体
    this.addScore();

    //渲染
    this.render();
  }

  render () {
    //bottle实例化之后，更新bottle状态
    if(this.bottle) this.bottle.update();
    //currentBlock实例化之后，更新currentBlock状态
    if(this.currentBlock) this.currentBlock.update();
    //bottle飞行时，检测飞行有没有结束，以便触发飞行结束后的内容
    if(this.checkingHit) this.checkBottleHit();

    this.scene.render();
    TWEEN.update();
    requestAnimationFrame(this.render.bind(this));
  }

  bindTouch () {
    canvas.addEventListener("touchstart", this.touchstartCallback);
    canvas.addEventListener("touchend", this.touchendCallback);
  }

  removeTouch () {
    canvas.removeEventListener("touchstart", this.touchstartCallback);
    canvas.removeEventListener("touchend", this.touchendCallback);
  }

  touchstartCallback = () => {
    if(this.delayScore) clearTimeout(this.delayScore);
    if(this.bottle.status === "jump" || this.bottle.status === "fall" ) return;
    if(this.touchStatus !== "end") return ;
    this.blockType = "default";
    this.touchStatus = "start";
    this.touchStartTime = Date.now();
    this.bottle.shrink();
    this.currentBlock.shrink();
    audioManager["scale_intro"].play();
  }

  touchendCallback = () => {
    if(this.bottle.status === "jump" || this.bottle.status === "fall" ) return;
    if(this.touchStatus !== "start") return ;
    this.touchStatus = "end";
    this.touchEndTime = Date.now();
    this.currentBlock.rebound();
    const duration = this.touchEndTime - this.touchStartTime;
    //水平方向初速度， 初速度上限值为400
    this.bottle.velocity.vx = +(Math.min(duration / 7, 400)).toFixed(2); 
    //竖直方向 有个比较大的初速度，可以使得瓶子跳起来
    this.bottle.velocity.vy = +(Math.min(120 + duration / 20, 400)).toFixed(2); 
    this.bottle.stopShrink();
    //block 下压的距离
    const deltaY = blockConf.height * (1 - this.currentBlock.instance.scale.y);
    //碰撞检测
    this.hitStatus = this.getHitStatus(this.bottle, this.currentBlock, this.nextBlock, deltaY);
    this.bottle.rotate();
    this.bottle.jump();
    console.log(this.blockType)
    this.addDelayScore(this.blockType);
    //
    this.checkingHit = true;
    audioManager["scale_intro"].stop();
    audioManager["scale_loop"].stop();
  }

  setDirection (direction) {
    const currentPosition = {
      x: this.bottle.group.position.x,
      z: this.bottle.group.position.z,
    }
    const x = this.targetPosition.x - currentPosition.x;
    const z = this.targetPosition.z - currentPosition.z;
    const y = this.targetPosition.y - 0;
    this.axis = new THREE.Vector3(x, y, z);
    this.axis.normalize();
    this.bottle.setDirection(direction, this.axis);
  }

  addBlock () {
    this.currentBlock = new CubeBlock(-15, 0, 0, "color");
    this.nextBlock = new CylinderBlock(23, 0, 0, "color");
    this.targetPosition = {
      x: 23, y: 0, z: 0
    }
    this.setDirection(0);
    this.scene.instance.add(this.currentBlock.instance);
    this.scene.instance.add(this.nextBlock.instance);
  }

  addBottle () {
    this.scene.instance.add(this.bottle.group);
    this.bottle.fall();
  }

  addGround () {
    this.scene.instance.add(ground.instance);
  }

  addScore () {
    this.scene.addScore(this.scoreText.instance)
  }

  updateScore (score) {
    this.scoreText.updateScore(score);
    // this.scene.updateScore(this.scoreText.instance);
  }

  /**
   *当page touchend 之后马上计算bottle是否能到达下一个block，
   *利用竖直上抛算出运动时间，然后用时间算出 水平面运动是否可以到达下一个block的平面
   *
   * @param {*} bottle 
   * @param {*} currentBlock 当前bottle站立的block
   * @param {*} nextBlock 下个目标block
   * @param {*} deltaY  从touchstart到touchend结束时，block 下压的距离， 计算竖直上抛时需要用到
   * @returns
   * @memberof GamePage
   */
  getHitStatus (bottle, currentBlock, nextBlock, deltaY) {
    //bottle 竖直方向的初速度
    const vy = this.bottle.velocity.vy;
    //bottle 水平方向初速度
    const vx = this.bottle.velocity.vx;
    //重力加速度
    const g = gameConf.g;
    //落回到原点的时间
    let flyTime = (2 * vy) / g;
    //bottle下压的距离
    deltaY = deltaY || this.bottle.group.position.y.toFixed(2);
    //block高度的一半
    // const differenceY = blockConf.height / 2;
    //在下压的距离回落到 下个block平面上所需要的时间
    const time = ((-vy + Math.sqrt(vy * vy - 2 * g * deltaY)) / -g);
    //回到原点的时间 减去 下压距离飞行的时间， 就是bottle飞行在空间的时间
    flyTime -= time;
    //bottle终点数组, 2维坐标
    const destination = [];
    //bottle的位置
    const bottlePosition = new THREE.Vector2(this.bottle.group.position.x, this.bottle.group.position.z);
    //沿着运动的轴，运动的距离, 将轴拉长
    const translate = new THREE.Vector2(this.axis.x, this.axis.z).setLength(vx * flyTime);
    //将bottle当前的位置向量和运动距离向量相加 得到终点的位置向量
    bottlePosition.add(translate);
    //将终点位置向量挂载到bottle实例上，可以方便后续bottle中方法调用
    this.bottle.destination = bottlePosition;
    //放入终点数组
    destination.push(bottlePosition.x, bottlePosition.y);

    if(nextBlock) {
      //下一个block位置的x
      const nx = nextBlock.instance.position.x;
      //下一个block位置的z
      const nz = nextBlock.instance.position.z;
      //位置向量
      const nextVec = new THREE.Vector2(nx, nz);
      //计算 当前bottle位置 离 下一个block中心点的位置
      const diff = bottlePosition.distanceTo(nextVec);
      //获取下一个block的顶点多边形，都是正方形
      const nextPolygon = nextBlock.getVertices();
      //当前block的顶点多边形
      const currentPolygon = currentBlock.getVertices();
      //bottle width
      const w = bottleConf.or * 0.9;
      //两种情况，点击时间过短，跳的还是当前的block
      //正常情况跳到下一个block
      let result1, result2;
      // console.log(destination, nextPolygon);
      //跳跃的终点下个block之前 有两个方向上的
      const next_front = utils.pointInPolygon([destination[0] + w, destination[1]], nextPolygon)
                          || utils.pointInPolygon([destination[0], destination[1] - w], nextPolygon); 
      //跳跃的终点下个block之后 有两个方向上的
      const next_back = utils.pointInPolygon([destination[0] - w, destination[1]], nextPolygon)
                          || utils.pointInPolygon([destination[0], destination[1] + w], nextPolygon);

      //如果跳到 下个block上的情况 4种
      if(utils.pointInPolygon(destination, nextPolygon)) {
        if(diff < 1.5) {
          result1 = HIT_NEXT_BLOCK_CENTER;
        } else {
          result1 = HIT_NEXT_BLOCK_NOT_CENTER;
        }
      } else if (next_front) { //下个block前
        result1 = HIT_NEXT_BLOCK_FRONT_GAME_OVER;
      } else if (next_back) { //下个block后
        result1 = HIT_NEXT_BLOCK_BACK_GAME_OVER;
      }

      const current_back = utils.pointInPolygon([destination[0] - w, destination[1]], currentPolygon)
                            || utils.pointInPolygon([destination[0], destination[1] - w], currentPolygon);
      //如果跳到当前 block上的情况 3种
      if(utils.pointInPolygon(destination, currentPolygon)) {
        result2 = HIT_CURRENT_BLOCK;
      } else if (current_back) {
        if(result1) { //如果当前bottle 在nextBlock上也在当前block上 触发
          result2 = HIT_BOTH_GAME_OVER;
        }
        result2 = HIT_CURRENT_BLOCK_BACK_GAME_OVER;
      }

      return result1 || result2 || false;
    }

  }

  /**
   *bottle飞出后已经知道了结果， 那么需要在飞行的空中 一直去check 飞行的位置，
   *直到，到达指定的destination就继续游戏 或者 游戏结束 分别操作
   *
   * @memberof GamePage
   */
  checkBottleHit () {
    //
    const checking = this.checkingHit 
                      && this.bottle.group.position.y <= blockConf.height / 2
                      && this.bottle.status === 'jump' //bottle的状态必须要jump
                      && this.bottle.flyTime > 0.3; //bottle翻转时间

    if(!checking) return; 

    this.checkingHit = false;
    //当状态为这两个时，会生成下一个block
    const next_center = this.hitStatus === HIT_NEXT_BLOCK_CENTER;
    const not_center = this.hitStatus === HIT_NEXT_BLOCK_NOT_CENTER;
    //当状态为这三种时，游戏继续进行
    const gameContinue = next_center || not_center || this.hitStatus === HIT_CURRENT_BLOCK;

    //游戏继续
    if(gameContinue) {
      this.bottle.scatterAnimation();
      this.state = 'stop';
      this.bottle.stopShrink();
      this.bottle.group.position.y = blockConf.height / 2 + bottleConf.or;
      // bottle.group.position.y = 0;
      this.bottle.group.position.x = this.bottle.destination.x;
      this.bottle.group.position.z = this.bottle.destination.y;

      //生成下一个block，移动相机位置
      if(next_center) {
        this.combo++;
        audioManager['combo'+ (this.combo <= 8 ? this.combo : 8)].play();
        this.score += 2 * this.combo;
        this.blockType = this.updateNextBlock();
        this.bottle.scoreTextPopover(2 * this.combo);
        this.updateScore(this.score);


      } else if(not_center) {
        this.combo = 0;
        audioManager['success'].play();
        this.blockType = this.updateNextBlock();
        this.bottle.scoreTextPopover(1);
        this.updateScore(++this.score);
      }

    } else {
      const next_block_back = this.hitStatus === HIT_NEXT_BLOCK_BACK_GAME_OVER;
      const next_block_front = this.hitStatus === HIT_NEXT_BLOCK_FRONT_GAME_OVER;
      const current_back = this.hitStatus === HIT_CURRENT_BLOCK_BACK_GAME_OVER;

      this.combo = 0;
      this.score = 0;
      this.removeTouch();

      if(next_block_front) {
        //停止所有动画
        TWEEN.removeAll();
        this.bottle.stopShrink();
        audioManager['fall_2'].play();
        //因为 checking判断依据是小于等于 block高度一半， 所以bottle位置有可能会低于block高度一点点
        //所以把高度 指定block高度 效果更好
        this.bottle.group.position.y = blockConf.height / 2 + bottleConf.or;
        //往前掉落
        this.bottle.frontFall();
      } else if(next_block_back || current_back) {
        TWEEN.removeAll();
        this.bottle.stopShrink();
        audioManager['fall_2'].play();
        this.bottle.group.position.y = blockConf.height / 2 + bottleConf.or;
        //往后掉落
        this.bottle.backFall();
      } else {
        TWEEN.removeAll();
        this.bottle.stopShrink();
        audioManager['fall'].play();
        this.bottle.verticalFal();
      }

      setTimeout(() => {
        this.callbacks.showGameOverPage();
      }, 1500);
    }
  }

  //游戏继续时， 继续生成下一个block
  updateNextBlock () {
    //随机生成下个block 的类型
    const seed = Math.round(Math.random());
    const type = seed ? 'cube' : 'cylinder';
    //下个跳跃的方向direction 0 ===> x正轴 1 ===> z负轴
    const direction = Math.round(Math.random());
    //下个block 的 width
    let width = Math.round(Math.random() * 5) + 12;
    //下个block 和 当前的距离
    const distance = Math.round(Math.random() * 20) + 20;
    this.currentBlock = this.nextBlock;
    this.targetPosition = {};
    if(direction === 0) { //x
      this.targetPosition.x = this.currentBlock.instance.position.x + distance;
      this.targetPosition.y = this.currentBlock.instance.position.y;
      this.targetPosition.z = this.currentBlock.instance.position.z;
    } else {  // z
      this.targetPosition.x = this.currentBlock.instance.position.x;
      this.targetPosition.y = this.currentBlock.instance.position.y;
      this.targetPosition.z = this.currentBlock.instance.position.z - distance;
    }
    this.setDirection(direction);
    const x = this.targetPosition.x;
    const y = this.targetPosition.y;
    const z = this.targetPosition.z;

    const cubeLen = blockConf.cubeTypeName.length;
    const tName = blockConf.cubeTypeName[Math.floor(Math.random() * cubeLen)];

    const cyLen = blockConf.cylinderName.length;
    const cName = blockConf.cylinderName[Math.floor(Math.random() * cyLen)];
    if(type === "cube") {
      blockConf.cubeWidth[tName] ? width = blockConf.cubeWidth[tName] : width;
      this.nextBlock = new CubeBlock(x, y, z, tName, width);
      this.nextBlock.width = width;
    } else {
      this.nextBlock = new CylinderBlock(x, y, z, cName, width);
      this.nextBlock.width = width;
    }
    const boxHelper = new THREE.BoxHelper(this.nextBlock.instance);
    this.scene.instance.add(boxHelper);
    this.scene.instance.add(this.nextBlock.instance);
    //获取currentBlock 和 nextBlock 中心点连线的中心， 
    const cameraTargetPosition = {
      x: (this.currentBlock.instance.position.x + x) / 2,
      y: (this.currentBlock.instance.position.y + y) / 2,
      z: (this.currentBlock.instance.position.z + z) / 2,
    }
    this.scene.updateCameraPosition(cameraTargetPosition);
    this.ground.updatePosition(this.targetPosition);

    return type === "cube" ? tName : cName;
  }

  addDelayScore (type) {
    if(this.hitStatus !== (HIT_NEXT_BLOCK_CENTER && HIT_NEXT_BLOCK_NOT_CENTER)) return ;
    if(blockConf.delayType[type]) {
      const score = blockConf.delayType[type].score;
      const audio = blockConf.delayType[type].audio;
      this.delayScore = setTimeout(() => {
        this.bottle.scoreTextPopover(score);
        audioManager[audio].play();
        this.updateScore(this.score + score);
      }, blockConf.delayType[type].delay);
    }
  }

  restart () {
    this.deleteMeshOfScene();
    this.scene.reset();
    this.bottle.reset();
    this.ground.reset();
    this.updateScore(0);
    this.addBlock();
    this.addGround();
    this.addBottle();
    this.bindTouch();
  }

  deleteMeshOfScene () {
    let mesh = this.scene.instance.getObjectByName("block");
    while (mesh) {
      this.scene.instance.remove(mesh);
      if(mesh.geometry) mesh.geometry.dispose();
      if(mesh.material) {
        if(mesh.material instanceof Array) {
          for(let i of mesh.material) {
            i.dispose();
          }
        } else {
          mesh.material.dispose();
        }
      }
      mesh = this.scene.instance.getObjectByName("block");
    }
    this.scene.instance.remove(this.bottle.group);
    this.scene.instance.remove(this.ground.instance);
  }

  show () {
    this.visible = true;
  }

  hide () {
    this.visible = false;
  }
}
