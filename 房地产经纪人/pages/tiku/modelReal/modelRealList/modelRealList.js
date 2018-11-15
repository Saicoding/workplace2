// pages/tiku/modelReal/modelRealList/modelRealList.js
const API_URL = 'https://xcx2.chinaplat.com/'; //接口地址
const app = getApp(); //获取app对象
let common = require('../../../../common/shiti.js');

let validate = require('../../../../common/validate.js');
let  buttonClicked = false;

Page({
  /**
   * 页面的初始数据
   */
  data: {
    isHasShiti: true,//默认有试题
    isLoaded:false// 默认没有载入完毕
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    let self = this;
    let user = wx.getStorageSync('user');
    let username = user.username;
    let acode = user.acode;
    let tiType = options.ti == "model"?1:2;//获取题的类型
    let title = options.ti == "model" ?"模拟真题":"考前押题";
    wx.setNavigationBarTitle({
      title: title
    }) //设置标题

    self.setData({
      title: title,
    })

    let px = 1;

    app.post(API_URL, "action=GetTestlist&kid=" + options.kid + "&username=" + username + "&acode=" + acode + "&types=" + tiType, false, true, "","",true,self).then((res) => {
      let modelList = res.data.list;

      for (let i = 0; i < modelList.length; i++) { 
        let model = modelList[i];

        //设置title前面小圆的颜色
        switch (i % 3) {
          case 0:
            model.bgColor = "#eb3d49";
            break;
          case 1:
            model.bgColor = "#45e6d7";
            break;
          case 2:
            model.bgColor = "#ffc740";
            break;
        }

        //设置分数字体颜色
        let score = model.test_score;

        model.ifDone = score == 0 ?false:true;

        model.scoreColor = score >= 60 ? "#59a22e" : "#f35f70";

      }

      self.setData({
        modelList: modelList, //真题列表
        isLoaded: true,
        tiType:tiType//题的类型（押题，真题）
      })
    }).catch((errMsg) => {
      console.log(errMsg); //错误提示信息
      wx.hideLoading();
    });
  },

  GOModelRealDetail: function(e) {
    if(buttonClicked) return;
    buttonClicked = true;
    let self = this;
    if(self.buttonClicked) return;
    let id = e.currentTarget.dataset.id;
    let test_score = e.currentTarget.dataset.test_score;
    let times = e.currentTarget.dataset.times;
    let title = e.currentTarget.dataset.title;
    let totalscore = e.currentTarget.dataset.totalscore;
    let tiType = self.data.tiType;

    let url = encodeURIComponent('/pages/tiku/modelReal/modelRealDetail/modelRealDetail?id=' + id + "&times=" + times + "&title=" + title + "&totalscore=" + totalscore + "&tiType=" + tiType + "&test_score=" + test_score);
    let url1 = '/pages/tiku/modelReal/modelRealDetail/modelRealDetail?id=' + id + "&times=" + times + "&title=" + title + "&totalscore=" + totalscore + "&tiType=" + tiType + "&test_score=" + test_score;


    //获取是否有登录权限
    wx.getStorage({
      key: 'user',
      success: function (res) { //如果已经登陆过
        let user = res.data;
        let zcode = user.zcode;
        let LoginRandom = user.Login_random;
        let pwd = user.pwd

        //验证重复登录:  参数:1.url1  没转码的url  2.url 转码的url 3.true 代码验证如果是重复登录是否跳转到要导向的页面
        validate.validateDPLLoginOrPwdChange(zcode, LoginRandom, pwd, url1, url,true)
      },
      fail: function (res) { //如果没有username就跳转到登录界面
        wx.navigateTo({
          url: '/pages/login1/login1?url=' + url + "&ifGoPage=true",
        })
      }
    })
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function() {
    let self = this;
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
   * 生命周期函数
   */
  onShow:function(){
    buttonClicked = false;
  }
})