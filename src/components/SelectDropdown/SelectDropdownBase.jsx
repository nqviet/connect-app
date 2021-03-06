import _ from 'lodash'
import React, { PureComponent } from 'react'
import cn from 'classnames'
import PT from 'prop-types'
import Dropdown from 'appirio-tech-react-components/components/Dropdown/Dropdown'
import Tooltip from 'appirio-tech-react-components/components/Tooltip/Tooltip'
import { TOOLTIP_DEFAULT_DELAY } from '../../../config/constants'

import Modal from 'react-modal'

import './SelectDropdown.scss'

class SelectDropdown extends PureComponent {
  constructor(props) {
    super(props)

    this.state = {
      selectedOption: null,
      confirmOption: null,
    }

    this.cancelSelectOption = this.cancelSelectOption.bind(this)
    this.confirmSelectOption = this.confirmSelectOption.bind(this)
  }

  componentWillMount() {
    this.updateSelectedOptionValue(this.props.value)
  }

  updateSelectedOptionValue(value) {
    const { options } = this.props


    const selectedOption = _.find(options, { value }) || null

    this.setState({
      selectedOption
    }/*, function() {
      // FIXME intentionally commented because it was causing multiple renders when used in mobility testing template
      // Need to further analyze
      // It does not seem to add any value either in both of its usage (it is used in App Screens section
      // for design projects and in mobility testing projects)
      this.props.setValue(this.state.selectedOption.value)
    }*/)
  }

  componentWillReceiveProps(nextProps) {
    // if we changed value by props, then update selected value
    if (this.props.value !== nextProps.value) {
      this.updateSelectedOptionValue(nextProps.value)
    }
  }

  handleClick(option) {
    if (!option.confirm) {
      this.selectOption(option)
    } else {
      this.showConfirmOption(option)
    }
  }

  showConfirmOption(option) {
    this.setState({
      confirmOption: option,
    })
  }

  cancelSelectOption() {
    this.setState({
      confirmOption: null,
    })
  }

  confirmSelectOption() {
    this.selectOption(this.state.confirmOption)
    this.setState({
      confirmOption: null,
    })
  }

  selectOption(option) {
    this.setState({ selectedOption : option }, function() {
      if (this.props.onSelect && typeof this.props.onSelect === 'function')  {
        this.props.onSelect(this.state.selectedOption)
      }
    })
    this.props.setValue(option.value)
  }

  render() {
    const { options, theme, disabled, placeholder } = this.props
    const { selectedOption, confirmOption } = this.state
    const selectedValue = selectedOption ? selectedOption.title : placeholder
    const renderOption = (option, optIdx) => {
      if (option.hide) {
        return null
      }
      const handleOptionClick = this.handleClick.bind(this, option)
      const preventDefault = (evt) => {
        evt.preventDefault()
        // stop propagation to prevent dropdown from closing when clicking disabled item
        evt.stopPropagation()
      }
      const selectItem = (
        <li
          tabIndex="-1"
          key={ optIdx }
          className="dropdown-menu-list-item"
          styleName={cn({ disabled: option.disabled })}
          onClick={ option.disabled ? preventDefault : handleOptionClick }
        >
          <a href="javascript:;">{ option.title }</a>
        </li>
      )
      return option.toolTipMessage ? (
        <Tooltip theme="light" tooltipDelay={TOOLTIP_DEFAULT_DELAY} key={optIdx} usePortal>
          <div className="tooltip-target">
            {selectItem}
          </div>
          <div className="tooltip-body">
            {option.toolTipMessage}
          </div>
        </Tooltip>
      ) : selectItem
    }
    return (
      <div styleName="container">
        {disabled ? (
          <div className="SelectDropdown" styleName="dropdown-disabled">
            <div className="dropdown-menu-header"><span className="tc-link">{ selectedValue }</span></div>
          </div>
        ) : (
          <Dropdown handleKeyboardNavigation theme={ theme } className="SelectDropdown" noPointer>
            <div className="dropdown-menu-header"><span className="tc-link">{ selectedValue }</span></div>
            <ul className="dropdown-menu-list">
              { options.map(renderOption) }
            </ul>
          </Dropdown>
        )}

        <Modal
          isOpen={!!confirmOption}
          className="delete-post-dialog"
          overlayClassName="delete-post-dialog-overlay"
          onRequestClose={this.cancelSelectOption}
          contentLabel=""
        >
          <div className="modal-title">
            {!!confirmOption && confirmOption.confirm}
          </div>

          <div className="button-area flex center action-area">
            <button className="tc-btn tc-btn-default tc-btn-sm action-btn btn-cancel" onClick={this.cancelSelectOption}>Cancel</button>
            <button className="tc-btn tc-btn-warning tc-btn-sm action-btn " onClick={this.confirmSelectOption}>Confirm</button>
          </div>
        </Modal>
      </div>
    )
  }
}

const valuePropType = PT.oneOfType([PT.string, PT.number])

SelectDropdown.defaultProps = {
  placeholder: ' - Select - '
}

SelectDropdown.propTypes = {
  onSelect       : PT.func,
  options        : PT.arrayOf(PT.shape({
    title: PT.string.isRequired,
    value: valuePropType.isRequired,
    disabled: PT.bool,
    hide: PT.bool,
    confirm: PT.oneOfType([PT.string, PT.bool]),
    toolTipMessage: PT.string,
  })).isRequired,
  theme          : PT.string,
  value          : valuePropType,
  /**
   * Placeholder to show when there is no selected option
   */
  placeholder: PT.string,
}

export default SelectDropdown
