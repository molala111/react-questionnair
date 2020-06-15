export default function uuid() {
  const s = [];
  const hexDigits = '0123456789abcdef';
  for (let i = 0; i < 36; i += 1) {
    s[i] = hexDigits.substr(Math.floor(Math.random() * 0x10), 1);
  }
  s[14] = '4';
  s[19] = hexDigits.substr((s[19] & 0x3) | 0x8, 1);
  const id = s.join('');
  return id;
}

const types = {
  radio: 0,
  0: 'radio',
  checkbox: 1,
  1: 'checkbox',
  dropdown: 2,
  2: 'dropdown',
  input: 3,
  3: 'input',
  text: 4,
  4: 'text',
  textarea: 5,
  5: 'textarea',
  grading: 6,
  6: 'grading'
}

export const fitterEditorsValue = (editors) => {
  let values = []
  if (editors && editors.length) {
    editors.forEach(editor => {
      let {
        id,
        type,
        title,
        required,
        remark,
        remarkText,
        options,
        recordOptions,
        otherOption,
        otherOptionWards
      } = editor
      let value = {
        id,
        type: types[type],
        title,
        required: required ? 1 : 0,
        tips: remark ? remarkText : '',
      }
      if (['radio', 'dropdown', 'checkbox'].includes(type)) {
        let os = []
        for (let i = 0; i < options.length; i++) {
          let o = {}
          if (recordOptions && recordOptions.length > i) {
            o = {
              ...recordOptions[i],
              content: options[i]
            }
          } else {
            o = { content: options[i] }
          }
          os.push(o)
        }
        value.options = os
        if ('dropdown' !== type) {
          value.allowOther = otherOption ? 1 : 0
          value.otherDescribe = otherOption ? otherOptionWards : ''
        }
      }
      values.push(value)
    })
  }
  return values
}

export const initEditor = (type, record) => {
  const editor = {
    id: null,
    questionId: uuid(), //uuid

    isEditor: true, //编辑状态还是已编辑状态
    isFirst: true, //是否是新创建的

    type: type, //类型
    options: ['', ''], //选项(只有radio,checkbox,select有,其余尽量给个空数组)
    /**
     * 业务数据
     */
    recordOptions: [],
    title: '', //题目题干
    required: false, //是否必填
    remark: false, //是否有备注
    remarkText: '', //备注内容
    otherOption: false, //是否有其他选项
    // otherOptionForwards: '其他', //”其他“项文本(前)
    // otherOptionBackwards: '', //”其他“项文本(后)
    otherOptionWards: '其他____', //”其他“项
    // completionForwards: '题目：', //填空题文本(前)
    // completionBackwards: '', //填空题文本(后)

    rows: 1, //单行选项数量
    maxLength: 100, //单行文本限制的字数
    textareaHeight: 3, //多行文本行数

    editorShake: ''//抖动效果标志属性
  }
  if (record) {
    editor.isEditor = false
    editor.isFirst = false
    editor.id = record.id
    editor.title = record.title
    editor.type = types[record.type]
    editor.required = record.required ? true : false
    editor.remark = record.tips ? true : false
    editor.remarkText = record.tips || ''
    if (['radio', 'dropdown', 'checkbox'].includes(editor.type)) {
      editor.recordOptions = record.options
      let options = []
      record.options.forEach(option => {
        options.push(option.content)
      })
      editor.options = options
      if ('dropdown' !== editor.type) {
        editor.otherOption = record.allowOther ? true : false
        editor.otherOptionWards = record.otherDescribe || ''
      }
    }
  }
  return editor
}

export const initEditors = (editors) => {
  let init = []
  if (editors && editors.length) {
    editors.forEach(editor => {
      init.push(initEditor(-1, editor))
    })
  }
  return init
}