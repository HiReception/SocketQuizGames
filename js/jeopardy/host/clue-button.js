const React = require("react");
const PropTypes = require("prop-types");

export default class ClueButton extends React.Component {
	constructor(props) {
		super(props);
		this.onClick = this.onClick.bind(this);
	}

	onClick() {
		this.props.callback(this.props.catNo, this.props.clueNo, this.props.value);
	}

	render() {
		if (this.props.active) {
			return (
				<div
					className='clue-button active'
					onClick={this.onClick}>
					<span className='clue-button-text'>{this.props.prefix}{this.props.value}{this.props.suffix}</span>
				</div>
			);
		}
		return (
				<div
					className='clue-button inactive' />
		);
	}
}

ClueButton.propTypes = {
	active: PropTypes.bool,
	catNo: PropTypes.number,
	clueNo: PropTypes.number,
	value: PropTypes.number,
	callback: PropTypes.func,
	prefix: PropTypes.string,
	suffix: PropTypes.string,
};