const React = require("react");
const $ = require("jquery");
const PropTypes = require("prop-types");
const fs = require("fs");
const io = require("socket.io-client");

// starting panel, with field to upload question file
export default class NoQuestionPanel extends React.Component {
	constructor(props) {
		super(props);
		const playerNameList = this.props.players.map((player) => {
			return {screenName: player.screenName, id: player.id};
		});
		const testFiles = fs.readdirSync("public/jeopardy/testgames");
		this.state = {
			playerNameList: playerNameList,
			selectedFirstPlayer: this.props.players.length > 0 ?
				this.props.players[0].id : "",
			anyFieldsEmpty: !(this.props.players.length > 0),
			gameUsed: "upload",
			testFiles: testFiles,
			testFileSelected: `testgames/${ testFiles[0]}`,
		};
	}
	componentWillReceiveProps = (newProps) => {
		const playerNameList = newProps.players.map((player) => {
			return {screenName: player.screenName, id: player.id};
		});
		this.setState({
			playerNameList: playerNameList,
			selectedFirstPlayer: newProps.players.length > 0 ?
				newProps.players[0].id : "",
			anyFieldsEmpty: !(newProps.players.length > 0),
		});
	}
	processFile = () => {
		if (!(this.state.anyFieldsEmpty)) {
			let selectedFile;
			if (this.state.gameUsed === "upload") {
				selectedFile = document.getElementById("questionFile").files[0];
				const reader = new FileReader();
				reader.onload = (event) => {
					this.loadGameData(JSON.parse(event.target.result));
				};
				reader.readAsText(selectedFile);
				// TODO show loading graphic until processing is done
			} else {
				$.ajax({
					type: "GET",
					url: this.state.testFileSelected,
					success: this.loadGameData,
				});
			}
		}
	}
	loadGameData = (fileObject) => {
		const rounds = fileObject.rounds;
		const final = fileObject.final;
		const prefix = fileObject.properties.prefix;
		const suffix = fileObject.properties.suffix;
		// TODO error handling
		for (let round = 0; round < rounds.length; round++) {
			for (let cat = 0; cat < rounds[round].categories.length; cat++) {
				const clues = rounds[round].categories[cat].clues;
				for (let clue = 0; clue < clues.length; clue++) {
					clues[clue].active = true;
				}
			}
		}

		this.props.socket.emit("send question", {
			type: "buzz-in",
			open: true,
		});
		this.props.setGameData(rounds, final,
			this.state.selectedFirstPlayer, prefix, suffix);
	}
	changeGameUsed = (event) => {
		this.setState({
			gameUsed: event.target.value,
		});
	}
	changeFirstPlayer = (event) => {
		this.setState({
			selectedFirstPlayer: event.target.value,
			anyFieldsEmpty: false,
		});
	}
	changeTestFile = (event) => {
		this.setState({
			testFileSelected: event.target.value,
		});
	}
	render = () => {
		const gameTypeRadioGroup = (
			<div className='game-type-radio-group'>
				<label>
					<input type='radio' value='upload'
						checked={this.state.gameUsed === "upload"}
						onChange={this.changeGameUsed}/>
					<p>Upload your own file</p>
				</label>
				<label>
					<input type='radio' value='testfile'
						checked={this.state.gameUsed === "testfile"}
						onChange={this.changeGameUsed}/>
					<p>Use an Internal Test Game</p>
				</label>
			</div>
		);

		let fileInputSection;

		if (this.state.gameUsed === "upload") {
			fileInputSection = (
				<input type='file' required multiple={false} id='questionFile'/>
			);
		} else {
			const testGameOptions = this.state.testFiles.map((file) => {
				return (
					<option
						value={`testgames/${ file }`}
						key={file}>
						{file}
					</option>
				);
			});
			fileInputSection = (
				<select onChange={this.changeTestFile}>
					{testGameOptions}
				</select>
			);
		}

		const startingPlayerOptions = [];
		for (let i = 0; i < this.state.playerNameList.length; i++) {
			startingPlayerOptions.push((
				<option
					value={this.state.playerNameList[i].id}
					key={i}>
					{this.state.playerNameList[i].screenName}
				</option>
			));
		}
		return (
			<div className='no-question-panel'>
				{gameTypeRadioGroup}
				<div className='upload-file-dialog'>{fileInputSection}</div>
				<div className='upload-file-dialog'>
					<p>Who will make the first selection of the game?</p>
					<select onChange={this.changeFirstPlayer}>
						{startingPlayerOptions}
					</select>
				</div>
				<div
					className='add-question-button'
					href='#'
					onClick={this.processFile}>
					<p>Go</p>
				</div>
			</div>
		);
	}
}

NoQuestionPanel.propTypes = {
	players: PropTypes.array,
	setGameData: PropTypes.func,
	socket: PropTypes.instanceOf(io.Socket),
};
