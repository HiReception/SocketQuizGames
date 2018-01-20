import React, { Component } from "react";
import PropTypes from "prop-types";
import Lozenge from "../common/lozenge";
import {Layer, Stage, Text, Rect, Group} from "react-konva";


export default class PlayerResultsPanel extends Component {
	constructor(props) {
		super(props);
		this.state = {
			height: 0,
			width: 0,
			backgroundImage: null,
			fastestFlashOn: false,
			numPlayersRevealed: 0,
			
		}
	}

	updateDimensions = () => {
		this.setState({width: window.innerWidth, height: window.innerHeight});
	}

	iterateCorrectReveal = () => {
		this.setState({
			numPlayersRevealed: this.state.numPlayersRevealed + 1,
		});

		if (this.state.numPlayersRevealed + 1 >= this.props.question.answers.length) {
			clearInterval(this.iterateCorrectReveal);
		}
	}

	flashFastest = () => {
		this.setState({fastestFlashOn: !this.state.fastestFlashOn});
	}

	componentWillMount = () => {
		this.updateDimensions();
		const image = new window.Image();
		image.src = "images/background.png";
		image.onload = () => {
			this.setState({
				backgroundImage: image,
				backgroundNatHeight: image.naturalHeight,
				backgroundNatWidth: image.naturalWidth,
			});
		};
	}
	componentDidMount = () => {
		window.addEventListener("resize", this.updateDimensions);
		if (this.props.fastestCorrectRevealed) {
			setInterval(this.flashFastest, 250);
		}
	}

	componentWillUnmount = () => {
		window.removeEventListener("resize", this.updateDimensions);
	}

	componentWillReceiveProps = (props) => {
		if (props.correctPlayersRevealed && !this.props.correctPlayersRevealed) {
			setInterval(this.state.iterateCorrectReveal, 200);
		}

		if (props.fastestCorrectRevealed && !this.props.fastestCorrectRevealed) {
			setInterval(this.flashFastest, 250);
		}
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



		

		const { question, players, correctPlayersRevealed, fastestCorrectRevealed } = this.props;
		const canvas = document.createElement("canvas");
		const ctx = canvas.getContext("2d");
		var gradient = ctx.createLinearGradient(0,0,width,0);
		gradient.addColorStop(0,"#4286f4");
		gradient.addColorStop(0.5,"skyblue");
		gradient.addColorStop(1,"#4286f4");

		
		var fontFamily = "Copperplate Gothic";
		const sideWidth = 0.1 * width;
		const pWidth = width - (2*sideWidth);
		const marginHeight = 0.1 * height;
		const pGapHeight = 0.02 * height;
		const pHeight = Math.min(((height - 2*marginHeight) - (players.length - 1) * pGapHeight) / players.length, 0.05 * pWidth);

		const totalPHeight = (pHeight * players.length) + (pGapHeight * (players.length - 1));
		const firstY = (height - totalPHeight) / 2;

		const pTextGapHeight = 0.1 * pHeight;
		const pTextHeight = pHeight - (2*pTextGapHeight);
		const lineWidth = 0.1 * pHeight;
		const pTextGapWidth = 0.1 * pWidth;
		const pTextWidth = pWidth - (pTextGapWidth*2);

		const pTextNameWidth = 0.8 * pTextWidth;
		const pTextTimeWidth = (pTextWidth - pTextNameWidth);
		
		const fastestTime = Math.min(...question.answers.filter((a) => a.answer === question.correctResponse).map((a) => a.timeTaken));
		const playerDetails = players.map((p, index) => {
			const answer = question.answers.find((a) => a.screenName === p.screenName);
			return {
				screenName: p.screenName.toUpperCase(),
				timeTaken: answer ? (answer.timeTaken/1000).toFixed(2) : "0.00",
				correctLit: typeof answer !== "undefined" && answer.answer === question.correctResponse && correctPlayersRevealed && this.state.numPlayersRevealed > index,
				fastestLit: typeof answer !== "undefined" && answer.answer === question.correctResponse && answer.timeTaken === fastestTime && fastestCorrectRevealed,
			};
		});
		const screenRatio = width / height;
		const backgroundRatio = this.state.backgroundNatWidth / this.state.backgroundNatHeight;
		var backgroundScale = 1;
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
				<Layer>
					<Rect x={0} y={0} height={height} width={width} fillPatternImage={this.state.backgroundImage}
						fillPatternScaleX={backgroundScale} fillPatternScaleY={backgroundScale}
						fillPatternOffsetX={backgroundOffsetX} fillPatternOffsetY={backgroundOffsetY}/>
				</Layer>
				<Layer>

					{playerDetails.map((player, index) => {
						const topY = firstY + (pHeight + pGapHeight) * index
						return (
							<Group key={index}>
								<Lozenge xStart={0} yStart={topY}
									height={pHeight} width={pWidth} leftSideWidth={sideWidth} rightSideWidth={sideWidth}
									fillStyle={player.fastestLit ? (this.state.fastestFlashOn ? "#00ff00" : "black") : (player.correctLit ? "#00ff00" : "black")} strokeStyle={gradient} lineWidth={lineWidth}/>

								<Rect
									x={sideWidth+(pHeight*(2/5))} y={topY + pHeight/2}
									width={pHeight/5} height={pHeight/5}
									fill="white" rotation="-45"/>

								<Rect
									x={width-(sideWidth+(pHeight*(2/5)))} y={topY + pHeight/2}
									width={pHeight/5} height={pHeight/5}
									fill="white" rotation="135"/>
								<Text
									x={sideWidth + pTextGapWidth} y={topY + pTextGapHeight}
									height={pTextHeight} scaleX={this.textScale(player.screenName, fontFamily, pTextHeight, pTextNameWidth)}
									fontSize={pTextHeight} fontFamily={fontFamily} fontStyle="bold"
									fill="white" align='left' text={player.screenName}/>
								<Text
									x={sideWidth + pTextGapWidth + pTextNameWidth} y={topY + pTextGapHeight}
									height={pTextHeight} width={pTextTimeWidth} wrap="none"
									visible={player.correctLit}
									fontSize={pTextHeight} fontFamily={fontFamily} fontStyle="bold"
									fill="white" align="right"
									scaleX={this.textScale(player.timeTaken, fontFamily, pTextHeight, pTextTimeWidth)}
									text={player.timeTaken}/>
							</Group>
						);
					})}
				</Layer>
			</Stage>
		);
	}
}

PlayerResultsPanel.propTypes = {
	question: PropTypes.object,
	players: PropTypes.array,
	correctPlayersRevealed: PropTypes.bool,
	fastestCorrectRevealed: PropTypes.bool,
};