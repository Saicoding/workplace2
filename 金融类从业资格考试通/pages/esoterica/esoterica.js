// pages/hasNoErrorShiti/hasNoErrorShiti.js
const API_URL = 'https://xcx2.chinaplat.com/jinrong/'; //接口地址
const app = getApp(); //获取app对象
let validate = require('../../common/validate.js');
let buttonClicked = false;
Page({

  /**
   * 页面的初始数据
   */
  data: {
    folder_object: [], //展开字节的对象,用于判断点击的章之前有多少个字节被展开
    buttonClicked: false,
    isLoaded: false,
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    let category = options.category;

    let title = "";
    let kid = options.kid;
    let typesid = "";
    let dingwei_src = "";

    switch (category) {
      case "zq":
        typesid = "274";
        dingwei_src = "/imgs/zq_dingwei.png";
        title = "证券从业资格考试通";
        break;
      case "jj":
        typesid = "277";
        dingwei_src = "/imgs/jj_dingwei.png";
        title = "基金从业资格考试通";
        break;
      case "qh":
        typesid = "281";
        dingwei_src = "/imgs/qh_dingwei.png";
        title = "期货从业资格考试通";
        break;
    }

    this.setData({
      dingwei_src: dingwei_src
    })

    wx.setNavigationBarTitle({ //设置标题
      title: title
    })

    //先执行onload方法，如果没有登录信息就先进入登录界面，登录成功后又执行一次该方法，这时可以获取user值，
    let self = this;
    let user = wx.getStorageSync('user');

    let LoginRandom = user.Login_random == undefined ? "" : user.Login_random;
    let zcode = user.zcode == undefined ? "" : user.zcode;

    app.post(API_URL, "action=SelectZj&typesid=" + typesid).then((res) => {
      this.setZhangjie(res.data.list); //得到当前题库的缓存,并设置变量:1.所有题库数组 2.要显示的题库id 3.要显示的题库index
      app.post(API_URL, "action=GetKaodianList&kid=" + self.data.kaodian_id + "&LoginRandom=" + LoginRandom + "&zcode=" + zcode, false, false, "", "", true).then((res) => {
        let kdList = res.data.list; //考点列表
        console.log(kdList)
        self.initKdList(kdList);

        self.setData({
          kdList: kdList,
          isLoaded: true,
          user: user
        })
      })
    })
  },

  /**
   * 初始化列表信息
   */
  initKdList: function(kdList) {
    for (let i = 0; i < kdList.length; i++) {
      let kd = kdList[i];
      kd.isFolder = true;
    }
  },

  /**
   * onShow生命周期事件
   */
  onShow: function() {
    buttonClicked = false;
  },
  /**
   * 
   */
  onReady: function() {
    this.waterWave = this.selectComponent('#waterWave')
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

  /**
   * 当点击章节时
   */
  onTapZhangjie: function(e) {
    this.waterWave.containerTap(e);
    let self = this;
    let kdList = self.data.kdList;
    let index  = e.currentTarget.dataset.itemidx;
    let num = kdList[index].data.length;
    let windowWidth = self.data.windowWidth;

    let isFolder = kdList[index].isFolder; //取得现在是什么状态
    let folder_object = self.data.folder_object //取得展开章节的对象

    let jie_num = 0;

    for (let i = 0; i < folder_object.length; i++) {
      if (folder_object[i].index < index) { //如果在点击选项前面有展开字节
        jie_num += folder_object[i].num //有几个节点就加几个节点
      }
    }

    let height = 80 * num;

    let scroll = (index * 100 + jie_num * 80) * (windowWidth / 750);


    if (isFolder) { //展开
      let spreadAnimation = wx.createAnimation({
        duration: 1000,
        delay: 0,
        timingFunction: "ease"
      })

      spreadAnimation.height(height + "rpx", 0).step({

      })
      kdList[index].isFolder = false;
      kdList[index].height = height;
      kdList[index].spreadData = spreadAnimation.export()
      //添加对象到折叠数组
      folder_object.push({
        index: index,
        num: num
      })

      self.setData({
        kdList: kdList,
        scroll: scroll,
        folder_object: folder_object
      })

    } else { //折叠
      let foldAnimation = wx.createAnimation({
        duration: 1000,
        delay: 0,
        timingFunction: "ease-out"
      })

      foldAnimation.height(0, height + "rpx").step(function() {})
      //把折叠对象从折叠对象数组中去除
      for (let i = 0; i < folder_object.length; i++) {
        if (folder_object[i].index == index) {
          folder_object.splice(i, 1)
        }
      }
      kdList[index].height = 0;
      kdList[index].isFolder = true;
      kdList[index].folderData = foldAnimation.export();


      self.setData({
        kdList: kdList,
        scroll: scroll,
        folder_object: folder_object
      })
    }
  },

  /**
   * 当改变课题
   */
  bindPickerChange: function(e) {
    let self = this;

    let index = e.detail.value //picker index
    let kaodian_id = self.data.array[e.detail.value].id;
    let user = self.data.user;

    let username = user.username;
    let LoginRandom = user.Login_random;
    let zcode = user.zcode;

    self.setData({
      index: index, //设置是第几个题库
      kaodian_id: kaodian_id, //设置章节的id编号
      isLoaded: false,
    })


    app.post(API_URL, "action=GetKaodianList&kid=" + kaodian_id + "&LoginRandom=" + LoginRandom + "&zcode=" + zcode, false, false, "").then((res) => {
      let kdList = res.data.list; //考点列表

      self.initKdList(kdList);//初始化考点列表信息
      //存储本次浏览的题库

      wx.setStorageSync("kaodian_id" + username, {
        "id": kaodian_id,
        "index": index
      });
      self.setData({
        kdList: kdList,
        isLoaded: true
      })
    })
  },

  GOkaodianDetail: function(e) {
    this.waterWave.containerTap(e);
    if (buttonClicked) return;
    buttonClicked = true;

    let kdid = e.currentTarget.dataset.kdid;
    let kdList = this.data.kdList
    let title = e.currentTarget.dataset.title
    let kidx = e.currentTarget.dataset.kidx;
    let jidx = e.currentTarget.dataset.jidx;

    let url = encodeURIComponent('/pages/kaodianDetail/kaodianDetail?kdid=' + kdid + "&title=" + title + "&kidx=" + kidx + "&jidx=" + jidx );
    let url1 = '/pages/kaodianDetail/kaodianDetail?kdid=' + kdid + "&title=" + title + "&kidx=" + kidx + "&jidx=" + jidx;

    //获取是否有登录权限
    wx.getStorage({
      key: 'user',
      success: function(res) { //如果已经登陆过
        let user = res.data;
        let zcode = user.zcode;
        let LoginRandom = user.Login_random;
        let pwd = user.pwd

        validate.validateDPLLoginOrPwdChange(zcode, LoginRandom, pwd, url1, url, true) //验证重复登录
      },
      fail: function(res) { //如果没有username就跳转到登录界面
        wx.navigateTo({
          url: '/pages/login1/login1?url=' + url + "&ifGoPage=true",
        })
      }
    })
  },

  /**
   * 得到当前题库的缓存,并设置变量:1.所有题库数组 2.要显示的题库id 3.要显示的题库index
   */
  setZhangjie: function(res) {
    let self = this;
    let kaodian_id = 0;
    let index = 0;
    let user = wx.getStorageSync('user');
    let username = user.username;
    let kaodian = wx.getStorageSync("kaodian_id" + username);
    console.log(kaodian)
    if (kaodian == "") {
      kaodian_id = res[0].id;
      index = 0;
    } else {
      kaodian_id = kaodian.id;
      index = kaodian.index;
    }

    this.setData({
      array: res,
      kaodian_id: kaodian_id,
      index: index
    })
  },
})