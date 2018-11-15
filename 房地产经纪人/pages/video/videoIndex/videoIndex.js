// pages/hasNoErrorShiti/hasNoErrorShiti.js
const API_URL = 'https://xcx2.chinaplat.com/'; //接口地址
const app = getApp();
let validate = require('../../../common/validate.js');
let animate = require('../../../common/animate.js');
let easeOutAnimation = animate.easeOutAnimation();
let easeInAnimation = animate.easeInAnimation();
let buttonClicked = false;


Page({
  /**
   * 页面的初始数据
   */
  data: {
    loaded:false,
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function() {
    //获取是否有登录权限
    // return;
    let self = this;

    self.setData({
      product: "jjr",
    })

    let url = encodeURIComponent('/pages/video/videoIndex/videoIndex');

    let user = wx.getStorageSync('user');
    
    wx.removeStorageSync('page');

    if (user) {
      self.setData({
        user: user
      })
    } else {
      wx.navigateTo({
        url: '/pages/login1/login1?url=' + url + '&ifGoPage=false',
      })
    }
  },

  /**
   * 生命周期事件
   */
  onReady: function() {
    let self = this;
    wx.getSystemInfo({ //得到窗口高度,这里必须要用到异步,而且要等到窗口bar显示后再去获取,所以要在onReady周期函数中使用获取窗口高度方法
      success: function(res) { //转换窗口高度
        let windowHeight = res.windowHeight;
        let windowWidth = res.windowWidth;

        windowHeight = (windowHeight * (750 / windowWidth));

        self.setData({
          windowHeight: windowHeight,
          windowWidth: windowWidth,
        })
      }
    });
  },

  /**
   * 在返回页面的时候
   */
  onShow: function() {
    // return;
    let self = this;
    let user = wx.getStorageSync('user');

    buttonClicked = false;

    if (user != "") {
      let LoginRandom = user.Login_random;
      let zcode = user.zcode;
      let url = encodeURIComponent('/pages/video/videoIndex/videoIndex');

      let moveData = undefined;
      let product = wx.getStorageSync('page');

      let types = "";
      if (product == "xl") {
        types = "xl"
      } else {
        types = "jjr"
      }

      self.setData({
        user: user,
        product: types
      })

      app.post(API_URL, "action=GetCourseList&types=" + types + "&LoginRandom=" + LoginRandom + "&zcode=" + zcode, false, true, "", url).then((res) => {
        let videoList = res.data.list;
        self.setData({
          videoList: videoList,
          loaded:true
        })
      })
    }
  },

  /**
   * 改变产品时
   */
  changeProduct: function(e) {
    let self = this;
    let currentProduct = self.data.product;//当前种类
    let product = e.currentTarget.dataset.product;//点击的视频种类
    if (product == currentProduct) return;//如果没有改变就不作任何操作

    self.setData({
      loaded:false
    })

    let windowWidth = self.data.windowWidth;//窗口宽度
    let moveData = undefined;//动画
    if(product == "xl"){
      moveData = animate.ChangeWidthAndmoveX(easeOutAnimation, 265 * (windowWidth / 750), 276 * (windowWidth / 750));
      app.post(API_URL, "action=GetCourseList&types=xl", false, true, "", "").then((res) => {
        let videoList = res.data.list;
        self.setData({
          videoList: videoList,
          loaded: true
        })
      })
    }else{
      moveData = animate.ChangeWidthAndmoveX(easeOutAnimation, 200 * (windowWidth / 750),  0);
      app.post(API_URL, "action=GetCourseList&types=jjr", false, true, "", "").then((res) => {
        let videoList = res.data.list;
        self.setData({
          videoList: videoList,
          loaded: true
        })
      })
    }
    
    self.setData({
      product: product,
      moveData: moveData
    })
  },

  /**
   * 观看视频
   */
  watch:function(e){
    if (buttonClicked) return;
    buttonClicked = true;
    let self = this;
    let product = self.data.product;

    let kc_id = e.currentTarget.dataset.kc_id;
    let title = e.currentTarget.dataset.title;
    let img = e.currentTarget.dataset.img

    // let url = encodeURIComponent('/pages/video/videoDetail/videoDetail?kc_id=' + kc_id);
    // let url1 = '/pages/video/videoDetail/videoDetail?kc_id=' + kc_id;

    // let user = self.data.user;
    // let zcode = user.zcode;
    // let LoginRandom = user.Login_random;
    // let pwd = user.pwd

    // validate.validateDPLLoginOrPwdChange(zcode, LoginRandom, pwd, url1, url, true) //验证重复登录
    wx.navigateTo({
      url: '/pages/video/videoDetail/videoDetail?kc_id='+kc_id+'&img='+img+"&product="+product+"&title="+title,
    })
  }
})