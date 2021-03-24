//index.js
const modelBusiness = require('../../utils/ThreeUtils.js')
const canvasId = 'webgl';
import {
  getPicBase64,
  aliyunSB
} from '../../request/request.js'

var isAndroid = false;
//获取应用实例
const app = getApp();

Page({
  data: {
    canvasWidth: 0,
    canvasHeight: 0,
    SpriteTextisV:false,
    animationData: '',
    showModalStatus: false,
    src:'',
    plantName:''
  },

  /**
   * 页面加载回调函数
   */
  onLoad: function () {
   // set cameraStyle of camera by system platform
   const res = wx.getSystemInfoSync();
   console.log(res.system);
   if (res.system.indexOf('Android') !== -1) {
     isAndroid = true;
   }
   modelBusiness.initThree(canvasId,
    function (THREE) {
      modelBusiness.initScene();
      modelBusiness.loadModel(THREE);
    });
  modelBusiness.startDeviceMotion(isAndroid);
  this.setData({
    canvasWidth: res.windowWidth,
    canvasHeight: res.windowHeight
  });

  /////////////////////////////////////识别


  },

  onUnload() {
  
    modelBusiness.stopAnimate();
    modelBusiness.stopDeviceMotion();
  
    console.log('onUnload', 'listener is stop');
  },
  ////////////////////////////////////////识别
  showModal: function () {
    // 显示遮罩层
    const ctx=wx.createCameraContext();
    ctx.takePhoto({
      quality: 'low',
      success: (res)=>{
        // console.log(res)
        this.setData({
          src:res.tempImagePath
        })
        getPicBase64(res.tempImagePath).then((res)=>{
          // console.log(res)
          aliyunSB(res).then((res)=>{
            console.log(res)
            app.globalData.plantInfo=res.data.Result
            this.setData({
              plantName:app.globalData.plantInfo[0].Name
            })
            
          })
        })
      },
      fail: ()=>{},
      complete: ()=>{}
    });
    console.log("展示")
    var animation = wx.createAnimation({
      duration: 200,
      timingFunction: "linear",
      delay: 0
    })
    this.animation = animation
    animation.translateY(600).step()
    this.setData({
      animationData: animation.export(),
      showModalStatus: true
    })
    setTimeout(function () {
      animation.translateY(0).step()
      this.setData({
        animationData: animation.export()
      })
    }.bind(this), 200)
  },

  hideModal: function () {
    // 隐藏遮罩层
    console.log(22)
    var animation = wx.createAnimation({
      duration: 200,
      timingFunction: "linear",
      delay: 0
    })
    this.animation = animation
    animation.translateY(600).step()
    this.setData({
      animationData: animation.export(),
    })
    setTimeout(function () {
      animation.translateY(0).step()
      this.setData({
        animationData: animation.export(),
        showModalStatus: false
      })
    }.bind(this), 200)
  }

  
})