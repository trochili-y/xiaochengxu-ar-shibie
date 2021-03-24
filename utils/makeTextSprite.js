import * as THREE from '../libs/three.js'
/* 创建字体精灵 */

function makeTextSprite(message, parameters,callback) {
  if (parameters === undefined) parameters = {}
  let fontface = parameters.hasOwnProperty("fontface") ?
    parameters["fontface"] : "Arial"
  /* 字体大小 */
  let fontsize = parameters.hasOwnProperty("fontsize") ?
    parameters["fontsize"] : 18
 
  let color = parameters.hasOwnProperty("color") ?
    parameters["color"]: 'rgba(0, 0, 0, 1.0)'
  /* 边框厚度 */
  let borderThickness = parameters.hasOwnProperty("borderThickness") ?
    parameters["borderThickness"] : 4
  /* 边框颜色 */
  let borderColor = parameters.hasOwnProperty("borderColor") ?
    parameters["borderColor"] : {
      r: 0,
      g: 0,
      b: 0,
      a: 1.0
    }
  /* 背景颜色 */
  let backgroundColor = parameters.hasOwnProperty("backgroundColor") ?
    parameters["backgroundColor"] : {
      r: 255,
      g: 255,
      b: 255,
      a: 1.0
    }
  /* 创建画布 */
  return new Promise(resolve=>{
    const query = wx.createSelectorQuery()
    query.select('#SpriteText')
      .fields({ node: true, size: true })
      .exec((res) => {
        const canvas = res[0].node
        let context = canvas.getContext('2d')
        /* 字体加粗 */
        context.font = "Bold " + fontsize + "px " + fontface
        /* 获取文字的大小数据，高度取决于文字的大小 */
        let metrics = context.measureText(message);
        let textWidth = metrics.width
        /* 背景颜色 */
        context.fillStyle = "rgba(" + backgroundColor.r + "," + backgroundColor.g + "," +
          backgroundColor.b + "," + backgroundColor.a + ")"
        /* 边框的颜色 */
        context.strokeStyle = "rgba(" + borderColor.r + "," + borderColor.g + "," +
          borderColor.b + "," + borderColor.a + ")";
        context.lineWidth = borderThickness
        /* 绘制圆角矩形 */
        roundRect(context, borderThickness / 2, borderThickness / 2, textWidth + borderThickness, fontsize * 1.4 +
          borderThickness,
          6)
        /* 字体颜色 */
        context.fillStyle = color;
        context.fillText(message, borderThickness, fontsize + borderThickness)
        /* 画布内容用于纹理贴图 */
        


        let texture = new THREE.Texture(canvas);
        // texture.setCrossOrigin( 'Anonymous');
 


   
        // texture.needsUpdate = true
        // let spriteMaterial = new THREE.SpriteMaterial({
        //   map: texture
        // });
        // let sprite = new THREE.Sprite(spriteMaterial)
    
        // /* 缩放比例 */
        // sprite.scale.set(10, 5, 1)
        // resolve(sprite);
        resolve(texture);

    
      })
  })

 
  };
 
  /* 绘制圆角矩形 */
  function roundRect(ctx, x, y, w, h, r) {
   
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.lineTo(x + w - r, y);
    ctx.quadraticCurveTo(x + w, y, x + w, y + r);
    ctx.lineTo(x + w, y + h - r);
    ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
    ctx.lineTo(x + r, y + h);
    ctx.quadraticCurveTo(x, y + h, x, y + h - r);
    ctx.lineTo(x, y + r);
    ctx.quadraticCurveTo(x, y, x + r, y);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
   
  };



  module.exports = {makeTextSprite};