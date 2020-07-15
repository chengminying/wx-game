import TWEEN from "../../libs/tween";
import { TetrahedronGeometry } from "../../libs/three";

export default {
  pointInPolygon(point, vs) {
    // ray-casting algorithm based on
    // http://www.ecse.rpi.edu/Homepages/wrf/Research/Short_Notes/pnpoly.html

    var x = point[0],y = point[1];

    var inside = false;
    for (var i = 0, j = vs.length - 1; i < vs.length; j = i++) {
      var xi = vs[i][0],
        yi = vs[i][1];
      var xj = vs[j][0],
        yj = vs[j][1];

      var intersect =
        yi > y != yj > y && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi;
      if (intersect) inside = !inside;
    }

    return inside;
  },
  /**
   *纹理映射
   *
   * @param {*} textureWidth 纹理图的宽度 
   * @param {*} textureHeight
   * @param {*} geometry 纹理要映射到的geometry
   * @param {*} faceIdx 纹理要映射到geometry 那个面，如立方体有6个面 0-5
   * @param {*} x1 裁剪开始位置的x
   * @param {*} y1 裁剪开始位置的y
   * @param {*} x2 裁剪结束位置的x
   * @param {*} y2 裁剪结束位置的y
   * @param {*} flag 
   */
  mapUv (textureWidth, textureHeight, geometry, faceIdx, x1, y1, x2, y2, flag) {
    //归一化
    var tileUvW = 1 / textureWidth;
    var tileUvH = 1 / textureHeight;

    if(geometry.faces[faceIdx] instanceof THREE.Face3) {
      var UVs = geometry.faceVertexUvs[0][faceIdx * 2];
      if (faceIdx == 4 && !flag) {
        UVs[0].x = x1 * tileUvW;UVs[0].y = y1 * tileUvH;
        UVs[2].x = x1 * tileUvW;UVs[2].y = y2 * tileUvH;
        UVs[1].x = x2 * tileUvW;UVs[1].y = y1 * tileUvH;
      } else {
        UVs[0].x = x1 * tileUvW;UVs[0].y = y1 * tileUvH;
        UVs[1].x = x1 * tileUvW;UVs[1].y = y2 * tileUvH;
        UVs[2].x = x2 * tileUvW;UVs[2].y = y1 * tileUvH;
      }
      var UVs = geometry.faceVertexUvs[0][faceIdx * 2 + 1];
      if (faceIdx == 4 && !flag) {
        UVs[2].x = x1 * tileUvW;UVs[2].y = y2 * tileUvH;
        UVs[1].x = x2 * tileUvW;UVs[1].y = y2 * tileUvH;
        UVs[0].x = x2 * tileUvW;UVs[0].y = y1 * tileUvH;
      } else {
        UVs[0].x = x1 * tileUvW;UVs[0].y = y2 * tileUvH;
        UVs[1].x = x2 * tileUvW;UVs[1].y = y2 * tileUvH;
        UVs[2].x = x2 * tileUvW;UVs[2].y = y1 * tileUvH;
      }
    }
  }
};
