// pages/mine/set/set.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    storageSize: 0,
    checked: false,
    categories: [{
        title: '证券   '
      },
      {
        title: '基金   '
      },
      {
        title: '期货   '
      },
    ],
    index:0
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
    this.setColor(myType);
  },

  setColor: function (myType){
    let index = 0;
    let color = "";
    switch(myType){
      case "zq":
        index = 0;
        color = "#fd6131";
      break;
      case "jj":
        index = 1;
        color = "#c1940e";
        break;
      case "qh":
        index = 2;
        color = "#c71585";
        break;
    }
    
    this.setData({
      index:index,
      color:color
    })
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

        } else if (res.cancel) {

        }
      }
    })
  },

  /**
   * 改变首选项
   */
  categorySelect: function(e) {
    let self = this;
    let index = e.detail.value;
    let category = "";
    let color = "";
    console.log(index)

    switch (index) {
      case "0":
        category = "zq";
        color = "#fd6131";
        break;
      case "1":
        category= "jj";
        color = "#c1940e";
        break;
      case "2":
        category = "qh";
        color = "#c71585";
        break;
    }

    console.log(category)

    self.setData({
      index: index,
      color:color
    })

    wx.setStorageSync('myType', category);

  }

})