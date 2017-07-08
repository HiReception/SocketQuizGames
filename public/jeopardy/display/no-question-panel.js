var React = require("react");

// starting panel, with field to upload question file
export default class NoQuestionPanel extends React.Component {
	render = () => {
		return (
			<div className="no-question-panel">
				<div>
					<p className="handwriting">Doyle's</p>
					<img src="images/white logo.png"/>
				</div>
			</div>
		);
	}
}