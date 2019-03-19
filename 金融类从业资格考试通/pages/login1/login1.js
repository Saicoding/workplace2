const app = getApp();
const API_URL = 'https://xcx2.chinaplat.com/jinrong/'; //接口地址
let WXBizDataCrypt = require('../../utils/cryptojs/RdWXBizDataCrypt.js');
let appId = "wx1264a65218ad1fab";

// pages/login1/login1.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    openId: '', //用户唯一标识  
    unionId: '',
    encryptedData: ''
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    let self = this;

    wx.setNavigationBarColor({ //设置窗口颜色
      frontColor: "#ffffff",
      backgroundColor: "#fd6131",
    })


    this.setData({
      url: decodeURIComponent(options.url),
      url1: options.url,
      ifGoPage: options.ifGoPage
    })
  },
  /**
   * 手机登录
   */
  userPwdLogin: function (e) {
    wx.navigateTo({
      url: '/pages/phoneLogin/phoneLogin?url=' + this.data.url1 + '&ifGoPage=' + this.data.ifGoPage,
    })
  },

  /**
   * 微信授权登录
   */
  wxLogin: function (e) {
    let self = this;
    wx.showLoading({
      title: '登录中',
    })
    wx.login({
      success: res => {
        let code = res.code;
        app.post(API_URL, "action=getSessionKey&code=" + code, false, false, "").then((res) => {
          let sesstion_key = res.data.sessionKey;
          let openid = res.data.openid;

          wx.getUserInfo({
            success: function (res) {
              let wxid = ""; //openId
              let session_key = ""; //
              let ifGoPage = self.data.ifGoPage //是否返回上一级菜单
              let url = self.data.url; //需要导航的url

              let encryptedData = res.encryptedData;
              let iv = res.iv;
              let signature = res.signature; //签名
              let nickname = res.userInfo.nickName; //昵称
              let headurl = res.userInfo.avatarUrl; //头像
              let sex = res.userInfo.gender //性别
              //拿到session_key实例化WXBizDataCrypt（）这个函数在下面解密用
              let pc = new WXBizDataCrypt(appId, sesstion_key);
              let data = pc.decryptData(encryptedData, iv);
              let unionId = data.unionId;

              app.post(API_URL, "action=Login_wx&unionId=" + unionId + "&openid=" + openid + "&nickname=" + nickname + "&headurl=" + headurl + "&sex=" + sex, false, false, "").then((res) => {

                let user = res.data.list[0];

                wx.setStorage({
                  key: 'user',
                  data: user
                })

                wx.hideLoading();

                wx.navigateBack({}) //先回到登录前的页面

                if (ifGoPage == 'true') {
                  wx.navigateTo({
                    url: url,
                  })
                }
              })
            }
          })
        })
      }
    })
  },
})