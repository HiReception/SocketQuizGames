const React = require("react");
const PropTypes = require("prop-types");

// panel at end of game, with option to follow on game
export default class PostGamePanel extends React.Component {
	render() {
		return (
			<div className='no-question-panel'>
				That's the end of the game!
				<div
					className='add-question-button'
					href='#'
					onClick={this.props.callback}>
					<p>Create New Game with Same Players</p>
				</div>
			</div>
		);
	}
}

PostGamePanel.propTypes = {
	callback: PropTypes.func,
};
