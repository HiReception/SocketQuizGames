const React = require("react");
const io = require("socket.io-client");
const PropTypes = require("prop-types");
import accounting from "accounting";

import PlayerDetailsPanel from "./player-details-panel";
import PlayerListing from "./player-listing";
import initialState from "../initial-state";

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
import TiebreakQuestion from "./tiebreak-question";


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
		if (this.state.currentItemType === "StandardQuestion" || this.state.currentItemType === "FameGame"
		|| this.state.currentItemType === "FastMoney") {
			if (this.state.buzzersOpen && this.state.playerAnswering === ""
				&& !this.state.lockedOutPlayerNames.includes(details.player)) {
				this.setAnsweringPlayer(details.player);
			}
		} else if (this.state.currentItemType === "GiftShop" || this.state.currentItemType === "CashCard") {
			if (this.state.playerPurchasing === ""
			&& this.state.eligibleToBuy.includes(details.player)
			&& this.state.availableToBuy) {
				this.setPurchasingPlayer(details.player);
			}
		} else if (this.state.currentItemType === "TiebreakQuestion") {
			if (this.state.buzzersOpen
				&& this.state.playerAnswering === ""
				&& this.state.tiebreakEligiblePlayers.includes(details.player)) {
				this.setAnsweringPlayer(details.player);
			}
		}
		
	}

	togglePlayerPanel = () => {
		this.setState({
			playerPanelHidden: !this.state.playerPanelHidden,
		});
	}

	setAnsweringPlayer = (screenName) => {
		this.setGameState({
			playerAnswering: screenName,
			timerRunning: false // cancel any post-question timer that may be running
		});
	}

	clearAnsweringPlayer = () => {
		this.setGameState({
			playerAnswering: "",
		});
	}

	setPurchasingPlayer = (screenName) => {
		this.setGameState({
			playerPurchasing: screenName,
			availableToBuy: false,
		});
	}

	clearPurchasingPlayer = () => {
		this.setGameState({
			playerPurchasing: "",
			availableToBuy: true,
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
		if (this.state.currentItemType === "StandardQuestion"
			|| this.state.currentItemType === "FastMoney"
			|| this.state.currentItemType === "TiebreakQuestion") {
			var newPlayers = this.state.players;
			var newAnswering = newPlayers.find((p) => p.screenName === this.state.playerAnswering);
			newAnswering.score = newAnswering.score + this.state.standardCorrectAmount;
			this.setGameState({
				players: newPlayers,
				buzzersOpen: false,
				currentItemOver: true
			});
			this.clearAnsweringPlayer();
		}
		
	}

	playerWrong = () => {
		var newPlayers = this.state.players;
		var newAnswering = newPlayers.find((p) => p.screenName === this.state.playerAnswering);
		if (this.state.currentItemType === "StandardQuestion" || this.state.currentItemType === "FastMoney") {
			
			newAnswering.score = newAnswering.score - this.state.standardIncorrectAmount;
			this.setGameState({
				players: newPlayers,
				currentItemOver: true,
				buzzersOpen: false,
			});
			this.clearAnsweringPlayer();
		} else if (this.state.currentItemType === "FameGame") {
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
		} else if (this.state.currentItemType === "TiebreakQuestion") {
			// deduct the standard amount from the player's total
			newAnswering.score = newAnswering.score - this.state.standardIncorrectAmount;

			// remove this player from those eligible for the tiebreak question (and therefore eligible to win)
			const newEligible = this.state.tiebreakEligiblePlayers
				.filter(p => p.screenName !== this.state.playerAnswering);
			
			// if only one eligible player is left, that player wins by default and the question is over
			if (newEligible.length === 1) {
				this.setGameState({
					players: newPlayers,
					currentItemOver: true,
					buzzersOpen: false,
					
				});
			
			}
			// otherwise, open the buzzers again
			else {
				this.setGameState({
					players: newPlayers,
					buzzersOpen: true,
					tiebreakEligiblePlayers: newEligible
				});
			}
		}
	}

	cancelBuzz = () => {
		this.clearAnsweringPlayer();
	}

	timerIncrement = () => {
		if (this.state.timerRunning) {
			const newTimeRemaining = Math.max(this.state.timeRemaining - 100, 0);
			this.setGameState({
				timeRemaining: newTimeRemaining,
			});
			if (newTimeRemaining === 0) {
				this.setGameState({
					timerRunning: false,
					buzzersOpen: false,
					currentItemOver: true,
				});
				clearInterval(this.state.lockoutTimer);
			} 
		} else {
			this.setGameState({
				timeRemaining: 0,
			});
			clearInterval(this.state.lockoutTimer);
		}
	}

	startTimer = (limit) => {
		this.setGameState({
			timerStarted: true,
			timerRunning: true,
			timeRemaining: limit,
			lockoutTimer: setInterval(this.timerIncrement, 100)
		});
	}

	formatCurrency = (value, commas = true) => {
		return `${this.state.prefix}${accounting.formatNumber(value, 0, commas ? "," : "")}${this.state.suffix}`;
	}

	goToFameGameBoard = () => {
		this.setGameState({
			fameGameBoardShowing: true,
		});
	}

	lockPlayerOutThisItem = () => {
		var lockedOut = this.state.lockedOutPlayerNames;
		lockedOut.push(this.state.playerAnswering);
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
		player.bonusPrizes.push(prize);
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
		if (this.state.fameGameCurrentSelection === -1 || this.state.wildCardDecision === 1) {
			const newBoard = this.state.fameGameBoard;
			newBoard[index].selected = true;
			this.setGameState({
				fameGameCurrentSelection: index,
				fameGameBoard: newBoard,
				wildCardDecision: -1,
			});
		}
		
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
		if (this.state.selectedSuit === -1) {
			this.setGameState({
				selectedSuit: index
			});
		}
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

	fastMoneyTimerIncrement = () => {
		if (this.state.fmClockRunning) {
			const newTimeRemaining = Math.max(this.state.fmTimeRemaining - 100, 0);
			this.setGameState({
				fmTimeRemaining: newTimeRemaining,
			});
			if (newTimeRemaining === 0) {
				this.setGameState({
					fmClockRunning: false,
					buzzersOpen: false,
					currentItemOver: true,
				});
				clearInterval(this.state.fmTimer);
			} 
		}
	}

	startFastMoneyTimer = () => {
		this.setGameState({
			fmStarted: true,
			fmClockRunning: true,
			fmTimer: setInterval(this.fastMoneyTimerIncrement, 100)
		});
	}

	pauseFastMoneyTimer = () => {
		this.setGameState({
			fmClockRunning: false,
		});
		clearInterval(this.state.fmTimer);
	}

	fmNextQuestion = () => {
		this.setGameState({
			fmCurrentQuestionNo: this.state.fmCurrentQuestionNo + 1,
			fmCurrentQuestion: this.state.items[this.state.currentItemNo]
				.questions[this.state.fmCurrentQuestionNo + 1],
			buzzersOpen: true,
			timerStarted: false,
			timerRunning: false,
			currentItemOver: false,
		});
	}

	goToTiebreaker = () => {
		const leadingScore = Math.max(...this.state.players.map(p => p.score));
		this.setGameState({
			currentItemType: "TiebreakQuestion",
			tiebreakEligiblePlayers: this.state.players.filter(p => p.score === leadingScore).map(p => p.screenName),
		});
	}

	selectWinnersBoardNumber = (number) => {
		if (!this.state.winnersBoardCompleted) {
			// set option at position number as selected
			const newBoard = this.state.winnersBoard;
			newBoard[number - 1].selected = true;
			// if win card has been previously found, or same prize as this one has already been uncovered
			const prizePairFound = newBoard[number - 1].name
				&& this.state.winnersBoard.some((opt, i) => opt.selected && i !== number - 1 && opt.name && opt.name === newBoard[number - 1].name);
			if ((newBoard[number - 1].name && this.state.winnersBoardWinFound) || prizePairFound) {
				// mark board game as over, set won prize to prize found
				this.setGameState({
					winnersBoardCompleted: true,
					winnersBoardPrizeWon: newBoard[number - 1],
				});
				// TODO add the two numbers that held this prize's cards (or if major, the prize card and the win) to the inactive numbers list
			}
			// else if this selection is a win card
			else if (newBoard[number - 1].winCard) {
				// mark win card as found
				this.setGameState({
					winnersBoardWinFound: true,
				});
			}

			this.setGameState({
				winnersBoard: newBoard,
			});
		}
		
	}

	revealWinnersBoardMajor = () => {
		this.setGameState({
			winnersBoardMajorRevealed: true,
		});
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

	showPlayerDetails = (name) => {
		this.setGameState({
			detailPlayerName: name,
		});
	}

	setWildCardDecision = (decision) => {
		this.setGameState({
			wildCardDecision: decision
		});
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
			const newItemType = newItem.type;

			this.setGameState({
				currentItemNo: newItemNo,
				currentItemType: newItemType,
				currentItemOver: false,
				
			});

			if (newItemType === "StandardQuestion" || newItemType === "FameGame" || newItemType === "FastMoney") {
				this.setGameState({
					buzzersOpen: true,
					timerStarted: false,
					timerRunning: false,
				});
			}

			if (newItemType === "FastMoney") {
				this.setGameState({
					fmTimeRemaining: newItem.length * 1000,
					fmCurrentQuestionNo: 0,
					fmCurrentQuestion: newItem.questions[0],
					fmStarted: false,
				});
			}

			const leadingScore = Math.max(...this.state.players.map(p => p.score));

			if (newItemType === "GiftShop") {
				this.setGameState({
					sellingPrice: newItem.prize.startingPrice,
					bonusMoney: 0,
					availableToBuy: true,
					eligibleToBuy: this.state.players.filter((p) => p.score === leadingScore).map(p => p.screenName),
					playerPurchasing: "",
				});
			}

			if (newItemType === "CashCard") {
				this.setGameState({
					sellingPrice: newItem.startingPrice,
					availableToBuy: true,
					eligibleToBuy: this.state.players.filter((p) => p.score === leadingScore).map(p => p.screenName),
					playerPurchasing: "",
				});
			}

			if (this.state.currentItemType === "RoundBreak") {
				this.setGameState({
					currentRound: this.state.currentRound + 1,
				});
			}

			if (this.state.currentItemType === "FameGame") {
				this.setGameState({
					fameGamesCompleted: this.state.fameGamesCompleted + 1,
					playerAnswering: "",
				});
			}

			if (newItemType === "FameGame") {
				// TODO add verification that there will never be a situation where there are fewer
				//	 removable prizes on the board than there are ones to be added for a new round
				// TODO add validation to prevent duplicate names of prizes in fame game
				var newBoard = this.state.fameGameBoard;
				const fameGameNo = this.state.fameGamesCompleted + 1;
				// find the prizes which are to be added to the board this round
				const toAdd = this.state.fameGamePrizes.filter(p => p.added === fameGameNo);
				console.log("Prizes to be added to Fame Game:");
				console.log(toAdd);
				// pick prizes that can be taken off the board to be replaced by the new prizes (if any)
				if (toAdd.length > 0) {
					const removablePrizes = this.state.fameGameBoard.filter(o => !o.selected && o.prize.removable);
					// select random elements, one for each new prize
					const selectedToRemove = removablePrizes
						.sort(() => 0.5 < Math.random())
						.slice(0,toAdd.length)
						.map(o => o.prize.name);
					console.log("Prize(s) selected to remove: ");
					console.log(selectedToRemove);
					newBoard = newBoard.map(o => {
						// replace those prizes with the new prizes
						if (selectedToRemove.includes(o.prize.name)) {
							console.log(`${o.prize.name} Found`);
							o.prize = toAdd.pop();
						}
						return o;
					});
					console.log("Updated board:");
					console.log(newBoard);
				}
				

				this.setGameState({
					fameGameBoard: newBoard,
					fameGameBoardShowing: false,
					fameGameCurrentSelection: -1,
					wildCardDecision: -1,
				});
			}


		} else {
			this.setGameState({
				currentItemType: "PostGame"
			});
		}
		
	}

	goToEndgame = () => {
		const winner = this.state.players.sort((a, b) => b.score - a.score)[0];
		this.setGameState({
			carryOverChampion: winner.screenName,
		});
		switch (this.state.endgame) {
		case "BoardBonus":
			// if winner is not carry over champion, clear the inactive numbers for the winners board
			if (winner.screenName !== this.state.carryOverChampion) {
				this.setGameState({
					winnersBoardInactiveNumbers: []
				});
			}
			// if this player has already won all the bonus prizes, they win the cash jackpot as well, and are retired
			if (winner.bonusPrizes.length === this.state.bonusPrizes.length) {
				// TODO
			} else {

				// filter out prizes at the same level as carry over champion's already won bonus prizes
				const availablePrizes = this.state.bonusPrizes.filter(prize => !winner.bonusPrizes.some(wp => wp.prizeLevel === prize.prizeLevel));
				const prizeCards = [];

				const boardSpaces = this.state.bonusPrizes.length * 2;

				availablePrizes.forEach(prize => {
					if (prize.requiresWin) {
						// add one prize card, and one "WIN" card - the first prize found after revealing a WIN card is won
						prizeCards.push({...prize});
						prizeCards.push({winCard: true});
					} else {
						// add two prize cards to the board - if both cards are uncovered, the prize is won
						prizeCards.push({...prize});
						prizeCards.push({...prize});
					}
				});
				// shuffle list
				const shuffledCards = this.shuffleList(prizeCards);

				const startingBoard = [...Array(boardSpaces).keys()].map((i) => {
					// if i is in list of inactive numbers (where carry over champion has already won a prize),
					// or if there are no more cards to be assigned,
					// leave this space entirely blank
					if (this.state.winnersBoardInactiveNumbers.includes(i + 1) || shuffledCards.length === 0) {
						return {inactive: true};
					}
					// otherwise, assign it the next card from the shuffled list
					else {
						return shuffledCards.pop();
					}
				});

				this.setGameState({
					winnersBoard: startingBoard,
					currentItemType: "BoardBonus"
				});
			}
			break;

		case "ShoppingBonus":
			// TODO
			// if carry over champion has won
				// add winning score to this.state.carryOverScore
			// else
				// set this.state.carryOverScore to winning score
			
			// if player has high enough score to buy the lot and the jackpot
				// player is automatically retired
			// else

				// if this.state.carryOverScore is lower than lowest price of bonus prizes
					// set availablePrize to lowest-priced prize
					// change availablePrize.price to winning score
				// else
					// set availablePrize to highest-priced prize where price <= winningScore
				// set currentItemType to ShoppingBonus
			break;
		default:
			// TODO
			break;
		}
		
	}

	followOnGame = () => {
		// Set all game state values to initial, EXCEPT:
		let newState = initialState;
		// TODO Make default selections for NoQuestionPanel the ones used previously (if possible...?)
		// Reinstate existing players array, but revert their scores to zero
		newState.players = this.state.players;
		newState.players.forEach(p => p.score = 0);
		// TODO Increment Cash Jackpot (if applicable)
		// If carry over champion is playing on, put their name back in as carry over champion
		if (this.state.carryOverDecisionStaying) {
			newState.carryOverChampion = this.state.carryOverChampion;
		}
		// If carry over champion retired, move their Bonus Prizes to Prizes (keep them as "won", for recordkeeping)
		else {
			var carryOverChampion = newState.players.find(p => p.screenName === this.state.carryOverChampion);
			carryOverChampion.prizes.push(...carryOverChampion.bonusPrizes);
			carryOverChampion.bonusPrizes = [];
		}

		this.setGameState(newState);
	}

	goToWinnerDecision = () => {
		this.setGameState({
			currentItemType: "WinnerDecision"
		});
	}

	setGameState = (changedItems) => {
		this.setState(changedItems);
		this.props.socket.emit("set state", changedItems);
	}

	setGameData = (gameProps, standardQuestions, fameGameQuestions) => {
		// prepare list of all StandardQuestions in use (to prevent duplicates)
		// TODO validate that question database has enough questions to accommodate the requirements of the game JSON
		const standardQuestionsUsed = [];
		const fameGameQuestionsUsed = [];
		var index;
		gameProps.items = gameProps.items.map(i => {
			switch (i.type) {
			case "StandardQuestion":
				index = Math.floor(Math.random() * standardQuestions.length);
				while (standardQuestionsUsed.includes(index)) {
					index = Math.floor(Math.random() * standardQuestions.length);
				}
				i.question = standardQuestions[index];
				standardQuestionsUsed.push(index);
				break;
			case "FameGame":
				index = Math.floor(Math.random() * fameGameQuestions.length);
				while (fameGameQuestionsUsed.includes(index)) {
					index = Math.floor(Math.random() * fameGameQuestions.length);
				}
				i.question = fameGameQuestions[index];
				fameGameQuestionsUsed.push(index);
				break;
			case "FastMoney":
				// get a set of questions for the fast money, 1 for every 2 seconds in the alloted time
				i.questions = [...Array(Math.ceil(i.length / 2)).keys()].map(q => {
					index = Math.floor(Math.random() * standardQuestions.length);
					while (standardQuestionsUsed.includes(index)) {
						index = Math.floor(Math.random() * standardQuestions.length);
					}
					standardQuestionsUsed.push(index);
					return standardQuestions[index];
					
				});
				break;
			}

			return i;

			
		});

		// finally, pick another fame game question to act as a potential tiebreaker
		index = Math.floor(Math.random() * fameGameQuestions.length);
		while (fameGameQuestionsUsed.includes(index)) {
			index = Math.floor(Math.random() * fameGameQuestions.length);
		}
		const tiebreakQuestion = fameGameQuestions[index];
		fameGameQuestionsUsed.push(index);

		if (gameProps.items.some(i => i.type === "FameGame")) {
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
			this.setGameState({
				fameGameBoard: fameGameBoard,
				fameGamePrizes: gameProps.fameGamePrizes,
			});
		}

		if (gameProps.items.some(i => i.type === "CashCard")) {
			const shuffledPrizes = this.shuffleList(gameProps.cashCardPrizes);
			const cashCardSuits = [
				{name: "Hearts", suitSymbol: "\u2665"},
				{name: "Spades", suitSymbol: "\u2660"},
				{name: "Diamonds", suitSymbol: "\u2666"},
				{name: "Clubs", suitSymbol: "\u2663"},
			].map(suit => {
				suit.prize = shuffledPrizes.pop();
				return suit;
			});

			this.setGameState({
				cashCardSuits: cashCardSuits,
			});
		}
		

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
			tiebreakQuestion: tiebreakQuestion,
			endgame: gameProps.endgame,
			endgamePrizes: gameProps.endgamePrizes,
			currentRound: 1,
			currentItemNo: -1,
			standardCorrectAmount: gameProps.standardCorrectAmount,
			standardIncorrectAmount: gameProps.standardIncorrectAmount,
			normalAnsweringTimer: gameProps.normalAnsweringTimer,
			fastMoneyAnsweringTimer: gameProps.fastMoneyAnsweringTimer,
			newPanelKey: this.state.newPanelKey + 1,
			bonusPrizes: gameProps.bonusPrizes,
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
							onClick={() => this.showPlayerDetails(player.screenName)}
							player={player}
							key={i}
							answering={this.state.playerAnswering === player.screenName}
							lockedOut={this.state.playerAnswering.length > 0
								&& this.state.playerAnswering !== player.screenName}/>));
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
		const currentItem = this.state.currentItemNo >= this.state.items.length
			? {}
			: this.state.items[this.state.currentItemNo];
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
					question={currentItem.question}
					playerAnswering={this.state.playerAnswering}
					timerStarted={this.state.timerStarted}
					timeRemaining={this.state.timeRemaining}
					answered={this.state.currentItemOver}
					playerRight={this.playerRight}
					playerWrong={this.playerWrong}
					cancelBuzz={this.cancelBuzz}
					startTimer={() => this.startTimer(this.state.normalAnsweringTimer)}
					nextItem={this.goToNextItem}
				/>
			);
			break;
		case "FameGame":
			mainPanel = !this.state.fameGameBoardShowing ? (
				<FameGameQuestion
					question={currentItem.question}
					eligiblePlayers={this.state.players
						.map(p => p.screenName)
						.filter(n => !this.state.lockedOutPlayerNames.includes(n))}
					playerAnswering={this.state.playerAnswering}
					timerStarted={this.state.timerStarted}
					timeRemaining={this.state.timeRemaining}
					questionOver={this.state.currentItemOver}
					playerRight={this.goToFameGameBoard}
					playerWrong={this.playerWrong}
					cancelBuzz = {this.cancelBuzz}
					startTimer={() => this.startTimer(this.state.normalAnsweringTimer)}
					nextItem={this.goToNextItem}
				/>
			) : (
				<FameGameBoard
					playerSelecting={this.state.playerAnswering}
					boardState={this.state.fameGameBoard}
					currentSelection={this.state.fameGameCurrentSelection}
					wildCardDecision={this.state.wildCardDecision}
					first={this.state.fameGamesCompleted === 0}
					last={this.state.fameGamesCompleted + 1 === this.state.items.filter((i) => i.type === "FameGame")}
					moneyRevealed={this.state.fameGameMoneyRevealed}
					addToPrizes={this.addPlayerPrize}
					addToScore={this.addPlayerScore}
					selectFace={this.selectFace}
					revealMoney={this.revealFGMoney}
					setWildCardDecision={this.setWildCardDecision}
					nextItem={this.goToNextItem}
					formatCurrency={this.formatCurrency}
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
					formatCurrency={this.formatCurrency}
				/>
			);
			break;
		case "CashCard":
			mainPanel = (
				<CashCard
					suits={this.state.cashCardSuits}
					prizes={this.state.cashCardSuits
						.map(s => s.prize)
						.sort((a,b) => (a.prizeValue || a.scoreValue) > (b.prizeValue || b.scoreValue))}
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
					formatCurrency={this.formatCurrency}
				/>
			);
			break;
		case "FastMoney":
			mainPanel = (
				<FastMoney
					fmStarted={this.state.fmStarted}
					fmTimeRemaining={this.state.fmTimeRemaining}
					fmClockRunning={this.state.fmClockRunning}
					currentQuestion={this.state.fmCurrentQuestion}
					currentQuestionOver={this.state.currentItemOver}
					playerAnswering={this.state.playerAnswering}
					lockTimerStarted={this.state.timerStarted}
					lockTimeRemaining={this.state.timeRemaining}
					playerRight={this.playerRight}
					playerWrong={this.playerWrong}
					cancelBuzz={this.cancelBuzz}
					startLockTimer={() => this.startTimer(this.state.fastMoneyAnsweringTimer)}
					startFastMoneyTimer={this.startFastMoneyTimer}
					pauseFastMoneyTimer={this.pauseFastMoneyTimer}
					nextQuestion={this.fmNextQuestion}
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
					players={this.state.players}
					goToTiebreaker={this.goToTiebreaker}
					goToEndgame={this.goToEndgame}
					formatCurrency={this.formatCurrency}
				/>
			);
			break;
		case "TiebreakQuestion":
			mainPanel = (
				<TiebreakQuestion
					question={this.state.tiebreakQuestion}
					eligiblePlayers={this.state.tiebreakEligiblePlayers}
					playerAnswering={this.state.playerAnswering}
					questionOver={this.state.currentItemOver}
					playerRight={this.playerRight}
					playerWrong={this.playerWrong}
					cancelBuzz={this.cancelBuzz}
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
					winCardFound={this.state.winnersBoardWinFound}
					boardGameFinished={this.state.winnersBoardCompleted}
					majorPrizeRevealed={this.state.winnersBoardMajorRevealed}
					selectWBNumber={this.selectWinnersBoardNumber}
					prizeWon={this.state.winnersBoardPrizeWon}
					addBonusPrize={this.addBonusPrize}
					revealMajorPrize={this.revealWinnersBoardMajor}
					goToDecision={this.goToWinnerDecision}
					formatCurrency={this.formatCurrency}/>
			);
			break;
		case "WinnerDecision":
			mainPanel = (
				<WinnerDecision
					champion={this.state.carryOverChampion}
					safePrizes={this.state.players.find(p => p.screenName === this.state.carryOverChampion).prizes}
					bonusPrizesWon={this.state.players.find(p => p.screenName === this.state.carryOverChampion).bonusPrizes}
					bonusPrizesLeft={this.state.bonusPrizes
						.filter(bp => !this.state.players
							.find(p => p.screenName === this.state.carryOverChampion)
							.bonusPrizes.some(wp => wp.prizeLevel === bp.prizeLevel))}
					decisionMade={this.state.carryOverDecisionMade}
					playerStaying={this.state.carryOverDecisionStaying}
					makeDecision={this.setCarryOverDecision}
					formatCurrency={this.formatCurrency}
					followOnGame={this.followOnGame}
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