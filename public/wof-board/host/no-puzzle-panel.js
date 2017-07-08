var React = require("react");
var PropTypes = require("prop-types");

// starting panel, with field to upload puzzle file
export default class NoPuzzlePanel extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			playerNameList: []
		};
	}
	processFile = () => {
		var selectedFile = document.getElementById("questionFile").files[0];
		var reader = new FileReader();
		var thisPanel = this;
		reader.onload = function() {
			console.log("reader.onload called");
			var fileText = reader.result;
			var fileObject = JSON.parse(fileText);
			var puzzles = fileObject.puzzles;
			var bonus = fileObject.bonus;
			var wheels = fileObject.wheels;
			thisPanel.props.setGameData(puzzles, bonus, wheels);
			
		};
		reader.readAsText(selectedFile);
		console.log("readAsText called");
		// TODO show loading graphic until processing is done
	}
	render = () => {
		// TODO make an option to either upload own file or use one of the internal test games
		var fileInput = <input type="file" required={true} multiple={false} id="questionFile"/>;
		return (
			<div className="no-question-panel">
				
				<div className="upload-file-dialog">{fileInput}</div>
				<div className="add-question-button" href="#" onClick={this.processFile}><p>Go</p></div>
			</div>
		);
	}
}

NoPuzzlePanel.propTypes = {
	setGameData: PropTypes.func,
};