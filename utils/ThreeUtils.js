import * as THREE from '../libs/three.js'
import * as makeTextSprite from 'makeTextSprite.js'
// const Sprite = require('@spritejs/wxapp');
const deviceOrientationControl = require('./DeviceOrientationControl.js');
const deviceMotionInterval = 'ui';
var camera, scene, renderer;
var canvas;
var device = {};
var lon, lat, gradient;

var seletedModel, requestId;
var isDeviceMotion = false;
var isAndroid = false;
var last_lon, last_lat, last_device = {};


function initThree(canvasId, callback) {
    wx.createSelectorQuery()
        .select('#' + canvasId)
        .node()
        .exec((res) => {
            canvas = res[0].node;
            //获取系统信息，包括屏幕分辨率，显示区域大小，像素比等
            var info = wx.getSystemInfoSync();
            this._sysInfo = info;
            //设置canvas的大小，这里需要用到窗口大小与像素比乘积来定义
            canvas.width = this._sysInfo.windowWidth * this._sysInfo.pixelRatio;
            canvas.height = this._sysInfo.windowHeight * this._sysInfo.pixelRatio;
            //设置canvas的样式
            canvas.style = {};
            canvas.style.width = canvas.width.width;
            canvas.style.height = canvas.width.height;
            if (typeof callback === 'function') {
                callback(THREE);
            }
        });
}

function initScene() {
    lon = 0,
        lat = 0

    // init Perspective Camera
    camera = new THREE.PerspectiveCamera(60,
        canvas.width / canvas.height,
        1,
        1000);
    // according to camera position
    //camera.position.set(0, 3, 5);

    scene = new THREE.Scene();
    scene.add(new THREE.AmbientLight(0xffffff));

    /*
    if (!isAndroid) {
        // init Orthographic Camera
        initBackroundScene();
    }
    */
    // init render
    renderer = new THREE.WebGLRenderer({
        canvas: canvas,
        antialias: true,
        alpha: true,
    });
    console.log('canvas size', canvas.width, canvas.height);
    renderer.setSize(canvas.width, canvas.height);
    /*
    if (!isAndroid) {
        renderer.autoClear = false;
    }
    */
    loadModel();
    animate();

}

/*
function initBackroundScene() {
    cameraRTT = new THREE.OrthographicCamera(canvas.width / -2, canvas.width / 2, canvas.height / 2, canvas.height / -2, -100, 0);
    cameraRTT.position.z = 0;

    var light = new THREE.DirectionalLight(0xffffff);
    light.position.set(0, 0, 1).normalize();

    sceneRTT = new THREE.Scene();
    sceneRTT.add(light);

    var planeBufferGeometry = new THREE.PlaneGeometry(canvas.width, canvas.height);
    var planeMaterial = new THREE.MeshBasicMaterial();
    planeTexture = new THREE.DataTexture();
    planeMaterial.map = planeTexture;
    var plane = new THREE.Mesh(planeBufferGeometry, planeMaterial);
    // fixed a flip vertical direction problem
    plane.scale.x = -1;
    plane.rotation.z = THREE.Math.degToRad(180);

    sceneRTT.add(plane);
}
*/

async function loadModel() {
    //创建Cube几何体
    var cubeGeo = new THREE.CubeGeometry(30, 30, 30);
    //创建材质，设置材质为基本材质（不会反射光线，设置材质颜色为绿色）
    var mat = new THREE.MeshBasicMaterial({ color: 0x00FF00 });
    //////////////////////
    // const text = "ppppppppppcsa/ndas";
    // const color = new Date().getTime() % 2 == 1 ? 'rgba(234, 42, 6, 1)' : 'rgba(0, 0, 0, 1.0)'
    // var texture =  await makeTextSprite.makeTextSprite(text, {
    //         color: color
    //     }
    //     )
// texture.needsUpdate = true;
    // var mat = new THREE.MeshPhongMaterial({
    //     map: texture, // 设置纹理贴图
    //     });
    // var mat = [ 
    //     new THREE.MeshBasicMaterial( { color: 'blue' } ), // right
    //      new THREE.MeshPhongMaterial({
    //         map: texture, }), // left
    //     new THREE.MeshBasicMaterial( { color: 'red' } ), // top
    //     new THREE.MeshBasicMaterial( { color: 'black' } ), // bottom
    //     new THREE.MeshBasicMaterial( { color: 'green' } ), // back
    //     new THREE.MeshBasicMaterial( { color: 'yellow' } ),  // front 
    //     ];
    // console.log(texture)
    ////////////////////////
    //   var mat = new THREE.MeshBasicMaterial({map: new THREE.CanvasTexture(getTextCanvas('Leo Test Label'))}),

    //创建Cube的Mesh对象
    var cube = new THREE.Mesh(cubeGeo, mat);
    // cube.position.set(0, 0, -100);


    //设置Cube对象的位置
    // --------------test----------------
    var locail_res = lglt2xyz(113.093079, 23.411371, 447.1)
    // calcPosFromLatLonRad(113.093079, 23.411371, 447.1);
    cube.position.set(locail_res.x, locail_res.y, locail_res.z);
    seletedModel = cube;
    scene.add(seletedModel);


}





function animate() {
    requestId = canvas.requestAnimationFrame(animate);

    if (lon !== last_lon ||
        lat !== last_lat) {

        last_lon = lon;
        last_lat = lat;

        deviceOrientationControl.modelRotationControl(seletedModel, lon, lat, gradient, THREE);
    }

    if (last_device.alpha !== device.alpha ||
        last_device.beta !== device.beta ||
        last_device.gamma !== device.gamma) {

        last_device.alpha = device.alpha;
        last_device.beta = device.beta;
        last_device.gamma = device.gamma;

        if (isDeviceMotion) {
            deviceOrientationControl.deviceControl(camera, device, THREE, isAndroid);
        }
    }

    /*
    if (!isAndroid) {
        // render for Orthographic Camera
        if (cameraFrame) {
            planeTexture.image = cameraFrame;
            planeTexture.needsUpdate = true;
            renderer.render(sceneRTT, cameraRTT);
        }
    }
    */

    // render for Perspective Camera
    renderer.render(scene, camera);
}

function stopAnimate() {
    if (canvas && requestId) {
        canvas.cancelAnimationFrame(requestId);
    }
}




function startDeviceMotion(_isAndroid) {
    isDeviceMotion = true;
    isAndroid = _isAndroid;
    wx.onDeviceMotionChange(function (_device) {
        device = _device;
    });
    wx.startDeviceMotionListening({
        interval: deviceMotionInterval,
        success: function () {
            console.log('startDeviceMotionListening', 'success');
        },
        fail: function (error) {
            console.log('startDeviceMotionListening', error);
        }
    });
}

function stopDeviceMotion() {
    isDeviceMotion = false;
    wx.offDeviceMotionChange();
    wx.stopDeviceMotionListening({
        success: function () {
            console.log('stopDeviceMotionListening', 'success');
        },
        fail: function (error) {
            console.log('stopDeviceMotionListening', error);
        }
    });
}

function setCameraFrame(_cameraFrame) {
    cameraFrame = _cameraFrame;
}

function lglt2xyz(longitude, latitude, radius) {
    var lg = THREE.Math.degToRad(longitude), lt = THREE.Math.degToRad(latitude);
    var y = radius * Math.sin(lt);
    var temp = radius * Math.cos(lt);
    var x = temp * Math.sin(lg);
    var z = temp * Math.cos(lg);
    // console.log(x+","+y+","+z);
    return { x: x, y: y, z: z }
}

function calcPosFromLatLonRad(radius, lat, lon) { var spherical = new THREE.Spherical(radius, THREE.Math.degToRad(90 - lon), THREE.Math.degToRad(lat)); var vector = new THREE.Vector3(); vector.setFromSpherical(spherical); console.log(vector.x, vector.y, vector.z); return vector; }




function createSpriteText(label, x, y, z) {
    //先用画布将文字画出

    const query = wx.createSelectorQuery()
    query.select('#SpriteText')
        .fields({ node: true, size: true })
        .exec((res) => {
            const canvas = res[0].node
            const ctx = canvas.getContext('2d')

            ctx.fillStyle = "#ffff00";
            ctx.font = "Bold 50px Arial";
            ctx.lineWidth = 4;
            // ctx.fillText("ABCDRE",4,104);
            ctx.fillText(label, 40, 104);
            let texture = new THREE.Texture(canvas);
            texture.needsUpdate = true;

            //使用Sprite显示文字
            let material = new THREE.SpriteMaterial({ map: texture });
            // let material = new THREE.SpriteMaterial({map:texture,transparent:true});
            let textObj = new THREE.Sprite(material);
            textObj.scale.set(0.5 * 100, 0.25 * 100, 0.75 * 100);
            // textObj.position.set(0,0,98);
            textObj.position.set(x, y, z);
            return textObj;
        })



}

function getTextCanvas(text) {
    var width = 512, height = 256;
    const query = wx.createSelectorQuery()
    query.select('#SpriteText')
        .fields({ node: true, size: true })
        .exec((res) => {
            const canvas = res[0].node
            canvas.width = width;
            canvas.height = height;
            var ctx = canvas.getContext('2d');
            ctx.fillStyle = '#C3C3C3';
            ctx.fillRect(0, 0, width, height);
            ctx.font = 50 + 'px " bold';
            ctx.fillStyle = '#2891FF';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText(text, width / 2, height / 2);
            return canvas;
        })


}


function lonLatToVector3(lng, lat, out) {
    out = out || new THREE.Vector3();

    //flips the Y axis
    lat = Math.PI / 2 - lat;

    //distribute to sphere
    out.set(
        Math.sin(lat) * Math.sin(lng),
        Math.cos(lat),
        Math.sin(lat) * Math.cos(lng)
    );
    // console.log(out)
    return out;

}


function deepCopy(obj) {
    var result, oClass = getClass(obj);

    if (oClass == "Object") result = {}; //判断传入的如果是对象，继续遍历
    else if (oClass == "Array") result = []; //判断传入的如果是数组，继续遍历
    else return obj; //如果是基本数据类型就直接返回

    for (var i in obj) {
        var copy = obj[i];

        if (getClass(copy) == "Object") result[i] = deepCopy(copy); //递归方法 ，如果对象继续变量obj[i],下一级还是对象，就obj[i][i]
        else if (getClass(copy) == "Array") result[i] = deepCopy(copy); //递归方法 ，如果对象继续数组obj[i],下一级还是数组，就obj[i][i]
        else result[i] = copy; //基本数据类型则赋值给属性
    }

    return result;
}

function getClass(o) { //判断数据类型
    return Object.prototype.toString.call(o).slice(8, -1);
}
module.exports = {
    initThree,
    initScene,
    loadModel,
    startDeviceMotion,
    stopDeviceMotion,
    stopAnimate,
    setCameraFrame
}

