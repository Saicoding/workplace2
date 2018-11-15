// pages/kaodianDetail/kaodianDetail.js
const API_URL = 'https://xcx2.chinaplat.com/'; //接口地址
const app = getApp(); //获取app对象
let time = require('../../common/time.js');
let mytime = { 'second': 0 };
let myinterval = {'interval':0};
Page({

  /**
   * 页面的初始数据
   */
  data: {
    fontSize:30,//默认字体大小
    day:true,//白天还是黑天
    scroll:0,//滚动条位置
    isToBottom:false,//是否到底了
    isLoaded:false,
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    wx.setNavigationBarTitle({//设置标题
      title: options.title
    }) 
    let self = this;
    let kdid = options.kdid;
    
    let user = wx.getStorageSync("user");
    let username = user.username;
    let acode = user.acode;

    app.post(API_URL,"action=GetKaodianShow&username="+username+"&acode="+acode+"&kdid="+kdid,false,true,"").then((res)=>{
      let data = res.data.data[0];
      let content = data.content;
      let nextId = data.nextId;
      let proId = data.proId;
      let nextTitle = data.nextTitle;
      let proTitle = data.proTitle;
 
      self.setData({
        content:content,
        nextId: nextId,
        nextTitle: nextTitle,
        proTitle: proTitle,
        proId: proId,
        user:user,
        kdid: kdid,
        isLoaded: true
      })
    })
  },
  /**
   * 滑动到底部
   */
  scrollToBottom: function (e) {
    let self = this;

    self.setPreReaded();//设置是否已读
    self.setData({//设置已经到底了
      isToBottom:true
    })

  },

  /**
   * 设置readed
   */
  setPreReaded:function(){
    let self = this;
    let user = self.data.user;
    let LoginRandom = user.Login_random;
    let zcode = user.zcode;

    let second = mytime.second;

    let pages = getCurrentPages();
    let prePage = pages[pages.length - 2];//上一页
    let kdList = prePage.data.kdList;
    let kdid = self.data.kdid;

    if (second > 30) {
      for (let i = 0; i < kdList.length; i++) {
        let kd = kdList[i];
        if (kd.id == kdid) {
          kd.readed = 1;
        }
      }
      prePage.setData({
        kdList: kdList
      })

      app.post(API_URL, "action=ChangeKaodianFlag&LoginRandom=" + LoginRandom + "&zcode=" + zcode + "&id=" + kdid, false, true, "").then((res) => {
      })
    }
  },

  /**
   * 滑块变动事件
   */

  sliderChange:function(e){
    let value = e.detail.value;
    this.setData({
      fontSize:value
    })
  },

  toogleDay:function(){
    let day = this.data.day;
    this.setData({
      day:!this.data.day
    })
    
    let frontColor = !day ? "#ffffff" : "#ffffff";
    let backgroundColor = !day ? "#0197F6" : "#000000";
    wx.setNavigationBarColor({
      frontColor: frontColor,
      backgroundColor: backgroundColor,
    })
  },

  /**
   * 点击上一题或者下一题
   */
  select:function(e){
    let self = this;

    let user = self.data.user;
    let username = user.username;
    let acode = user.acode;
    let preNext = e.currentTarget.dataset.prenext;
    let nextId = self.data.nextId;
    let proId = self.data.proId;
    let kdid = "";
    let isToBottom = self.data.isToBottom;
    let second = mytime.second;

    //先判断当前题是否已经看完，再做下面的判断
    if (isToBottom){
      self.setPreReaded();
    }

    if (preNext == 0){//点击上一题
      if(proId == 0){
        wx.showToast({
          title: '没有了',
          icon: 'none',
          duration:3000
        })
        clearInterval(myinterval.interval);
        return;
      }
      kdid = proId;
    }

    if(preNext == 1){//点击了下一题
      if(nextId == 0){
        wx.showToast({
          title: '没有了',
          icon: 'none',
          duration: 3000
        })
        clearInterval(myinterval.interval);
        return;
      }
      kdid = nextId;
    }
    time.restart(myinterval, mytime); //重新开始计时
    
  
    app.post(API_URL, "action=GetKaodianShow&username=" + username + "&acode=" + acode + "&kdid=" + kdid, true, true, "载入中").then((res) => {
      
      let data = res.data.data[0];
      let content = data.content;
      let nextId = data.nextId;
      let proId = data.proId;
      let nextTitle = data.nextTitle;
      let proTitle = data.proTitle;
      let mynextTitle = self.data.nextTitle;
      let myproTitle = self.data.proTitle;

      let title = preNext == 0 ? myproTitle : mynextTitle

      wx.setNavigationBarTitle({//设置标题
        title: title
      }) 
      
      self.setData({
        content: content,
        nextId: nextId,
        proId: proId,
        nextTitle: nextTitle,
        proTitle: proTitle,
        scroll:0
      })
    })
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {
    let self  = this;
    wx.getSystemInfo({ //得到窗口高度,这里必须要用到异步,而且要等到窗口bar显示后再去获取,所以要在onReady周期函数中使用获取窗口高度方法
      success: function (res) { //转换窗口高度
        let windowHeight = res.windowHeight;
        let windowWidth = res.windowWidth;
        windowHeight = (windowHeight * (750 / windowWidth));
        self.setData({
          windowHeight: windowHeight
        })
      }
    });
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    time.start(myinterval, mytime);//开始计时
  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {
    clearInterval(myinterval.interval);
  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {
    clearInterval(myinterval.interval);
  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  }
})