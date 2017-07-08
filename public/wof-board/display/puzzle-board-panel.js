var React = require("react");

import WheelContainer from "./wheel-container";
import PuzzleBoardGrid from "./puzzle-board-grid";

// panel showing category, current board, correct answer, and letters both available and called
export default class PuzzleBoardPanel extends React.Component {
	render = () => {
		var categoryPanel = null;
		if (this.props.gameState.currentPanel === "PuzzleBoardPanel") {
			categoryPanel = (
				<div className="puzzle-category-panel">
					<p className="puzzle-category-panel">
						{this.props.gameState.currentCategory.toUpperCase()}
					</p>
				</div>
			);
		} else if (this.props.gameState.currentPanel === "BonusRoundPanel") {
			categoryPanel = (
				<div className="bonus-category-panel">
					<p className="called-letters">
						{this.props.gameState.selectedLetters}
					</p>
					<p className="puzzle-category-panel">
						{this.props.gameState.currentCategory.toUpperCase()}
					</p>
				</div>
			);
		}

		var wheelContainer = null;
		if (this.props.gameState.currentPanel === "PuzzleBoardPanel") {
			var wedges = [];
			if (this.props.gameState.currentRound < this.props.gameState.wheels.length) {
				wedges = this.props.gameState.wheels[this.props.gameState.currentRound];
			} else {
				wedges = this.props.gameState.wheels[this.props.gameState.wheels.length - 1];
			}

			wheelContainer = (
				<WheelContainer
					wedges={wedges}
					angle={this.props.gameState.wheelAngle}
					currentPlayer={this.props.gameState.currentPlayer}/>
			);
		}

		var playerPanels = [];
		for (var p in this.props.gameState.players) {
			playerPanels.push((
				<div key={p} className="player-panel" style={{
					backgroundColor: this.props.gameState.players[p].colour
				}}>
					<div className="player-panel-inner">
						<p className="player-panel" style={{
							color: "white"
						}}>
							{this.props.gameState.players[p].roundScore}
						</p>
					</div>
				</div>
			));
		}

		return (
			<div className="puzzle-board-panel">
				<PuzzleBoardGrid currentBoard={this.props.gameState.displayedBoard}/>
				<div className="below-puzzle-board">
					{categoryPanel}
				</div>
				<div className="above-puzzle-board" id="above-puzzle-board">
					{wheelContainer}
				</div>
				<div className="player-row">
					{playerPanels}
				</div>
			</div>
		);
	}
}