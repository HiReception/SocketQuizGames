var React = require("react");
var PropTypes = require("prop-types");
import {Text, Group, Image} from "react-konva";

// starting panel, with field to upload question file
export default class FinalJeopardyLogo extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			logoImage: null,
		};
	}
	componentDidMount = () => {
		const logoImage = new window.Image();
		logoImage.onload = () => {
			this.setState({
				logoImage: logoImage,
			});
		};
		logoImage.src = "images/white logo.png";
	}
	render = () => {
		
		const logoRatio = 395 / 116; // ratio of width of jeopardy logo image to height

		const logoX = this.props.width * 0.1;
		const logoWidth = this.props.width - (2 * logoX);
		const logoHeight = logoWidth / logoRatio;

		const textHeight = logoHeight * 0.5;
		const textFont = "Brush Script Standard Medium";

		const combinedHeight = logoHeight + (textHeight * 0.5);

		const textTop = (this.props.height - combinedHeight) / 2;
		const logoTop = textTop + (textHeight * 0.5);

		return (
			<Group x={0} y={0} height={this.props.height} width={this.props.width}>
				<Image x={logoX}
					y={logoTop}
					height={logoHeight} width={logoWidth}
					image={this.state.logoImage}/>
				<Text x={0}
					y={textTop}
					height={textHeight} width={this.props.width} wrap="none"
					fontSize={textHeight} fontFamily={textFont}
					fill="red" align="center"
					text="Final"/>
			</Group>
		);
		
		

	}
}

FinalJeopardyLogo.propTypes = {
	height: PropTypes.number,
	width: PropTypes.number,
};