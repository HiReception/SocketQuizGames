var React = require("react");
var PropTypes = require("prop-types");
const fs = require("fs");
const $ = require("jquery");

// starting panel, with field to upload puzzle file
export default class NoPuzzlePanel extends React.Component {
	constructor(props) {
		super(props);
		const testFiles = fs.readdirSync("public/wof-board/testgames");
		this.state = {
			playerNameList: [],
			gameUsed: "upload",
			testFiles: testFiles,
			testFileSelected: `testgames/${ testFiles[0]}`,
		};
	}

	processFile = () => {
		// TODO show loading graphic until processing is done
		if (this.state.gameUsed === "upload") {
			const selectedFile = document.getElementById("questionFile").files[0];
			const reader = new FileReader();
			reader.readAsText(selectedFile);
			reader.onload = () => {
				const fileText = reader.result;
				const fileObject = JSON.parse(fileText);
				this.props.setGameData(fileObject.puzzles, fileObject.bonus, fileObject.wheels);
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

	loadGameData = (fileObject) => {
		// TODO error handling
		this.props.setGameData(fileObject.puzzles, fileObject.bonus, fileObject.wheels);
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
				<input type="file" required={true} multiple={false} id="questionFile"/>
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
			<div className="no-question-panel">
				{gameTypeRadioGroup}
				<div className="upload-file-dialog">{fileInputSection}</div>
				<div className="add-question-button" href="#" onClick={this.processFile}><p>Go</p></div>
			</div>
		);
	}
}

NoPuzzlePanel.propTypes = {
	setGameData: PropTypes.func,
};