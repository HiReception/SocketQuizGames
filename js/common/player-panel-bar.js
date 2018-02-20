const React = require("react");
const PropTypes = require("prop-types");

export default class PlayerPanelToggleBar extends React.Component {
	render = () => {
		const playerPanelText = this.props.currentlyHidden ?
			"Show Player Panel" : "Hide Player Panel";

		return (
			<div
				id='player-panel-bar'
				className='player-panel-bar'
				onClick={this.props.toggle}>
				<p className='player-panel-bar'>
					{playerPanelText}
				</p>
			</div>
		);
	}
}

PlayerPanelToggleBar.propTypes = {
	currentlyHidden: PropTypes.bool,
	toggle: PropTypes.func,
};
