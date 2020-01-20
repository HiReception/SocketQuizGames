const initialState = {
	players: [],
	detailPlayerID: "",
	
	prefix: "",
	suffix: "",

	ffQuestions: [],
	ffCurrentQuestion: 0,
	currentPanel: "NoQuestionPanel",
	newPanelKey: 0,

	ffQuestionRecapped: false,
	ffNumAnswersRevealed: 0,
	ffFullAnswerRevealed: false,

	playerPanelHidden: false,

	ffCorrectPlayersRevealed: false,
	ffFastestCorrectRevealed: false,
	ffFastestFlashOn: false,

	ffFastestCorrectPlayer: "",
	ffFastestCorrectTime: 0,

	ffBuzzersPending: false,
	ffBuzzersOpen: false,
	playerStats: [],

	mainGameMoneyTree: [],
	mainGameMoneyTreeVisible: false,
	mainGameQuestions: [],

	mainGamePlayer: {},
	mainGameQuestionNo: 1,
	mainGameActiveLifeline: "",
	mainGameOptionsShown: 0,
	mainGameWinnings: 0,
	mainGameWinningsString: "",
	mainGameStartingLifelines: [],
	mainGameLifelinesAvailable: [],
	mainGameCorrectRevealed: false,
	mainGameChosenAnswer: "",
	mainGameQuestionStack: [],

	pafTimerStarted: false,
	pafSecondsRemaining: 30,
	pafTimer: null,

	ataVotesOpen: false,
	ataVotes: [],
	ataVotesFinished: false,

};

export default initialState;