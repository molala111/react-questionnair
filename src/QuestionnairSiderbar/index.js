import React from 'react'
import PropTypes from 'prop-types'
import classNames from 'classnames'
import DragSort from '../../libs/DragSort'
import './index.less'

class QuestionnairSiderbar extends React.PureComponent {

  constructor(props) {
    super(props)
    const { tabs, types } = this.props
    this.state = {
      tabType: tabs[0] && tabs[0].type,
      questionType: undefined,
      curMoveItem: null,
      editors: [],
    }
    this._tabs = tabs
    this._types = types
  }

  static propTypes = {
    siderbarClass: PropTypes.string,
    tabs: PropTypes.array,
    tabInactiveClass: PropTypes.string,
    tabActiveClass: PropTypes.string,
    types: PropTypes.array,
    typeInactiveClass: PropTypes.string,
    typeActiveClass: PropTypes.string,
    renderContent: PropTypes.any,
    renderTab: PropTypes.any
  }

  static defaultProps = {
    tabs: [
      { name: '题目类型', type: 'question' },
      { name: '题目大纲', type: 'outline' }
    ],
    types: [
      { name: '单选题', type: 'radio', icon: 'icon-danxuanicon' },
      { name: '下拉题', type: 'dropdown', icon: 'icon-xialaicon' },
      { name: '多选题', type: 'checkbox', icon: 'icon-duoxuan-icon' },
      { name: '单行文本题', type: 'text', icon: 'icon-danhangicon' },
      { name: '多行文本题', type: 'textarea', icon: 'icon-duohangicon' },
      { name: '填空题', type: 'input', icon: 'icon-tiankongtiicon' },
      { name: '评分题', type: 'grading', icon: 'icon-tiankongtiicon' }
    ]
  }

  componentWillReceiveProps(nextProps) {
    this.setState({ editors: nextProps.editors })
  }

  _switchIcon = (type) => {
    switch (type) {
      case 'radio':
        return 'icon-danxuanicon'
      case 'dropdown':
        return 'icon-xialaicon'
      case 'checkbox':
        return 'icon-duoxuan-icon'
      case 'textarea':
        return 'icon-duohangicon'
      case 'text':
        return 'icon-danhangicon'
      case 'input':
        return 'icon-tiankongtiicon'
      case 'grading':
        return 'icon-tiankongtiicon'
    }
  }

  _handleDragMove = (editors, from, to) => {
    if (this.props.onDragOutline) {
      this.props.onDragOutline(editors)
    }
    this.setState({ curMoveItem: to, editors })
  }

  _handleDragEnd = () => {
    this.setState({ curMoveItem: null })
  }

  _clickOutline = (index) => {
    if (this.props.onClickOutline) {
      this.props.onClickOutline(index)
    }
  }

  _renderTabs(activeType) {
    const { tabInactiveClass, tabActiveClass, renderTabs } = this.props
    if (renderTabs) {
      return renderTabs(activeType)
    } else {
      let tabs = []
      let tabInactive = classNames('tab-item', tabInactiveClass)
      let tabActive = classNames('tab-item tab-item-active', tabActiveClass)
      this._tabs.length && this._tabs.forEach(data => {
        let active = activeType === data.type
        let className = active ? tabActive : tabInactive
        tabs.push(
          <div key={data.type} className={className} onClick={() => this.setState({ tabType: data.type })}>
            {data.name}
          </div>
        )
      })
      return <div className='siderbar-tab'>{tabs}</div>
    }
  }

  _onTypeSelect(type) {
    const { onSelectEditor } = this.props
    if (onSelectEditor) {
      if (onSelectEditor(type)) {
        this.setState({ questionType: type })
      }
    }
  }

  _editTypeSelect(questionType) {
    this.setState({ questionType })
  }

  _renderTypeItem(data, className) {
    return (
      <div key={data.type} className={className} onClick={() => this._onTypeSelect(data.type)}>
        <i className={`iconfont ${data.icon} siderbar-menu-icon`}></i>
        <span>{data.name}</span>
      </div>
    )
  }

  _renderEditors(editors) {
    return editors.map((data, index) => {
      let content = data.type === 'input' ? data.completionForwards + '____' + data.completionBackwards : data.title
      let className = this.state.curMoveItem !== index ? 'summary-drag-mask' : 'summary-drag-mask summary-drag-move-item'
      return (
        <div key={data.questionId} className='siderbar-menu-summary' onClick={() => this._clickOutline(index)}>
          <i className={`iconfont ${this._switchIcon(data.type)} siderbar-menu-icon`}></i>
          <span className='summary-text'>{content}</span>
          <div className={className}/>
        </div>
      )
    })
  }

  _renderSiderbar(tabType) {
    if (tabType === 'question') {
      const { typeInactiveClass, typeActiveClass } = this.props
      let types = []
      let typeInactive = classNames('siderbar-menu-editors', typeInactiveClass)
      let typeActive = classNames('siderbar-menu-editors siderbar-menu-editors-active', typeActiveClass)
      this._types.length && this._types.forEach(data => {
        let className = this.state.questionType === data.type ? typeActive : typeInactive
        types.push(this._renderTypeItem(data, className))
      })
      return <div className='siderbar-menu-content'>{types}</div>
    } else if (tabType === 'outline') {
      const { editors } = this.state
      //如果有编辑状态的题目则禁止拖动
      const hasEditor = editors.some(data => data.isEditor === true)
      return (
          <div className='siderbar-menu-content' style={{ paddingTop: 12 }}>
            <DragSort 
              draggable={!hasEditor}
              data={editors}
              onDragEnd={this._handleDragEnd}
              onDragMove={this._handleDragMove}>
              {this._renderEditors(editors)}
            </DragSort>
          </div>
      )
    } else if (this.props.renderContent) {
      this.props.renderContent(tabType)
    }
    return null
  }

  render() {
    const { tabType } = this.state
    let className = classNames('questionnair-siderbar', this.props.siderbarClass)
    return (
      <div className={className}>
        {this._renderTabs(tabType)}
        <div className='siderbar-menu'>
          {this._renderSiderbar(tabType)}
        </div>
      </div>
    )
  }
}

export default QuestionnairSiderbar