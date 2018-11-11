const initialState =  {
	players: [],
	detailPlayerName: "",

	carryOverChampion: "",
	carryOverPrizes: [],
	carryOverScore: 0,
	carryOverDecisionMade: false,
	carryOverDecisionStaying: false,

	winnersBoardState: [],
	winnersBoardCompleted: false,
	winnersBoardPrizeWon: {},
	winnersBoardMajorRevealed: false,
	winnersBoardInactiveNumbers: [],
	winnersBoardWinFound: false,
	bonusPrizes: [],

	currentRound: 0,
	playerAnswering: "",

	items: [],
	currentItemNo: 0,
	currentItemType: "NoQuestionPanel",
	currentItemOver: false,
	newPanelKey: 0,

	tiebreakQuestion: {},
	tiebreakEligiblePlayers: [],

	prefix: "",
	suffix: "",
	startingScore: 0,
	standardCorrectAmount: 0,
	standardIncorrectAmount: 0,

	// gift shop and cash card related fields
	sellingPrice: 0,
	bonusMoney: 0,
	playerPurchasing: "",
	cashCardSuits: [],
	availableToBuy: true,
	selectedSuit: -1,
	selSuitRevealed: false,
	majorPrizeRevealed: false,
	eligibleToBuy: [],
	
	// fame game related
	lockedOutPlayerNames: [],
	fameGamesStarted: 0,
	fameGameBoard: [],
	fameGamePrizes: [],
	fameGameBoardShowing: false,
	fameGameCurrentSelection: -1,
	fameGameWildCardDecision: -1,
	fameGameMoneyRevealed: false,

	lockoutTimer: null,
	timerStarted: false,
	timeRemaining: 0,
	normalAnsweringTimer: 0,
	fastMoneyAnsweringTimer: 0,
	

	// fast money related fields
	fmTimer: null,
	fmStarted: false,
	fmTimeRemaining: 0,
	fmClockRunning: false,
	fmCurrentQuestionNo: 0,
	fmCurrentQuestion: {},

	

	buzzersOpen: false,
};

export default initialState;