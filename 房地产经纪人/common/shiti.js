const API_URL = 'https://xcx2.chinaplat.com/'; //接口地址
const app = getApp();
let myTime = require('time.js');
let animate = require('animate.js')
let easeOutAnimation = animate.easeOutAnimation();
let easeInAnimation = animate.easeInAnimation();
/**
 * 初始化试题
 */
function initShiti(shiti, self) {
  let TX = shiti.TX;

  //给试题设置章idx 节idx 和默认已做答案等
  shiti.isAnswer = false;

  if (TX == 1) { //单选
    shiti.num_color = "#0197f6";
    shiti.tx = "单选题"
    shiti.srcs = { //定义初始图片对象(单选)
      "A": "/imgs/A.png",
      "B": "/imgs/B.png",
      "C": "/imgs/C.png",
      "D": "/imgs/D.png",
      "E": "/imgs/E.png"
    }
  } else if (TX == 2) { //多选
    shiti.num_color = "#2ac414";
    shiti.tx = "多选题"
    shiti.srcs = { //定义初始图片对象(多选)
      "A": "/imgs/A.png",
      "B": "/imgs/B.png",
      "C": "/imgs/C.png",
      "D": "/imgs/D.png",
      "E": "/imgs/E.png"
    };
    shiti.A_checked = false;
    shiti.B_checked = false;
    shiti.C_checked = false;
    shiti.D_checked = false;
    shiti.E_checked = false;
  } else if (TX == 99) { //材料
    shiti.num_color = "#eaa91d";
    shiti.tx = "材料题";
    shiti.doneAnswer = [];

    let xiaoti = shiti.xiaoti;
    for (let i = 0; i < xiaoti.length; i++) {
      let ti = xiaoti[i];
      ti.isAnswer = false; //默认不回答

      if (ti.TX == 1) {
        ti.num_color = "#0197f6";
        ti.tx = "单选题";
        ti.checked = false;
        ti.srcs = { //定义初始图片对象(单选)
          "A": "/imgs/A.png",
          "B": "/imgs/B.png",
          "C": "/imgs/C.png",
          "D": "/imgs/D.png"
        };
      } else if (ti.TX == 2) {
        ti.num_color = "#2ac414";
        ti.tx = "多选题";
        ti.checked = false;
        ti.srcs = { //定义初始图片对象(多选)
          "A": "/imgs/A.png",
          "B": "/imgs/B.png",
          "C": "/imgs/C.png",
          "D": "/imgs/D.png",
          "E": "/imgs/E.png"
        };
        ti.A_checked = false;
        ti.B_checked = false;
        ti.C_checked = false;
        ti.D_checked = false;
        ti.E_checked = false;
      }
    }
  }
}
/**
 * 初始化新请求的错题页的试题的答案为空
 */
function initNewWrongArrayDoneAnswer(shitiArray, page) {
  for (let i = 0; i < shitiArray.length; i++) {
    shitiArray[i].px = i + 1 + page * 10; //设置每个试题的px号
    switch (shitiArray[i].TX) {
      case 1:
        shitiArray[i].done_daan = "";
      case 2:
        shitiArray[i].done_daan = [];
      case 99:
        shitiArray[i].done_daan = [];
        shitiArray[i].confirm = false;
        for (let j = 0; j < shitiArray[i].xiaoti.length; j++) {
          let ti = shitiArray[i].xiaoti[j];
          if (ti.TX == 1) {
            ti.done_daan = "";
          } else {
            ti.done_daan = [];
          }
        }
    }
  }
}

/**
 * 错题中点击答题板后的处理方法封装
 */
function processTapWrongAnswer(midShiti, preShiti, nextShiti, px, current, circular, shitiArray, self) {

  let myFavorite = midShiti.favorite;

  let sliderShitiArray = [];

  initShiti(midShiti, self); //初始化试题对象
  processDoneAnswer(midShiti.done_daan, midShiti, self);

  if (px != 1 && px != shitiArray.length) { //如果不是第一题也是不是最后一题
    preShiti = shitiArray[px - 2];
    initShiti(preShiti, self); //初始化试题对象
    processDoneAnswer(preShiti.done_daan, preShiti, self);
    nextShiti = shitiArray[px];
    initShiti(nextShiti, self); //初始化试题对象
    processDoneAnswer(nextShiti.done_daan, nextShiti, self);
  } else if (px == 1) { //如果是第一题
    nextShiti = shitiArray[px];
    initShiti(nextShiti, self); //初始化试题对象
    processDoneAnswer(nextShiti.done_daan, nextShiti, self);
  } else {
    preShiti = shitiArray[px - 2];
    initShiti(preShiti, self); //初始化试题对象
    processDoneAnswer(preShiti.done_daan, preShiti, self);
  }

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
    circular: circular,
    isLoaded: true,
    myFavorite: myFavorite,
    xiaotiCurrent: 0, //没滑动一道题都将材料题小题的滑动框index置为0
    lastSliderIndex: current,
    checked: false
  })

  //如果是材料题就判断是否动画
  if (midShiti.TX == 99) {
    let str = "#q" + px;
    let questionStr = midShiti.question; //问题的str
    let height = getQuestionHeight(questionStr); //根据问题长度，计算应该多高显示

    height = height >= 400 ? 400 : height;

    let question = self.selectComponent(str);

    animate.blockSpreadAnimation(90, height, question); //占位框动画

    question.setData({
      style2: "positon: fixed; left: 20rpx;height:" + height + "rpx", //问题框"
    })

    self.setData({
      height: height
    })
  }
}


/**
 * 错题将试题数组扩充
 */
function initShitiArray(shitiArray, all_nums) {
  let num = all_nums - shitiArray.length; //空的试题
  let blankArray = [];
  for (let i = 0; i < num; i++) {
    blankArray.push({});
  }
  shitiArray.push.apply(shitiArray, blankArray);
}

/**
 * 初始化所有试题编号
 */
function setModelRealCLShitiPx(shitiArray) {
  let num = 0;
  for (let i = 0; i < shitiArray.length; i++) {
    num++;
    let shiti = shitiArray[i];
    shiti.px = i + 1;
    //试题编号加上中间如果有材料题的数量
    if (shiti.TX == 99) { //如果是材料题
      shiti.clpx = num;
      num--;
      for (let j = 0; j < shiti.xiaoti.length; j++) {
        let ti = shiti.xiaoti[j];
        ti.px = num + 1;
        num++;
      }
    }
  }
}

/**
 * 初始化答题板数组
 */
function initMarkAnswer(nums, self) {
  let markAnswerItems = self.data.markAnswerItems;

  let lines = Math.ceil(nums / 9);//有多少行编号
  let answerHeight = lines > 5 ? 460 : lines * 90 + 10;

  for (let i = 0; i < nums; i++) {
    markAnswerItems.push({});
  }
  self.markAnswer.setData({
    markAnswerItems: markAnswerItems,
    answerHeight: answerHeight
  })
}

/**
 * 初始化modelReal答题板数组
 */
function initModelRealMarkAnswer(newShitiArray, self) {
  let markAnswerItems = self.data.markAnswerItems;

  let lines = Math.ceil(newShitiArray.length / 9);//有多少行编号
  let answerHeight = lines > 5 ? 460 : lines * 90 + 10;

  for (let i = 0; i < newShitiArray.length; i++) {
    let newShiti = newShitiArray[i];
    if (newShiti.cl == undefined) { //如果有cl这个属性
      markAnswerItems.push({});
    } else {
      markAnswerItems.push({
        'cl': newShiti.cl
      });
    }

    markAnswerItems[i].radius = newShiti.TX ==1?50:10;//映射试题种类
  }

  self.markAnswer.setData({
    markAnswerItems: markAnswerItems,
    answerHeight: answerHeight
  })
}


/**
 * 初始化modelReal答题板数组
 */
function getNewShitiArray(shitiArray) {
  let newShitiArray = []; //新的试题数组
  for (let i = 0; i < shitiArray.length; i++) {
    let shiti = shitiArray[i]; //原试题

    if (shiti.TX == 1 || shiti.TX == 2) {
      newShitiArray.push(shiti);
    } else {
      for (let j = 0; j < shiti.xiaoti.length; j++) {
        let ti = shiti.xiaoti[j]; //小题
        ti.cl = i + 1;
        newShitiArray.push(ti);
      }
    }
  }
  return newShitiArray;
}

/**
 * 初始化一个多选题的checked
 */
function initMultiSelectChecked(shiti) {
  shiti.A_checked = false;
  shiti.B_checked = false;
  shiti.C_checked = false;
  shiti.D_checked = false;
  shiti.E_checked = false;
}
/**
 * 初始化一个多选题的srcs
 */
function initMultiShitiSrcs(shiti) {
  shiti.srcs = { //定义初始图片对象(多选)
    "A": "/imgs/A.png",
    "B": "/imgs/B.png",
    "C": "/imgs/C.png",
    "D": "/imgs/D.png",
    "E": "/imgs/E.png"
  };
}

/**
 * 根据多选答案改变试题对应答案的checked
 */
function changeShitiChecked(done_daan, shiti) {
  let new_done_daan = [];
  for (let i = 0; i < done_daan.length; i++) {
    switch (done_daan[i]) {
      case "A":
        shiti.A_checked = !shiti.A_checked;
        if (shiti.A_checked) new_done_daan.push("A");
        break;
      case "B":
        shiti.B_checked = !shiti.B_checked;
        if (shiti.B_checked) new_done_daan.push("B");
        break;
      case "C":
        shiti.C_checked = !shiti.C_checked;
        if (shiti.C_checked) new_done_daan.push("C");
        break;
      case "D":
        shiti.D_checked = !shiti.D_checked;
        if (shiti.D_checked) new_done_daan.push("D");
        break;
      case "E":
        shiti.E_checked = !shiti.E_checked;
        if (shiti.E_checked) new_done_daan.push("E");
        break;
    }
  }
  return new_done_daan;
}

/**
 * 映射该节已答题目，得到答题板迭代数组
 * 参数：
 *  1.jie_answer_array 已回答数组
 *  2.nums 题的数量
 *  3.isMOdelReal 是不是真题
 *  4.isSubmit 是否已提交试题
 */
function setModelRealMarkAnswerItems(jie_answer_array, nums, isModelReal, isSubmit, self) {
  let markAnswerItems = self.data.markAnswerItems; //得到答题板组件的已答

  for (let i = 0; i < jie_answer_array.length; i++) {
    let px = jie_answer_array[i].px;
    let select = jie_answer_array[i].select;
    let style = "";

    if (select != "材料题") {
      if (isModelReal && isSubmit == false) { //如果是真题或者押题并且没有提交
        if (jie_answer_array[i].done_daan != "") { //如果答案不为空
          style = "background:#0197f6;color:white;border:1rpx solid #0197f6;"
        } else { //如果是空
          style = "border:1rpx solid #9c9c9c;"
        }

      } else if (jie_answer_array[i].isRight == 0) { //如果题是正确的
        style = "background:#90dd35;color:white;border:1rpx solid #90dd35;"
      } else if (jie_answer_array[i].isRight == 1) { //如果题是错误的
        style = "background:#fa4b5c;color:white;border:1rpx solid #fa4b5c;"
      }

      markAnswerItems[px - 1].select = jie_answer_array[i].select;
      markAnswerItems[px - 1].isRight = jie_answer_array[i].isRight
      markAnswerItems[px - 1].style = style;

    } else {
      let done_daan = jie_answer_array[i].done_daan; //多选题答案
      for (let j = 0; j < done_daan.length; j++) {
        let daan = done_daan[j];
        let tiPx = daan.px;
        if (isModelReal && isSubmit == false) { //如果是真题或者押题并且没有提交
          if (daan.done_daan != "") { //如果答案不为空
            style = "background:#0197f6;color:white;border:1rpx solid #0197f6;"
          } else { //如果是空
            style = "border:1rpx solid #9c9c9c;"
          }

        } else if (daan.isRight == 0) { //如果题是正确的
          style = "background:#90dd35;color:white;border:1rpx solid #90dd35;"
        } else if (daan.isRight == 1) { //如果题是错误的
          style = "background:#fa4b5c;color:white;border:1rpx solid #fa4b5c;"
        }

        markAnswerItems[daan.px - 1].select = "材料题";
        markAnswerItems[daan.px - 1].isRight = daan.isRight
        markAnswerItems[daan.px - 1].style = style;
        markAnswerItems[daan.px - 1].cl = jie_answer_array[i].px
      }
    }
  }

  console.log(markAnswerItems)

  self.markAnswer.setData({
    markAnswerItems: markAnswerItems
  })
}
/**
 * 设置答题板
 */
function setMarkAnswerItems(jie_answer_array, nums, isModelReal, isSubmit, self) {
  let markAnswerItems = self.data.markAnswerItems; //得到答题板组件的已答

  for (let i = 0; i < jie_answer_array.length; i++) {
    let px = jie_answer_array[i].px;
    let style = "";
    if (isModelReal && isSubmit == false) { //如果是真题或者押题
      if (jie_answer_array[i].done_daan != "") { //如果答案不为空
        style = "background:#0197f6;color:white;border:1rpx solid #0197f6;"
      } else { //如果是空
        style = "border:1rpx solid #9c9c9c;";
      }

    } else if (jie_answer_array[i].isRight == 0) { //如果题是正确的
      style = "background:#90dd35;color:white;border:1rpx solid #90dd35;"
    } else if (jie_answer_array[i].isRight == 1) { //如果题是错误的
      style = "background:#fa4b5c;color:white;border:1rpx solid #fa4b5c;"
    }

    markAnswerItems[px - 1].select = jie_answer_array[i].select;
    markAnswerItems[px - 1].isRight = jie_answer_array[i].isRight
    markAnswerItems[px - 1].style = style;

  }

  self.markAnswer.setData({
    markAnswerItems: markAnswerItems
  })
}

/**
 * 设置单个答题板
 */
function setMarkAnswer(shiti, isModelReal, isSubmit, self) {
  let markAnswerItems = self.markAnswer.data.markAnswerItems; //得到答题板组件的已答
  let px = shiti.px;
  let style = "";
  if (isModelReal && isSubmit == false) { //如果是真题或者押题
    style = "background:#0197f6;color:white;border:1rpx solid #0197f6; "
  } else if (shiti.flag == 0) { //如果题是正确的
    style = "background:#90dd35;color:white;border:1rpx solid #90dd35; "
  } else if (shiti.flag == 1) { //如果题是错误的
    style = "background:#fa4b5c;color:white;border:1rpx solid #fa4b5c; "
  }

  markAnswerItems[px - 1].select = shiti.tx;
  markAnswerItems[px - 1].isRight = shiti.flag
  markAnswerItems[px - 1].style = style;


  self.markAnswer.setData({
    markAnswerItems: markAnswerItems
  })
}

/**
 * 材料题设置单个答题板
 */

function setCLMarkAnswer(shiti, isSubmit, shitiPx, self) {
  let markAnswerItems = self.markAnswer.data.markAnswerItems; //得到答题板组件的已答
  let px = shiti.px;
  let style = "";

  if (isSubmit == false) { //如果是真题或者押题
    style = "background:#0197f6;color:white;border:1rpx solid #0197f6; "
  } else if (shiti.flag == 0) { //如果题是正确的
    style = "background:#90dd35;color:white;border:1rpx solid #90dd35; "
  } else if (shiti.flag == 1) { //如果题是错误的
    style = "background:#fa4b5c;color:white;border:1rpx solid #fa4b5c; "
  }

  markAnswerItems[px - 1].select = shiti.tx;
  markAnswerItems[px - 1].isRight = shiti.flag
  markAnswerItems[px - 1].style = style;
  markAnswerItems[px - 1].cl = shitiPx

  self.markAnswer.setData({
    markAnswerItems: markAnswerItems
  })
}

/**
 * 更新存储已答试题,更新答题板数据（单选和多选）
 */
function storeAnswerStatus(shiti, self) {
  let zhangIdx = self.data.zhangIdx;
  let jieIdx = self.data.jieIdx;
  let doneAnswerArray = self.data.doneAnswerArray
  let user = self.data.user;
  let username = user.username

  let answer_nums_array = wx.getStorageSync("shiti" + self.data.zhangjie_id + username);

  let obj = {
    "id": shiti.id,
    "done_daan": shiti.done_daan,
    "select": shiti.tx,
    "isRight": shiti.flag,
    "px": shiti.px
  }
  //根据章是否有字节的结构来
  if (jieIdx != "undefined") {
    answer_nums_array[zhangIdx][jieIdx].push(obj)
  } else {
    answer_nums_array[zhangIdx].push(obj)
  }

  doneAnswerArray.push(obj) //存储已经做题的状态

  self.setData({
    doneAnswerArray: doneAnswerArray
  })

  wx.setStorage({
    key: "shiti" + self.data.zhangjie_id + username,
    data: answer_nums_array,
  })
}

/**
 * 更新存储已答试题（单选和多选）(真题，押题)
 */
function storeModelRealAnswerStatus(shiti, self) {
  let id = self.data.id;
  let user = self.data.user;
  let username = user.username;
  let doneAnswerArray = self.data.doneAnswerArray;

  let answer_nums_array = wx.getStorageSync(self.data.tiTypeStr + "modelReal" + id + username);

  let flag = false;

  let obj = {};

  if (shiti.TX == 99) {
    obj = {
      "id": shiti.id,
      "done_daan": shiti.done_daan,
      "select": shiti.tx,
      "isRight": shiti.flag,
      "px": shiti.px,
      "clpx": shiti.clpx
    }
  } else {
    obj = {
      "id": shiti.id,
      "done_daan": shiti.done_daan,
      "select": shiti.tx,
      "isRight": shiti.flag,
      "px": shiti.px,
    }
  }



  for (let i = 0; i < answer_nums_array.length; i++) {

    let done_shiti_local = doneAnswerArray[i]; //本地已答试题
    let done_shiti_storage = answer_nums_array[i]; //已做试题（本地存储）
    if (done_shiti_storage.id == shiti.id) { //已经存储过
      done_shiti_local.done_daan = shiti.done_daan; //用新的作答覆盖之前的回答
      done_shiti_local.isRight = shiti.flag;
      done_shiti_storage.done_daan = shiti.done_daan; //用新的作答覆盖之前的回答
      done_shiti_storage.isRight = shiti.flag;
      flag = true;
      break;
    }
  }

  if (!flag) {
    answer_nums_array.push(obj); //本地做题状态数组
    doneAnswerArray.push(obj); //存储已经做题的状态
  }

  self.setData({
    doneAnswerArray: doneAnswerArray
  })

  wx.setStorage({
    key: self.data.tiTypeStr + "modelReal" + id + username,
    data: answer_nums_array,
  })
}



/**
 * 只更新本页面的已答对象
 */
function storeAnswerArray(shiti, self) {
  let doneAnswerArray = self.data.doneAnswerArray

  let obj = {
    "id": shiti.id,
    "done_daan": shiti.done_daan,
    "select": shiti.tx,
    "isRight": shiti.flag,
    "px": shiti.px
  }

  doneAnswerArray.push(obj) //存储已经做题的状态

  self.setData({
    doneAnswerArray: doneAnswerArray
  })
}

/**
 * 更改选择状态（练习题）
 */
function changeSelectStatus(done_daan, shiti, self) {
  let srcs = shiti.srcs; //选项前的图标对象
  let flag = 0; //初始化正确还是错误

  switch (shiti.tx) {
    case "单选题":
      srcs[shiti.answer] = "/imgs/right_answer.png" //将正确答案的图标变为正确图标
      //先判断是否正确
      if (done_daan != shiti.answer) {
        srcs[done_daan] = "/imgs/wrong_answer.png" //如果答错就把当前图标变为错误图标
        flag = 1;
      } else {
        srcs[done_daan] = "/imgs/right_answer1.png";
        flag = 0;
      }

      shiti.done_daan = done_daan; //已经做的选择
      shiti.isAnswer = true;
      break;
    case "多选题":
      let answers = shiti.answer.split(""); //将“ABD” 这种字符串转为字符数组
      shiti.done_daan = done_daan; //已经做的选择

      for (let i = 0; i < answers.length; i++) {
        shiti.srcs[answers[i]] = "/imgs/right_answer.png";
      }

      for (let i = 0; i < done_daan.length; i++) {
        if (answers.indexOf(done_daan[i]) >= 0) { //如果正确答案包含选中
          shiti.srcs[done_daan[i]] = "/imgs/right_answer1.png";
        } else {
          shiti.srcs[done_daan[i]] = "/imgs/wrong_answer.png";
        }
      }
      /**
       * 比较正确答案和已经选择选项，因为都是数组，数组比较内容需要转到字符串，因为数组也是对象，对象的比较默认为变量地址
       */
      if (answers.toString() == done_daan.toString()) {
        flag = 0;
      } else {
        flag = 1;
      }
      shiti.isAnswer = true;
      break;
  }
  shiti.flag = flag; //答案是否正确
}

/**
 * 更改选择状态（真题和押题）
 */
function changeModelRealSelectStatus(done_daan, shiti, self) {
  shiti.srcs = { //初始图片对象(多选)
    "A": "/imgs/A.png",
    "B": "/imgs/B.png",
    "C": "/imgs/C.png",
    "D": "/imgs/D.png",
    "E": "/imgs/E.png",
  };
  let flag = 0; //初始化正确还是错误

  switch (shiti.tx) {
    case "单选题":
      shiti.srcs[done_daan] = "/imgs/right_answer.png";
      //先判断是否正确
      if (done_daan != shiti.answer) {
        flag = 1;
      } else {
        flag = 0;
      }

      shiti.done_daan = done_daan; //已经做的选择
      break;
    case "多选题":
      //初始化多选的checked值
      initMultiSelectChecked(shiti);
      //遍历这个答案，根据答案设置shiti的checked属性
      let new_done_daan = changeShitiChecked(done_daan, shiti);
      changeMultiShiti(new_done_daan, shiti);

      let answers = shiti.answer.split(""); //将“ABD” 这种字符串转为字符数组
      shiti.done_daan = new_done_daan; //已经做的选择

      for (let i = 0; i < new_done_daan.length; i++) {
        shiti.srcs[new_done_daan[i]] = "/imgs/right_answer.png";
      }

      /**
       * 比较正确答案和已经选择选项，因为都是数组，数组比较内容需要转到字符串，因为数组也是对象，对象的比较默认为变量地址
       */
      // console.log(answers.toString() + "||" + new_done_daan.toString())
      if (answers.toString() == new_done_daan.toString()) {
        flag = 0;
      } else {
        flag = 1;
      }
      break;
  }
  // shiti.isAnswer = true;
  shiti.flag = flag; //答案是否正确
}

/**
 * 对已答试题进行处理（练习题）
 */
function processDoneAnswer(done_daan, shiti, self) {
  switch (shiti.tx) {
    case "单选题":
    case "多选题":
      if (done_daan != "") {
        changeSelectStatus(done_daan, shiti, self) //根据得到的已答数组更新试题状态
        shiti.isAnswer = true;
      }
      break;
    case "材料题":
      if (done_daan != "") { //如果材料题已答
        for (let i = 0; i < shiti.xiaoti.length; i++) {
          let ti = shiti.xiaoti[i]; //小题
          for (let j = 0; j < done_daan.length; j++) {
            let xt_done_daan = done_daan[j]; //小题已答答案对象
            if (i + 1 == xt_done_daan.px) { //找到对应小题
              changeSelectStatus(xt_done_daan.done_daan, ti, self) //根据得到的已答数组更新试题状态
              break;
            }
          }
        }
        shiti.isAnswer = true;
      }
      break;
  }
}
/**
 * 对已答试题进行处理（真题,押题）
 */
function processModelRealDoneAnswer(done_daan, shiti, self) {
  switch (shiti.tx) {
    case "单选题":
    case "多选题":
      if (self.data.isSubmit) { //提交了
        if (done_daan == "") { //提交而且答案是空
          changeModelRealSelectStatus(shiti.answer, shiti, self) //根据得到的已答数组更新试题状态   
        } else {
          changeSelectStatus(done_daan, shiti, self)
        }

      } else {
        changeModelRealSelectStatus(done_daan, shiti, self) //根据得到的已答数组更新试题状态
      }
      break;
    case "材料题":
      let xiaoti = shiti.xiaoti;
      for (let i = 0; i < xiaoti.length; i++) {
        let ti = xiaoti[i];

        if (self.data.isSubmit) { //提交了试卷
          if (done_daan == "") { //提交而且答案是空
            changeModelRealSelectStatus(ti.answer, ti, self) //根据得到的已答数组更新试题状态   
          } else {
            let isIn = false; //已答数组中有没有这个小题，默认没有
            for (let j = 0; j < done_daan.length; j++) {
              let ti_done_daan = done_daan[j];
              if (ti.px == ti_done_daan.px) {
                isIn = true;
                changeSelectStatus(ti_done_daan.done_daan, ti, self)
              }
            }
            if (!isIn) { //如果没有作答
              changeModelRealSelectStatus(ti.answer, ti, self) //根据得到的已答数组更新试题状态  
            }
          }
        } else { //如果没有提交试卷     
          for (let j = 0; j < done_daan.length; j++) {
            let ti_done_daan = done_daan[j]
            if (ti.px == ti_done_daan.px) {
              changeModelRealSelectStatus(ti_done_daan.done_daan, ti, self) //根据得到的已答数组更新试题状态
              break;
            }
          }
        }
      }
      break;
  }
}

/**
 * 根据已答试题库得到正确题数和错误题数
 * 参数:
 *    1.isRight : 试题是否正确 1 正确 0 错误
 */
function setRightWrongNums(doneAnswerArray) {
  let right = 0;
  let wrong = 0;

  for (let i = 0; i < doneAnswerArray.length; i++) {
    let doneAnswer = doneAnswerArray[i];
    if (doneAnswer.isRight == 0) {
      right++;
    } else {
      wrong++;
    }
  }
  return {
    'rightNum': right,
    'wrongNum': wrong
  };
}

/**
 * 根据flag对rightNum和wrongNum处理
 */
function changeNum(flag, self) {
  let rightNum = self.data.rightNum;
  let wrongNum = self.data.wrongNum;
  flag == 0 ? rightNum++ : wrongNum++;
  self.setData({
    rightNum: rightNum,
    wrongNum: wrongNum
  })
}

/**
 * 多选题点击一个选项后更新试题对象
 */
function changeMultiShiti(done_daan, shiti) {
  if (shiti.isAnswer) return //如果已经回答了 就不作反应
  initMultiShitiSrcs(shiti);
  shiti.selectAnswer = done_daan;

  for (let i = 0; i < done_daan.length; i++) {
    shiti.srcs[done_daan[i]] = "/imgs/right_answer.png"; //将所有选中的选项置位正确图标
  }
}

/**
 * 向服务器提交做题结果
 */
function postAnswerToServer(acode, username, id, flag, done_daan, app, API_URL) {
  //向服务器提交做题结果
  app.post(API_URL, "action=saveShitiResult&acode=" + acode + "&username=" + username + "&tid=" + id + "&flag=" + flag + "&answer=" + done_daan, false).then((res) => {})
}

/**
 * 存储最后一题(练习题)
 */
function storeLastShiti(px, self) {
  //存储当前最后一题
  let zhangIdx = self.data.zhangIdx;
  let jieIdx = self.data.jieIdx;

  let user = self.data.user;
  let username = user.username;

  let last_view_key = ""; //存储上次访问的题目的key
  if (jieIdx != "undefined") { //如果有子节
    last_view_key = 'last_view' + self.data.zhangjie_id + zhangIdx + jieIdx + username;
  } else { //如果没有子节
    last_view_key = 'last_view' + self.data.zhangjie_id + zhangIdx + username;
  }
  //本地存储最后一次访问的题目
  wx.setStorage({
    key: last_view_key,
    data: {
      'px': px
    },
  })
}
/**
 * 存储最后一题(真题，押题)
 */
function storeModelRealLastShiti(px, self) {
  let user = self.data.user;
  let username = user.username;
  //存储当前最后一题
  let last_view_key = self.data.tiTypeStr + 'lastModelReal' + self.data.id + username; //存储上次访问的题目的key
  //本地存储最后一次访问的题目
  wx.setStorage({
    key: last_view_key,
    data: {
      'px': px
    },
  })
}

/**
 * 判断所有本节题已经做完
 */
function ifDoneAll(shitiArray, doneAnswerArray) {
  if (shitiArray.length == doneAnswerArray.length) { //所有题都答完了
    wx.showToast({
      title: '所有题已经作答',
      duration: 4000
    })
  }
}
/**
 * 收藏题重新开始练习
 */
function markRestart(self) {
  let restart = self.data.restart;
  let shitiArray = self.data.shitiArray;

  if (restart) { //如果点击了重新开始练习，就清除缓存
    let shiti = self.data.shitiArray[0];

    initShiti(shiti, 1, self); //初始化试题对象

    self.setData({ //先把答题板数组置空
      markAnswerItems: []
    })

    initMarkAnswer(shitiArray.length, self); //初始化答题板数组

    self.setData({
      shiti: self.data.shitiArray[0],
      checked: false,
      doneAnswerArray: [], //已做答案数组
      rightNum: 0, //正确答案数
      wrongNum: 0, //错误答案数
    })
  }
}

/**
 * 练习题重新开始做题
 */
function lianxiRestart(self) {
  let restart = self.data.restart;
  let shitiArray = self.data.shitiArray;
  let jieIdx = self.data.jieIdx;
  let zhangIdx = self.data.zhangIdx;
  let user = self.data.user;
  let username = user.username;

  if (restart) { //如果点击了重新开始练习，就清除缓存
    let shiti = self.data.shitiArray[0];

    initShiti(shiti, 1, self); //初始化试题对象

    self.setData({ //先把答题板数组置空
      markAnswerItems: []
    })

    initMarkAnswer(shitiArray.length, self); //初始化答题板数组

    let answer_nums_array = wx.getStorageSync("shiti" + self.data.zhangjie_id + username);

    //根据章是否有字节的结构来
    if (jieIdx != "undefined") {
      answer_nums_array[zhangIdx][jieIdx] = [];
    } else {
      answer_nums_array[zhangIdx] = [];
    }
    wx.setStorageSync("shiti" + self.data.zhangjie_id + username, answer_nums_array); //重置已答数组

    self.setData({
      shiti: self.data.shitiArray[0],
      doneAnswerArray: [], //已做答案数组
      rightNum: 0, //正确答案数
      wrongNum: 0, //错误答案数
    })
  }
}

function initShitiArrayDoneAnswer(shitiArray) {
  for (let i = 0; i < shitiArray.length; i++) {
    shitiArray[i].px = i + 1; //设置每个试题的px号
    switch (shitiArray[i].TX) {
      case 1:
        shitiArray[i].done_daan = "";
      case 2:
        shitiArray[i].done_daan = [];
      case 99:
        shitiArray[i].done_daan = [];
        shitiArray[i].confirm = false;
        for (let j = 0; j < shitiArray[i].xiaoti.length; j++) {
          let ti = shitiArray[i].xiaoti[j];
          if (ti.TX == 1) {
            ti.done_daan = "";
          } else {
            ti.done_daan = [];
          }
        }
    }
  }
}

/**
 * 真题重新开始练习
 */

function restartModelReal(self) {
  let shitiArray = self.data.shitiArray;
  let user = self.data.user;
  let username = user.username;

  initShitiArrayDoneAnswer(shitiArray); //将所有问题已答置空

  //得到swiper数组
  let midShiti = shitiArray[0]; //中间题
  let nextShiti = shitiArray[1]; //后一题
  initShiti(midShiti, self); //初始化试题对象
  initShiti(nextShiti, self); //初始化试题对象

  let sliderShitiArray = [];

  sliderShitiArray[0] = midShiti;
  sliderShitiArray[1] = nextShiti;


  self.setData({ //先把答题板数组置空
    myCurrent: 0,
    shitiNum: 1,
    lastSliderIndex: 0, //把最后一次的slider置位0,否则重置后滑动时不会得到正确的px值
    markAnswerItems: [],
    sliderShitiArray: sliderShitiArray,
    px: 1
  })

  clearInterval(self.data.interval); //停止计时
  startWatch(self.data.times * 60, self); //重新开始计时

  initModelRealMarkAnswer(self.data.newShitiArray, self); //初始化答题板数组

  let answer_nums_array = wx.getStorageSync(self.data.tiTypeStr + "modelReal" + self.data.id + username); //将已答答案置空
  wx.setStorage({
    key: self.data.tiTypeStr + "modelReal" + self.data.id + username,
    data: [],
  })
  wx.setStorage({
    key: self.data.tiTypeStr + "modelRealIsSubmit" + self.data.id + username,
    data: false,
  })
  self.setData({
    shiti: self.data.shitiArray[0],
    doneAnswerArray: [], //已做答案数组
    shitiArray: shitiArray,
    isSubmit: false,
    checked: false,
    text: "立即交卷"
  })
}

/**
 * 开始计时
 */

function startWatch(startTime, self) {
  let interval = setInterval(function() {
    startTime--;
    let time = myTime.getTime(startTime);
    let hStr = time.h;
    let mStr = time.m >= 10 ? time.m : '0' + time.m;
    let sStr = time.s >= 10 ? time.s : '0' + time.s;

    let timeStr = "倒计时" + hStr + ":" + mStr + ":" + sStr;
    self.modelCount.setData({
      timeStr: timeStr,
      time: time,
    })

    self.setData({
      interval: interval
    })
  }, 1000)

  return interval;
}
/**
 * 去除最后一个字符
 */
function delLastStr(str) {
  str = str.substring(0, str.length - 1);
  return str;
}


/**
 * 得到用户所得答案
 */
function getDoneAnswers(shitiArray) {
  let userAnswer1 = "";
  let userAnswer2 = "";
  let userAnswer99 = "";
  let tid1 = "";
  let tid2 = "";
  let tid99 = "";
  let rightAnswer1 = "";
  let rightAnswer2 = "";
  let rightAnswer99 = "";
  let TrueTid = "";



  for (let i = 0; i < shitiArray.length; i++) {
    let myShiti = shitiArray[i];
    let done_daan = myShiti.done_daan; //试题答案["A","B","C"]   
    switch (myShiti.TX) {
      case 1:
        userAnswer1 += done_daan + ","; //拼接字符串
        tid1 += myShiti.id + ",";

        if (myShiti.flag == 0) { //答对
          TrueTid += myShiti.id + ",";
        }

        rightAnswer1 += myShiti.answer + ',';
        break;
      case 2:
        let str_done_daan = ""; //试题字符串答案"ABC"

        for (let j = 0; j < done_daan.length; j++) {
          let single = done_daan[j]; //多选单个字符串
          str_done_daan += single;
        }
        userAnswer2 += str_done_daan + ","; //拼接字符串
        tid2 += myShiti.id + ",";

        if (myShiti.flag == 0) { //答对
          TrueTid += myShiti.id + ",";
        }
        rightAnswer2 += myShiti.answer + ',';
        break;
      case 99:
        let xiaoti = myShiti.xiaoti;

        for (let k = 0; k < xiaoti.length; k++) {
          let ti = xiaoti[k]; //材料题的每个小题

          if (ti.TX == 1) {
            userAnswer99 += ti.done_daan + ","; //拼接字符串
          } else if (ti.TX == 2) {
            let xt_done_daan = ti.done_daan; //试题答案["A","B","C"]
            let str_done_daan = ""; //试题字符串答案"ABC"

            for (let m = 0; m < xt_done_daan.length; m++) {
              let single = xt_done_daan[m];
              str_done_daan += single;
            }
            userAnswer99 += str_done_daan + ","; //拼接字符串  
          }
          tid99 += ti.id + ",";
          if (ti.flag == 0) { //答对
            TrueTid += ti.id + ",";
          }
          rightAnswer99 += ti.answer + ',';
        }
        break;
    }
  }
  userAnswer1 = delLastStr(userAnswer1);
  userAnswer2 = delLastStr(userAnswer2);
  userAnswer99 = delLastStr(userAnswer99);
  tid1 = delLastStr(tid1);
  tid2 = delLastStr(tid2);
  tid99 = delLastStr(tid99);
  rightAnswer1 = delLastStr(rightAnswer1);
  rightAnswer2 = delLastStr(rightAnswer2);
  rightAnswer99 = delLastStr(rightAnswer99);
  TrueTid = delLastStr(TrueTid);

  let doneUserAnswer = {
    'userAnswer1': userAnswer1,
    'userAnswer2': userAnswer2,
    'userAnswer99': userAnswer99,
    'tid1': tid1,
    'tid2': tid2,
    'tid99': tid99,
    'rightAnswer1': rightAnswer1,
    'rightAnswer2': rightAnswer2,
    'rightAnswer99': rightAnswer99,
    'TrueTid': TrueTid
  }
  return doneUserAnswer;
}

function setMarkedAll(shitiArray) {
  for (let i = 0; i < shitiArray.length; i++) {
    let shiti = shitiArray[i];
    shiti.favorite = 1;
  }
}

/**
 * 根据问题长度，得到高度
 */
function getQuestionHeight(str) {
  //数字长度
  let num = str.replace(/[^0-9]/ig, "").length; //问题中含有的数字的长度
  //汉字长度
  let word_length = str.length - num;
  //总长度 
  let total_length = word_length + Math.ceil(num / 2) + 7;

  let height = Math.ceil(total_length / 19) * 45; //行高是45rpx
  return height;
}


module.exports = {
  initShiti: initShiti,
  initMarkAnswer: initMarkAnswer,
  setMarkAnswerItems: setMarkAnswerItems,
  setModelRealMarkAnswerItems: setModelRealMarkAnswerItems,
  changeSelectStatus: changeSelectStatus,
  setRightWrongNums: setRightWrongNums,
  changeNum: changeNum,
  postAnswerToServer: postAnswerToServer,
  storeAnswerStatus: storeAnswerStatus,
  changeMultiShiti: changeMultiShiti,
  storeLastShiti: storeLastShiti,
  storeAnswerArray: storeAnswerArray,
  processDoneAnswer: processDoneAnswer,
  processModelRealDoneAnswer: processModelRealDoneAnswer,
  ifDoneAll: ifDoneAll,
  initMultiSelectChecked: initMultiSelectChecked,
  changeShitiChecked: changeShitiChecked,
  lianxiRestart: lianxiRestart,
  markRestart: markRestart,
  changeModelRealSelectStatus: changeModelRealSelectStatus,
  storeModelRealAnswerStatus: storeModelRealAnswerStatus,
  storeModelRealLastShiti: storeModelRealLastShiti,
  restartModelReal: restartModelReal,
  setMarkAnswer: setMarkAnswer,
  startWatch: startWatch,
  getDoneAnswers: getDoneAnswers,
  initShitiArrayDoneAnswer: initShitiArrayDoneAnswer,
  getNewShitiArray: getNewShitiArray,
  initModelRealMarkAnswer: initModelRealMarkAnswer,
  setModelRealCLShitiPx: setModelRealCLShitiPx,
  setCLMarkAnswer: setCLMarkAnswer,
  setMarkedAll: setMarkedAll,
  initShitiArray: initShitiArray,
  initNewWrongArrayDoneAnswer: initNewWrongArrayDoneAnswer,
  processTapWrongAnswer: processTapWrongAnswer,
  getQuestionHeight: getQuestionHeight
}