var React = require("react");
var ReactDOM = require("react-dom");
var PropTypes = require("prop-types");

const faces = ["5000dollars", "bmw", "15dollars", "prize"];
const startingFace = "titlecard";

class CashCardFace extends React.Component {
	render = () => {
		return (
			<div className="cashcard-face">
				<img src={"cashcard/" + this.props.face + ".png"}/>
			</div>
		);
	}
}

CashCardFace.propTypes = {
	face: PropTypes.string,
};

class CashCardReel extends React.Component {
	constructor(props) {
		super(props);

		var reelFaces = [];
		reelFaces.push(startingFace);
		for (var i = 1; i <= props.length; i++) {
			if (props.stopAfter === i) {
				reelFaces.push(props.landOn);

			} else if (i === props.stopAfter - 1 && faces[(i + faces.length - 1) % faces.length] === props.landOn) {
				reelFaces.push(faces[(i + faces.length - 1) % faces.length + 1]);
			} else if (i === props.stopAfter + 1 && faces[(i + faces.length - 1) % faces.length] === props.landOn) {
				reelFaces.push(faces[(i + faces.length - 1) % faces.length - 1]);
			} else {
				reelFaces.push(faces[(i + faces.length - 1) % faces.length]);
			}
		}

		this.state = {
			reelFaces: reelFaces,
			spun: false,
		};
	}

	spin = () => {
		this.setState({
			spun: true,
		});
	}

	render = () => {
		var faceDivs = this.state.reelFaces.map((face, index) => {
			return <CashCardFace key={index} face={face}/>;
		}).reverse();
		return (
			<div className={this.state.spun ? "cashcard-reel spun" : "cashcard-reel"} onClick={this.spin}>
				{faceDivs}
			</div>
		);
	}
}

CashCardReel.propTypes = {
	length: PropTypes.number,
	stopAfter: PropTypes.number,
	landOn: PropTypes.string,
};
// TODO decorate machines
class CashCardMachine extends React.Component {
	render = () => {
		return (
			<div className="cashcard-machine">
				<div className="cashcard-viewport">
					<CashCardReel
						length={this.props.reelLength}
						stopAfter={this.props.stopAfter}
						landOn={this.props.landOn}/>
				</div>
			</div>
		);
	}
}

CashCardMachine.propTypes = {
	suit: PropTypes.string,
	reelLength: PropTypes.number,
	stopAfter: PropTypes.number,
	landOn: PropTypes.string,

};

var landOn = faces[Math.floor(Math.random()*faces.length)];

ReactDOM.render((
	<div className="cashcard-collection">
		<CashCardMachine
			key="hearts"
			suit="hearts"
			reelLength={12}
			stopAfter={11}
			landOn="5000dollars"/>
		<CashCardMachine
			suit="clubs"
			reelLength={12}
			stopAfter={11}
			landOn="bmw"/>
		<CashCardMachine
			suit="diamonds"
			reelLength={12}
			stopAfter={11}
			landOn="prize"/>
		<CashCardMachine
			suit="spades"
			reelLength={12}
			stopAfter={11}
			landOn="15dollars"/>
	</div>
	), document.getElementById("display-panel"));