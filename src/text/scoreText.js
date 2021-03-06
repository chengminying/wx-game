import font from './font';

export default class ScoreText {
  constructor() {

  }

  init (options) {
    this.material = new THREE.MeshBasicMaterial({ 
      color: (options && options.fillStyle) ? options.fillStyle : 0xff0000,
      transparent: true
    });
    if (options && options.opacity) this.material.opacity = options.opacity;
    const geometry = new THREE.TextGeometry('0', { 'font': font, 'size': 6.0, 'height': 0.1 });
    this.instance = new THREE.Mesh(geometry, this.material);
    this.instance.name = 'scoreText';
  }

  updateScore (score) {
    const scoreStr = score.toString();
		this.instance.geometry = new THREE.TextGeometry(scoreStr, { 'font': font, 'size': 6.0, 'height': 0.1 });
  }
}