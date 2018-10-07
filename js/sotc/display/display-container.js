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
		const image = new window.Image();
		image.src = "88-93background.png";
		image.onload = () => {
			this.setState({
				backgroundImage: image,
				backgroundNatHeight: image.naturalHeight,
				backgroundNatWidth: image.naturalWidth,
			});
		};
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
		const {height, width, players, currentItemType, playerAnswering, playerPurchasing, fameGameBoardShowing, fameGameBoard} = this.state;
		var mainPanel;

		const screenRatio = width / height;
		const backgroundRatio = this.state.backgroundNatWidth / this.state.backgroundNatHeight;
		var backgroundScale = 1;
		var backgroundOffsetX = 0, backgroundOffsetY = 0;
		if (this.state.backgroundNatHeight) {
			if (screenRatio > backgroundRatio) {
				backgroundScale = width / this.state.backgroundNatWidth;
				backgroundOffsetY = (this.state.backgroundNatHeight - height/backgroundScale)/2;
			} else {
				backgroundScale = height / this.state.backgroundNatHeight;
				backgroundOffsetX = (this.state.backgroundNatWidth - width/backgroundScale)/2;
			}
			backgroundScale = screenRatio > backgroundRatio ? width / this.state.backgroundNatWidth : height/this.state.backgroundNatHeight;
		}

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
					/>
				);
			} else {
				mainPanel = (
					<ContestantPanel
						players={players}
						playerAnswering={playerAnswering || playerPurchasing}
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



		return (
			<Stage x={0} y={0} height={this.state.height} width={this.state.width}>
				<Layer>
					<Rect x={0} y={0} height={height} width={width} fillPatternImage={this.state.backgroundImage}
						fillPatternScaleX={backgroundScale} fillPatternScaleY={backgroundScale}
						fillPatternOffsetX={backgroundOffsetX} fillPatternOffsetY={backgroundOffsetY}/>
				</Layer>
				{mainPanel}
			</Stage>
		);
	}
}

DisplayContainer.propTypes = {
	socket: PropTypes.instanceOf(io.Socket),
};