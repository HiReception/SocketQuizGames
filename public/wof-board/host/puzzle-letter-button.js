var React = require("react");
var PropTypes = require("prop-types");

export default class PuzzleLetterButton extends React.Component {
	onClick = (letter) => {
		this.props.onClick(letter);
	}
	render = () => {
		if (this.props.active) {
			return (
				<div className="letter-button" href="#" onClick={() => this.onClick(this.props.letter)}>
					<p>{this.props.letter}</p>
				</div>
			);
		} else {
			return (
				<div className="letter-button inactive" href="#">
					<p>{this.props.letter}</p>
				</div>
			);
		}
		
	}
}

PuzzleLetterButton.propTypes = {
	letter: PropTypes.string,
	onClick: PropTypes.func,
	active: PropTypes.bool
};