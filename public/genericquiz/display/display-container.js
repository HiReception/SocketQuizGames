var React = require("react");
var PropTypes = require("prop-types");
const io = require("socket.io-client");
import PlayerListing from "./player-listing";

export default class DisplayContainer extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			buzzersOpen: false,
			players: [],

			playerAnswering: {},
		};
	}

	onNewState = (state) => {
		this.setState(state);
	}

	componentDidMount = () => {
		this.props.socket.on("new game state", this.onNewState);
	}

	componentWillUnmount = () => {
		this.props.socket.removeListener("new game state", this.onNewState);
	}

	render = () => {
		var questionPanel;
		var playerPanel;

		if (this.state.players.length != 0) {
			var list = [];
			for (var i = 0; i < this.state.players.length; i++) {
				var p = this.state.players[i];

				// light this display up if they are answering the question
				var answering = this.state.playerAnswering.screenName === p.screenName;

				list.push((<PlayerListing
					player={p}
					key={i}
					answering={answering}
				/>));
			}
			playerPanel = <div className="playerContainer">{list}</div>;
		} else {
			playerPanel = <div className="playerContainer"/>;
		}

		return (
			<div id="display-panel" className="content">
				<div id="question-panel" className="content">
					{questionPanel}
				</div>		
				<div id="player-list" className="content">
					{playerPanel}
				</div>
			</div>
		);
	}
}

DisplayContainer.propTypes = {
	socket: PropTypes.instanceOf(io.Socket),
};