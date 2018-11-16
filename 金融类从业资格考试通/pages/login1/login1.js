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
    this.setData({
      url: decodeURIComponent(options.url),
      url1: options.url,
      ifGoPage: options.ifGoPage
    })

    wx.login({
      success: res => {
        let code = res.code;
        app.post(API_URL, "action=getSessionKey&code=" + code, false, false, "").then((res) => {
          let sesstion_key = res.data.sessionKey;
          let openid = res.data.openid;
          self.setData({
            sesstion_key: sesstion_key,
            openid: openid
          })
        })
      }
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
    let wxid = ""; //openId
    let session_key = ""; //
    let ifGoPage = self.data.ifGoPage //是否返回上一级菜单
    let url = self.data.url; //需要导航的url

    let encryptedData = e.detail.encryptedData;
    let iv = e.detail.iv;
    let signature = e.detail.signature; //签名
    let nickname = e.detail.userInfo.nickName; //昵称
    let headurl = e.detail.userInfo.avatarUrl; //头像
    let sex = e.detail.userInfo.gender //性别
    let code = self.data.code;

    //得到openId和session_key

    let sesstion_key = self.data.sesstion_key;
    let openid = self.data.openid;

    //拿到session_key实例化WXBizDataCrypt（）这个函数在下面解密用
    let pc = new WXBizDataCrypt(appId, sesstion_key);
    let data = pc.decryptData(encryptedData, iv);
    let unionId = data.unionId;

    app.post(API_URL, "action=Login_wx&unionId=" + unionId + "&openid=" + openid + "&nickname=" + nickname + "&headurl=" + headurl + "&sex=" + sex, true, false, "登录中").then((res) => {

      let user = res.data.list[0];

      wx.setStorage({
        key: 'user',
        data: user
      })

      wx.navigateBack({}) //先回到登录前的页面

      if (ifGoPage == 'true') {
        wx.navigateTo({
          url: url,
        })
      }
    })
  },
})