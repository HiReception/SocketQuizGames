var React = require("react");
var PropTypes = require("prop-types");
const io = require("socket.io-client");
import {Stage, Group, Layer, Rect} from "react-konva";
import initialState from "../initial-state";
import ContestantPanel from "./contestant-panel";
import FameGameBoard from "./fame-game-board";
import CashCard from "./cash-card";
import GiftShop from "./gift-shop";
import ShoppingRoomPanel from "./shopping-room-panel";
import WinnersBoard from "./winners-board";

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
		this.props.socket.removeListener("new game state", this.onNewState);
		window.removeEventListener("resize", this.updateDimensions);
	}


	render = () => {
		const {players, currentItemType, playerAnswering, playerPurchasing,
			fameGameBoardShowing, fameGameBoard, fameGameCurrentSelection, fameGameMoneyRevealed} = this.state;
		var mainPanel;


		switch (currentItemType) {
		case "NoQuestionPanel":
		case "NextRoundPanel":
		case "StandardQuestion":
		case "FastMoney":
		case "RoundBreak":
		case "PostGame":
		case "TiebreakQuestion":
			mainPanel = (
				<ContestantPanel
					players={players}
					playerAnswering={playerAnswering || playerPurchasing}
					clockDisplay={currentItemType === "FastMoney" ? Math.ceil(this.state.fmTimeRemaining/1000).toString() : ""}
				/>
			);
			break;
		case "FameGame":
			if (fameGameBoardShowing) {
				mainPanel = (
					<FameGameBoard
						board={fameGameBoard}
						currentSelection={fameGameCurrentSelection}
						moneyRevealed={fameGameMoneyRevealed}
					/>
				);
			} else {
				mainPanel = (
					<ContestantPanel
						players={players}
						playerAnswering={playerAnswering || playerPurchasing}
						clockDisplay={currentItemType === "FastMoney" ? Math.ceil(this.state.fmTimeRemaining/1000).toString() : ""}
					/>
				);
			}
			break;
		case "GiftShop":
			mainPanel = (
				<GiftShop/>
			);
			break;
		case "CashCard":
			mainPanel = (
				<CashCard/>
			);
			break;
		case "ShoppingBonus":
		case "WinnerDecision":
			mainPanel = (
				<ShoppingRoomPanel/>
			);
			break;
		case "BoardBonus":
			mainPanel = (
				<WinnersBoard/>
			);
			break;
		}



		return mainPanel;
	}
}

DisplayContainer.propTypes = {
	socket: PropTypes.instanceOf(io.Socket),
};