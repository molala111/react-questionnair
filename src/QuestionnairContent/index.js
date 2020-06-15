import React from 'react'
import PropTypes from 'prop-types'
import classNames from 'classnames'
import './index.less'
import Input from '../../libs/Input'
import empty from '../../assets/scale_default.png'

class QuestionnairContent extends React.PureComponent {
  constructor(props) {
    super(props)
    this.state = {
      title: this.props.title,
      sign: this.props.sign
    }
  }

  static propTypes = {
    title: PropTypes.string,
    sign: PropTypes.bool,
    showSign: PropTypes.bool,
    pageClass: PropTypes.string
  }

  static defaultProps = {
    sign: false,
    title: '问卷标题',
    showSign: false
  }

  //新增题目时内容页滚动到底部
  componentDidUpdate() {
    if (this.scrollBottom) {
      const scrollHeight = this.content.scrollHeight
      this.page.scrollTo && this.page.scrollTo(0, scrollHeight)
    }
    if (this.scrollTo) {
      this.page.scrollTo && this.page.scrollTo(0, this.scrollTo)
    }
  }

  componentWillReceiveProps(nextProps) {
    this.scrollBottom = nextProps.isFirst ? true : false
    this.scrollTo = nextProps.scrollTo !== this.props.scrollTo ? nextProps.scrollTo : false
    this.setState({ sign: nextProps.sign, title: nextProps.title })
  }

  _handleSign = () => {
    this.setState(prevState => ({ sign: !prevState.sign }), () => {
      this.props.onChangeSign && this.props.onChangeSign(this.state.sign)
    })
  }

  _handleChange = (e) => {
    this.setState({ title: e.target.value })
  }

  _handleBlur = () => {
    if (this.props.onBlurTitle) {
      this.props.onBlurTitle(this.state.title)
    }
  }

  render() {
    let className = classNames('questionnair-page', this.props.pageClass)
    return (
      <div className={className} ref={el => this.page = el}>
        {this._renderSign()}
        {this._renderTitle()}
        <div className='questionnair-page-content' ref={el => this.content = el}>
          {this._renderContent()}
        </div>
      </div>
    )
  }

  _renderSign() {
    if (this.props.showSign) {
      let status = this.state.sign ? '取消标记' : '标记'
      let className = this.state.sign ? 'banner-text' : 'banner-text banner-text-sign'
      return (
        <div className='questionnair-page-banner'>
          <div className={className} onClick={this._handleSign}>
            <i className="iconfont icon-dengpao"></i>
            <span className='status-text'>{status}</span>
          </div>
        </div>
      )
    }
  }

  _renderTitle() {
    if (this.props.renderTitle) {
      return this.props.renderTitle()
    }
    return (
      <div className='questionnair-page-title'>
        <div className='title-inner'>
          <Input
            value={this.state.title}
            onChange={this._handleChange}
            onBlur={this._handleBlur}
            style={{
              height: 45,
              borderColor: 'transparent',
              textAlign: 'center',
              fontSize: 18,
              color: '#666',
              fontFamily: 'PingFangSC-Medium'
            }}
            className='title-input' />
        </div>
      </div>
    )
  }

  _renderContent() {
    if (this.props.children) {
      return this.props.children
    } else {
      return this._renderEmpty()
    }
  }

  _renderEmpty() {
    return (
      <div className='questionnair-page-default'>
        <img src={empty} style={{ width: 130 }} />
        <div className='page-default-text'>您还没有添加题目哦，请点击左侧控件开始出题吧</div>
      </div>
    )
  }
}

export default QuestionnairContent