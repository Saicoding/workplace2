// components/question/question.js
Component({
  /**
   * 组件的属性列表
   */
  properties: {
    num_color: {
      type: String,
      value: ""
    },
    px: {
      type: Number,
      value: 1,
    },
    isModelReal: {
      type: Boolean,
      value: false
    },

    colors:{
      type:Array,
      value:[]
    },

    tx: {
      type: String,
      value: "",
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
  }
})