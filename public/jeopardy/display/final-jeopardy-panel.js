var React = require("react");
var PropTypes = require("prop-types");
import FinalJeopardyLogo from "./final-jeopardy-logo";

export default class FinalJeopardyPanel extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			categoryVisible: false,
			clueVisible: false,
			revealTone: false,
			thinkMusicPlaying: false,
		};
	}

	render = () => {
		var categoryPanel;
		if (this.props.categoryVisible) {
			categoryPanel = (
				<div className="final-jeopardy-category">
					<p className="final-jeopardy-category">
						{this.props.final.category}
					</p>
				</div>
			);
		} else {
			categoryPanel = <FinalJeopardyLogo/>;
		}

		var cluePanel;
		if (this.props.clueVisible) {
			cluePanel = (
				<div className="final-jeopardy-clue">
					<p className="final-jeopardy-clue">
						{this.props.final.answer}
					</p>
				</div>
			);
		} else {
			cluePanel = <FinalJeopardyLogo/>;
		}

		return (
			<div className="final-jeopardy-panel">
				<div className="final-jeopardy-row">
					<div className="final-jeopardy-blank"/>
					{categoryPanel}
				</div>
				<div className="final-jeopardy-row">
					<div className="final-jeopardy-blank"/>
					{cluePanel}
				</div>
			</div>
		);
	}
}

FinalJeopardyPanel.propTypes = {
	final: PropTypes.object,
	categoryVisible: PropTypes.bool,
	clueVisible: PropTypes.bool,
	revealTone: PropTypes.bool,
	thinkMusicPlaying: PropTypes.bool
};