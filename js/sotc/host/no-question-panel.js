const React = require("react");
const $ = require("jquery");
const PropTypes = require("prop-types");
const fs = require("fs");

// starting panel, with field to upload question file
export default class NoQuestionPanel extends React.Component {
	constructor(props) {
		super(props);
		const testFiles = fs.readdirSync("public/sotc/testgames");
		this.state = {
			anyFieldsEmpty: !(this.props.players.length > 0),
			gameUsed: "upload",
			testFiles: testFiles,
			testFileSelected: `testgames/${ testFiles[0]}`,
		};
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

		// TODO error handling
		
		this.props.setGameData(fileObject);
	}
	changeGameUsed = (event) => {
		this.setState({
			gameUsed: event.target.value,
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

		return (
			<div className='no-question-panel'>
				{gameTypeRadioGroup}
				<div className='upload-file-dialog'>{fileInputSection}</div>
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
};
