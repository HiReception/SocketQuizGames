import React, { Component } from "react";
import PropTypes from "prop-types";
import Lozenge from "../common/lozenge";
import QuestionDisplay from "./question-display";
import {Layer, Stage, Text, Rect, Group} from "react-konva";
import {Motion, spring} from "react-motion";

export default class QuestionResultsPanel extends Component {
	constructor(props) {
		super(props);
		this.state = {
			height: 0,
			width: 0,
			backgroundImage: null,
			panelBackgroundImage: null,
			correctFlashOn: true,
		}


	}

	updateDimensions = () => {
		this.setState({width: window.innerWidth, height: window.innerHeight});
	}

	flashCorrect = () => {
		this.setState({correctFlashOn: !this.state.correctFlashOn});
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

	componentWillReceiveProps = (props) => {
		if (props.fullAnswerRevealed && !this.props.fullAnswerRevealed) {
			setInterval(this.flashCorrect, 250);
		}
	}

	componentDidMount = () => {
		window.addEventListener("resize", this.updateDimensions);
		if (this.props.fullAnswerRevealed) {
			setInterval(this.flashCorrect, 250);
		}
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

		const { question, fullAnswerRevealed, numAnswersRevealed, questionRecapped } = this.props;
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
				correctLit: question.correctResponse.includes(a.key) && fullAnswerRevealed && this.state.correctFlashOn,
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
			var qNumLines = 6;
			var panelWidth = 0.4 * width;
			var aWidth = 0.4 * width;
			var sideWidth = 0.05 * width;
			var aTotalWidth = aWidth + sideWidth;
			var qMarginHeight = 0.05 * height;
			var totalContentHeight = height - (2*qMarginHeight);
			var aGapHeight = 0.02 * height;
			var aHeight = 0.05 * width;
			var lineWidth = 0.1 * aHeight;
			var aTextGapWidth = 0.1 * aWidth;
			var qWidth = 0.8 * panelWidth;
			var aLetterWidth = 0.09 * aWidth;
			var qMarginWidth = 0.1 * panelWidth;
			var qHeight = totalContentHeight - question.options.length*(aHeight + aGapHeight);
			var aTextWidth = 0.74 * aWidth;
			
			var aLeft = width - aTotalWidth;
			var firstAnswerY = qMarginHeight + qHeight + aGapHeight;
			var aTextHeight = 0.8 * aHeight;
			var aTextGapHeight = 0.1 * aHeight;

			var qTextHeight = qHeight/qNumLines;

			const answersInOrder = question.correctResponse.split("").map((k) => {
				return answers.find((a) => a.key === k);
			})

			const recapBackgroundX = panelWidth/-2;

			const panelBackgroundScale = this.state.panelBackgroundNatHeight ? height / this.state.backgroundNatHeight : 1;
			const panelBackgroundOffset = this.state.panelBackgroundNatWidth + (panelWidth / panelBackgroundScale);
			return (
				<Stage width={width} height={height}>
					<Motion defaultStyle={{x: 0}} style={{x: spring(questionRecapped ? recapBackgroundX : 0)}}>
						{({x}) => (
							<Layer>
								<Rect x={x} y={0} height={height} width={width} fillPatternImage={this.state.backgroundImage}
								fillPatternScaleX={backgroundScale} fillPatternScaleY={backgroundScale}
								fillPatternOffsetX={backgroundOffsetX} fillPatternOffsetY={backgroundOffsetY}/>
							</Layer>
						)}
					</Motion>

					
					
					<Motion defaultStyle={{x: width}} style={{x: spring(questionRecapped ? width - panelWidth : width)}}>
						{({x}) => (
							<Layer>
								<Rect x={x} y={0} height={height} width={panelWidth} fillPatternImage={this.state.panelBackgroundImage}
									fillPatternScaleX={panelBackgroundScale} fillPatternScaleY={panelBackgroundScale} fillPatternOffsetX={-panelBackgroundOffset}/>
								<Text x={x + qMarginWidth} y={qMarginHeight}
									height={qHeight} width={qWidth}
									fontSize={qTextHeight} fontFamily={fontFamily}
									fill='white' align='left'
									text={question.body}/>
							</Layer>
						)}
					</Motion>
					
					<Layer visible={questionRecapped}>
						

						{answersInOrder.map((ans, index) => {
							const xStart = numAnswersRevealed > index ? aLeft : width;
							return (
								<Motion key={index} defaultStyle={{x: width}} style={{x: spring(xStart)}}>
									{({x}) => {
										return (
											<Group key={index}>
												<Lozenge xStart={x} yStart={firstAnswerY + (aHeight + aGapHeight) * index}
													height={aHeight} width={aWidth} leftSideWidth={0} rightSideWidth={sideWidth}
													fillStyle="black" strokeStyle={gradient} lineWidth={lineWidth}/>

												<Rect
													x={x+(aHeight*(2/5))} y={firstAnswerY + (aHeight + aGapHeight) * index + aHeight/2}
													width={aHeight/5} height={aHeight/5}
													fill="orange" rotation="-45"/>
												<Text
													x={x + aTextGapWidth} y={firstAnswerY + (aHeight + aGapHeight) * index + aTextGapHeight}
													width={aLetterWidth} height={aTextHeight}
													fontSize={aTextHeight} fontFamily={fontFamily}
													fill="orange" align='left' text={ans.key + ":"}/>
												<Text
													x={x + aTextGapWidth + aLetterWidth} y={firstAnswerY + (aHeight + aGapHeight) * index + aTextGapHeight}
													height={aTextHeight}
													fontSize={aTextHeight} fontFamily={fontFamily}
													fill="white" align='left'
													scaleX={this.textScale(ans.answer, fontFamily, aTextHeight, aTextWidth)}
													text={ans.answer}/>
											</Group>
										)
										
									}}
									
								</Motion>
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
						questionVisible={true} answersVisible={true} correctFlashOn={this.state.correctFlashOn}/>
				</Stage>
			);
		}
		
	}
}

QuestionResultsPanel.propTypes = {
	question: PropTypes.object,
	fullAnswerRevealed: PropTypes.bool,
	numAnswersRevealed: PropTypes.number,
	questionRecapped: PropTypes.bool,
};