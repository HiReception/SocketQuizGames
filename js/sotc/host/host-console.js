const React = require("react");
const io = require("socket.io-client");
const PropTypes = require("prop-types");

import PlayerDetailsPanel from "./player-details-panel";
import PlayerListing from "./player-listing";

import NoQuestionPanel from "./no-question-panel";
import StandardQuestion from "./standard-question";
import FameGameQuestion from "./fame-game-question";
import FameGameBoard from "./fame-game-board";
import GiftShop from "./gift-shop";
import CashCard from "./cash-card";
import FastMoney from "./fast-money";
import RoundBreak from "./round-break";
import PostGame from "./post-game";
import ShoppingBonus from "./shopping-bonus";
import BoardBonus from "./board-bonus";
import WinnerDecision from "./winner-decision";

import PlayerPanelToggleBar from "../../common/player-panel-bar";


export default class HostConsole extends React.Component {
	constructor(props) {
		super(props);
		const newState = props.receivedState;
		newState.playerPanelHidden = true;
		this.state = newState;
	}

	componentDidMount = () => {
		this.props.socket.on("new player", this.handleNewPlayer);
		this.props.socket.on("new answer", this.handleNewAnswer);
	}

	componentWillUnmount = () => {
		this.props.socket.removeListener("new player", this.handleNewPlayer);
		this.props.socket.removeListener("new answer", this.handleNewAnswer);
	}

	handleNewAnswer = (details) => {
		if (this.state.currentItemType === "StandardQuestion" || this.state.currentItemType === "FameGameQuestion" || this.state.currentItemType === "FastMoney") {
			if (this.state.buzzersOpen && this.state.playerAnswering === "" && !this.state.lockedOutPlayerNames.includes(details.player)) {
				this.setAnsweringPlayer(details.player);
			}
		} else if (this.state.currentItemType === "GiftShop" || this.state.currentItemType === "CashCard") {
			if (this.state.playerPurchasing === "" && this.state.eligibleToBuy.includes(details.player)) {
				this.setPurchasingPlayer(details.player);
			}
		}
		
	}

	togglePlayerPanel = () => {
		this.setState({
			playerPanelHidden: !this.state.playerPanelHidden,
		});
	}

	setAnsweringPlayer = (screenName) => {
		console.log(`HostConsole setting answering player to ${screenName}`);
		this.setGameState({
			playerAnswering: screenName,
		});
	}

	clearAnsweringPlayer = () => {
		this.setGameState({
			playerAnswering: "",
		});
	}

	setPurchasingPlayer = (screenName) => {
		console.log(`HostConsole setting purchasing player to ${screenName}`);
		this.setGameState({
			playerPurchasing: screenName,
		});
	}

	clearPurchasingPlayer = () => {
		this.setGameState({
			playerPurchasing: "",
		});
	}

	changeCurrentPanel = (panelName) => {
		this.setGameState({
			currentPanel: panelName,
			newPanelKey: this.state.newPanelKey + 1,
		});
	}

	shuffleList = (list) => {
		for (let i = list.length - 1; i > 0; i--) {
			const j = Math.floor(Math.random() * (i + 1));
			[list[i], list[j]] = [list[j], list[i]];
		}
		return list;
	}

	playerRight = () => {
		if (this.state.currentItemType === "StandardQuestion") {
			var newPlayers = this.state.players;
			var newAnswering = newPlayers.find((p) => p.screenName === this.state.playerAnswering);
			newAnswering.score = newAnswering.score + this.state.standardCorrectAmount;
			this.setGameState({
				players: newPlayers,
				buzzersOpen: false,
				currentItemOver: true
			});
			this.clearAnsweringPlayer();
		} else if (this.state.currentItemType === "FameGameQuestion") {
			this.setGameState({
				currentItemOver: true,
				buzzersOpen: false,
			});
		}
		
	}

	playerWrong = () => {
		if (this.state.currentItemType === "StandardQuestion") {
			var newPlayers = this.state.players;
			var newAnswering = newPlayers.find((p) => p.screenName === this.state.playerAnswering);
			newAnswering.score = newAnswering.score - this.state.standardIncorrectAmount;
			this.setGameState({
				players: newPlayers,
				currentItemOver: true,
				buzzersOpen: false,
			});
			this.clearAnsweringPlayer();
		} else if (this.state.currentItemType === "FameGameQuestion") {
			this.lockPlayerOutThisItem();
			
			if (this.state.lockedOutPlayerNames.length === this.state.players.length) {
				this.setGameState({
					currentItemOver: true,
					buzzersOpen: false,
				});
			} else {
				this.setGameState({
					buzzersOpen: true,
				});
			}
			this.clearAnsweringPlayer();
		}
	}

	cancelBuzz = () => {
		this.clearAnsweringPlayer();
	}

	startTimer = () => {
		// TODO
	}

	goToFameGameBoard = () => {
		this.setGameState({
			fameGameBoardShowing: false,
		});
	}

	lockPlayerOutThisItem = () => {
		var lockedOut = this.state.lockedOutPlayerNames;
		lockedOut.append(this.state.playerAnswering);
		this.setGameState({
			lockedOutPlayerNames: lockedOut,
		});
	}

	addPlayerPrize = (name, prize) => {
		var newPlayers = this.state.players;
		var player = newPlayers.find((p) => p.screenName === name);
		player.prizes.push(prize);
		this.setGameState({
			players: newPlayers
		});
	}

	addBonusPrize = (name, prize) => {
		var newPlayers = this.state.players;
		var player = newPlayers.find((p) => p.screenName === name);
		player.bonusPrizes.append(prize);
		this.setGameState({
			players: newPlayers
		});
	}

	removeBonusPrize = (name, prize) => {
		// TODO
	}

	addPlayerScore = (name, amount) => {
		var newPlayers = this.state.players;
		var newAnswering = newPlayers.find((p) => p.screenName === name);
		newAnswering.score = newAnswering.score + amount;
		this.setGameState({
			players: newPlayers
		});
	}

	deductPlayerScore = (name, amount) => {
		var newPlayers = this.state.players;
		var newAnswering = newPlayers.find((p) => p.screenName === name);
		newAnswering.score = newAnswering.score - amount;
		this.setGameState({
			players: newPlayers
		});
	}

	selectFace = (index) => {
		// TODO
	}

	setPrice = (price) => {
		if (!isNaN(parseInt(price))) {
			this.setGameState({
				sellingPrice: parseInt(price),
			});
		} else if (price === "") {
			this.setGameState({
				sellingPrice: 0,
			});
		}
		
	}

	setBonus = (amount) => {
		if (!isNaN(parseInt(amount))) {
			this.setGameState({
				bonusMoney: parseInt(amount),
			});
		} else if (amount === "") {
			this.setGameState({
				bonusMoney: 0,
			});
		}
		
	}

	callNoSale = () => {
		this.setGameState({
			availableToBuy: false,
		});
	}

	selectCashCardSuit = (index) => {
		this.setGameState({
			selectedSuit: index
		});
	}

	revealSelectedSuit = () => {
		this.setGameState({
			selSuitRevealed: true,
		});
	}

	revealCCMajor = () => {
		this.setGameState({
			majorPrizeRevealed: true,
		});
	}

	startFastMoneyTimer = () => {
		// TODO
	}

	pauseFastMoneyTimer = () => {
		// TODO
	}

	nextQuestion = () => {
		// TODO
	}

	goToTiebreaker = () => {
		// TODO
	}

	selectWinnersBoardNumber = (number) => {
		// TODO
	}

	setCarryOverDecision = (staying) => {
		this.setGameState({
			carryOverDecisionMade: true,
			carryOverDecisionStaying: staying,
		});
	}

	revealFGMoney = () => {
		this.setGameState({
			fameGameMoneyRevealed: true,
		});
	}

	handleNewPlayer = (screenName) => {
		console.log("new player:");
		console.log(screenName);
		const newPlayer = {
			screenName: screenName,
			score: 0,
			prizes: [],
			bonusPrizes: [],
			hidden: false
		};
		const newPlayers = this.state.players;

		newPlayers.push(newPlayer);
		this.setGameState({
			players: newPlayers,
		});
	}

	changePlayerScore = (screenName, newScore) => {
		const newPlayers = this.state.players;
		newPlayers.find((player) => {
			return player.screenName === screenName;
		}).score = newScore;
		this.setGameState({
			players: newPlayers,
		});
	}

	showPlayerDetails = (name, event) => {
		console.log(`showPlayerDetails(${ name },${ event }) called`);
		this.setGameState({
			detailPlayerName: name,
		});
	}

	setWildCardDecision = (decision) => {
		// TODO
	}

	clearPlayerDetails = () => {
		this.setGameState({
			detailPlayerName: "",
		});
	}

	hidePlayer = (playerName) => {
		const newPlayers = this.state.players;
		newPlayers.find((player) => {
			return player.screenName === playerName;
		}).hidden = true;
		this.setGameState({
			players: newPlayers,
		});
	}

	unhidePlayer = (playerName) => {
		const newPlayers = this.state.players;
		newPlayers.find((player) => {
			return player.screenName === playerName;
		}).hidden = false;
		this.setGameState({
			players: newPlayers,
		});
	}

	goToNextItem = () => {
		const newItemNo = this.state.currentItemNo + 1;
		if (newItemNo !== this.state.items.length) {
			const newItem = this.state.items[newItemNo];

			this.setGameState({
				currentItemNo: newItemNo,
				currentItemType: newItem.type,
				currentItemOver: false,
				buzzersOpen: (newItem.type === "StandardQuestion" || newItem.type === "FameGameQuestion")
			});

			const leadingScore = Math.max(...this.state.players.map(p => p.score));

			if (newItem.type === "GiftShop") {
				this.setGameState({
					sellingPrice: newItem.prize.startingPrice,
					bonusMoney: 0,
					availableToBuy: true,
					eligibleToBuy: this.state.players.filter((p) => p.score === leadingScore).map(p => p.screenName),
					playerPurchasing: "",
				});
			}
		} else {
			// TODO handle end of regular game
		}
		
	}

	setGameState = (changedItems) => {
		console.log("setGameState called");
		this.setState(changedItems);
		this.props.socket.emit("set state", changedItems);
	}

	setGameData = (gameProps) => {
		console.log(gameProps);
		// prepare fame game board
		// take prizes that start on fame game board and randomise them
		const shuffledOpeningPrizes = this.shuffleList(gameProps.fameGamePrizes.filter((p) => !p.added));
		// pair them up with faces
		const fameGameBoard = gameProps.fameGameFaces.map((face, index) => {
			return {
				face: face,
				prize: shuffledOpeningPrizes[index],
				selected: false,
			};
		});

		// give players starting score
		const newPlayers = this.state.players.map(p => {
			const newP = p;
			newP.score = gameProps.startingScore;
			return newP;
		});

		this.setGameState({
			prefix: gameProps.prefix,
			suffix: gameProps.suffix,
			players: newPlayers,
			items: gameProps.items,
			endgame: gameProps.endgame,
			fameGameBoard: fameGameBoard,
			endgamePrizes: gameProps.endgamePrizes,
			currentRound: 0,
			currentItemNo: -1,
			standardCorrectAmount: gameProps.standardCorrectAmount,
			standardIncorrectAmount: gameProps.standardIncorrectAmount,
			newPanelKey: this.state.newPanelKey + 1,
		});
		this.goToNextItem();
	}

	render = () => {
		// render player list panel
		let playerPanel;
		if (this.state.detailPlayerName === "") {
			const nonHiddenPlayers = this.state.players.filter((player) => {
				return !player.hidden;
			});
			if (nonHiddenPlayers.length !== 0) {
				const playersByScore = nonHiddenPlayers.sort((p1, p2) => {
					return p1.score < p2.score;
				});
				const list = [];
				for (let i = 0; i < playersByScore.length; i++) {
					const player = playersByScore[i];
					list.push((
						<PlayerListing
							onClick={this.showPlayerDetails.bind(this, player.screenName)}
							player={player}
							key={i}
							answering={this.state.playerAnswering === player.screenName}
							lockedOut={this.state.playerAnswering.length > 0 && this.state.playerAnswering !== player.screenName}/>));
				}
				playerPanel = <div>{list}</div>;
			} else {
				playerPanel = <div><p className='no-players'>No Players</p></div>;
			}
		} else {
			const player = this.state.players.find((player) => {
				return player.screenName === this.state.detailPlayerName;
			});
			playerPanel = (<PlayerDetailsPanel
				player={player}
				clearPlayerDetails={this.clearPlayerDetails}
				hidden={player.hidden}
				hidePlayer={this.hidePlayer}
				unhidePlayer={this.unhidePlayer}
				changePlayerScore={this.changePlayerScore}/>);
		}


		let mainPanel;
		const leadingScore = Math.max(...this.state.players.map(p => p.score));
		const currentItem = this.state.items[this.state.currentItemNo];
		switch (this.state.currentItemType) {
		case "NoQuestionPanel":
			mainPanel = (
				<NoQuestionPanel
					key={this.state.newPanelKey}
					players={this.state.players}
					setGameData={this.setGameData}
				/>
			);
			break;
		case "StandardQuestion":
			mainPanel = (
				<StandardQuestion
					question={currentItem}
					playerAnswering={this.state.playerAnswering}
					timerStarted={this.state.timerStarted}
					timeRemaining={this.state.timeRemaining}
					answered={this.state.currentItemOver}
					playerRight={this.playerRight}
					playerWrong={this.playerWrong}
					cancelBuzz={this.cancelBuzz}
					startTimer={this.startTimer}
					nextItem={this.goToNextItem}
				/>
			);
			break;
		case "FameGameQuestion":
			mainPanel = (
				<FameGameQuestion
					question={currentItem}
					eligiblePlayers={this.state.players.map(p => p.screenName).filter(n => !this.state.lockedOutPlayerNames.includes(n))}
					playerAnswering={this.state.playerAnswering}
					timerStarted={this.state.timerStarted}
					timeRemaining={this.state.timeRemaining}
					answeredCorrectly={this.state.currentItemOver}
					playerRight={this.goToFameGameBoard}
					playerWrong={this.lockPlayerOut}
					cancelBuzz = {this.cancelBuzz}
					startTimer={this.startTimer}
					nextItem={this.goToNextItem}
				/>
			);
			break;
		case "FameGameBoard":
			mainPanel = (
				<FameGameBoard
					playerSelecting={this.state.playerAnswering}
					boardState={this.state.fameGameBoard}
					currentSelection={this.state.fameGameCurrentSelection}
					wildCardDecision={this.state.fameGameWildCardDecision}
					first={this.state.completedFameGames === 0}
					last={this.state.completedFameGames + 1 === this.state.items.filter((i) => i.type === "FameGame")}
					moneyRevealed={this.state.fameGameMoneyRevealed}
					addToPrizes={this.addPlayerPrize}
					addToScore={this.addPlayerScore}
					selectFace={this.selectFace}
					revealMoney={this.revealFGMoney}
					setWildCardDecision={this.setWildCardDecision}
					nextItem={this.goToNextItem}
				/>
			);
			break;
		case "GiftShop":
			mainPanel = (
				<GiftShop
					prize={currentItem.prize}
					currentPrice={this.state.sellingPrice}
					bonusMoney={this.state.bonusMoney}
					eligibleToBuy={this.state.eligibleToBuy}
					playerPurchasing={this.state.playerPurchasing}
					available={this.state.availableToBuy}
					setPrice={this.setPrice}
					setBonus={this.setBonus}
					callNoSale={this.callNoSale}
					deductFromScore={this.deductPlayerScore}
					addToPrizes={this.addPlayerPrize}
					nextItem={this.goToNextItem}
				/>
			);
			break;
		case "CashCard":
			mainPanel = (
				<CashCard
					suits={this.state.cashCardSuits}
					prizes={currentItem.prizes}
					eligibleToBuy={this.state.eligibleToBuy}
					currentPrice={this.state.sellingPrice}
					availableToBuy={this.state.availableToBuy}
					playerPurchasing={this.state.playerPurchasing}
					selectedSuit={this.state.selectedSuit}
					selSuitRevealed={this.state.selSuitRevealed}
					majorPrizeRevealed={this.state.majorPrizeRevealed}
					setPrice={this.setPrice}
					callNoSale={this.callNoSale}
					deductFromScore={this.deductPlayerScore}
					selectCashCardSuit={this.selectCashCardSuit}
					revealSelectedSuit={this.revealSelectedSuit}
					revealMajorPrize={this.revealCCMajor}
					addToPrizes={this.addPlayerPrize}
					addToScore={this.addPlayerScore}
					nextItem={this.goToNextItem}
				/>
			);
			break;
		case "FastMoney":
			mainPanel = (
				<FastMoney
					fmStarted={this.state.fmStarted}
					fmTimeRemaining={this.state.fmTimeRemaining}
					fmClockRunning={this.state.fmClockRunning}
					question={currentItem}
					playerAnswering={this.state.playerAnswering}
					lockTimerStarted={this.state.timerStarted}
					lockTimeRemaining={this.state.timeRemaining}
					playerRight={this.playerRight}
					playerWrong={this.playerWrong}
					cancelBuzz={this.cancelBuzz}
					startLockTimer={this.startTimer}
					startFastMoneyTimer={this.startFastMoneyTimer}
					pauseFastMoneyTimer={this.pauseFastMoneyTimer}
					nextQuestion={this.nextQuestion}
					nextItem={this.goToNextItem}
				/>
			);
			break;
		case "RoundBreak":
			mainPanel = (
				<RoundBreak
					currentRound={this.state.currentRound}
					nextItem={this.goToNextItem}
				/>
			);
			break;
		case "PostGame":
			mainPanel = (
				<PostGame
					leaderOrLeaders={this.state.players.filter((p) => p.score === leadingScore)}
					goToTiebreaker={this.goToTiebreaker}
					nextItem={this.goToNextItem}
				/>
			);
			break;
		case "ShoppingBonus":
			mainPanel = (
				<ShoppingBonus
					champion={this.state.carryOverChampion}
					availableScore={this.state.carryOverScore}
					prizes={this.state.bonusPrizes}
					addBonusPrize={this.addBonusPrize}
					removeBonusPrize={this.removeBonusPrize}/>
			);
			break;
		case "BoardBonus":
			mainPanel = (
				<BoardBonus
					champion={this.state.carryOverChampion}
					wonPrizes={this.state.carryOverPrizes}
					boardState={this.state.winnersBoard}
					boardGameCommenced={this.state.winnersBoardStarted}
					boardGameFinished={this.state.winnersBoardCompleted}
					selectWBNumber={this.selectWinnersBoardNumber}
					addBonusPrize={this.addBonusPrize}/>
			);
			break;
		case "WinnerDecision":
			mainPanel = (
				<WinnerDecision
					champion={this.state.carryOverChampion}
					decisionMade={this.state.carryOverDecisionMade}
					playerStaying={this.state.carryOverDecisionStaying}
					makeDecision={this.setCarryOverDecision}
				/>
			);
			break;
		
		default:
			mainPanel = null;
			break;
		}

		return (
			<div>
				<div className='main-panel'>
					<div
						id='player-list'
						className={`content${
							this.state.playerPanelHidden ? " hidden" : "" }`}>
						{playerPanel}
					</div>
					<div
						id='question-panel'
						className='content'>
						{mainPanel}
					</div>
				</div>
				<PlayerPanelToggleBar
					currentlyHidden={this.state.playerPanelHidden}
					toggle={this.togglePlayerPanel}/>
			</div>
		);
	}
}

HostConsole.propTypes = {
	receivedState: PropTypes.object,
	socket: PropTypes.instanceOf(io.Socket),
};