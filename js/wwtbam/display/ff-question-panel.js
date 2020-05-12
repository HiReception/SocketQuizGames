import React, { Component } from "react";
import PropTypes from "prop-types";
import QuestionDisplay from "./question-display";
import {Layer, Stage, Rect} from "react-konva";


export default class FFQuestionPanel extends Component {
	constructor(props) {
		super(props);
		this.state = {
			height: 0,
			width: 0,
			backgroundImage: null,
		};
	}

	updateDimensions = () => {
		this.setState({width: window.innerWidth, height: window.innerHeight});
	}

	componentWillMount = () => {
		this.updateDimensions();
		const bgImage = new window.Image();
		bgImage.src = "images/set-pink.png";
		bgImage.onload = () => {
			this.setState({
				backgroundImage: bgImage,
				backgroundNatHeight: bgImage.naturalHeight,
				backgroundNatWidth: bgImage.naturalWidth,
			});
		};
	}
	componentDidMount = () => {
		window.addEventListener("resize", this.updateDimensions);
	}
	componentWillUnmount = () => {
		window.removeEventListener("resize", this.updateDimensions);
	}

	render = () => {
		var width = window.innerWidth;
		var height = window.innerHeight;

		const { question, questionVisible, answersVisible } = this.props;

		const screenRatio = width / height;
		const backgroundRatio = this.state.backgroundNatWidth / this.state.backgroundNatHeight;

		var backgroundScale = 0;
		var backgroundOffsetX = 0, backgroundOffsetY = 0;
		if (this.state.backgroundNatHeight) {
			if (screenRatio > backgroundRatio) {
				backgroundScale = width / this.state.backgroundNatWidth;
				backgroundOffsetY = (this.state.backgroundNatHeight - height/backgroundScale)/2;
			} else {
				backgroundScale = height / this.state.backgroundNatHeight;
				backgroundOffsetX = (this.state.backgroundNatWidth - width/backgroundScale)/2;
			}
			backgroundScale = screenRatio > backgroundRatio ? width / this.state.backgroundNatWidth : height/this.state.backgroundNatHeight;
		}

		return (
			<Stage width={width} height={height}>
				{/* <Layer>
					<Rect x={0} y={0} height={height} width={width} fillPatternImage={this.state.backgroundImage}
						fillPatternScaleX={backgroundScale} fillPatternScaleY={backgroundScale}
						fillPatternOffsetX={backgroundOffsetX} fillPatternOffsetY={backgroundOffsetY}/>
				</Layer> */}
				<QuestionDisplay question={question} questionVisible={questionVisible}
					numAnswersVisible={answersVisible ? question.options.length : 0} fullAnswerRevealed={false}/>
			</Stage>
		);
	}
}

FFQuestionPanel.propTypes = {
	question: PropTypes.object,
	questionVisible: PropTypes.bool,
	answersVisible: PropTypes.bool,
};