var React = require("react");
var ReactDOM = require("react-dom");
var PropTypes = require("prop-types");

class AnswerPanel extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			revealed: false,
		};
	}
	flip = () => {
		this.setState({
			revealed: true
		})
	}
	render = () => {
		const flipped = this.state.revealed ? " flip" : "";
		return (
			<div className={"flip-container" + flipped} onClick={this.flip}>
				<div className={"flipper" + flipped}>
					<div className={"front" + flipped}>
						<div className="index">
							<p>{this.props.index}</p>
						</div>
					</div>
					<div className="back">
						<div className="answer">
							<p>{this.props.answer}</p>
						</div>
						<div className="value">
							<p>{this.props.value}</p>
						</div>
					</div>
				</div>
			</div>
		);
	}
}

AnswerPanel.propTypes = {
	index: PropTypes.string,
	answer: PropTypes.string,
	value: PropTypes.number,
};

ReactDOM.render((
	<div className="board">
		<div className="column">
			<AnswerPanel index="1" answer="Christopher Columbus" value={13}/>
			<AnswerPanel index="2" answer="Sir Edmund Hillary" value={12}/>
			<AnswerPanel index="3" answer="Captain Cook" value={9}/>
			<AnswerPanel index="4" answer="Marco Polo" value={8}/>
		</div>
		<div className="column">
			<AnswerPanel index="5" answer="James Cook" value={7}/>
			<AnswerPanel index="6" answer="Captain Scott" value={5}/>
			<AnswerPanel index="7" answer="Bear Grylls" value={3}/>
			<AnswerPanel index="8" answer="David Livingstone" value={3}/>
		</div>
	</div>
	), document.getElementById("display-panel"));