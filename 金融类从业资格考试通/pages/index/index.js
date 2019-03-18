/**
 * 时间 : 2018/10/11 20:33
 * 
 * 说明 : 该页是首页
 * 
 */
const API_URL = 'https://xcx2.chinaplat.com/jinrong/'; //接口地址
const app = getApp(); //获取app对象
let validate = require('../../common/validate.js');
let buttonClicked = false;

Page({

  /**
   * 页面的初始数据
   */
  data: {

  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    console.log('ok')
    wx.setNavigationBarColor({//设置窗口颜色
      frontColor: "#ffffff",
      backgroundColor: "#f78c6b",
    })

    let myType = wx.getStorageSync('myType');
    if (myType != "") {
      switch(myType){
        case "zq":
          wx.switchTab({
            url: '/pages/index/bund/bund',
          })
        break;
        case "jj":
          wx.switchTab({
            url: '/pages/index/fund/fund',
          })
          break;
        case "qh":
          wx.switchTab({
            url: '/pages/index/future/future',
          })
          break;
      }

    }
  },

  select: function(e) {
    let select_type = e.currentTarget.dataset.type;
    wx.setStorageSync('myType', select_type)
    switch (select_type) {
      case "zq":
        wx.switchTab({
          url: '/pages/index/bund/bund',
        })
        break;
      case "jj":
        wx.switchTab({
          url: '/pages/index/fund/fund',
        })
        break;
      case "qh":
        wx.switchTab({
          url: '/pages/index/future/future',
        })
        break;
    }
  }
})