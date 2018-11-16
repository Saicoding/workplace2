// pages/hasNoErrorShiti/hasNoErrorShiti.js
const API_URL = 'https://xcx2.chinaplat.com/'; //接口地址
const app = getApp();
let animate = require('../../../common/animate.js');
let validate = require('../../../common/validate.js');
let util = require('../../../utils/util.js');

let easeOutAnimation = animate.easeOutAnimation();
let easeInAnimation = animate.easeInAnimation();


// start雷达图初始化数据
let numCount = 5; //元素个数
let numSlot = 5; //一条线上的总节点数
let windowWidth = wx.getSystemInfoSync().windowWidth; //窗口高度
let mW = wx.getSystemInfoSync().windowWidth; //Canvas的宽度

let mCenter = mW / 2; //中心点
let mAngle = Math.PI * 2 / numCount; //角度
let mRadius = mCenter - 40 * (750 / windowWidth); //半径(减去的值用于给绘制的文本留空间)
//获取指定的Canvas
let radCtx = wx.createCanvasContext("radarCanvas");
let buttonClicked = false;


Page({

  /**
   * 页面的初始数据
   */
  data: {
    stepText: 5,
    nums: 0,
    product: [{
        'title': '【房地产经纪人】 学习进度',
        'rate': 'jjr',
        'angle': 0,
        'isFold': true,
        'height':380,
        'src': '/imgs/orange-rate.png',
        'jie': [{
            'title': '房地产交易制度政策',
            'kmid': 257
          },
          {
            'title': '房地产经纪职业导论',
            'kmid': 258
          },
          {
            'title': '房地产经纪专业基础',
            'kmid': 260
          },
          {
            'title': '房地产业务操作',
            'kmid': 259
          },
        ]
      },
      {
        'title': '【房地产经纪人协理】 学习进度',
        'rate': 'xl',
        'height': 200,
        'isFold': true,
        'angle': 0,
        'src': '/imgs/blue-rate.png',
        'jie': [{
            'title': '经纪操作实务',
            'kmid': 263
          },
          {
            'title': '经纪综合能力',
            'kmid': 262
          }
        ]
      }
    ]
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function() {
    wx.setTabBarStyle({
      selectedColor: "#fd6131"
    })
    //获取是否有登录权限
    let self = this;

    let url = encodeURIComponent('/pages/mine/mineIndex/mineIndex');

    let user = wx.getStorageSync('user');

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

  toogleShow: function(e) {
    let self = this;
    let rate = e.currentTarget.dataset.rate; //点击的科目
    let product = self.data.product;
    let p = rate == "jjr" ? product[0] : product[1];

    if (p.isFold) { //如果是折叠状态
      p.foldData = animate.foldAnimation(easeInAnimation, p.height, 0);
      p.isFold = false;
      let interval = setInterval(function() {
        p.angle += 3;
        if (p.angle >= 90) {
          p.angle = 90;
          clearInterval(interval);
        }
        self.setData({
          product: product
        })
      }, 30)

    } else {
      p.foldData = animate.foldAnimation(easeOutAnimation, 0, p.height);
      p.isFold = true;
      let interval = setInterval(function() {
        p.angle -= 3;
        if (p.angle <= 0) {
          p.angle = 0;
          clearInterval(interval);
        }
        self.setData({
          product: product
        })
      }, 30)
    }

  },

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
   * 设置页面
   */
  GOset: function() {
    if (buttonClicked) return;
    buttonClicked = true;
    wx.navigateTo({
      url: '/pages/mine/set/set',
    })
  },

  /**
   * 导航到雷达页面
   */
  GOradar: function(e) {
    if (buttonClicked) return;
    buttonClicked = true;
    let kmid = e.currentTarget.dataset.kmid;
    let title = e.currentTarget.dataset.title;

    wx.navigateTo({
      url: '/pages/mine/mineRadar/mineRadar?kmid=' + kmid + "&title=" + title,
    })
  },

  /**
   * 导航到消息页面
   */
  GOmessage: function() {
    if (buttonClicked) return;
    buttonClicked = true;
    let self = this;

    let url = encodeURIComponent('/pages/mine/message/message');
    let url1 = '/pages/mine/message/message';

    let user = self.data.user;
    let zcode = user.zcode;
    let LoginRandom = user.Login_random;
    let pwd = user.pwd

    validate.validateDPLLoginOrPwdChange(zcode, LoginRandom, pwd, url1, url, true) //验证重复登录

  },
  /**
   * 在返回页面的时候
   */
  onShow: function() {
    wx.setTabBarStyle({
      selectedColor: "#fd6131"
    })
    let self = this;
    buttonClicked = false;
    let user = wx.getStorageSync('user');

    if (user != "") {
      let LoginRandom = user.Login_random;
      let zcode = user.zcode;
      let url = encodeURIComponent('/pages/mine/mineIndex/mineIndex');

      app.post(API_URL, "action=GetNoticesNums&LoginRandom=" + LoginRandom + "&zcode=" + zcode, false, true, "", url).then((res) => {
        let nums = res.data.nums;
        self.setData({
          nums: nums
        })
      })
    }

    this.setData({
      user: user
    })
  },

  /**
   * 导航到关于我们界面
   */
  GOabout: function() {
    if (buttonClicked) return;
    buttonClicked = true;
    wx.navigateTo({
      url: '/pages/mine/about/about',
    })
  }
})