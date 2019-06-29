var React = require("react");
var io = require("socket.io-client");
var PropTypes = require("prop-types");
import BuzzInQuestion from "../../common/buzz-in-question";

export default class PlayerPanel extends React.Component {
	constructor(props) {
		super(props);
		this.state = props.receivedState;
	}

	handleNewState = (state) => {
		console.log("state received:");
		console.log(state);
		this.setState(state);
	}

	componentDidMount = () => {
		this.props.socket.on("new game state", this.handleNewState);
	}

	componentWillUnmount = () => {
		this.props.socket.removeListener("new game state", this.handleNewState);
	}

	render = () => {
		const thisPlayer = this.state.players.find(p => { return p.id === this.props.id; });
		let background = "#05ABE3";
		if (thisPlayer) {
			background = thisPlayer.colour;
		}
		return (
			<div className="playerBody" style={{backgroundColor: background}}>
				<BuzzInQuestion socket={this.props.socket}/>
			</div>
		);
	}
}

PlayerPanel.propTypes = {
	id: PropTypes.string,
	receivedState: PropTypes.object,
	socket: PropTypes.instanceOf(io.Socket),
};