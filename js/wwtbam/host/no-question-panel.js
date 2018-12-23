const fs = require("fs");
const PropTypes = require("prop-types");
const $ = require("jquery");
import React, { Component } from "react";

// starting panel, with field to upload question file
export default class NoQuestionPanel extends Component {
	constructor(props) {
		super(props);
		const configFiles = fs.readdirSync("public/wwtbam/configurations");
		const mainDeckFiles = fs.readdirSync("public/wwtbam/main-decks");
		const ffDeckFiles = fs.readdirSync("public/wwtbam/ff-decks");
		this.state = {
			configToggle: "upload",
			configFiles: configFiles,
			configFileSelected: `configurations/${ configFiles[0]}`,
			mainDeckToggle: "upload",
			mainDeckFiles: mainDeckFiles,
			mainDeckFileSelected: `main-decks/${ mainDeckFiles[0]}`,
			ffDeckToggle: "upload",
			ffDeckFiles: ffDeckFiles,
			ffDeckFileSelected: `ff-decks/${ ffDeckFiles[0]}`,
		};
	}
	processFiles = () => {
		if (!(this.state.anyFieldsEmpty)) {
			console.log("Launching Promises Now");
			Promise.all([new Promise(this.processConfigFile), new Promise(this.processMainDeckFile), new Promise(this.processFFDeckFile)])
				.then((values) => this.loadGameData(...values));
		}
	}
	processConfigFile = (resolve, reject) => {
		let selectedFile;
		if (this.state.configToggle === "upload") {
			selectedFile = document.getElementById("configFileInput").files[0];
			const reader = new FileReader();
			reader.onload = (event) => {
				resolve(JSON.parse(event.target.result));
			};
			reader.readAsText(selectedFile);
			console.log("readAsText called");
			// TODO show loading graphic until processing is done
		} else {
			console.log(this.state.configFileSelected);
			$.ajax({
				type: "GET",
				url: this.state.configFileSelected,
				success: resolve,
			});
		}
	}
	processMainDeckFile = (resolve, reject) => {
		let selectedFile;
		if (this.state.mainDeckToggle === "upload") {
			selectedFile = document.getElementById("mainDeckFileInput").files[0];
			const reader = new FileReader();
			reader.onload = (event) => {
				resolve(JSON.parse(event.target.result));
			};
			reader.readAsText(selectedFile);
			console.log("readAsText called");
			// TODO show loading graphic until processing is done
		} else {
			console.log(this.state.mainDeckFileSelected);
			$.ajax({
				type: "GET",
				url: this.state.mainDeckFileSelected,
				success: resolve,
			});
		}
	}
	processFFDeckFile = (resolve, reject) => {
		let selectedFile;
		if (this.state.ffDeckToggle === "upload") {
			selectedFile = document.getElementById("ffDeckFileInput").files[0];
			const reader = new FileReader();
			reader.onload = (event) => {
				resolve(JSON.parse(event.target.result));
			};
			reader.readAsText(selectedFile);
			console.log("readAsText called");
			// TODO show loading graphic until processing is done
		} else {
			console.log(this.state.ffDeckFileSelected);
			$.ajax({
				type: "GET",
				url: this.state.ffDeckFileSelected,
				success: resolve,
			});
		}
	}
	loadGameData = (configObject, mainDeckObject, ffDeckObject) => {
		console.log(configObject);
		console.log(mainDeckObject);
		console.log(ffDeckObject);

		const mainQuestions = mainDeckObject.questions.map((q) => {
			return {
				valueLevel: q["Value"],
				valueQNo: q["Q No"],
				body: q["Question"],
				options: [
					{key: "A", text: q["A"]},
					{key: "B", text: q["B"]},
					{key: "C", text: q["C"]},
					{key: "D", text: q["D"]}
				],
				correctResponse: q["Correct"]
			};
		});

		const ffQuestions = ffDeckObject.questions.map((question, index) => {
			const newQuestion = question;
			newQuestion.questionNo = index + 1;
			newQuestion.answers = [];
			return newQuestion;
		});


		this.props.setGameData(configObject, mainQuestions, ffQuestions);
	}
	toggleConfig = (event) => {
		this.setState({
			configToggle: event.target.value,
		});
	}
	changeConfigFile = (event) => {
		console.log("changeConfigFile called");
		console.log(event);
		this.setState({
			configFileSelected: event.target.value,
		});
	}
	toggleMainDeck = (event) => {
		this.setState({
			mainDeckToggle: event.target.value,
		});
	}
	changeMainDeckFile = (event) => {
		console.log("changeMainDeckFile called");
		console.log(event);
		this.setState({
			mainDeckFileSelected: event.target.value,
		});
	}
	toggleFFDeck = (event) => {
		this.setState({
			ffDeckToggle: event.target.value,
		});
	}
	changeFFDeckFile = (event) => {
		console.log("changeFFDeckFile called");
		console.log(event);
		this.setState({
			ffDeckFileSelected: event.target.value,
		});
	}
	render = () => {

		// Configuration selection

		const configRadioGroup = (
			<div className='game-type-radio-group'>
				<label>
					<input type='radio' value='upload'
						checked={this.state.configToggle === "upload"}
						onChange={this.toggleConfig}/>
					<p>Upload your own</p>
				</label>
				<label>
					<input type='radio' value='testfile'
						checked={this.state.configToggle === "testfile"}
						onChange={this.toggleConfig}/>
					<p>Choose a pre-made config</p>
				</label>
			</div>
		);

		let configFileSelect;

		if (this.state.configToggle === "upload") {
			configFileSelect = (
				<input
					type='file'
					required multiple={false}
					id='configFileInput'/>
			);
		} else {
			const configOptions = this.state.configFiles.map((file) => {
				return (
					<option
						value={`testgames/${ file }`}
						key={file}>
						{file}
					</option>
				);
			});
			configFileSelect = (
				<select onChange={this.changeConfigFile}>
					{configOptions}
				</select>
			);
		}

		// Main Game Question Deck selection

		const mainDeckRadioGroup = (
			<div className='game-type-radio-group'>
				<label>
					<input type='radio' value='upload'
						checked={this.state.mainDeckToggle === "upload"}
						onChange={this.toggleMainDeck}/>
					<p>Upload your own</p>
				</label>
				<label>
					<input type='radio' value='testfile'
						checked={this.state.mainDeckToggle === "testfile"}
						onChange={this.toggleMainDeck}/>
					<p>Choose a provided deck</p>
				</label>
			</div>
		);

		let mainDeckFileSelect;

		if (this.state.mainDeckToggle === "upload") {
			mainDeckFileSelect = (
				<input
					type='file'
					required multiple={false}
					id='mainDeckFileInput'/>
			);
		} else {
			const mainDeckOptions = this.state.mainDeckFiles.map((file) => {
				return (
					<option
						value={`testgames/${ file }`}
						key={file}>
						{file}
					</option>
				);
			});
			mainDeckFileSelect = (
				<select onChange={this.changeMainDeckFile}>
					{mainDeckOptions}
				</select>
			);
		}


		const ffDeckRadioGroup = (
			<div className='game-type-radio-group'>
				<label>
					<input type='radio' value='upload'
						checked={this.state.ffDeckToggle === "upload"}
						onChange={this.toggleFFDeck}/>
					<p>Upload your own</p>
				</label>
				<label>
					<input type='radio' value='testfile'
						checked={this.state.ffDeckToggle === "testfile"}
						onChange={this.toggleFFDeck}/>
					<p>Choose a provided deck</p>
				</label>
			</div>
		);

		let ffDeckFileSelect;

		if (this.state.ffDeckToggle === "upload") {
			ffDeckFileSelect = (
				<input
					type='file'
					required multiple={false}
					id='ffDeckFileInput'/>
			);
		} else {
			const ffDeckOptions = this.state.ffDeckFiles.map((file) => {
				return (
					<option
						value={`testgames/${ file }`}
						key={file}>
						{file}
					</option>
				);
			});
			ffDeckFileSelect = (
				<select onChange={this.changeFFDeckFile}>
					{ffDeckOptions}
				</select>
			);
		}


		return (
			<div className='no-question-panel'>
				<div className="no-question-section">
					<h1>Select a Game Configuration</h1>
					{configRadioGroup}
					<div className='upload-file-dialog'>{configFileSelect}</div>
				</div>

				<div className="no-question-section">
					<h1>Main Game Question Deck</h1>
					{mainDeckRadioGroup}
					<div className='upload-file-dialog'>{mainDeckFileSelect}</div>
				</div>

				<div className="no-question-section">
					<h1>Fastest Finger First Question Deck</h1>
					{ffDeckRadioGroup}
					<div className='upload-file-dialog'>{ffDeckFileSelect}</div>
				</div>
				
				
				<div
					className='add-question-button'
					href='#'
					onClick={this.processFiles}><p>Go</p></div>
			</div>
		);
	}
}

NoQuestionPanel.propTypes = {
	setGameData: PropTypes.func,
	gameState: PropTypes.object,
};