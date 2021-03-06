const initialState = {
	players: [],
	detailPlayerID: "",

	currentRound: 0,
	cluesLeft: 0,
	selectingPlayer: "",
	playerAnswering: {},

	currentPanel: "NoQuestionPanel",
	newPanelKey: 0,

	finalEligiblePlayers: [],

	rounds: [],
	final: {},

	currentCatNo: 0,
	currentClueNo: 0,
	currentClueValue: 0,

	prefix: "",
	suffix: "",

	wrongPlayerIDs: [],
	ddWagerEntered: false,
	ddWagerSubmittable: false,
	ddWager: 0,
	buzzersOpen: false,

	buzzingTimer: null,
	buzzingTimerStarted: false,
	buzzingTimerRunning: false,
	buzzingTimeRemaining: 0,
	buzzingTimeOver: false,

	finalCategoryVisible: false,
	finalClueVisible: false,
	finalWagers: [],
	finalWageringOpen: false,
	allFinalWagersIn: false,
	finalRespondingOpen: false,
	finalRespondingOver: false,
	finalRespondingTimeRemaining: 30,
	finalResponses: [],
	finalFocusPlayerNumber: 0,
	finalFocusPlayerID: "",
	finalFocusResponse: "",
	finalFocusMode: "not-ready",
	finalFocusCorrect: false,
};

export default initialState;