var React = require("react");
var ReactDOM = require("react-dom");

var ContestantPodium1993 = React.createClass({
	getInitialState: function() {
		return {
			lit: false,
		};
	},
	toggleLit: function() {
		this.setState({
			lit: !this.state.lit,
		});
	},
	render: function() {var lightArray = [];
		for (var i = 0; i < 16; i++) {
			var delay = this.state.lit ? i * 40 + "ms" : "0ms";
			lightArray.push((
				<div
					key={i}
					className={"light-bar" +
						(this.state.lit ? " lit" : "")}
					style={{transitionDelay: delay}}/>
			))
		}
		
		return (
			<div className="contestant-podium" onClick={this.toggleLit}>
				<div className="name-section">
					<div className="buzzer"/>
					<div className={"name-box" + (this.state.lit ? " lit" : "")}>
						<div className={"name-badge" + (this.state.lit ? " lit" : "")}>
							<p className={"name-badge" + (this.state.lit ? " lit" : "")}>
								{this.props.name}
							</p>
						</div>
					</div>
				</div>
				<div className="score-section">
					<div className="score-block">
						<div className="score-readout">
							<p className="score-readout">
								{this.props.score}
							</p>
						</div>
					</div>
				</div>
				<div className="base">
					<div className="lights">
						{lightArray}
					</div>
				</div>
			</div>
		);
	}
});

var ContestantPodium1988 = React.createClass({
	getInitialState: function() {
		return {
			lit: false,
		};
	},
	toggleLit: function() {
		this.setState({
			lit: !this.state.lit,
		});
	},
	render: function() {
		var lightArray = [];
		var colourArray = ["#807276", "#FFFD93", "#D07877"];
		for (var i = 0; i < 8; i++) {
			var delay = this.state.lit ? i * 80 + "ms" : "0ms";
			lightArray.push((
				<div
					key={i}
					className={"light-bar-1988" +
						(this.state.lit ? " lit" : "")}
					style={{
						backgroundColor: !this.state.lit ? "#4F4E54" : colourArray[i % 3],
						transitionDelay: delay,
						zIndex: 8 - i,
						height: Math.min(110, (2*(i+1) -1) * 10) + "px",
						width: ((i === 7) ? 170 : (2*(i+1)-1) * 10) + "px",
						top: Math.max(0, 50 - i * 10) + "px",
						left: (i === 7) ? 0 : (20 + (6 - i) * 10) + "px",
					}}/>
			))
		}
		return (
			<div className="contestant-podium" onClick={this.toggleLit}>
				<div className="name-section">
					<div className="buzzer"/>
					<div className={"name-box" + (this.state.lit ? " lit" : "")}>
						<div className={"name-badge" + (this.state.lit ? " lit" : "")}>
							<p className={"name-badge-1988" + (this.state.lit ? " lit" : "")}>
								{this.props.name}
							</p>
						</div>
					</div>
				</div>
				<div className="score-section-1988">
					<div className="score-block-1988">
						<div className="score-readout-1988">
							<p className="score-readout-1988">
								{this.props.score}
							</p>
						</div>
					</div>
				</div>
				<div className="base-1988">
					<div className="lights-1988">
						{lightArray}
					</div>
				</div>
			</div>
		);
	}
});



ReactDOM.render((
	<div className="podium-row">
		<ContestantPodium1993 name="Virginia" score="155"/>
		<ContestantPodium1993 name="David" score="200"/>
		<ContestantPodium1993 name="Cary" score="110"/>
	</div>
), document.getElementById("canvas2"));

ReactDOM.render((
	<div className="podium-row">
		<ContestantPodium1988 name="Virginia" score="155"/>
		<ContestantPodium1988 name="David" score="200"/>
		<ContestantPodium1988 name="Cary" score="110"/>
	</div>
), document.getElementById("canvas1"));