// pages/pay/pay.js
const API_URL = 'https://xcx2.chinaplat.com'; //接口地址
const API_URL1 = 'https://xcx2.chinaplat.com/jinrong/'; //接口地址

const app = getApp(); //获取app对象
let md5 = require('../../common/MD5.js');
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
    let self = this;

    // 设置标题
    let category = "";

    let title = "";
    switch(options.category){
      case 'zq':
        category = '证券从业资格套餐';
        title = "证券";
        break;
      case 'jj':
        category = '基金从业资格套餐';
        title = "基金";
        break;
      case 'qh':
        category = '期货从业资格套餐';
        title = "期货";
        break;

    }
    wx.setNavigationBarTitle({
      title: title,
    })
    self.setData({
      category:category,
      options: options
    })

    wx.getUserInfo({
      success: function(res) {
        let city = res.userInfo.city;
        let province = res.userInfo.province;
   
        app.post(API_URL, "action=getDlInfo&city=" + city + "&province=" + province, false, true, "").then((res) => {
          if (res.data.data.length == 0) { //如果没有城市代理
            self.setData({ //设置成没有城市代理
              hasCompany: false
            })
          } else {
            let company = res.data.data[0].Name;
            let tel = res.data.data[0].Tel
            self.setData({
              company: company,
              hasCompany: true,
              tel: tel
            })
          }
        })
      }
    })
  },

  /**
   * 拨打400电话
   */
  call400:function(){
    wx.makePhoneCall({
      phoneNumber: '400-6456-114' //仅为示例，并非真实的电话号码
    })
  },

  /**
   * 拨打电话
   */
  tel:function(){
    let phoneNumber = this.data.tel;
    wx.makePhoneCall({
      phoneNumber: phoneNumber //仅为示例，并非真实的电话号码
    })
  },

  /**
   * 生命周期事件
   */
  onReady:function(){
    let self = this;

    wx.getSystemInfo({ //得到窗口高度,这里必须要用到异步,而且要等到窗口bar显示后再去获取,所以要在onReady周期函数中使用获取窗口高度方法
      success: function (res) { //转换窗口高度
        let windowHeight = res.windowHeight;
        let windowWidth = res.windowWidth;
        let platform = res.platform;

        windowHeight = (windowHeight * (750 / windowWidth));
        self.setData({
          windowWidth: windowWidth,
          windowHeight: windowHeight,
          platform: platform 
        })
      }
    });
  },

  /**
   * 点击返回按钮
   */
  onUnload: function() {
    let goBack = this.data.goBack;
    if(goBack == "false"){
      wx.navigateBack({})
    }
  },

  /**
   * 弹出支付详细信息
   */
  showPayDetail:function(e){
    console.log(e)
    let product = e.currentTarget.dataset.product;
    let platform = this.data.platform;

    if(platform == 'ios'){//如果是苹果系统
      wx.showModal({
        title: '提示',
        content: '因Apple政策原因，IOS暂不支持小程序内付费服务，苹果用户请使用安卓设备开通！服务电话：4006-456-114',
        confirmText: '拨打电话',
        confirmColor: '#2983fe',
        success:function(e){
          if(e.confirm){
            wx.makePhoneCall({
              phoneNumber: '4006-456-114',
            })
          }
        }
      })
    }else{
      this._submit();
    }  
  },

  /**
   * 提交支付
   */
  _submit:function(e){
    let self = this;
    console.log(self.data.options)
    let product = self.data.options.category;
    let code = "";
    let user = wx.getStorageSync('user');
    let Login_random = user.Login_random; //用户登录随机值
    let zcode = user.zcode; //客户端id号

    wx.showLoading({
      title: '购买中',
      mask:true
    })

    // 登录
    wx.login({
      success: res => {
        // 发送 res.code 到后台换取 openId, sessionKey, unionId
        code = res.code;
        console.log("action=getSessionKey&code=" + code)
        app.post(API_URL1, "action=getSessionKey&code=" + code, false, false, "").then((res) => {
          console.log(res)
          let openid = res.data.openid;
          console.log("action=unifiedorder&loginrandom=" + Login_random + "&zcode=" + zcode + "&product=" + product + "&openid=" + openid)
          app.post(API_URL1, "action=unifiedorder&loginrandom=" + Login_random + "&zcode=" + zcode + "&product=" + product + "&openid=" + openid, false, false, "","",false,self).then((res) => {

            let status = res.data.status;

            if (status == 1) {
              let timestamp = Date.parse(new Date());
              timestamp = timestamp / 1000;
              timestamp = timestamp.toString();
              let nonceStr = "TEST";
              let prepay_id = res.data.prepay_id;
              let appId = "wx1264a65218ad1fab";
              let myPackage = "prepay_id=" + prepay_id;
              let key = "e625b97ae82c3622af5f5a56d1118825";

              let str = "appId=" + appId + "&nonceStr=" + nonceStr + "&package=" + myPackage + "&signType=MD5&timeStamp=" + timestamp + "&key=" + key;
              let paySign = md5.md5(str).toUpperCase();
              wx.hideLoading();
              let myObject = {
                'timeStamp': timestamp,
                'nonceStr': nonceStr,
                'package': myPackage,
                'paySign': paySign,
                'signType': "MD5",
                success: function (res) {
                  if (res.errMsg == "requestPayment:ok") { //成功付款后
                    console.log("action=BuyTC&loginrandom=" + Login_random + "&zcode=" + zcode + "&product=" + product)
                    app.post(API_URL1, "action=BuyTC&loginrandom=" + Login_random + "&zcode=" + zcode + "&product=" + product, true, false, "购买中", "",false,self).then((res) => {
                      console.log(res)
                      // let pages = getCurrentPages();
                      // let  prevPage = pages[pages.length - 2];  //上一个页面
                      // prevPage.setData({
                      //   buied: product
                      // })
    
                      wx.navigateBack({})
                      wx.showToast({
                        title: '购买成功',
                        icon:'none',
                        duration:3000
                      })
                    })
                  }
                },
                fail: function (res) {
                }
              }
              wx.requestPayment(myObject)
            }
          })
        })
      }
    })
  }
})