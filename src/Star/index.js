
import React, { Component } from 'react'
import PropTypes from 'prop-types'
import half from './star-half.png'
import off from './star-off.png'
import on from './star-on.png'

export default class Star extends Component {
  constructor(props) {
    super(props)
    this.state = {
      source: this.props.source / 2,
      size: this.props.size
    }
  }

  static propTypes = {
    source: PropTypes.number,
    size: PropTypes.number
  }

  static defaultProps = {
    source: 10,
    size: 5
  }

  render() {
    let stars = []
    for (let index = 0; index < this.props.size; index++) {
        if (this.state.source >= index) {
            stars.push(<img src={on} style={{ width: 30 }} />)
        } else if (this.state.source >= index - 0.5) {
            stars.push(<img src={half} style={{ width: 30 }} />)
        } else {
            stars.push(<img src={off} style={{ width: 30 }} />)
        }
    }
    return (
      <div>
        {stars}
      </div>
    )
  }
}