import React from 'react'
import PropTypes from 'prop-types'
import QuestionnairContent from '../QuestionnairContent'
import QuestionnairEditor from '../QuestionnairEditor'
import QuestionnairSiderbar from '../QuestionnairSiderbar'
import DragSort from '../../libs/DragSort/index.js'
import uuid, { fitterEditorsValue, initEditors, initEditor } from '../../utils/utils'
import './index.less'

class Questionnair extends React.PureComponent {
  constructor(props) {
    super(props)
    this._editorsEl = []
    this.state = {
      editors: initEditors(this.props.editors),
      curMoveItem: null,
      drag: false,
      scrollTo: 0,
      newEditor: true
    }
  }

  _fitterValues() {
    if (this._isThereEditor()) {
      return
    }
    let { editors } = this.state
    let values = fitterEditorsValue(editors)
    return values
  }


  /** 
   * siderbar
   * siderbarClass: PropTypes.string,
   * tabs: PropTypes.array,
   * tabInactiveClass: PropTypes.string,
   * tabActiveClass: PropTypes.string,
   * types: PropTypes.array,
   * typeInactiveClass: PropTypes.string,
   * typeActiveClass: PropTypes.string,
   * renderContent: PropTypes.any,
   * renderTab: PropTypes.any,
 
   * content
   * renderTitle: PropTypes.any,
   * title: PropTypes.string,
   * sign: PropTypes.bool
   * pageClass: PropTypes.string
   */
  static propTypes = {
    editors: PropTypes.array
  }

  static defaultProps = {
    editors: []
  }


  _updateEditors = (callback) => {
    this.state.editors.some((data, index) => {
      if (data.isFirst && data.isEditor) {
        this.state.editors.splice(index, 1)
        return true
      } else if (!data.isFirst && data.isEditor) {
        data.isEditor = false
        return true
      }
    })
    callback(this.state.editors)
  }


  _cancelEdit = (index) => {
    let editors = JSON.parse(JSON.stringify(this.state.editors))
    editors[index].isFirst ? editors.splice(index, 1) : editors[index].isEditor = false
    this.setState({ editors })
    this._siderbar && this._siderbar._editTypeSelect()
  }

  _confirmEdit = (index, newEditor) => {
    let editors = JSON.parse(JSON.stringify(this.state.editors))
    editors.splice(index, 1, newEditor)
    this.setState({ editors }, () => {
      if (this.props.onConfirm) {
        this._updateEditors(this.props.onConfirm)
      }
    })
    this._siderbar && this._siderbar._editTypeSelect()
  }

  _againEdit = (index) => {
    if (this._isThereEditor()) {
      return
    }
    let editors = JSON.parse(JSON.stringify(this.state.editors))
    editors[index].isEditor = true
    this.setState({ editors })
    this._siderbar && this._siderbar._editTypeSelect(this.state.editors[index].type)
  }

  _copyEdit = (index) => {
    let editors = JSON.parse(JSON.stringify(this.state.editors))
    const copyEditor = {
      ...this.state.editors[index],
      questionId: uuid(),
    }
    delete copyEditor['id']
    editors.splice(index + 1, 0, copyEditor)
    this.setState({ editors }, () => {
      if (this.props.onCopy) {
        this._updateEditors(this.props.onCopy)
      }
    })
  }

  _removeEdit = (index) => {
    let editors = JSON.parse(JSON.stringify(this.state.editors))
    editors.splice(index, 1)
    this.setState({ editors }, () => {
      if (this.props.onRemove) {
        this._updateEditors(this.props.onRemove)
      }
    })
  }

  _handleDragMove = (editors, from, to) => {
    this.setState({ curMoveItem: to, editors, drag: true })
  }

  _handleDragEnd = () => {
    this.setState({ curMoveItem: null, drag: false }, () => {
      if (this.props.onDrag) {
        this._updateEditors(this.props.onDrag)
      }
    })
  }
  //标记事件
  _handleSgin = (sign) => {
    if (this.props.onSign) {
      this.props.onSign(sign)
    }
  }
  //问卷标题失焦事件
  _blurTitle = (title) => {
    if (this.props.onSaveTitle) {
      this.props.onSaveTitle(title)
    }
  }

  render() {
    return (
      <div className="questionnair">
        {this._renderQuestionnairSiderbar()}
        {this._renderQuestionnairContent()}
      </div>
    )
  }

  _renderQuestionnairContent() {
    const { editors, scrollTo } = this.state
    const { pageClass, renderTitle, title, sign } = this.props
    const isFirst = editors.length !== 0 && editors[editors.length - 1].isFirst
    let content = {
      pageClass, renderTitle, title, sign, isFirst, scrollTo
    }
    return (
      <QuestionnairContent onBlurTitle={this._blurTitle} onChangeSign={this._handleSgin} {...content}>
        {this._renderEditors(editors)}
      </QuestionnairContent>
    )
  }

  _renderEditors(editors) {
    //如果有编辑状态的题目则禁止拖动
    const hasEditor = editors.some(data => data.isEditor === true)
    if (editors.length > 0) {
      return (
        <DragSort
          draggable={!hasEditor}
          data={editors}
          onDragEnd={this._handleDragEnd}
          onDragMove={this._handleDragMove}>
          {this._eachEditors(editors)}
        </DragSort>
      )
    }
    return null
  }

  _eachEditors(editors) {
    return editors.map((editor, index) => {
      return (
        <div
          className="drag-wrapper"
          ref={el => this._editorsEl[index] = el}
          key={editor.questionId}>
          <QuestionnairEditor
            index={index}
            curMoveItem={this.state.curMoveItem}
            editor={editor}
            drag={this.state.drag}
            handleConfirm={this._confirmEdit}
            handleCancel={this._cancelEdit}
            handleEdit={this._againEdit}
            handleRemove={this._removeEdit}
            handleCopy={this._copyEdit}
          />
        </div>
      )
    })
  }

  _renderQuestionnairSiderbar() {
    const {
      siderbarClass,
      tabs,
      tabInactiveClass,
      tabActiveClass,
      types,
      typeInactiveClass,
      typeActiveClass,
      renderContent,
      renderTabs
    } = this.props
    let siderbarProps = {
      siderbarClass,
      tabs,
      tabInactiveClass,
      tabActiveClass,
      types,
      typeInactiveClass,
      typeActiveClass,
      renderContent,
      renderTabs
    }
    return (
      <QuestionnairSiderbar
        ref={siderbar => this._siderbar = siderbar}
        editors={this.state.editors}
        onSelectEditor={this._createEditor}
        onDragOutline={this._dragEditorByOutline}
        onClickOutline={this._locateEditor}
        {...siderbarProps}
      />
    )
  }

  /*
   * 判断是否有处于编辑状态的题目, activeEditorIndex // -1,没有处于编辑状态的题目
   * 如果有处于编辑状态的题目，则激活该编辑器抖动
   */
  _isThereEditor = () => {
    const activeEditorIndex = this.state.editors.findIndex(data => data.isEditor === true)
    if (activeEditorIndex !== -1) {
      let editors = JSON.parse(JSON.stringify(this.state.editors))
      editors[activeEditorIndex].editorShake = uuid()
      this.setState({ editors })
      return true
    } else {
      return false
    }
  }

  _createEditor = (type) => {
    if (this._isThereEditor()) {
      return false
    }
    const editor = initEditor(type)
    this.setState(prevState => ({ editors: [...prevState.editors, editor] }))
    return true
  }

  _dragEditorByOutline = (editors) => {
    this.setState({ editors }, () => {
      if (this.props.onDrag) {
        this._updateEditors(this.props.onDrag)
      }
    })
  }

  _locateEditor = (index) => {
    this.setState({ scrollTo: this._editorsEl[index].offsetTop })
  }
}

export default Questionnair