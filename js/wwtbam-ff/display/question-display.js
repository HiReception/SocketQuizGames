import React, { Component } from "react";
import PropTypes from "prop-types";
import Lozenge from "../common/lozenge";
import {Layer, Text, Rect} from "react-konva";


export default class QuestionDisplay extends Component {
	constructor(props) {
		super(props);

	}

	splitLongString = (string, font, size, width) => {
		if (this.textScale(string, font, size, width) < 1) {
			var splitPoint = string.indexOf(" ", Math.floor(string.length/2));
			return string.substr(0, splitPoint) + "\n" + string.substr(splitPoint + 1);
		} else {
			return string;
		}
	}

	textWidth = (text, font, size) => {
		var textWidth;
		var c=document.createElement("canvas");
		var cctx=c.getContext("2d");
		cctx.font = size + "px " + font;
		if (!text.includes("\n")) {
			return cctx.measureText(text).width;
		} else {
			var lineLengths = text.split("\n").map((l) => {
				return cctx.measureText(l).width;
			});
			return Math.max(...lineLengths);
		}
	}

	textScale = (text, font, size, width) => {
		const textWidth = this.textWidth(text, font, size);
		if (textWidth <= width) {
			return 1;
		} else {
			return width / textWidth;
		}
	}

	textVerticalSpacing = (text, height) => {
		if (text.includes("\n")) {
			return 0;
		} else {
			return height/4;
		}
	}

	textHorizontalSpacing = (text, font, size, width) => {
		const textWidth = this.textWidth(text, font, size);
		if (textWidth >= width) {
			return 0;
		} else {
			return (width - textWidth)/2;
		}
	}

	render = () => {
		var width = window.innerWidth;
		var height = window.innerHeight;

		const { question, fullAnswerRevealed, questionVisible, answersVisible, correctFlashOn } = this.props;
		const canvas = document.createElement("canvas");
		const ctx = canvas.getContext("2d");
		var gradient = ctx.createLinearGradient(0,0,width,0);
		gradient.addColorStop(0,"#4286f4");
		gradient.addColorStop(0.5,"skyblue");
		gradient.addColorStop(1,"#4286f4");
		
		var fontFamily = "Conduit";
	
		const answers = question.options.map((a) => {
			return {
				key: a.key,
				answer: a.text,
				correctLit: question.correctResponse.includes(a.key) && fullAnswerRevealed && correctFlashOn,
			};
		});


		var lineWidth = 0.005 * width;
		var sideWidth = 0.1 * width;
		var aGapWidth = 0.02 * width;
		var qHeight = 0.1 * width;
		var qTextHeight = 0.8 * qHeight;
		var qWidth = width - (2 * sideWidth);
		var qTextWidth = 0.875 * qWidth;
		var qTextGapWidth = (qWidth - qTextWidth)/2;
		var qTextGapHeight = (qHeight - qTextHeight)/2;
		
		var aHeight = 0.05 * width;
		var aWidth = (width/2) - sideWidth - aGapWidth/2
		var aTextHeight = 0.8 * aHeight;
		var aTextWidth = 0.74 * aWidth;
		var aTextGapWidth = 0.1 * aWidth;
		var aLetterWidth = 0.09 * aWidth;
		var aTextGapHeight = (aHeight - aTextHeight)/2;
		var gapHeight = 0.1 * qHeight;
		var bottomMargin = 0.1 * height;

		var row1Start = height - (bottomMargin + 2*gapHeight + 2*aHeight + qHeight);
		var row2Start = row1Start + qHeight + gapHeight;
		var row3Start = row2Start + aHeight + gapHeight;

		var splitQuestion = this.splitLongString(question.body, fontFamily, qTextHeight/2, qTextWidth);



		return (
			<Layer>
				<Lozenge xStart={0} yStart={row1Start} height={qHeight} width={qWidth} leftSideWidth={sideWidth} rightSideWidth={sideWidth}
					fillStyle="black" strokeStyle={gradient} lineWidth={lineWidth}/>

				<Lozenge xStart={0} yStart={row2Start} height={aHeight} width={aWidth} leftSideWidth={sideWidth} rightSideWidth={aGapWidth + 1}
					fillStyle={answers[0].correctLit ? "#00ff00" : "black"} strokeStyle={gradient} lineWidth={lineWidth}/>

				<Lozenge xStart={width - (sideWidth + aWidth)} yStart={row2Start} height={aHeight} width={aWidth} leftSideWidth={0} rightSideWidth={sideWidth}
					fillStyle={answers[1].correctLit ? "#00ff00" : "black"} strokeStyle={gradient} lineWidth={lineWidth}/>

				<Lozenge xStart={0} yStart={row3Start} height={aHeight} width={aWidth} leftSideWidth={sideWidth} rightSideWidth={aGapWidth + 1}
					fillStyle={answers[2].correctLit ? "#00ff00" : "black"} strokeStyle={gradient} lineWidth={lineWidth}/>

				<Lozenge xStart={width - (sideWidth + aWidth)} yStart={row3Start} height={aHeight} width={aWidth} leftSideWidth={0} rightSideWidth={sideWidth}
					fillStyle={answers[3].correctLit ? "#00ff00" : "black"} strokeStyle={gradient} lineWidth={lineWidth}/>


				<Text x={sideWidth + qTextGapWidth + this.textHorizontalSpacing(splitQuestion, fontFamily, qTextHeight/2, qTextWidth)}
					y={row1Start + qTextGapHeight + this.textVerticalSpacing(splitQuestion, qTextHeight)}
					height={qTextHeight} wrap="none"
					fontSize={qTextHeight/2} fontFamily={fontFamily}
					fill='white' align="center"
					scaleX={this.textScale(splitQuestion, fontFamily, qTextHeight/2, qTextWidth)}
					text={splitQuestion} visible={questionVisible}/>
				
				<Rect
					x={sideWidth+(aHeight*(2/5))} y={row2Start+aHeight/2}
					width={aHeight/5} height={aHeight/5} visible={answersVisible}
					fill={answers[0].correctLit ? "black" : "orange"} rotation={-45}/>
				<Text
					x={sideWidth + aTextGapWidth} y={row2Start + aTextGapHeight}
					width={aLetterWidth} height={aTextHeight} visible={answersVisible}
					fontSize={aTextHeight} fontFamily={fontFamily}
					fill={answers[0].correctLit ? "black" : "orange"} align='left' text={answers[0].key + ":"}/>
				<Text
					x={sideWidth + aTextGapWidth + aLetterWidth} y={row2Start + aTextGapHeight}
					height={aTextHeight} visible={answersVisible}
					fontSize={aTextHeight} fontFamily={fontFamily}
					fill={answers[0].correctLit ? "black" : "white"} align='left'
					scaleX={this.textScale(answers[0].answer, fontFamily, aTextHeight, aTextWidth)}
					text={answers[0].answer}/>
				
				<Rect
					x={(width+aGapWidth)/2 + (aHeight*(2/5))} y={row2Start+aHeight/2}
					width={aHeight/5} height={aHeight/5} visible={answersVisible}
					fill={answers[1].correctLit ? "black" : "orange"} rotation={-45}/>
				<Text
					x={(width+aGapWidth)/2 + aTextGapWidth} y={row2Start + aTextGapHeight}
					width={aLetterWidth} height={aTextHeight} visible={answersVisible}
					fontSize={aTextHeight} fontFamily={fontFamily}
					fill={answers[1].correctLit ? "black" : "orange"} align='left' text={answers[1].key + ":"}/>
				<Text
					x={(width+aGapWidth)/2 + aTextGapWidth + aLetterWidth} y={row2Start + aTextGapHeight}
					height={aTextHeight} visible={answersVisible}
					fontSize={aTextHeight} fontFamily={fontFamily}
					fill={answers[1].correctLit ? "black" : "white"} align='left'
					scaleX={this.textScale(answers[1].answer, fontFamily, aTextHeight, aTextWidth)}
					text={answers[1].answer}/>
				
				<Rect
					x={sideWidth+(aHeight*(2/5))} y={row3Start+aHeight/2}
					width={aHeight/5} height={aHeight/5} visible={answersVisible}
					fill={answers[2].correctLit ? "black" : "orange"} rotation={-45}/>
				<Text
					x={sideWidth + aTextGapWidth} y={row3Start + aTextGapHeight}
					width={aLetterWidth} height={aTextHeight} visible={answersVisible}
					fontSize={aTextHeight} fontFamily={fontFamily}
					fill={answers[2].correctLit ? "black" : "orange"} align='left' text={answers[2].key + ":"}/>
				<Text
					x={sideWidth + aTextGapWidth + aLetterWidth} y={row3Start + aTextGapHeight}
					height={aTextHeight} visible={answersVisible}
					fontSize={aTextHeight} fontFamily={fontFamily}
					fill={answers[2].correctLit ? "black" : "white"} align='left'
					scaleX={this.textScale(answers[2].answer, fontFamily, aTextHeight, aTextWidth)}
					text={answers[2].answer}/>
				
				<Rect
					x={(width+aGapWidth)/2 + (aHeight*(2/5))} y={row3Start+aHeight/2}
					width={aHeight/5} height={aHeight/5} visible={answersVisible}
					fill={answers[3].correctLit ? "black" : "orange"} rotation={-45}/>
				<Text
					x={(width+aGapWidth)/2 + aTextGapWidth} y={row3Start + aTextGapHeight}
					width={aLetterWidth} height={aTextHeight} visible={answersVisible}
					fontSize={aTextHeight} fontFamily={fontFamily}
					fill={answers[3].correctLit ? "black" : "orange"} align='left' text={answers[3].key + ":"}/>
				<Text
					x={(width+aGapWidth)/2 + aTextGapWidth + aLetterWidth} y={row3Start + aTextGapHeight}
					height={aTextHeight} visible={answersVisible}
					fontSize={aTextHeight} fontFamily={fontFamily}
					fill={answers[3].correctLit ? "black" : "white"} align='left'
					scaleX={this.textScale(answers[3].answer, fontFamily, aTextHeight, aTextWidth)}
					text={answers[3].answer}/>
			</Layer>
		);
		
	}
}

QuestionDisplay.propTypes = {
	question: PropTypes.object,
	fullAnswerRevealed: PropTypes.bool,
	questionVisible: PropTypes.bool,
	answersVisible: PropTypes.bool,
	correctFlashOn: PropTypes.bool,
};