import React from 'react'
import Input from '../../libs/Input'
import Checkbox from '../../libs/Checkbox'
import Radio from '../../libs/Radio'
import Dropdown from '../../libs/Dropdown'
import Button from '../../libs/Button'
import ContentEditable from '../../libs/ContentEditable'
import ShakeTransition from '../../libs/Shake'
import Dialog from '../../libs/Dialog'
import uuid from '../../utils/utils'
import './index.less'
import Star from '../Star'

class QuestionnairEditor extends React.PureComponent {
  constructor(props) {
    super(props)
    this.temp = ''
    this.otherOptionInput = ''
  }

  static defaultProps = {
    acitveAnswer: false,
  }

  state = {
    toggleMutiOption: false,
    editor: {
      ...this.props.editor,
    },
    hover: false,
    inputShake: false,
    optionShake: [],
    hasOption: [],
    hasTitle: true,
    dialogVisible: false,
    mutiOption: '',
    otherOptionInput: '',
    otherOptionForwards: '',
  }
  /* 首先有点乱。。。
   * 由于每次每个题目的操作实际上都是在操作整个题目数组，题目数组交给了题目组件的父组件来管理
   * 所以每次题目操作完以后更新父组件的题目数组，父组件更新会触发题目组件的componentWillReceiveProps生命周期函数
   */
  componentWillReceiveProps(nextProps) {
    /*
     * 每次只能编辑一个题目，所以触发再次添加题目的操作，将会引起当前题目的抖动
     * 连续点击产生连续抖动的效果，所以创建一个变量editorShake，来标志表格需要抖动
     * 由于是更新数组，为了在抖动的效果下保留之前填写的数据，所以比较之前和新的editorShake是否相同
     * 如果不同则说明只是要产生抖动，只更新editorShake变量
     */
    if (nextProps.editor.editorShake !== this.props.editor.editorShake) {
      this.setState({
        editor: {
          ...this.state.editor,
          editorShake: nextProps.editor.editorShake,
        },
      })
    } else {
      this.setState({
        editor: {
          ...this.state.editor,
          ...nextProps.editor,
        },
      })
    }
  }

  switchEditor = (type) => {
    switch (type) {
      case 'radio':
        return '单选题'
      case 'dropdown':
        return '下拉题'
      case 'checkbox':
        return '多选题'
      case 'textarea':
        return '多行文本题'
      case 'text':
        return '单行文本题'
      case 'input':
        return '填空题'
      case 'grading':
        return '评分题'
      default:
        return '错误'
    }
  }

  handleChange = (e, index) => {
    let value = e.target ? e.target.value : e
    let key = e.target.name
    let checked = e.target.checked
    if (key === 'title' && value) {
      //控制题目input边框颜色
      this.setState({
        hasTitle: true,
      })
    }
    if (key === 'options') {
      let {
        options,
      } = this.state.editor
      let {
        hasOption,
      } = this.state
      hasOption[index] = true
      this.setState({
        hasOption: [...hasOption],
      })
      let optionsTemp = options.concat()
      optionsTemp[index] = value
      value = optionsTemp
    }
    if (key === 'required' || key === 'remark') {
      value = checked
    }
    if (key === 'maxLength') {
      value = parseInt(value)
    }
    this.setState(prevState => ({
      editor: {
        ...prevState.editor,
        [key]: value,
      },
    }))
  }

  //填写答案时触发的事件
  handleAnswerChange = (e, index) => {
    let {
      type,
    } = this.state.editor
    let value = e.target.value
    this.optionIndex = e.target.dataset.index
    if (value === 'undefined') {
      value = this.otherOptionValue
    }
    if (type === 'checkbox') {
      let valueIn = this.answer.checkbox.optionValue.includes(value)
      let indexIn = this.answer.checkbox.optionIndex.includes(this.optionIndex)
      this.answer.checkbox.optionValue[this.optionIndex] = valueIn ? null : value
      this.answer.checkbox.optionIndex[this.optionIndex] = indexIn ? null : this.optionIndex
      this.answer.checkbox.otherOptionValue = this.otherOptionValue
    } else if (type === 'radio') {
      this.answer[type] = {
        optionValue: value,
        optionIndex: this.optionIndex,
        otherOptionValue: this.otherOptionValue,
      }
    } else {
      this.answer[type] = value
    }
    const answerEditor = {
      ...this.state.editor,
      answer: this.answer,
    }
    this.props.onAnswer(answerEditor, this.props.index)
  }

  // //填写radio、checkbox'其他'选项时触发的方法
  // handleOtherOptionInputChange = (e) => {
  //   const {
  //     type,
  //     otherOptionForwards,
  //     otherOptionBackwards,
  //   } = this.state.editor
  //   this.otherOptionValue = e.target.innerHTML
  //   this.allValue = otherOptionForwards + this.otherOptionValue + otherOptionBackwards
  //   this.optionIndex = e.target.dataset.index
  //   if (type === 'checkbox') {
  //     const length = this.answer.checkbox.optionValue.length
  //     this.answer.checkbox.optionValue[length - 1] = this.answer.checkbox.optionValue[length - 1] === null ? null : this.allValue
  //     this.answer.checkbox.otherOptionValue = this.allValue
  //   } else if (type === 'radio') {
  //     this.answer[type] = {
  //       optionValue: this.allValue,
  //       optionIndex: this.optionIndex,
  //       otherOptionValue: this.allValue,
  //     }
  //   } else {
  //     this.answer[type] = this.allValue
  //   }
  //   const answerEditor = {
  //     ...this.state.editor,
  //     answer: this.answer,
  //   }
  //   this.props.onAnswer(answerEditor, this.props.index)
  // }

  //新增选项
  createOption = () => {
    this.setState(prevState => ({
      editor: {
        ...prevState.editor,
        'options': [...prevState.editor.options, ''],
      },
    }))
  }

  //删除选项
  deleteOption = (index) => {
    let options = [ ...this.state.editor.options ]
    let recordOptions = [ ...this.state.editor.recordOptions ]
    if (options.length <= 2) {
      this.setState(prevState => {
        prevState.optionShake[index] = !prevState.optionShake[index]
        prevState.hasOption[index] = false
        return {
          optionShake: [...prevState.optionShake],
          hasOption: [...prevState.hasOption],
        }
      })
      return
    }
    options.splice(index, 1)
    if (recordOptions.length > index) {
      recordOptions.splice(index, 1)
    }
    this.setState(prevState => ({
      editor: {
        ...prevState.editor,
        options,
        recordOptions
      },
    }))
  }

  /*
   * 以下都是有关于批量编辑的事件
   */
  //点击打开批量编辑的弹窗
  handleMutiOption = () => {
    this.setState({
      dialogVisible: true,
      mutiOption: this.state.editor.options.join('\n'),
    })
  }

  //批量编辑textarea中的change
  handleMutiTextarea = (e) => {
    this.mutiTextareaValue = e.target.value
    this.setState({
      mutiOption: e.target.value,
    })
  }

  //关闭批量编辑的弹窗
  closeDialog = () => {
    this.setState({
      dialogVisible: false,
    })
  }

  //打开批量编辑的弹窗
  confirmDialog = () => {
    const options = this.mutiTextareaValue.split('\n')
    this.setState(prevState => ({
      dialogVisible: false,
      editor: {
        ...prevState.editor,
        options,
      },
    }))
  }

  //确认
  confirm = () => {
    const {
      index,
      handleConfirm,
    } = this.props
    const {
      editor,
      inputShake,
    } = this.state
    if (!editor.title && editor.type !== 'input') {
      this.setState(prevState => ({
        inputShake: !prevState.inputShake,
        hasTitle: false,
      }))
      return
    }
    //判断选项是否为空
    if (['radio', 'checkbox', 'dropdown'].includes(editor.type)) {
      let empty = editor.options.some((item, index) => {
        if (item === '') {
          this.setState(prevState => {
            prevState.optionShake[index] = !prevState.optionShake[index]
            prevState.hasOption[index] = false
            return {
              optionShake: [...prevState.optionShake],
              hasOption: [...prevState.hasOption],
            }
          })
          return true
        }
      })
      if (empty) {
        return
      }
    }
    const newEditor = {
      ...editor,
      isEditor: false,
      isFirst: false,
    }
    if (handleConfirm) {
      handleConfirm(index, newEditor)
    }
    this.isFirst = false
    this.temp = JSON.parse(JSON.stringify(this.state.editor))
  }

  //取消
  cancel = () => {
    const {
      index,
      handleCancel,
    } = this.props
    if (handleCancel) {
      handleCancel(index)
    }
    this.setState({
      editor: this.temp,
    })
  }

  //编辑
  edit = () => {
    const {
      index,
      handleEdit,
    } = this.props
    if (handleEdit) {
      handleEdit(index)
    }
  }

  //复制
  copy = () => {
    const {
      index,
      handleCopy,
    } = this.props
    if (handleCopy) {
      handleCopy(index)
    }
  }

  //删除
  remove = () => {
    const {
      index,
      handleRemove,
    } = this.props
    if (handleRemove) {
      handleRemove(index)
    }
  }

  //鼠标进入
  mouseEnter = () => {
    if (!this.props.drag && !this.props.acitveAnswer) {
      this.setState({
        hover: true,
      })
    }
  }
  
  //鼠标离开
  mouseLeave = () => {
    if (!this.props.drag && !this.props.acitveAnswer) {
      this.setState({
        hover: false,
      })
    }
  }
  disableEnter = (event) => {
    if (event.which == 13) {
      event.cancelBubble = true
      event.preventDefault()
      event.stopPropagation()
    }
  }

  /*
   * 想了很多交互，最终认为还是将编辑模块和题目模块放在一起实现起来相对方便点，虽然这样造成的后果是代码很臃肿。。。
   * 如果不这样做，组件之间的传值问题将会变得错综复杂
   * 后期有时间再仔细想想看看能不能有更优的办法
   */
  render() {
    let { type, isEditor, answer } = this.state.editor
    this.answer = answer && JSON.parse(JSON.stringify(answer))
    this.otherOptionValue = answer && answer[type] && answer[type].otherOptionValue
    if (isEditor) {
      return (
        <div className="questionnair-item">
          {this._renderEditor()}
        </div>
      )
    } else {
      return (
        <div className="questionnair-item">
          {this._renderQuestions()}
        </div>
      )
    }
  }

  //编辑状态下的填空题
  _renderEdiCompletionEl() {
    let { title } = this.state.editor
    return (
      <div className="editor-row">
        <label className="editor-row-title">内容</label>
        <div className="editor-row-content">
          <div className="other-option-wrapper">
            <ContentEditable
              style={{ flex: 1 }}
              name={'title'}
              html={title}
              onChange={this.handleChange}
              onKeyPress={this.disableEnter}
            />
          </div>
        </div>
      </div>
    )

    // let { completionForwards, completionBackwards } = this.state.editor
    // return (
    //   <div className="editor-row">
    //     <label className="editor-row-title">内容</label>
    //     <div className="editor-row-content">
    //       <div className="other-option-wrapper">
    //         <ContentEditable
    //           name={'completionForwards'}
    //           html={completionForwards}
    //           onChange={this.handleChange}
    //           onKeyPress={this.disableEnter}
    //         />
    //         <div className="other-fill">
    //           <div className="other-fill-inner">____</div>
    //         </div>
    //         <ContentEditable
    //           style={{ flex: 1 }}
    //           name={'completionBackwards'}
    //           html={completionBackwards}
    //           onChange={this.handleChange}
    //           onKeyPress={this.disableEnter}
    //         />
    //       </div>
    //     </div>
    //   </div>
    // )
  }

  //编辑状态下的非填空题
  _renderEdiTitleEl() {
    return (
      <div className="editor-row">
        <label className="editor-row-title">题目</label>
        <div className="editor-row-content">
          <ShakeTransition shake={this.state.inputShake}>
            <Input name={'title'} value={this.state.editor.title} onChange={this.handleChange}
              style={{
                borderColor: this.state.hasTitle ? '' : 'red'
              }}
            />
          </ShakeTransition>
        </div>
      </div>
    )
  }

  //编辑状态下的题目
  _renderEl(type) {
    if (type === 'input') {
      return this._renderEdiTitleEl()
    } else if (type === 'source') {
      return <Star />
    } else {
      return this._renderEdiTitleEl()
    }
  }

  //编辑备注
  _renderRemarkInput() {
    let { remark, remarkText } = this.state.editor
    if (remark) {
      return <Input name={'remarkText'} value={remarkText || ''} onChange={this.handleChange} />
    }
    return null
  }

  //编辑状态下的选项框
  _renderEdiOptions() {
    if (this.state.editor.options) {
      return this.state.editor.options.map((option, index) => {
        return (
          <div className="editor-row" key={index}>
            {/* <label className="editor-row-title">
              <i className="iconfont icon-xuanxiangicon"></i>
            </label> */}
            <label className="editor-row-title">选项</label>
            <div className="editor-row-content">
              <ShakeTransition shake={this.state.optionShake[index]}>
                <Input
                  index={index}
                  name={'options'}
                  value={option}
                  onChange={this.handleChange}
                  style={{
                    borderColor: this.state.hasOption[index] === false ? 'red' : ''
                  }}
                />
              </ShakeTransition>
            </div>
            <i className="iconfont icon-chachaicon" onClick={() => this.deleteOption(index)}></i>
          </div>
        )
      })
    }
    return null
  }

  //编辑状态下的选项框和新建框
  _renderEdiOptionsEl(type) {
    if (['radio', 'dropdown', 'checkbox'].includes(type)) {
      return (
        <div>
          {this._renderEdiOptions()}
          <div className="editor-row">
            <div className="editor-row-content">
              <div className="editor-create-option" onClick={this.createOption}>
                <i className="iconfont icon-xinjianxuanxiangicon"></i>
                <span style={{ color: '#999' }}>新建选项</span>
              </div>
            </div>
            <i className="iconfont icon-chachaicon" style={{ visibility: 'hidden' }}></i>
          </div>
        </div>
      )
    }
    return null
  }

  //编辑状态下的”其他“选项
  _renderOtherOption() {
    let { otherOption, otherOptionWards } = this.state.editor
    if (otherOption) {
      return (
        <div className="editor-row">
          <div className="editor-row-content">
              <Input
                  index={'other'}
                  name={'otherOptionWards'}
                  value={otherOptionWards}
                  onChange={this.handleChange}
                />
          </div>
          <i className="iconfont icon-chachaicon" onClick={() => this.handleChange({ target: { value: false, name: 'otherOption' } })}></i>
        </div>
      )
    }

    // let { otherOption, otherOptionForwards, otherOptionBackwards } = this.state.editor
    // if (otherOption) {
    //   return (
    //     <div className="editor-row">
    //       <div className="editor-row-content">
    //         <div className="other-option-wrapper">
    //           <ContentEditable
    //             name={'otherOptionForwards'}
    //             html={otherOptionForwards}
    //             onChange={this.handleChange}
    //             onKeyPress={this.disableEnter}
    //           />
    //           <div className="other-fill">
    //             <div className="other-fill-inner">____</div>
    //           </div>
    //           <ContentEditable
    //             style={{ flex: 1 }}
    //             name={'otherOptionBackwards'}
    //             html={otherOptionBackwards}
    //             onChange={this.handleChange}
    //             onKeyPress={this.disableEnter}
    //           />
    //         </div>
    //       </div>
    //       <i className="iconfont icon-chachaicon" onClick={() => this.handleChange({ target: { value: false, name: 'otherOption' } })}></i>
    //     </div>
    //   )
    // }

    return null
  }

  //添加"其他"选项 | 批量编辑
  _renderEdiCtrlOptionsEl() {
    let { editor, toggleMutiOption } = this.state
    let { otherOption } = editor
    return (
      <div className="options-control">
        <button
          className="control-button"
          style={{ color: otherOption ? '#CCC' : '#45A8E6', cursor: otherOption ? 'not-allowed' : 'pointer', fontSize: 14 }}
          disabled={otherOption}
          onClick={() => this.handleChange({ target: { value: true, name: 'otherOption' } })}>
          添加“其他”选项
        </button>
        <span style={{ margin: '0 10px' }}>|</span>
        <button
          className="control-button"
          style={{
            color: toggleMutiOption ? '#CCC' : '#45A8E6',
            cursor: toggleMutiOption ? 'not-allowed' : 'pointer',
            fontSize: 14
          }}
          disabled={toggleMutiOption}
          onClick={() => this.handleMutiOption()}>
          批量编辑
        </button>
      </div>
    )
  }

  //其他设置
  _renderOtherSetting() {
    let { type, rows, textareaHeight, maxLength } = this.state.editor
    if (['radio', 'checkbox'].includes(type)) {
      return (
        <>
          {this._renderEdiCtrlOptionsEl()}
          {/* <div className="editor-adv">
            <span className="adv-option">
              每行显示
              <Dropdown
                name={'rows'}
                value={rows}
                options={[1, 2, 3, 4]}
                onChange={this.handleChange}
              />
              个选项
            </span>
          </div> */}
        </>
      )
    } else if (type === 'text') {
      // return (
      //   <div className="editor-adv">
      //     <span className="adv-option">
      //       最多填写
      //       <Input
      //         width={50}
      //         margin={'0 10px'}
      //         type={"number"}
      //         name={'maxLength'}
      //         value={maxLength}
      //         onChange={this.handleChange}
      //       />
      //       字
      //     </span>
      //   </div>
      // )
    } else if (type === 'textarea') {
      // return (
      //   <div className="editor-adv">
      //     <span className="adv-option">
      //       文本框高度
      //       <Input
      //         width={50}
      //         margin={'0 10px'}
      //         type={"number"}
      //         name={'textareaHeight'}
      //         value={textareaHeight}
      //         onChange={this.handleChange}
      //       />
      //       行
      //     </span>
      //   </div>
      // )
    }
    return null
  }

  //批量修改
  _renderDialog() {
    let { dialogVisible, mutiOption } = this.state
    return (
      <Dialog
        visible={dialogVisible}
        title="批量修改"
        onCancel={this.closeDialog}
        onConfirm={this.confirmDialog}>
        <Input
          type="textarea"
          value={mutiOption}
          onChange={this.handleMutiTextarea}
          rows={6} />
      </Dialog>
    )
  }

  _renderEditor() {
    let { type, required, remark, editorShake } = this.state.editor
    return (
      <ShakeTransition shake={editorShake}>
        <div className="questionnair-editor">
          <div className="questionnair-editor-inner">
            <div className="editor-type">
              <i className="iconfont icon-Q-icon"></i>
              <span className="editor-type-text">{this.switchEditor(type)}</span>
            </div>
            {this._renderEl(type)}
            <div className="editor-row">
              <div className="editor-row-content">
                <Checkbox name={'required'} defaultChecked={required} label={'必填'} onChange={this.handleChange}
                  style={{
                    marginRight: 15
                  }}
                />
                <Checkbox name={'remark'} defaultChecked={remark} label={'备注'} onChange={this.handleChange}
                  style={{
                    marginRight: 15
                  }}
                />
                {this._renderRemarkInput()}
              </div>
            </div>
            {this._renderEdiOptionsEl(type)}
            {this._renderOtherOption()}
            {this._renderOtherSetting()}
            <div className="editor-button">
              <Button type="primary" onClick={this.confirm}>确定</Button>
              <Button type="cancel" onClick={this.cancel}>取消</Button>
            </div>
          </div>
          {this._renderDialog()}
        </div>
      </ShakeTransition>
    )
  }

  _renderQuestions() {
    const { index, curMoveItem, drag, acitveAnswer } = this.props
    return (
      <div
        className="questionnair-subject"
        style={{
          background: drag ? '' : (this.state.hover ? '#F5F5F5' : '#fff'),
          borderTopColor: (drag && index === 0) ? '#dbdbdb' : '',
          borderBottomColor: drag ? '#dbdbdb' : '',
          cursor: acitveAnswer ? '' : 'move'
        }}
        onMouseEnter={this.mouseEnter}
        onMouseLeave={this.mouseLeave}>
        <div className="questionnair-subject-inner" style={{ margin: acitveAnswer ? '' : '0 auto' }}>
          <div className="subject-row">
            <span>{index + 1}.</span>
            {this._renderQuestionTitle()}
            {this._renderRequiredStar()}
          </div>
          {this._renderRemark()}
          <div className="subject-row">
            {this._renderQuestionContent()}
          </div>
        </div>
        {!acitveAnswer && (
          <div
            className="subject-control-mask"
            style={{
              background: curMoveItem === index ? 'rgba(245,245,245,0.3)' : ''
            }}>
          </div>
        )}
        <div
          className="subject-control-bar"
          style={{ transform: drag ? '' : (this.state.hover ? 'translateX(0)' : '') }}>
          <div className="control-bar-inner">
            <div className="control-bar-button" onClick={this.edit}>
              <i className="iconfont icon-grey_bianji"></i>
            </div>
            <div className="control-bar-button" onClick={this.copy}>
              <i className="iconfont icon-grey_fuzhi"></i>
            </div>
            <div className="control-bar-button" onClick={this.remove}>
              <i className="iconfont icon-grey_shanchu"></i>
            </div>
          </div>
        </div>
      </div>
    )
  }

  _renderQuestionTitle() {
    let { type, title } = this.state.editor
    if (type === 'input') {
      return this._renderSubCompletionEl()
    } else {
      return <span>{title}</span>
    }
  }

  //填写状态下的填空
  _renderSubCompletionEl() {
    let { title } = this.state.editor
    return (
      <div className="subject-other-option">
        <span>{title}</span>
      </div>
    )

    // let { type, answer, completionForwards, completionBackwards } = this.state.editor
    // return (
    //   <div className="subject-other-option">
    //     <span>{completionForwards}</span>
    //     <div
    //       className='other-option-input'
    //       onInput={this.handleOtherOptionInputChange}
    //       onKeyPress={this.disableEnter}
    //       contentEditable
    //       dangerouslySetInnerHTML={{ __html: answer && this.answer[type] }}>
    //     </div>
    //     <span>{completionBackwards}</span>
    //   </div>
    // )
  }

  //必填题*
  _renderRequiredStar() {
    if (this.state.editor.required) {
      return <span className="subject-title-require">*</span>
    }
    return null
  }

  //备注
  _renderRemark() {
    let { remark, remarkText } = this.state.editor
    if (remark) {
      return <div className="subject-row subject-remarks">{remarkText}</div>
    }
    return null
  }

  //问题内容
  _renderQuestionContent() {
    let { type, textareaHeight, maxLength, answer } = this.state.editor
    if (['radio', 'dropdown', 'checkbox'].includes(type)) {
      //单选、多选、下拉
      return this._renderOptions()
    } else if (type === 'text') {
      //单行
      return (
        <Input
          defaultValue={answer && this.answer[type]}
          className="subject-input"
          style={{ height: 36 }}
          onChange={this.handleAnswerChange}
          maxLength={maxLength} />
      )
    } else if (type === 'textarea') {
      //多行
      return (
        <textarea
          defaultValue={answer && this.answer[type]}
          className="subject-input"
          name={'textarea'}
          onChange={this.handleAnswerChange}
          rows={textareaHeight} />
      )
    } else if (type === 'grading') {
      return <Star />
    }
    return null
  }

  //填写状态下的单选、多选、下拉
  _renderOptions() {
    let { type, options, rows, otherOption, otherOptionWards, answer } = this.state.editor
    const optionsCom = otherOption ? options.concat('undefined') : options
    if (type === 'dropdown') {
      //下拉
      return (
        <select
          defaultValue={answer && this.answer[type]}
          onChange={this.handleAnswerChange}>
          {
            options.map((option, index) => {
              return <option key={index} value={option}>{option}</option>
            })
          }
        </select>
      )
    } else if (type === 'radio') {
      //单选
      return (
        <div className="radio-group">
          {optionsCom.map((data, index) => {
            return (
              <label
                className="wowjoy-radio"
                style={{ width: `${100 / parseInt(rows)}%`, marginBottom: 8 }}
                key={uuid()}>
                <Input
                  type="radio"
                  name="radio"
                  data-index={index}
                  value={data}
                  defaultChecked={answer && this.answer.radio.optionIndex === index + ''}
                  onChange={this.handleAnswerChange}
                  style={{ display: 'none' }} />
                <span className="wowjoy-radio__inner"></span>
                <span className="wowjoy-radio__text">
                  {this._renderOptionsData(data, otherOptionWards)}
                </span>
              </label>
            )
          })}
        </div>
      )
    } else {
      //多选
      return (
        <div className="checkbox-group">
          {optionsCom.map((data, index) => {
            return (
              <label
                className="wowjoy-checkbox"
                key={uuid()}
                style={{ width: `${100 / parseInt(rows)}%`, marginBottom: 8 }}>
                <Input
                  type="checkbox"
                  name="checkbox"
                  value={data}
                  data-index={index}
                  defaultChecked={answer && this.answer.checkbox !== '' && this.answer.checkbox.optionIndex.includes(index + '')}
                  onChange={this.handleAnswerChange}
                  style={{ display: 'none' }} />
                <span className="wowjoy-checkbox__inner"></span>
                <span className="wowjoy-checkbox__text">
                  {this._renderOptionsData(data, otherOptionWards)}
                </span>
              </label>
            )
          })}
        </div>
      )
    }
  }

  _renderOptionsData(data, otherOptionWards) {
    if (data !== 'undefined') {
      return data
    } else {
      return (
        <div className="subject-other-option">
          <span>{otherOptionWards}</span>
        </div>
      )
    }

    // if (data === 'undefined') {
    //   return data
    // } else {
    //   return (
    //     <div className="subject-other-option">
    //       <span>{otherOptionForwards}</span>
    //       <div
    //         data-index={index}
    //         className='other-option-input'
    //         onInput={this.handleOtherOptionInputChange}
    //         onKeyPress={this.disableEnter}
    //         contentEditable
    //         dangerouslySetInnerHTML={{ __html: this.otherOptionValue }}>
    //       </div>
    //       <span>{otherOptionBackwards}</span>
    //     </div>
    //   )
    // }
  }
}

export default QuestionnairEditor