// pages/tiku/modelReal/modelRealDetail/modelRealDetail.js
// pages/tiku/zuoti/index.js
const API_URL = 'https://xcx2.chinaplat.com/jinrong/'; //接口地址
let common = require('../../../../common/shiti.js');
let time1 = require('../../../../common/time.js');
let animate = require('../../../../common/animate.js')
let easeOutAnimation = animate.easeOutAnimation();
let easeInAnimation = animate.easeInAnimation();
let isFold = false; //默认都是打开的
let share = require('../../../../common/share.js');

const util = require('../../../../utils/util.js')
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
    checked: false, //选项框是否被选择
    doneAnswerArray: [], //已做答案数组
    markAnswerItems: [], //设置一个空数组
    isModelReal: true, //是不是真题或者押题
    isSubmit: false, //是否已提交答卷
    circular: true, //默认slwiper可以循环滚动
    shitiNum: 1, //默认试题编号
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    let category = options.category;//试卷种类
    let colors = share.getColors(category);
    share.setColor(category,false,false);

    wx.setNavigationBarTitle({
      title: options.title
    }) //设置标题

    let self = this;
    let user = wx.getStorageSync('user');//用户名
    let LoginRandom = user.Login_random;//用户随机码
    let username = user.username;//用户名称
    let zcode = user.zcode;//用户唯一码

    let tiType = options.tiType;//题的种类,是真题还是押题
    let test_score = options.test_score;//试卷总分数
    let id = options.id;//试卷id
    let tiTypeStr = tiType == 1 ? "model" : "yati";//试卷种类
    let circular = false;//slider是否可以循环滑动
    let lastSliderIndex = 0 ;

    //根据真题定制最后一次访问的key
    let last_view_key = tiTypeStr + 'lastModelReal' + options.id + username;


    let last_model_real = wx.getStorageSync(last_view_key); //得到最后一次的题目

    let px = last_model_real.px; //最后一次浏览的题的编号
    if (px == undefined) {
      px = 1 //如果没有这个px说明这个章节首次访问
      self.setData({
        circular: false
      })
    }

    let shitiNum = px;

    app.post(API_URL, "action=SelectTestShow&sjid=" + id + "&LoginRandom=" + LoginRandom + "&zcode=" + zcode, false, true, "","",true,self).then((res) => {
      let shitiArray = res.data.list;

      common.setModelRealCLShitiPx(shitiArray)

      common.initShitiArrayDoneAnswer(shitiArray); //将试题的所有done_daan置空

      let newShitiArray = common.getNewShitiArray(shitiArray);

      //得到swiper数组
      let preShiti = undefined; //前一题
      let nextShiti = undefined; //后一题
      let midShiti = shitiArray[px - 1]; //中间题

      let sliderShitiArray = [];

      common.initShiti(midShiti, self); //初始化试题对象
      if (px != 1 && px != shitiArray.length) { //如果不是第一题也是不是最后一题
        preShiti = shitiArray[px - 2];
        common.initShiti(preShiti, self); //初始化试题对象
        nextShiti = shitiArray[px];
        common.initShiti(nextShiti, self); //初始化试题对象
      } else if (px == 1) { //如果是第一题
        nextShiti = shitiArray[px];
        common.initShiti(nextShiti, self); //初始化试题对象
      } else {
        preShiti = shitiArray[px - 2];
        common.initShiti(preShiti, self); //初始化试题对象
      }

      circular = px == 1 || px == shitiArray.length ? false : true //如果滑动后编号是1,或者最后一个就禁止循环滑动

      //得到试题总数
      let nums = 0;
      for (let i = 0; i < shitiArray.length; i++) {
        let myShiti = shitiArray[i];
        if (myShiti.TX == 1 || myShiti.TX == 2) { //单选或者多选
          nums += 1;
        } else { //材料题
          for (let j = 0; j < myShiti.xiaoti.length; j++) {
            nums += 1;
          }
        }
      }

      common.initModelRealMarkAnswer(newShitiArray, self); //初始化答题板数组

      let isSubmit = wx.getStorageSync(tiTypeStr + 'modelRealIsSubmit' + options.id + username);

      //开始计时
      let interval = "";
      console.log(isSubmit)
      if (!isSubmit) { //如果没提交
        let second = wx.getStorageSync(tiTypeStr + 'last_time' + options.id + username);
        if (second) {
          interval = common.startWatch(second, self);
        } else {
          interval = common.startWatch(options.times * 60, self);
        }
      } else { //如果已提交
        let last_gone_time_str = wx.getStorageSync(tiTypeStr + "last_gone_time" + options.id + username);

        self.modelCount.setData({
          timeStr: last_gone_time_str
        })
      }

      //对是否是已答试题做处理
      wx.getStorage({
        key: tiTypeStr + "modelReal" + options.id + username ,
        success: function(res1) {
          //根据章是否有子节所有已经回答的题
          let doneAnswerArray = res1.data;

          if (isSubmit == true) { //说明是已经是提交过答案的题
            self.setData({
              text: "重新评测",
              isSubmit: true
            })
          }

          common.setModelRealMarkAnswerItems(doneAnswerArray, self.data.nums, self.data.isModelReal, self.data.isSubmit, self); //更新答题板状态

          //映射已答题目的已作答的答案到shitiArray
          for (let i = 0; i < doneAnswerArray.length; i++) {
            let doneAnswer = doneAnswerArray[i];
            shitiArray[doneAnswer.px - 1].done_daan = doneAnswer.done_daan; //设置已答试题的答案
          }

          if (preShiti != undefined) common.processModelRealDoneAnswer(preShiti.done_daan, preShiti, self);
          common.processModelRealDoneAnswer(midShiti.done_daan, midShiti, self);
          if (nextShiti != undefined) common.processModelRealDoneAnswer(nextShiti.done_daan, nextShiti, self);

          //如果已答试题数目大于0才更新shiti
          if (doneAnswerArray.length > 0) {
            self.setData({
              sliderShitiArray: sliderShitiArray, //滑动数组
              doneAnswerArray: doneAnswerArray, //获取该节所有的已做题目
              shitiNum: shitiNum
            })
          }
        },
        fail: function() {
          wx.setStorage({
            key:tiTypeStr + "modelReal" + options.id + username,
            data: [],
          })
        }
      })

      if(px != 1 && px !=shitiArray.length){//如果不是第一题也不是最后一题
        sliderShitiArray[0] = midShiti;
        sliderShitiArray[1] = nextShiti;
        sliderShitiArray[2] = preShiti;
      }else if(px == 1){//如果是第一题
        sliderShitiArray[0] = midShiti;
        sliderShitiArray[1] = nextShiti;
      }else{//如果是最后一题
     
        sliderShitiArray[0] = preShiti;
        sliderShitiArray[1] = midShiti;
        lastSliderIndex = 1;
        self.setData({
          myCurrent:1
        })
      }

      self.setData({
        id: options.id, //真题编号
        times: options.times, //考试时间
        totalscore: options.totalscore, //总分
        tiTypeStr: tiTypeStr, //题的类型字符串
        test_score: test_score, //最高分

        interval: interval, //计时器
        title: options.title, //标题
        text: "立即交卷", //按钮文字
        nums: nums, //题数
        shitiArray: shitiArray, //整节的试题数组
        px: px,
        shitiNum: shitiNum,
        circular: circular, //是否循环
        user: user,

        category: category,//试卷种类
        colors: colors,//配色方案

        isLoaded: true, //是否已经载入完毕,用于控制过场动画
        sliderShitiArray: sliderShitiArray, //滑动数组
        lastSliderIndex: lastSliderIndex, //默认滑动条一开始是0

        newShitiArray: newShitiArray, //新的试题数组
        username: username, //用户账号名称
      });
    
      wx.hideLoading();
    }).catch((errMsg) => {
      console.log(errMsg)
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
    this.modelCount = this.selectComponent("#modelCount");

    this.modelCount.setData({
      time: time1.getTime(self.data.times)
    })

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
   * slider改变事件
   */
  sliderChange: function(e) {
    let self = this;
    let lastSliderIndex = self.data.lastSliderIndex;
    let current = e.detail.current;
    let source = e.detail.source;
    if (source != "touch") return;
    let px = self.data.px;
    let direction = "";
    let shitiArray = self.data.shitiArray;
    let doneAnswerArray = self.data.doneAnswerArray;
    let circular = self.data.circular;

    isFold = false;

    let lastStr = "#q" + px;
    let question = self.selectComponent(lastStr);

    question.setData({
      style1: "display:block;margin-bottom:30rpx;height:90rpx"
    })

    //判断滑动方向
    if ((lastSliderIndex == 0 && current == 1) || (lastSliderIndex == 1 && current == 2) || (lastSliderIndex == 2 && current == 0)) { //左滑
      direction = "左滑";
    } else {
      direction = "右滑";
    }

    if (direction == "左滑") {
      px++;
    } else {
      px--;
    }

    let shitiNum = px;
    let preShiti = undefined; //前一题
    let nextShiti = undefined; //后一题
    let midShiti = shitiArray[px - 1]; //中间题


    //每次滑动结束后初始化前一题和后一题
    if (direction == "左滑") {
      if (px < shitiArray.length) { //如果还有下一题
        nextShiti = shitiArray[px];
        common.initShiti(nextShiti, self); //初始化试题对象

        //先处理是否是已经回答的题    
        common.processModelRealDoneAnswer(nextShiti.done_daan, nextShiti, self);
      }
      preShiti = shitiArray[px - 2]; //肯定会有上一题
    } else { //右滑
      if (px > 1) { //如果还有上一题
        preShiti = shitiArray[px - 2];
        common.initShiti(preShiti, self); //初始化试题对象
        common.processModelRealDoneAnswer(preShiti.done_daan, preShiti, self);
      }
      nextShiti = shitiArray[px];
    }
   
    common.storeModelRealLastShiti(px, self); //存储最后一题的状态

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
      xiaotiCurrent:0,
      px: px,
      shitiNum: shitiNum,
      checked: false
    })
  },

  /**
   * 作答
   */
  _answerSelect: function(e) {
    let self = this;

    if (self.data.isSubmit) return

    let px = self.data.px;
    let done_daan = "";
    let shitiArray = self.data.shitiArray;

    let sliderShitiArray = self.data.sliderShitiArray;
    let current = self.data.lastSliderIndex //当前滑动编号
    let currentShiti = sliderShitiArray[current];

    let shiti = shitiArray[px - 1]; //本试题对象

    console.log(shiti.answer)

    done_daan = shiti.TX == 1 ? e.detail.done_daan : e.detail.done_daan.sort(); //根据单选还是多选得到done_daan

    common.changeModelRealSelectStatus(done_daan, currentShiti, self); //改变试题状态
    common.changeModelRealSelectStatus(done_daan, shiti, self); //改变试题状态

    this.setData({
      shitiArray: shitiArray,
      sliderShitiArray: sliderShitiArray
    })

    common.storeModelRealAnswerStatus(shiti, self); //存储答题状态

    common.setMarkAnswer(shiti, self.data.isModelReal, self.data.isSubmit, self) //更新答题板状态(单个)

    common.ifDoneAll(shitiArray, self.data.doneAnswerArray); //判断是不是所有题已经做完
  },

  /**
   * 刚载入时的动画
   */
  onShow: function(e) {
    let self = this; 
    let px = undefined;

    if (self.data.isSubmit) {
      self._showMarkAnswer();
    }
  },

  /**
   * 记录时间
   */
  onUnload: function(e) {
    let self = this;
    let isLoaded = self.data.isLoaded;
    if(!isLoaded) return;

    let user = self.data.user;
 
    let modelCount = self.modelCount;
    let pages = getCurrentPages();
    let prevPage = pages[pages.length - 2]; //上一个页面

    prevPage.setData({//设置回去标记，当返回页面时onshow可以监测到
      back:true
    })

    if (!self.data.isSubmit) {
      let time = modelCount.data.time;

      let second = time.h * 3600 + time.m * 60 + time.s;

      clearInterval(self.data.interval); //停止计时器

      wx.setStorage({
        key: self.data.tiTypeStr + 'last_time' + self.data.id + user.username,
        data: second,
      })
    }
  },

  /**
   * 切换答题板
   */
  _toogleMarkAnswer: function() {
    this.markAnswer.toogleDialog();
  },
  /**
   * 显示答题板
   */
  _showMarkAnswer: function() {
    this.markAnswer.showDialog();
  },
  /**
   * 隐藏答题板
   */
  _hideMarkAnswer: function() {
    this.markAnswer.hideDialog();
  },

  /**
   * 答题板点击编号事件,设置当前题号为点击的题号
   */
  _tapEvent: function(e) {
    let self = this;
    let px = e.detail.px;
    let cl = e.detail.cl;
    let shitiArray = self.data.shitiArray;
    let doneAnswerArray = self.data.doneAnswerArray;
    let isSubmit = self.data.isSubmit;
    let shiti = "";
    let xiaotiCurrent = 0;
    let shitiNum = px;
    isFold = false;

    let circular = self.data.circular;
    let current = self.data.lastSliderIndex; //当前swiper的index

    //得到swiper数组
    let preShiti = undefined; //前一题
    let nextShiti = undefined; //后一题
    let midShiti = undefined; //当前题
    if (cl == undefined) { //单选或者多选
      midShiti = shitiArray[px - 1];
    } else { //如果是材料题,就让px=cl
      midShiti = shitiArray[cl - 1];
      xiaotiCurrent = px - midShiti.clpx;
      px = cl;
    }

    let sliderShitiArray = [];

    common.initShiti(midShiti, self); //初始化试题对象
    common.processModelRealDoneAnswer(midShiti.done_daan, midShiti, self);

    if (px != 1 && px != shitiArray.length) { //如果不是第一题也是不是最后一题
      preShiti = shitiArray[px - 2];
      common.initShiti(preShiti, self); //初始化试题对象
      common.processModelRealDoneAnswer(preShiti.done_daan, preShiti, self);
      nextShiti = shitiArray[px];
      common.initShiti(nextShiti, self); //初始化试题对象
      common.processModelRealDoneAnswer(nextShiti.done_daan, nextShiti, self);
    } else if (px == 1) { //如果是第一题
      nextShiti = shitiArray[px];
      common.initShiti(nextShiti, self); //初始化试题对象
      common.processModelRealDoneAnswer(nextShiti.done_daan, nextShiti, self);
    } else {
      preShiti = shitiArray[px - 2];
      common.initShiti(preShiti, self); //初始化试题对象
      common.processModelRealDoneAnswer(preShiti.done_daan, preShiti, self);
    }

    common.storeModelRealLastShiti(midShiti.px, self); //存储最后一题的状态

    //点击结束后,更新滑动试题数组

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
    self.setData({
      shitiArray: shitiArray,
      sliderShitiArray: sliderShitiArray,
      px: px,
      shitiNum: shitiNum,
      circular: circular,
      lastSliderIndex: current,
      xiaotiCurrent: xiaotiCurrent,
      checked: false
    })
    self._hideMarkAnswer();
  },

  /**
   * 点击立即交卷后
   */
  _submit: function() {
    let self = this;
    let shitiArray = self.data.shitiArray; //所有试题
    let category = self.data.category;//试卷种类
    let id = self.data.id; //真题的id号
    let doneAnswerArray = self.data.doneAnswerArray; //已经回答的试题
    let times = self.data.times; //考试总时间
    let totalscore = self.data.totalscore //总分
    let allNums = self.data.nums; //题的总数
    let rightNums = 0; //正确题数
    let wrongNums = 0; //错误题数
    let score = 0; //分数
    let undone = 0; //未做题数
    let time = self.modelCount.data.time; //当前时间,对象格式
    let gone_time = 0; //花费时间

    let user = self.data.user;
    let username = user.username;
    let LoginRandom = user.Login_random;
    let zcode = user.zcode;


    let sjid = self.data.id;
    let doneUserAnswer = common.getDoneAnswers(shitiArray);


    //得到花费的时间
    gone_time = times * 60 - (time.h * 3600 + time.m * 60 + time.s);

    //得到正确数和错误数
    for (let i = 0; i < doneAnswerArray.length; i++) {
      let doneAnswer = doneAnswerArray[i]; //单个已经回答的试题
      let px = doneAnswer.px;

      switch (doneAnswer.select) {
        case "单选题":
        case "多选题":
          if (doneAnswer.isRight == 0) { //正确
            rightNums += 1;
            score += shitiArray[px - 1].score;
          } else {
            wrongNums += 1;
          }
          break;
      }
    }

    clearInterval(self.data.interval); //停止计时

    undone = allNums - rightNums - wrongNums; //计算出未做题数

    //提交结果
    app.post(API_URL, "action=SaveTestResult" +
      "&LoginRandom=" + LoginRandom +
      "&zcode=" + zcode +
      "&sjid=" + id +
      "&userAnswer1=" + doneUserAnswer.userAnswer1 +
      "&userAnswer2=" + doneUserAnswer.userAnswer2 +
      "&userAnswer99=" + doneUserAnswer.userAnswer99 +
      "&tid1=" + doneUserAnswer.tid1 +
      "&tid2=" + doneUserAnswer.tid2 +
      "&tid99=" + doneUserAnswer.tid99 +
      "&rightAnswer1=" + doneUserAnswer.rightAnswer1 +
      "&rightAnswer2=" + doneUserAnswer.rightAnswer2 +
      "&rightAnswer99=" + doneUserAnswer.rightAnswer99 +
      "&testTime=" + gone_time +
      "&testScore=" + score +
      "&TrueTid=" + doneUserAnswer.TrueTid, true, true, "计算中").then((res) => {

      if (score > self.data.test_score) { //如果比历史分数高就更新
        let pages = getCurrentPages();
        let prevPage = pages[pages.length - 2]; //上一个页面
        let modelList = prevPage.data.modelList;
        for (let i = 0; i < modelList.length; i++) {
          let model = modelList[i];
          if (id == model.id) {
            model.test_score = score;
            prevPage.setData({
              modelList: modelList
            })
          }
        }
      }

      //设置已经提交
      self.setData({
        isSubmit: true,
        text: "重新评测",
      })
      wx.setStorage({
        key: self.data.tiTypeStr + 'modelRealIsSubmit' + self.data.id + username ,
        data: true,
      })

      //设置用时
      wx.setStorage({
        key: self.data.tiTypeStr + "last_gone_time" + self.data.id + username,
        data: "用时" + time1.getGoneTimeStr(gone_time)
      })
      //设置答题板的显示文字
      self.modelCount.setData({ //设置时间显示为花费时间
        timeStr: "用时" + time1.getGoneTimeStr(gone_time)
      })

      let jibai = res.data.jibai;
      wx.navigateTo({
        url: '/pages/prompt/modelRealScore/modelRealScore?score=' + score + "&rightNums=" + rightNums + "&wrongNums=" + wrongNums + "&undone=" + undone + "&totalscore=" + totalscore + "&id=" + id + "&gone_time=" + gone_time + "&jibai=" + jibai + "&category=" + category
      })
    })

  },

  /**
   * 重新评测
   */
  _restart: function() {
    let self = this;
    common.restartModelReal(self);
  },
})