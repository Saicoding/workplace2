// pages/kaodianDetail/kaodianDetail.js
const API_URL = 'https://xcx2.chinaplat.com/jinrong/'; //接口地址
const app = getApp(); //获取app对象
let time = require('../../common/time.js');
let mytime = {
  'second': 0
};
let myinterval = {
  'interval': 0
};
Page({

  /**
   * 页面的初始数据
   */
  data: {
    fontSize: 30, //默认字体大小
    day: true, //白天还是黑天
    scroll: 0, //滚动条位置
    isToBottom: false, //是否到底了
    isLoaded: false,
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    wx.setNavigationBarTitle({ //设置标题
      title: options.title
    })

    let self = this;
    let kdid = options.kdid;

    let user = wx.getStorageSync("user");
    let LoginRandom = user.Login_random;
    console.log(user)
    let zcode = user.zcode;

    console.log("action=GetKaodianShow&LoginRandom=" + LoginRandom + "&zcode=" + zcode + "&kdid=" + kdid)
    app.post(API_URL, "action=GetKaodianShow&LoginRandom=" + LoginRandom + "&zcode=" + zcode + "&kdid=" + kdid, false, true, "").then((res) => {
      console.log(res)
      let data = res.data.data[0];
      let content = data.content;

      if(content == ""){
        self.setData({
          isLoaded:true,
          hasNoContent:true
        })
        return
      }
      let nextId = data.nextId;
      let proId = data.proId;
      let nextTitle = data.nextTitle;
      let proTitle = data.proTitle;
      let n_zid = data.n_zid;
      let p_zid = data.p_zid;
      let now_zid = data.now_zid;

      self.setData({
        content: content,
        nextId: nextId,
        nextTitle: nextTitle,
        proTitle: proTitle,
        proId: proId,
        user: user,
        kdid: kdid,
        n_zid: n_zid,
        p_zid: p_zid,
        now_zid: now_zid,
        isLoaded: true,
      })
    })
  },

  /**
   * 滑动到底部
   */
  scrollToBottom: function(e) {
    let self = this;

    self.setPreReaded(); //设置是否已读
    self.setData({ //设置已经到底了
      isToBottom: true
    })
  },

  /**
   * 设置readed
   */
  setPreReaded: function() {
    let self = this;
    let user = self.data.user;
    let LoginRandom = user.Login_random;
    let zcode = user.zcode;

    let second = mytime.second;

    let pages = getCurrentPages();
    let prePage = pages[pages.length - 2]; //上一页
    let kdList = prePage.data.kdList;
    let kdid = self.data.kdid;

    if (second > 30) {
      for (let i = 0; i < kdList.length; i++) {
        let kd = kdList[i];
        let readed = "1";
        for (let j = 0; j < kd.data.length; j++) {
          let jie_kd = kd.data[j];
          if (jie_kd.id == kdid) {
            jie_kd.readed = "1";
          }

          if (jie_kd.readed == "0") {
            readed = "0";
          }
        }
        kd.readed = readed;

        if (readed == "1") {
          let myid = kd.id;
          app.post(API_URL, "action=ChangeKaodianFlag&LoginRandom=" + LoginRandom + "&zcode=" + zcode + "&id=" + myid, false, true, "").then((res) => {})
        }
      }

      prePage.setData({
        kdList: kdList
      })

      app.post(API_URL, "action=ChangeKaodianFlag&LoginRandom=" + LoginRandom + "&zcode=" + zcode + "&id=" + kdid, false, true, "").then((res) => {})
    }
  },

  /**
   * 
   */
  onHide: function() {
    clearInterval(myinterval.interval);
  },

  /**
   * 生命周期事件
   */
  onUnload: function() {
    let self = this;
    clearInterval(myinterval.interval);
    let isToBottom = self.data.isToBottom;

    if (!isToBottom) {
      mytime.second = 0;
      return;
    }
    self.setPreReaded();
    mytime.second = 0;
  },

  /**
   * 生命周期事件
   */
  onShow: function() {
    clearInterval(myinterval.interval);
    time.start(myinterval, mytime);
  },

  /**
   * 滑块变动事件
   */

  sliderChange: function(e) {
    let value = e.detail.value;
    this.setData({
      fontSize: value
    })
  },

  /**
   * 切换模式
   */
  toogleDay: function() {
    let day = this.data.day;
    this.setData({
      day: !this.data.day
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
  select: function(e) {
    let self = this;

    let user = self.data.user;
    let LoginRandom = user.Login_random
    let zcode = user.zcode;
    let preNext = e.currentTarget.dataset.prenext;


    let nextId = self.data.nextId;
    let proId = self.data.proId;
    let p_zid = self.data.p_zid;
    let n_zid = self.data.n_zid;
    let now_zid = self.data.now_zid;

    let kdid = "";
    let isToBottom = self.data.isToBottom;
    let second = mytime.second;



    //先判断当前题是否已经看完，再做下面的判断
    if (isToBottom) {
      self.setPreReaded();
    }

    if (preNext == 0) { //点击上一题
      if (proId == 0) {
        wx.showToast({
          title: '没有了',
          icon: 'none',
          duration: 3000
        })
        clearInterval(myinterval.interval);
        return;
      }


      kdid = proId;
      if (p_zid != now_zid) {//如果不相等,说明到上一章了
        wx.showModal({
          content: "此为本章第一节",
          cancelText: "继续浏览",
          confirmText: "到上一章",
          success: function(e) {
            if(e.confirm){
              time.restart(myinterval, mytime); //重新开始计时
              self.requestDetail(LoginRandom, zcode, kdid, preNext);
            }
          }
        })
      }else{
        time.restart(myinterval, mytime); //重新开始计时
        self.requestDetail(LoginRandom, zcode, kdid, preNext);
      }
    }

    if (preNext == 1) { //点击了下一题
      if (nextId == 0) {
        wx.showToast({
          title: '没有了',
          icon: 'none',
          duration: 3000
        })
        clearInterval(myinterval.interval);
        return;
      }

      kdid = nextId;
      if (n_zid != now_zid) {//如果不相等,说明到上一章了
        wx.showModal({
          content: "此为本章最后一节",
          cancelText: "继续浏览",
          confirmText: "到下一章",
          success: function (e) {
            if (e.confirm) {
              time.restart(myinterval, mytime); //重新开始计时
              self.requestDetail(LoginRandom, zcode, kdid, preNext);
            }
          }
        })
      } else {
        time.restart(myinterval, mytime); //重新开始计时
        self.requestDetail(LoginRandom, zcode, kdid, preNext);
      }
    }
  },
  /**
   * 请求考点信息方法封装
   */
  requestDetail: function (LoginRandom, zcode, kdid, preNext) {
    let self = this;
    app.post(API_URL, "action=GetKaodianShow&LoginRandom=" + LoginRandom + "&zcode=" + zcode + "&kdid=" + kdid, true, false, "载入中").then((res) => {
      console.log(res.data.data[0])
      let data = res.data.data[0];
      let content = data.content;
      let nextId = data.nextId;
      let proId = data.proId;
      let nextTitle = data.nextTitle;
      let proTitle = data.proTitle;
      let mynextTitle = self.data.nextTitle;
      let myproTitle = self.data.proTitle;
      let n_zid = data.n_zid;
      let p_zid = data.p_zid;
      let now_zid = data.now_zid;

      let title = preNext == 0 ? myproTitle : mynextTitle

      wx.setNavigationBarTitle({ //设置标题
        title: title
      })

      self.setData({
        content: content,
        nextId: nextId,
        proId: proId,
        kdid: kdid,
        nextTitle: nextTitle,
        proTitle: proTitle,
        n_zid: n_zid,
        p_zid: p_zid,
        now_zid: now_zid,
        scroll: 0
      })
    })
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function() {
    let self = this;
    wx.getSystemInfo({ //得到窗口高度,这里必须要用到异步,而且要等到窗口bar显示后再去获取,所以要在onReady周期函数中使用获取窗口高度方法
      success: function(res) { //转换窗口高度
        let windowHeight = res.windowHeight;
        let windowWidth = res.windowWidth;
        windowHeight = (windowHeight * (750 / windowWidth));
        self.setData({
          windowHeight: windowHeight
        })
      }
    });
  },
})