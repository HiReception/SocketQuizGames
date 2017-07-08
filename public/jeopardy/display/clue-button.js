var React = require("react");
var PropTypes = require("prop-types");

export default class ClueButton extends React.Component {
	
	render = () => {
		if (this.props.clue.active) {
			var button = (
				<div 
					className="clue-button active">
					<p className="clue-button">{this.props.prefix}{this.props.value}{this.props.suffix}</p>
				</div>
			);
			return button;
		} else {
			return (
				<div 
					className="clue-button inactive">
					<p className="clue-button"/>
				</div>
			);
		}
		
	}
}

ClueButton.propTypes = {
	clue: PropTypes.object,
	prefix: PropTypes.string,
	suffix: PropTypes.string,
	value: PropTypes.number
};