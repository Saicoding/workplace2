// pages/phoneLogin/phoneLogin.js
const API_URL = 'https://xcx2.chinaplat.com/'; //接口地址
let md5 = require('../../common/MD5.js')
const app = getApp();

Page({

  /**
   * 页面的初始数据
   */
  data: {
    text: '获取验证码', //按钮文字
    currentTime: 61, //倒计时
    disabled: false, //按钮是否禁用
    phone: '' //获取到的手机栏中的值
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.setData({
      url: decodeURIComponent(options.url),
      ifGoPage:options.ifGoPage,
    })
  },

  /**
   * 获取手机栏input中的值
   */
  phoneInput: function (e) {
    this.setData({
      phone: e.detail.value
    })
  },

  /**
   * 获取验证码input中的值
   */
  codeInput:function(e){
    this.setData({
      code: e.detail.value
    })
  },

  /**
   * /获取验证码按钮
   */
  bindButtonTap: function () {
    let self = this;

    self.setData({
      disabled: true, //只要点击了按钮就让按钮禁用 （避免正常情况下多次触发定时器事件）
      color: '#ccc',
    })

    let phone = self.data.phone;
    let currentTime = self.data.currentTime //把手机号跟倒计时值变例成js值

    let warn = null; //warn为当手机号为空或格式不正确时提示用户的文字，默认为空


    if (phone == '') {
      warn = "号码不能为空";
    } else if (phone.trim().length != 11 || !/^1[3|4|5|6|7|8|9]\d{9}$/.test(phone)) {
      warn = "手机号格式不正确";
    } else {
      let Sign = md5.md5(phone + "ChinaplatSms").toLowerCase() ;
      //当手机号正确的时候提示用户短信验证码已经发送
      app.post(API_URL, "action=SendSms&mobile=" + self.data.phone + "&Sign=" + Sign, true, true, "发送中").then((res) => {
        wx.showToast({
          title: '短信验证码已发送',
          icon: 'none',
          duration: 2000
        });
        let identifyCode = res.data.data[0].yzm;
        console.log(identifyCode)
        self.setData({
          identifyCode: identifyCode
        })
      })

      //设置一分钟的倒计时
      var interval = setInterval(function () {
        currentTime--; //每执行一次让倒计时秒数减一
        self.setData({
          text: currentTime + 's', //按钮文字变成倒计时对应秒数
        })
        //如果当秒数小于等于0时 停止计时器 且按钮文字变成重新发送 且按钮变成可用状态 倒计时的秒数也要恢复成默认秒数 即让获取验证码的按钮恢复到初始化状态只改变按钮文字
        if (currentTime <= 0) {
         clearInterval(interval)
          self.setData({
            text: '重新发送',
            currentTime: 61,
            disabled: false,
            color: '#388ff8'
          })
        }
      }, 1000);

    };

    //判断 当提示错误信息文字不为空 即手机号输入有问题时提示用户错误信息 并且提示完之后一定要让按钮为可用状态 因为点击按钮时设置了只要点击了按钮就让按钮禁用的情况
    if (warn != null) {
      wx.showModal({
        title: '提示',
        content: warn
      })

      self.setData({
        disabled: false,
        color: '#388ff8'
      })
      return;

    };
  },

  /**
   * 点击用户协议
   */
  viewSign:function(){
    wx.navigateTo({
      url: '/pages/subscriber/subscriber',
    })
  },

  /**
   * 点击确定按钮
   */
  confirm:function(){
    let self = this;
    let code = self.data.code;
    let identifyCode = self.data.identifyCode;
    let ifGoPage = self.data.ifGoPage;
    let url = self.data.url;

    if(code == identifyCode && code !=undefined){//如果相等
      //开始登录
      app.post(API_URL, "action=Login&mobile=" + self.data.phone + "&yzm=" + code, true, true, "登录中").then((res) => {
        let user = res.data.list[0];

        wx.setStorage({
          key: 'user',
          data: user,
          success:function(){
            wx.navigateBack({
              delta: 2
            })

            if (ifGoPage == "true") {
              wx.navigateTo({
                url: url,
              })
            }
          },
          fail:function(){
            console.log('存储失败')
          }
        })
      })
    } else if (code == undefined){
      wx.showToast({
        title: '验证码不能为空',
        icon: 'none',
        duration: 2000
      });
    }else{
      wx.showToast({
        title: '验证码不正确',
        icon: 'none',
        duration: 2000
      });
    }
  },
})