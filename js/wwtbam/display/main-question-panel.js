import React, { Component } from "react";
import PropTypes from "prop-types";
import QuestionDisplay from "./question-display";
import {Layer, Stage, Rect} from "react-konva";
import WinSash from "./win-sash";


export default class MainQuestionPanel extends Component {
	constructor(props) {
		super(props);
		this.state = {
			height: 0,
			width: 0,
			backgroundImage: null,
			correctFlashIncrement: 0,
			winSashDisplayed: false
			
		};
	}

	updateDimensions = () => {
		this.setState({width: window.innerWidth, height: window.innerHeight});
	}


	flashCorrect = () => {
		if (this.state.correctFlashIncrement + 1 >= 5
			&& this.props.question.correctResponse.includes(this.props.gameState.mainGameChosenAnswer)) {

			this.setState({
				winSashDisplayed: true,
			});
			clearInterval(this.flashCorrect);
			
		} else {
			this.setState({
				correctFlashIncrement: this.state.correctFlashIncrement + 1
			});
		}
		this.setState({
			correctFlashOn: !this.state.correctFlashOn
		});
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
		if (this.props.gameState.mainGameCorrectRevealed) {
			this.flashCorrect();
			setInterval(this.flashCorrect, 250);
		}
	}
	componentWillUnmount = () => {
		window.removeEventListener("resize", this.updateDimensions);
	}

	componentWillReceiveProps = (props) => {
		if (props.gameState.mainGameCorrectRevealed && !this.props.gameState.mainGameCorrectRevealed) {
			this.flashCorrect();
			setInterval(this.flashCorrect, 250);
		}
	}

	render = () => {
		var width = window.innerWidth;
		var height = window.innerHeight;

		const { question, gameState, formatNumber } = this.props;

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

		var lozengeDisplay;

		if (this.state.winSashDisplayed) {
			lozengeDisplay = (
				<WinSash
					winningsString={gameState.mainGameMoneyTree[gameState.mainGameQuestionNo - 1].textValue}
				/>
			);
		} else {
			lozengeDisplay = (
				<QuestionDisplay question={question} questionVisible={true}
					numAnswersVisible={gameState.mainGameOptionsShown}
					lockedInAnswer={gameState.mainGameChosenAnswer}
					fullAnswerRevealed={gameState.mainGameCorrectRevealed}
					correctFlashOn={this.state.correctFlashOn}/>
			);
		}

		return (
			<Stage width={width} height={height}>
				{/* <Layer>
					<Rect x={0} y={0} height={height} width={width} fillPatternImage={this.state.backgroundImage}
						fillPatternScaleX={backgroundScale} fillPatternScaleY={backgroundScale}
						fillPatternOffsetX={backgroundOffsetX} fillPatternOffsetY={backgroundOffsetY}/>
				</Layer> */}
				{lozengeDisplay}
			</Stage>
		);
	}
}

MainQuestionPanel.propTypes = {
	question: PropTypes.object,
	gameState: PropTypes.object,
	formatNumber: PropTypes.func,
};