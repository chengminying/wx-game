/**
 * 小游戏入口
 */
import './libs/weapp-adapter.js';
import * as THREE from './libs/three';
import Main from './src/main.js';
window.THREE = THREE;


Main.init();