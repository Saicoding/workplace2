// pages/mine/set/set.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    storageSize: 0,
    checked: false
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    let self = this;
    wx.getStorage({
      key: 'user',
      success: function(res) {},
      fail: function(res) {
        console.log("获取数据失败");
      }
    });

    let myType = wx.getStorageSync('myType');

    self.setSrcsAndColors(myType);
  },


  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function() {
    let self = this;

    this.loginOut = this.selectComponent('#loginOut');
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
   * 清除缓存
   */
  clearStorage: function() {
    let user = wx.getStorageSync('user');
    let storages = wx.getStorageInfoSync().keys;

    for (let i = 0; i < storages.length; i++) {
      let storage = storages[i];
      if (storage == 'user' || storage == 'myType') {
        continue;
      }
      wx.removeStorageSync(storage);
    }

    let storages1 = wx.getStorageInfoSync();
    console.log(storages1)

    wx.showToast({
      title: '清除缓存成功',
      duration: 2000
    })
  },

  /**
   * 退出登录
   */
  goOut: function() {
    wx.showModal({
      content: '您确定要退出登录吗？',
      confirmColor: '#0097f5',
      success(res) {
        if (res.confirm) {
          let url = encodeURIComponent('/pages/mine/mineIndex/mineIndex');

          wx.navigateBack({})

          wx.removeStorageSync('user');

          wx.navigateTo({
            url: '/pages/login1/login1?url=' + url + "&ifGoPage=false",
          })
        } else if (res.cancel) {

        }
      }
    })
  },

  /**
   * 改变首选项
   */
  categorySelect:function(e){
    let self = this;
    let value = e.detail.value;
    let myType = self.data.myType;
    
    if(myType == value) return;

    self.setSrcsAndColors(value);
    wx.setStorageSync('myType', value);
  },

  /**
   * 设置srcs和colors方法封装
   */
  setSrcsAndColors: function (myType) {
    let self = this;
    let srcs = {};
    let colors = {};

    switch (myType) {
      case "zq":
        srcs.zq = "/imgs/zq-s.png";
        srcs.jj = "/imgs/jj.png";
        srcs.qh = "/imgs/qh.png";
        colors.zq = "#fd6131";
        colors.jj = "black";
        colors.qh = "black";
        break;
      case "jj":
        srcs.zq = "/imgs/zq.png";
        srcs.jj = "/imgs/jj-s.png";
        srcs.qh = "/imgs/qh.png";
        colors.zq = "black";
        colors.jj = "#d2ac37";
        colors.qh = "black";
        break;
      case "qh":
        srcs.zq = "/imgs/zq.png";
        srcs.jj = "/imgs/jj.png";
        srcs.qh = "/imgs/qh-s.png";
        colors.zq = "black";
        colors.jj = "black";
        colors.qh = "#c71585";
        break;
    }

    self.setData({
      srcs: srcs,
      colors: colors,
      myType: myType
    })
  },

})