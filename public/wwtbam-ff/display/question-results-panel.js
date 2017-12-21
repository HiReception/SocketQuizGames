import React, { Component } from "react";
import PropTypes from "prop-types";
import Lozenge from "../common/lozenge";
import QuestionDisplay from "./question-display";
import {Layer, Stage, Text, Rect, Group} from "react-konva";


export default class QuestionResultsPanel extends Component {
	constructor(props) {
		super(props);
		this.state = {
			height: 0,
			width: 0,
			backgroundImage: null,
			panelBackgroundImage: null,
		}
	}

	updateDimensions = () => {
		this.setState({width: window.innerWidth, height: window.innerHeight});
	}

	componentWillMount = () => {
		this.updateDimensions();
		const panelImage = new window.Image();
		panelImage.src = "images/background.png";
		panelImage.onload = () => {
			this.setState({
				panelBackgroundImage: panelImage,
				panelBackgroundNatHeight: panelImage.naturalHeight,
				panelBackgroundNatWidth: panelImage.naturalWidth,
			});
		};

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

	textScale = (text, font, size, width) => {
		var textWidth;
		var c=document.createElement("canvas");
		var cctx=c.getContext("2d");
		cctx.font = size + "px " + font;
		if (!text.includes("\n")) {
			textWidth = cctx.measureText(text).width;
		} else {
			var lineLengths = text.split("\n").map((l) => { return cctx.measureText(l).width;});
			textWidth = Math.max(...lineLengths);
		}
		if (textWidth <= width) {
			return 1;
		} else {
			return width / textWidth;
		}
	}

	render = () => {
		var width = window.innerWidth;
		var height = window.innerHeight;



		

		const { question, fullAnswerRevealed, numAnswersRevealed } = this.props;
		const canvas = document.createElement("canvas");
		const ctx = canvas.getContext("2d");
		var gradient = ctx.createLinearGradient(0,0,width,0);
		gradient.addColorStop(0,"#4286f4");
		gradient.addColorStop(0.5,"skyblue");
		gradient.addColorStop(1,"#4286f4");

		
		var fontFamily = "ConduitITC TT";
		
		

		
		
		const answers = question.options.map((a) => {
			return {
				key: a.key,
				answer: a.text,
				correctLit: question.correctResponse.includes(a.key) && fullAnswerRevealed,
			};
		})


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

		if (question.type === "sequence") {
			// todo calculate this based on length of text
			
			var qNumLines = 6;
			var panelWidth = 0.4 * width;
			var aWidth = 0.35 * width;
			var sideWidth = 0.1 * width;
			var aTotalWidth = aWidth + sideWidth;
			var aGapHeight = 0.02 * height;
			var aHeight = 0.08 * height;
			var lineWidth = 0.1 * aHeight;
			var aTextGapWidth = 0.1 * aWidth;
			var qWidth = 0.8 * panelWidth;
			var aLetterWidth = 0.09 * aWidth;
			var qMarginWidth = 0.1 * panelWidth;
			var qHeight = 0.5 * height;
			var aTextWidth = 0.74 * aWidth;
			var qMarginHeight = 0.05 * height;
			var aLeft = width - aTotalWidth;
			var firstAnswerY = qMarginHeight + qHeight + aGapHeight;
			var aTextHeight = 0.8 * aHeight;
			var aTextGapHeight = 0.1 * aHeight;

			var qTextHeight = qHeight/qNumLines;

			const answersInOrder = question.correctResponse.split("").map((k) => {
				return answers.find((a) => a.key === k);
			})

			const panelBackgroundScale = this.state.panelBackgroundNatHeight ? height / this.state.backgroundNatHeight : 1;
			const panelBackgroundOffset = this.state.panelBackgroundNatWidth + (panelWidth / panelBackgroundScale);
			

			return (
				<Stage width={width} height={height}>
					<Layer>
						<Rect x={0} y={0} height={height} width={width} fillPatternImage={this.state.backgroundImage}
						fillPatternScaleX={backgroundScale} fillPatternScaleY={backgroundScale}
						fillPatternOffsetX={backgroundOffsetX} fillPatternOffsetY={backgroundOffsetY}/>
					</Layer>
					<Layer>
						<Rect x={width - panelWidth} y={0} height={height} width={panelWidth} fillPatternImage={this.state.panelBackgroundImage}
							fillPatternScaleX={panelBackgroundScale} fillPatternScaleY={panelBackgroundScale} fillPatternOffsetX={-panelBackgroundOffset}/>
					</Layer>
					<Layer>
						
						<Text x={width - panelWidth + qMarginWidth} y={qMarginHeight}
							height={qHeight} width={qWidth}
							fontSize={qTextHeight} fontFamily={fontFamily}
							fill='white' align='left'
							text={question.body}/>

						{answersInOrder.map((ans, index) => {
							return (
								<Group key={index} visible={numAnswersRevealed > index}>
									<Lozenge xStart={aLeft} yStart={firstAnswerY + (aHeight + aGapHeight) * index}
										height={aHeight} width={aWidth} leftSideWidth={0} rightSideWidth={sideWidth}
										fillStyle="black" strokeStyle={gradient} lineWidth={lineWidth}/>

									<Rect
										x={aLeft+(aHeight*(2/5))} y={firstAnswerY + (aHeight + aGapHeight) * index + aHeight/2}
										width={aHeight/5} height={aHeight/5}
										fill="orange" rotation="-45"/>
									<Text
										x={aLeft + aTextGapWidth} y={firstAnswerY + (aHeight + aGapHeight) * index + aTextGapHeight}
										width={aLetterWidth} height={aTextHeight}
										fontSize={aTextHeight} fontFamily={fontFamily}
										fill="orange" align='left' text={ans.key + ":"}/>
									<Text
										x={aLeft + aTextGapWidth + aLetterWidth} y={firstAnswerY + (aHeight + aGapHeight) * index + aTextGapHeight}
										height={aTextHeight}
										fontSize={aTextHeight} fontFamily={fontFamily}
										fill="white" align='left'
										scaleX={this.textScale(ans.answer, fontFamily, aTextHeight, aTextWidth)}
										text={ans.answer}/>
								</Group>
							);
						})}
					</Layer>
				</Stage>
			);

		} else {

			return (
				<Stage width={width} height={height}>
					<Layer>
						<Rect x={0} y={0} height={height} width={width} fillPatternImage={this.state.backgroundImage}
						fillPatternScaleX={backgroundScale} fillPatternScaleY={backgroundScale}
						fillPatternOffsetX={backgroundOffsetX} fillPatternOffsetY={backgroundOffsetY}/>
					</Layer>
					<QuestionDisplay
						question={question} fullAnswerRevealed={fullAnswerRevealed}
						questionVisible={true} answersVisible={true}/>
				</Stage>
			);
		}
		
	}
}

QuestionResultsPanel.propTypes = {
	question: PropTypes.object,
	fullAnswerRevealed: PropTypes.bool,
	numAnswersRevealed: PropTypes.number,
};