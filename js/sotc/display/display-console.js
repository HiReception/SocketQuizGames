var React = require("react");
var PropTypes = require("prop-types");
const io = require("socket.io-client");
import {Stage, Group, Rect, Layer} from "react-konva";
import initialState from "../initial-state";
import PlayerListing from "./player-listing";
import OpenQuestionPanel from "./open-question-panel";
import NoQuestionPanel from "./no-question-panel";
import SelectQuestionPanel from "./select-question-panel";
import DailyDoublePanel from "./daily-double-panel";
import FinalJeopardyPanel from "./final-jeopardy-panel";
import FinalJeopardyResponsePanel from "./final-jeopardy-response-panel";

export default class DisplayContainer extends React.Component {
	constructor(props) {
		super(props);
		this.state = initialState;
	}

	updateDimensions = () => {
		this.setState({width: window.innerWidth, height: window.innerHeight});
	}

	onNewState = (state) => {
		this.setState(state);
	}

	componentWillMount = () => {
		this.updateDimensions();
	}

	componentDidMount = () => {
		this.props.socket.on("new game state", this.onNewState);
		window.addEventListener("resize", this.updateDimensions);
	}

	componentWillUnmount = () => {
		this.props.socket.removeHandler("new game state", this.onNewState);
		window.removeEventListener("resize", this.updateDimensions);
	}


	render = () => {
		var questionPanel;
		var cluePanel;
		var ddPanel;
		const currentRound = this.state.rounds[this.state.currentRound];
		const playerPanelHeight = 0.2 * this.state.height;
		const boardHeight = this.state.height - playerPanelHeight;
		const currentClue = currentRound ? currentRound.categories[this.state.currentCatNo].clues[this.state.currentClueNo] : {};
		const clueWidth = currentRound ? this.state.width/currentRound.categories.length : 0;
		const headerHeight = (1/6) * boardHeight;
		const clueHeight = currentRound ? (boardHeight - headerHeight) / currentRound.categories[this.state.currentCatNo].clues.length : 0;
		const clueTop = headerHeight + (clueHeight * this.state.currentClueNo);
		const clueLeft = clueWidth * this.state.currentCatNo;
		switch (this.state.currentPanel) {
		case "NoQuestionPanel":
		case "NextRoundPanel":
			questionPanel = <NoQuestionPanel height={boardHeight} width={this.state.width}/>;
			break;
		case "SelectQuestionPanel":
			questionPanel = (
				<Group height={boardHeight} width={this.state.width} x={0} y={0}>
					<SelectQuestionPanel
						round={this.state.rounds[this.state.currentRound]}
						prefix={this.state.prefix}
						suffix={this.state.suffix}
						height={boardHeight}
						width={this.state.width}
					/>
				</Group>
			);
			break;
		case "OpenQuestionPanel":
			questionPanel = (
				<Group height={boardHeight} width={this.state.width} x={0} y={0}>
					<SelectQuestionPanel
						round={this.state.rounds[this.state.currentRound]}
						prefix={this.state.prefix}
						suffix={this.state.suffix}
						height={boardHeight}
						width={this.state.width}
					/>
				</Group>
			);
			cluePanel = (<OpenQuestionPanel
				clue={currentClue}
				height={boardHeight}
				width={this.state.width}
				startingLeft={clueLeft}
				startingTop={clueTop}
				startingHeight={clueHeight}
				startingWidth={clueWidth}
			/>);
			break;
		case "DailyDoublePanel":
			questionPanel = (
				<Group height={boardHeight} width={this.state.width} x={0} y={0}>
					<SelectQuestionPanel
						round={this.state.rounds[this.state.currentRound]}
						prefix={this.state.prefix}
						suffix={this.state.suffix}
						height={boardHeight}
						width={this.state.width}
					/>
				</Group>
			);
			
			ddPanel = (<DailyDoublePanel
				height={boardHeight}
				width={this.state.width}
				startingLeft={clueLeft}
				startingTop={clueTop}
				startingHeight={clueHeight}
				startingWidth={clueWidth}
			/>);
			break;
		case "FinalJeopardyPanel":
			questionPanel = (
				<FinalJeopardyPanel
					final={this.state.final}
					categoryVisible={this.state.finalCategoryVisible}
					clueVisible={this.state.finalClueVisible}
					height={boardHeight}
					width={this.state.width}
				/>
			);
			break;
		case "FinalJeopardyResponsePanel":
			questionPanel = (
				<FinalJeopardyResponsePanel
					screenName={this.state.finalFocusPlayerName}
					response={this.state.finalFocusResponse}
					responseVisible={this.state.finalFocusResponseVisible}
					wager={this.state.finalFocusWager}
					wagerVisible={this.state.finalFocusWagerVisible}
					height={boardHeight}
					width={this.state.width}
				/>
			);
			break;
		}

		const nonHiddenPlayers = this.state.players.filter((p) => !p.hidden);

		const playerWidth = this.state.width / nonHiddenPlayers.length;

		const list = nonHiddenPlayers.map((p,i) => {
			// light this display up if they are answering the question
			const answering = this.state.playerAnswering.screenName === p.screenName;

			// player is "locked out" if someone ELSE is answering, so grey them out
			const lockedOut = this.state.playerAnswering.hasOwnProperty("screenName")
				&& this.state.playerAnswering.screenName !== p.screenName;

			return (<PlayerListing
				player={p}
				key={i}
				prefix={this.state.prefix}
				suffix={this.state.suffix}
				answering={answering}
				lockedOut={lockedOut}
				left={i * playerWidth}
				width={playerWidth}
				top={0}
				height={playerPanelHeight}
			/>);
		});

		return (
			<Stage x={0} y={0} height={this.state.height} width={this.state.width}>
				<Layer>
					{questionPanel}
					{cluePanel}
					{ddPanel}
				</Layer>
				<Layer>	
					<Group height={playerPanelHeight} width={this.state.width} x={0} y={boardHeight}>
						<Rect height={playerPanelHeight} width={this.state.width} x={0} y={0}
							fill={"brown"}/>
						{list}
					</Group>
				</Layer>
			</Stage>
		);
	}
}

DisplayContainer.propTypes = {
	socket: PropTypes.instanceOf(io.Socket),
};