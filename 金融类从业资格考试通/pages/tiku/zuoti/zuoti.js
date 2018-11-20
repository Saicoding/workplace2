// pages/tiku/zuoti/index.js
const API_URL = 'https://xcx2.chinaplat.com/jinrong/'; //接口地址
let common = require('../../../common/shiti.js');
let animate = require('../../../common/animate.js')
let easeOutAnimation = animate.easeOutAnimation();
let easeInAnimation = animate.easeInAnimation();
let post = require('../../../common/post.js');

let data = require('../../../data/data.js')

const util = require('../../../utils/util.js')
//把winHeight设为常量，不要放在data里（一般来说不用于渲染的数据都不能放在data里）
const winHeight = wx.getSystemInfoSync().windowHeight
const app = getApp();

Page({
  /**
   * 页面的初始数据
   */
  data: {
    id: 0, //书的编号,默认为0
    rightNum: 0, //正确答案数
    wrongNum: 0, //错误答案数

    isLoaded: false, //是否已经载入完毕,用于控制过场动画
    cl_question_hidden: false, //材料题是否隐藏题目
    checked: false, //选项框是否被选择
    doneAnswerArray: [], //已做答案数组
    markAnswerItems: [], //设置一个空数组

    isModelReal: false, //是不是真题或者押题
    isSubmit: false, //是否已提交答卷
    circular: true, //默认slwiper可以循环滚动
    myFavorite: 0, //默认收藏按钮是0
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    console.log(options)
    wx.setNavigationBarTitle({
      title: options.title
    }) //设置标题

    let self = this;

    let user = wx.getStorageSync('user');

    let page = 1;//默认是第一页
    let LoginRandom = user.Login_random == undefined ? "" : user.Login_random;
    let zcode = user.zcode == undefined ? "" : user.zcode;
    let username = user.username;
    let category = options.category;

    let circular = false;
    let myFavorite = 0;

    //根据章是否有字节来定制最后一次访问的key
    let last_view_key = category+'last_view' + options.zhangjie_id + options.zhangIdx + (options.jieIdx != "undefined" ? options.jieIdx : "") + user.username;

    let last_view = wx.getStorageSync(last_view_key); //得到最后一次的题目
    let px = last_view.px; //最后一次浏览的题的编号

    if (px == undefined) {
      px = 1 //如果没有这个px说明这个章节首次访问
      circular: false
    }else{
      page = ((px - 1) - (px - 1) % 10) / 10 + 1;//当前页
    }

    app.post(API_URL, "action=SelectShiti&LoginRandom=" + LoginRandom + "&z_id=" + options.z_id + "&zcode=" + zcode + "&page="+page, false, false, "").then((res) => {
      post.zuotiOnload(options, px, circular, myFavorite, res, user, page,self) //对数据进行处理和初始化
    }).catch((errMsg) => {
      wx.hideLoading();
    });
  },
  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function() {
    let self = this;
    //获得dialog组件
    this.markAnswer = this.selectComponent("#markAnswer");
    this.errorRecovery = this.selectComponent("#errorRecovery");
    wx.getSystemInfo({ //得到窗口高度,这里必须要用到异步,而且要等到窗口bar显示后再去获取,所以要在onReady周期函数中使用获取窗口高度方法
      success: function(res) { //转换窗口高度
        let windowHeight = res.windowHeight;
        let windowWidth = res.windowWidth;
        windowHeight = (windowHeight * (750 / windowWidth));
        self.setData({
          windowWidth: windowWidth,
          windowHeight: windowHeight
        })
      }
    });
  },

  /**
   * slider改变事件
   */
  sliderChange: function(e) {
    let source = e.detail.source;
    if (source != "touch") return;

    let self = this;
    let lastSliderIndex = self.data.lastSliderIndex;
    let current = e.detail.current;

    let myFavorite = 0;
    let pageArray = self.data.pageArray; //当前所有已经渲染的页面数组
    let pageall = self.data.pageall; //当前题库错题页总页数

    let z_id = self.data.z_id;
    let LoginRandom = self.data.LoginRandom;
    let zcode = self.data.zcode;

    let px = self.data.px;
    let direction = "";
    let shitiArray = self.data.shitiArray;
    let doneAnswerArray = self.data.doneAnswerArray;
    let circular = self.data.circular;

    //判断滑动方向
    if ((lastSliderIndex == 0 && current == 1) || (lastSliderIndex == 1 && current == 2) || (lastSliderIndex == 2 && current == 0)) { //左滑
      direction = "左滑";
    } else {
      direction = "右滑";
    }

    if (direction == "左滑") {
      px++;
      if (px % 10 >= 7) { //滑动到号大于7，这时判断有没有下一个page
        let nextPage = ((px - 1) - (px - 1) % 10) / 10 + 2;
        console.log(nextPage)
        console.log(pageall)

        if (pageArray.indexOf(nextPage) == -1 && nextPage <= pageall) { //已渲染数组不包含下一页面
          pageArray.push(nextPage); //请求后就添加到已渲染数组
          self.setData({
            pageArray: pageArray
          })

            app.post(API_URL, "action=SelectShiti&LoginRandom=" + LoginRandom + "&z_id=" + z_id + "&zcode=" + zcode + "&page="+nextPage, false, false, "", true, self).then((res) => {
            console.log(res)
            let newWrongShitiArray = res.data.shiti;

            common.initNewWrongArrayDoneAnswer(newWrongShitiArray, nextPage - 1); //将试题的所有done_daan置空

            for (let i = 0; i < newWrongShitiArray.length; i++) {
              shitiArray[i + (nextPage - 1) * 10] = newWrongShitiArray[i];
            }
            console.log(shitiArray)

            self.setData({
              shitiArray: shitiArray,
            })
          }).catch((errMsg) => {
            console.log(errMsg); //错误提示信息
            wx.hideLoading();
          });
        }
      }
    } else {
      px--;

      if (px % 10 <= 3) { //滑动到小于等于3时，这时判断有没有上一个page
        let prePage = ((px - 1) - (px - 1) % 10) / 10;

        if (pageArray.indexOf(prePage) == -1 && prePage >= 1) { //已渲染数组不包含下一页面
          pageArray.push(prePage); //请求后就添加到已渲染数组
          self.setData({
            pageArray: pageArray
          })

          app.post(API_URL, "action=SelectShiti&LoginRandom=" + LoginRandom + "&z_id=" + z_id + "&zcode=" + zcode + "&page=" + prePage, false, false, "", true, self).then((res) => {

            let newWrongShitiArray = res.data.shiti;

            common.initNewWrongArrayDoneAnswer(newWrongShitiArray, prePage - 1); //将试题的所有done_daan置空

            for (let i = 0; i < newWrongShitiArray.length; i++) {
              shitiArray[i + (prePage - 1) * 10] = newWrongShitiArray[i];
            }

            self.setData({
              shitiArray: shitiArray,
            })
          }).catch((errMsg) => {
            console.log(errMsg); //错误提示信息
            wx.hideLoading();
          });
        }
      }
    }

    let preShiti = undefined; //前一题
    let nextShiti = undefined; //后一题
    let midShiti = shitiArray[px - 1]; //中间题
    myFavorite = midShiti.favorite;

    //每次滑动结束后初始化前一题和后一题
    if (direction == "左滑") {
      if (px < shitiArray.length) { //如果还有下一题
        nextShiti = shitiArray[px];
        common.initShiti(nextShiti, self); //初始化试题对象

        //先处理是否是已经回答的题    
        common.processDoneAnswer(nextShiti.done_daan, nextShiti, self);
      }
      preShiti = shitiArray[px - 2]; //肯定会有上一题
    } else { //右滑
      if (px > 1) { //如果还有上一题
        preShiti = shitiArray[px - 2];
        common.initShiti(preShiti, self); //初始化试题对象
        common.processDoneAnswer(preShiti.done_daan, preShiti, self);
      }
      nextShiti = shitiArray[px];
    }

    common.storeLastShiti(px, self); //存储最后一题的状态


    //滑动结束后,更新滑动试题数组
    let sliderShitiArray = [];

    if (px != 1 && px != shitiArray.length) {
      if (current == 1) {
        if (nextShiti != undefined) sliderShitiArray[2] = nextShiti;
        sliderShitiArray[1] = midShiti;
        if (preShiti != undefined) sliderShitiArray[0] = preShiti;
      } else if (current == 2) {
        if (nextShiti != undefined) sliderShitiArray[0] = nextShiti;
        sliderShitiArray[2] = midShiti;
        if (preShiti != undefined) sliderShitiArray[1] = preShiti;

      } else {
        if (nextShiti != undefined) sliderShitiArray[1] = nextShiti;
        sliderShitiArray[0] = midShiti;
        if (preShiti != undefined) sliderShitiArray[2] = preShiti;
      }
    } else if (px == 1) {
      sliderShitiArray[0] = midShiti;
      sliderShitiArray[1] = nextShiti;
      current = 0;
      self.setData({
        myCurrent: 0
      })
    } else if (px == shitiArray.length) {
      sliderShitiArray[0] = preShiti;
      sliderShitiArray[1] = midShiti;
      current = 1;
      self.setData({
        myCurrent: 1
      })
    }


    circular = px == 1 || px == shitiArray.length ? false : true //如果滑动后编号是1,或者最后一个就禁止循环滑动

    self.setData({ //每滑动一下,更新试题
      shitiArray: shitiArray,
      sliderShitiArray: sliderShitiArray,
      circular: circular,
      lastSliderIndex: current,
      xiaotiCurrent: 0, //没滑动一道题都将材料题小题的滑动框index置为0
      myFavorite: myFavorite,
      px: px,
      checked: false
    })

  },


  /**
   * 作答
   */
  _answerSelect: function(e) {
    let self = this;
    let px = self.data.px;
    let done_daan = "";
    let shitiArray = self.data.shitiArray;

    let sliderShitiArray = self.data.sliderShitiArray;
    let current = self.data.lastSliderIndex //当前滑动编号
    let currentShiti = sliderShitiArray[current];

    let shiti = shitiArray[px - 1]; //本试题对象

    done_daan = shiti.TX == 1 ? e.detail.done_daan : shiti.selectAnswer; //根据单选还是多选得到done_daan

    if (shiti.TX == 2 && shiti.selectAnswer == undefined) {
      wx.showToast({
        title: '还没有作答 !',
        icon: 'none',
      })
      return;
    }

    if (shiti.isAnswer) return;

    common.changeSelectStatus(done_daan, shiti, self); //改变试题状态
    common.changeSelectStatus(done_daan, currentShiti, self); //改变试题状态

    this.setData({
      shitiArray: shitiArray,
      sliderShitiArray: sliderShitiArray
    })

    common.changeNum(shiti.flag, self); //更新答题的正确和错误数量

    common.postAnswerToServer(self.data.LoginRandom, self.data.zcode, shiti.id, shiti.flag, shiti.done_daan, app, API_URL); //向服务器提交答题结
    common.storeAnswerStatus(shiti, self); //存储答题状态

    common.setMarkAnswer(shiti, self.data.isModelReal, self.data.isSubmit, self) //更新答题板状态

    common.ifDoneAll(shitiArray, self.data.doneAnswerArray); //判断是不是所有题已经做完

  },

  /**
   * 多选题选一个选项
   */
  _checkVal: function(e) {
    let self = this;
    let done_daan = e.detail.done_daan.sort();
    let px = self.data.px;
    let shitiArray = self.data.shitiArray;

    let sliderShitiArray = self.data.sliderShitiArray;
    let current = self.data.lastSliderIndex //当前滑动编号
    let currentShiti = sliderShitiArray[current];

    let shiti = shitiArray[px - 1];
    //初始化多选的checked值
    // common.initMultiSelectChecked(shiti);
    common.initMultiSelectChecked(currentShiti);
    //遍历这个答案，根据答案设置shiti的checked属性

    done_daan = common.changeShitiChecked(done_daan, currentShiti);
    common.changeMultiShiti(done_daan, currentShiti);
    common.changeMultiShiti(done_daan, shiti);
    this.setData({
      sliderShitiArray: sliderShitiArray,
      shitiArray: shitiArray
    })
  },

  /**
   * 刚载入时的动画
   */
  onShow: function(e) {
    let self = this;

    // common.lianxiRestart(self); //重新开始作答
  },

  /**
   * 切换纠错面板
   */

  _toggleErrorRecovery: function(e) {
    this.markAnswer.hideDialog();
    this.errorRecovery.toogleDialog();
  },

  /**
   * 切换答题板
   */
  _toogleMarkAnswer: function() {
    this.errorRecovery.hideDialog();
    this.markAnswer.toogleDialog();
  },
  /**
   * 显示答题板
   */
  showMarkAnswer: function() {
    this.markAnswer.showDialog();
  },
  /**
   * 隐藏答题板
   */
  _hideMarkAnswer: function() {
    this.markAnswer.hideDialog();
  },
  /**
   * 切换是否收藏该试题
   */
  _toogleMark: function(e) {
    let self = this;
    let username = self.data.username;
    let acode = self.data.acode;
    let myFavorite = self.data.myFavorite;
    let px = self.data.px;
    let shitiArray = self.data.shitiArray;
    let shiti = shitiArray[px - 1];

    shiti.favorite = shiti.favorite == 0 ? 1 : 0;

    this.setData({
      myFavorite: shiti.favorite,
      shitiArray: shitiArray
    })
    app.post(API_URL, "action=FavoriteShiti&tid=" + shiti.id + "&username=" + username + "&acode=" + acode, false).then((res) => {

    })
  },

  /**
   * 答题板点击编号事件,设置当前题号为点击的题号
   */
  _tapEvent: function(e) {
    let self = this;
    let px = e.detail.px;

    let zhangIdx = self.data.zhangIdx;
    let jieIdx = self.data.jieIdx;

    let shitiArray = self.data.shitiArray;
    let doneAnswerArray = self.data.doneAnswerArray;

    let z_id = self.data.z_id;
    let LoginRandom = self.data.LoginRandom;
    let zcode = self.data.zcode;

    let pageArray = self.data.pageArray; //当前所有已经渲染的页面数组
    let pageall = self.data.pageall; //当前题库错题页总页数

    let current = self.data.lastSliderIndex; //当前swiper的index
    let circular = self.data.circular;

    //得到swiper数组
    let preShiti = undefined; //前一题
    let nextShiti = undefined; //后一题
    let midShiti = shitiArray[px - 1]; //中间题

    let page = ((px - 1) - (px - 1) % 10) / 10 + 1;//当前页

    let prepage = page - 1;//上一页
    let nextPage = page + 1;//下一页

    self._hideMarkAnswer();

    //如果渲染数组不包含当前页面
    if (pageArray.indexOf(page) == -1) {
      pageArray.push(page);

      if (px % 10 == 1 && prepage >= 1 && pageArray.indexOf(prepage) == -1) {//如果是页码的第一题,并且有上一页,并且不在已渲染数组中
        pageArray.push(prepage);
        self.setData({
          isLoaded: false,
          pageArray: pageArray
        })

        app.post(API_URL, "action = SelectShiti&LoginRandom=" + LoginRandom + "&z_id=" + z_id + "&zcode=" + zcode + "&page=" + page, false, false, "", true, self).then((res) => {

          let newWrongShitiArray = res.data.shiti;

          common.initNewWrongArrayDoneAnswer(newWrongShitiArray, page - 1); //将试题的所有done_daan置空

          for (let i = 0; i < newWrongShitiArray.length; i++) {
            shitiArray[i + (page - 1) * 10] = newWrongShitiArray[i];
          }

          app.post(API_URL, "action=SelectShiti&LoginRandom=" + LoginRandom + "&z_id=" + z_id + "&zcode=" + zcode + "&page=" + prepage, false, false, "", true, self).then((res) => {

            let newWrongShitiArray = res.data.shiti;

            common.initNewWrongArrayDoneAnswer(newWrongShitiArray, prepage - 1); //将试题的所有done_daan置空

            for (let i = 0; i < newWrongShitiArray.length; i++) {
              shitiArray[i + (prepage - 1) * 10] = newWrongShitiArray[i];
            }
            midShiti = shitiArray[px - 1];

            common.processTapLianxiAnswer(midShiti, preShiti, nextShiti, px, current, circular, shitiArray, self);

          }).catch((errMsg) => {
            console.log(errMsg); //错误提示信息
            wx.hideLoading();
          });

        }).catch((errMsg) => {
          console.log(errMsg); //错误提示信息
          wx.hideLoading();
        });
      } else if (px % 10 == 0 && nextPage <= pageall && pageArray.indexOf(nextPage) == -1) {
        pageArray.push(nextPage);
        self.setData({
          isLoaded: false,
          pageArray: pageArray
        })
        app.post(API_URL, "action=SelectShiti&LoginRandom=" + LoginRandom + "&z_id=" + z_id + "&zcode=" + zcode + "&page=" + page, false, false, "", true, self).then((res) => {
          let newWrongShitiArray = res.data.shiti;

          common.initNewWrongArrayDoneAnswer(newWrongShitiArray, page - 1); //将试题的所有done_daan置空

          for (let i = 0; i < newWrongShitiArray.length; i++) {
            shitiArray[i + (page - 1) * 10] = newWrongShitiArray[i];
          }

          app.post(API_URL, "action=SelectShiti&LoginRandom=" + LoginRandom + "&z_id=" + z_id + "&zcode=" + zcode + "&page=" + nextPage, false, false, "", true, self).then((res) => {

            let newWrongShitiArray = res.data.shiti;

            common.initNewWrongArrayDoneAnswer(newWrongShitiArray, nextPage - 1); //将试题的所有done_daan置空

            for (let i = 0; i < newWrongShitiArray.length; i++) {
              shitiArray[i + (nextPage - 1) * 10] = newWrongShitiArray[i];
            }

            midShiti = shitiArray[px - 1];

            common.processTapLianxiAnswer(midShiti, preShiti, nextShiti, px, current, circular, shitiArray, self);

          }).catch((errMsg) => {
            console.log(errMsg); //错误提示信息
            wx.hideLoading();
          });

        }).catch((errMsg) => {
          console.log(errMsg); //错误提示信息
          wx.hideLoading();
        });

      } else {
        self.setData({
          isLoaded: false,
          pageArray: pageArray
        })

        app.post(API_URL, "action=SelectShiti&LoginRandom=" + LoginRandom + "&z_id=" + z_id + "&zcode=" + zcode + "&page=" + page, false, false, "", true, self).then((res) => {
          let newWrongShitiArray = res.data.shiti;

          common.initNewWrongArrayDoneAnswer(newWrongShitiArray, page - 1); //将试题的所有done_daan置空

          for (let i = 0; i < newWrongShitiArray.length; i++) {
            shitiArray[i + (page - 1) * 10] = newWrongShitiArray[i];
          }

          midShiti = shitiArray[px - 1];

          console.log(midShiti)

          common.processTapLianxiAnswer(midShiti, preShiti, nextShiti, px, current, circular, shitiArray, self);

        }).catch((errMsg) => {
          console.log(errMsg); //错误提示信息
          wx.hideLoading();
        });
      }

    } else {
      common.processTapLianxiAnswer(midShiti, preShiti, nextShiti, px, current, circular, shitiArray, self);
    }

  },
  /**
   * 纠错提交后
   */
  _submit: function(e) {
    let self = this;

    let user = wx.getStorageSync('user');
    let LoginRandom = user.Login_random;
    let zcode = user.zcode;
    let reason = e.detail.reason;
    let px = self.data.px;
    let shitiArray = self.data.shitiArray;
    let shiti = shitiArray[px - 1];
    let stid = shiti.id

    app.post(API_URL, "action=JiuCuo&LoginRandom=" + LoginRandom + "&zcode=" + zcode + "&stid=" + stid + "&reason=" + reason, true, false, "提交中").then((res) => {
      self.errorRecovery.hideDialog();
    })
  }
})