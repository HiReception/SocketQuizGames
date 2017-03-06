'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = undefined;

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

var _class, _temp2; /**
                     * Adapted from ReactCSSTransitionGroup.js by Facebook
                     *
                     * @providesModule ReactCSSTransitionReplace
                     */

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _reactDom = require('react-dom');

var _reactDom2 = _interopRequireDefault(_reactDom);

var _ReactCSSTransitionGroupChild = require('react/lib/ReactCSSTransitionGroupChild');

var _ReactCSSTransitionGroupChild2 = _interopRequireDefault(_ReactCSSTransitionGroupChild);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _defaults(obj, defaults) { var keys = Object.getOwnPropertyNames(defaults); for (var i = 0; i < keys.length; i++) { var key = keys[i]; var value = Object.getOwnPropertyDescriptor(defaults, key); if (value && value.configurable && obj[key] === undefined) { Object.defineProperty(obj, key, value); } } return obj; }

function _objectWithoutProperties(obj, keys) { var target = {}; for (var i in obj) { if (keys.indexOf(i) >= 0) continue; if (!Object.prototype.hasOwnProperty.call(obj, i)) continue; target[i] = obj[i]; } return target; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? _defaults(subClass, superClass) : _defaults(subClass, superClass); }

var reactCSSTransitionGroupChild = _react2.default.createFactory(_ReactCSSTransitionGroupChild2.default);

var TICK = 17;

function createTransitionTimeoutPropValidator(transitionType) {
  var timeoutPropName = 'transition' + transitionType + 'Timeout';
  var enabledPropName = 'transition' + transitionType;

  return function (props) {
    // If the transition is enabled
    if (props[enabledPropName]) {
      // If no timeout duration is provided
      if (!props[timeoutPropName]) {
        return new Error(timeoutPropName + ' wasn\'t supplied to ReactCSSTransitionReplace: ' + 'this can cause unreliable animations and won\'t be supported in ' + 'a future version of React. See ' + 'https://fb.me/react-animation-transition-group-timeout for more ' + 'information.');

        // If the duration isn't a number
      } else if (typeof props[timeoutPropName] != 'number') {
        return new Error(timeoutPropName + ' must be a number (in milliseconds)');
      }
    }
  };
}

var ReactCSSTransitionReplace = (_temp2 = _class = function (_React$Component) {
  _inherits(ReactCSSTransitionReplace, _React$Component);

  function ReactCSSTransitionReplace() {
    var _temp, _this, _ret;

    _classCallCheck(this, ReactCSSTransitionReplace);

    for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
      args[_key] = arguments[_key];
    }

    return _ret = (_temp = (_this = _possibleConstructorReturn(this, _React$Component.call.apply(_React$Component, [this].concat(args))), _this), _this.state = {
      currentChild: _this.props.children ? _react2.default.Children.only(_this.props.children) : undefined,
      currentChildKey: _this.props.children ? '1' : '',
      nextChild: undefined,
      activeHeightTransition: false,
      nextChildKey: '',
      height: null,
      width: null,
      isLeaving: false
    }, _this._handleDoneAppearing = function () {
      _this.isTransitioning = false;
    }, _this._handleDoneEntering = function () {
      var _this2 = _this,
          state = _this2.state;


      _this.isTransitioning = false;
      _this.setState({
        currentChild: state.nextChild,
        currentChildKey: state.nextChildKey,
        activeHeightTransition: false,
        nextChild: undefined,
        nextChildKey: '',
        height: null,
        width: null
      });
    }, _this._handleDoneLeaving = function () {
      if (_this.isTransitioning) {
        var state = { currentChild: undefined, isLeaving: false };

        if (!_this.state.nextChild) {
          _this.isTransitioning = false;
          state.height = null;
          state.width = null;
        }

        _this.setState(state);
      }
    }, _temp), _possibleConstructorReturn(_this, _ret);
  }

  ReactCSSTransitionReplace.prototype.componentDidMount = function componentDidMount() {
    if (this.props.transitionAppear && this.state.currentChild) {
      this.appearCurrent();
    }
  };

  ReactCSSTransitionReplace.prototype.componentWillUnmount = function componentWillUnmount() {
    clearTimeout(this.timeout);
  };

  ReactCSSTransitionReplace.prototype.componentWillReceiveProps = function componentWillReceiveProps(nextProps) {
    // Setting false indicates that the child has changed, but it is a removal so there is no next child.
    var nextChild = nextProps.children ? _react2.default.Children.only(nextProps.children) : false;
    var currentChild = this.state.currentChild;

    // Avoid silencing the transition when this.state.nextChild exists because it means that there’s
    // already a transition ongoing that has to be replaced.
    if (currentChild && nextChild && nextChild.key === currentChild.key && !this.state.nextChild) {
      // Nothing changed, but we are re-rendering so update the currentChild.
      return this.setState({
        currentChild: nextChild
      });
    }

    if (!currentChild && !nextChild && this.state.nextChild) {
      // The container was empty before and the entering element is being removed again while
      // transitioning in. Since a CSS transition can't be reversed cleanly midway the height
      // is just forced back to zero immediately and the child removed.
      return this.cancelTransition();
    }

    var state = this.state;

    // When transitionLeave is set to false, refs.curr does not exist when refs.next is being
    // transitioned into existence. When another child is set for this component at the point
    // where only refs.next exists, we want to use the width/height of refs.next instead of
    // refs.curr.

    var ref = this.refs.curr || this.refs.next;

    // Set the next child to start the transition, and set the current height.
    this.setState({
      nextChild: nextChild,
      activeHeightTransition: false,
      nextChildKey: state.currentChildKey ? String(Number(state.currentChildKey) + 1) : '1',
      height: state.currentChild ? _reactDom2.default.findDOMNode(ref).offsetHeight : 0,
      width: state.currentChild && this.props.changeWidth ? _reactDom2.default.findDOMNode(ref).offsetWidth : null
    });

    // Enqueue setting the next height to trigger the height transition.
    this.enqueueHeightTransition(nextChild);
  };

  ReactCSSTransitionReplace.prototype.componentDidUpdate = function componentDidUpdate() {
    if (!this.isTransitioning && !this.state.isLeaving) {
      var _state = this.state,
          currentChild = _state.currentChild,
          nextChild = _state.nextChild;


      if (currentChild && (nextChild || nextChild === false || nextChild === null) && this.props.transitionLeave) {
        this.leaveCurrent();
      }
      if (nextChild) {
        this.enterNext();
      }
    }
  };

  ReactCSSTransitionReplace.prototype.enqueueHeightTransition = function enqueueHeightTransition(nextChild) {
    var _this3 = this;

    var tickCount = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 0;

    this.timeout = setTimeout(function () {
      if (!nextChild) {
        return _this3.setState({
          activeHeightTransition: true,
          height: 0,
          width: _this3.props.changeWidth ? 0 : null
        });
      }

      var nextNode = _reactDom2.default.findDOMNode(_this3.refs.next);
      if (nextNode) {
        _this3.setState({
          activeHeightTransition: true,
          height: nextNode.offsetHeight,
          width: _this3.props.changeWidth ? nextNode.offsetWidth : null
        });
      } else {
        // The DOM hasn't rendered the entering element yet, so wait another tick.
        // Getting stuck in a loop shouldn't happen, but it's better to be safe.
        if (tickCount < 10) {
          _this3.enqueueHeightTransition(nextChild, tickCount + 1);
        }
      }
    }, TICK);
  };

  ReactCSSTransitionReplace.prototype.appearCurrent = function appearCurrent() {
    this.refs.curr.componentWillAppear(this._handleDoneAppearing);
    this.isTransitioning = true;
  };

  ReactCSSTransitionReplace.prototype.enterNext = function enterNext() {
    this.refs.next.componentWillEnter(this._handleDoneEntering);
    this.isTransitioning = true;
  };

  ReactCSSTransitionReplace.prototype.leaveCurrent = function leaveCurrent() {
    this.refs.curr.componentWillLeave(this._handleDoneLeaving);
    this.isTransitioning = true;
    this.setState({ isLeaving: true });
  };

  // When the leave transition time-out expires the animation classes are removed, so the
  // element must be removed from the DOM if the enter transition is still in progress.


  ReactCSSTransitionReplace.prototype.cancelTransition = function cancelTransition() {
    this.isTransitioning = false;
    clearTimeout(this.timeout);
    return this.setState({
      nextChild: undefined,
      activeHeightTransition: false,
      nextChildKey: '',
      height: null,
      width: null
    });
  };

  ReactCSSTransitionReplace.prototype._wrapChild = function _wrapChild(child, moreProps) {
    var transitionName = this.props.transitionName;

    if ((typeof transitionName === 'undefined' ? 'undefined' : _typeof(transitionName)) == 'object' && transitionName !== null) {
      transitionName = _extends({}, transitionName);
      delete transitionName.height;
    }

    // We need to provide this childFactory so that
    // ReactCSSTransitionReplaceChild can receive updates to name,
    // enter, and leave while it is leaving.
    return reactCSSTransitionGroupChild(_extends({
      name: transitionName,
      appear: this.props.transitionAppear,
      enter: this.props.transitionEnter,
      leave: this.props.transitionLeave,
      appearTimeout: this.props.transitionAppearTimeout,
      enterTimeout: this.props.transitionEnterTimeout,
      leaveTimeout: this.props.transitionLeaveTimeout
    }, moreProps), child);
  };

  ReactCSSTransitionReplace.prototype.render = function render() {
    var _state2 = this.state,
        currentChild = _state2.currentChild,
        currentChildKey = _state2.currentChildKey,
        nextChild = _state2.nextChild,
        nextChildKey = _state2.nextChildKey,
        height = _state2.height,
        width = _state2.width,
        isLeaving = _state2.isLeaving,
        activeHeightTransition = _state2.activeHeightTransition;

    var childrenToRender = [];

    var _props = this.props,
        overflowHidden = _props.overflowHidden,
        transitionName = _props.transitionName,
        changeWidth = _props.changeWidth,
        component = _props.component,
        transitionAppear = _props.transitionAppear,
        transitionEnter = _props.transitionEnter,
        transitionLeave = _props.transitionLeave,
        transitionAppearTimeout = _props.transitionAppearTimeout,
        transitionEnterTimeout = _props.transitionEnterTimeout,
        transitionLeaveTimeout = _props.transitionLeaveTimeout,
        containerProps = _objectWithoutProperties(_props, ['overflowHidden', 'transitionName', 'changeWidth', 'component', 'transitionAppear', 'transitionEnter', 'transitionLeave', 'transitionAppearTimeout', 'transitionEnterTimeout', 'transitionLeaveTimeout']);

    if (currentChild && !nextChild && !transitionLeave || currentChild && transitionLeave) {
      childrenToRender.push(_react2.default.createElement('span', { key: currentChildKey }, this._wrapChild(typeof currentChild.type == 'string' ? currentChild : _react2.default.cloneElement(currentChild, { isLeaving: isLeaving }), { ref: 'curr' })));
    }

    if (height !== null) {
      var heightClassName = (typeof transitionName === 'undefined' ? 'undefined' : _typeof(transitionName)) == 'object' && transitionName !== null ? transitionName.height || '' : String(transitionName) + '-height';

      // Similarly to ReactCSSTransitionGroup, adding `-height-active` suffix to the
      // container when we are transitioning height.
      var activeHeightClassName = nextChild && activeHeightTransition && heightClassName ? String(heightClassName) + '-active' : '';

      containerProps.className = String(containerProps.className || '') + ' ' + String(heightClassName) + ' ' + activeHeightClassName;

      containerProps.style = _extends({}, containerProps.style, {
        position: 'relative',
        display: 'block',
        height: height
      });

      if (overflowHidden) {
        containerProps.style.overflow = 'hidden';
      }

      if (changeWidth) {
        containerProps.style.width = width;
      }
    }

    if (nextChild) {
      childrenToRender.push(_react2.default.createElement('span', {
        style: {
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0
        },
        key: nextChildKey
      }, this._wrapChild(nextChild, { ref: 'next' })));
    }

    return _react2.default.createElement(component, containerProps, childrenToRender);
  };

  return ReactCSSTransitionReplace;
}(_react2.default.Component), _class.displayName = 'ReactCSSTransitionReplace', _class.defaultProps = {
  transitionAppear: false,
  transitionEnter: true,
  transitionLeave: true,
  overflowHidden: true,
  component: 'span',
  changeWidth: false
}, _temp2);
exports.default = ReactCSSTransitionReplace;
module.exports = exports['default'];