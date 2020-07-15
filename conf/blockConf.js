export default {
  height: 10,
  width: 16,
  colors: [0xf7aa6c, 0xff8c00, 0x8a9ad6, 0x2c9f67, 0x009ff7, 0xffbe00],
  innerColor: 0xffffff,
  innerH: 1.5,
  cubeType: {
    well: "res/images/well.png",
    box_bottom: "res/images/box_bottom.png",
    box_middle: "res/images/box_middle.png",
    express: "res/images/express.png",
    sing: "res/images/sing.png",
    tit: "res/images/tit.png",
  },
  cubeTypeName: ["color", "well", "box_bottom", "box_middle", "express", "sing", "tit"],
  cubeWidth: {
    box_bottom: 10,
    box_middle: 10,
  },
  cylinderType: {
    paper: [
      "res/images/paper_top.png",
      "res/images/paper_bottom.png"
    ]
  },
  cylinderName: ["color", "paper"],
  cylinderWidth: {},
  delayType: {
    well: {
      name: "well",
      score: 30,
      delay: 5000,
      audio: "water"
    }
  }
};
