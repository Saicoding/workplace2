// components/question/question.js
Component({
  /**
   * 组件的属性列表
   */
  properties: {
    px: {
      type: Number,
      value: 1,
    },
    isModelReal: {
      type: Boolean,
      value: false
    },

    colors: {
      type: Array,
      value: []
    },

    tx: {
      type: String,
      value: '',
      observer: function(e) {
        let style1 = "";
        let style2 = "";
        let style3 = "";
        if (e == "材料题") {
          style1: "display:block;margin-bottom:30rpx;height:90rpx"
          style3 = "position:fixed;z-index:10000";
        } else {
          style1 = "display:none;"; //占位框
          style3 = "position:block";
        }

        let colors = this.data.colors;

        let bgColor;
        switch (e) {
          case "单选题":
            bgColor = colors[0];
            break;
          case "多选题":
            bgColor = colors[3];
            break;
          case "判断题":
            bgColor = colors[0];
            break;
          case "材料题":
            bgColor = colors[5];
            break
        }

        this.setData({
          bgColor: bgColor,
          style1: style1,
          style2: style2,
          style3: style3
        })
      }
    },
    question: {
      type: String,
      value: ""
    },
  },

  /**
   * 组件的初始数据
   */
  data: {

  },

  pageLifetimes: {
    show: function() {
      let tx = this.data.tx;
    }
  },


  /**
  * 组件的方法列表
  */
  methods: {
    toogleShow: function () {
      if (this.data.tx != "材料题") return;
      this.triggerEvent('toogleAnimation')
    },
  }
})