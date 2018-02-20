var React = require("react");
var PropTypes = require("prop-types");

export default class SubmitButton extends React.Component {
	select = () => {
		this.props.selector(this);
	}

	render = () => {
		var className = this.props.invalidInput ? "submitButton disabled" : "submitButton";
		return (
			<div onClick={this.select} className={className}>
				<p>{this.props.text}</p>
			</div>

		);
	}
}

SubmitButton.propTypes = {
	text: PropTypes.string,
	selector: PropTypes.func,
	invalidInput: PropTypes.bool,
};