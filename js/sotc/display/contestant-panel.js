import React, { Component } from "react";
import PropTypes from "prop-types";
import {Layer, Stage, Text, Rect, Group} from "react-konva";

const lightBlockCount = 16;


export default class ContestantPanel extends Component {
	constructor(props) {
		super(props);
		this.state = {
			height: 0,
			width: 0,
			answeringLightProgress: 0,
			answeringLightInterval: null,
		};
	}

	updateDimensions = () => {
		this.setState({width: window.innerWidth, height: window.innerHeight});
	}

	clearAnsweringLights = () => {
		this.setState({
			answeringLightProgress: 0,
		});
	}

	progressAnsweringLights = () => {
		this.setState({
			answeringLightProgress: this.state.answeringLightProgress + 1/lightBlockCount,
		});

		if (this.state.answeringLightProgress + 1/lightBlockCount >= 1) {
			clearInterval(this.state.answeringLightInterval);
		}
	}

	componentWillMount = () => {
		this.updateDimensions();
		[...Array(10).keys()].map(i => {
			const image = new window.Image();
			image.src = `timer-blue/${i}.png`;
			image.onload = () => {
				this.setState({
					["clock" + i]: image,
					clockNatHeight: image.naturalHeight,
					clockNatWidth: image.naturalWidth,
				});
			};
		});
	}
	componentDidMount = () => {
		window.addEventListener("resize", this.updateDimensions);
	}

	componentWillUnmount = () => {
		window.removeEventListener("resize", this.updateDimensions);
	}

	componentWillReceiveProps = (props) => {
		if (props.playerAnswering !== "" && props.playerAnswering !== this.props.playerAnswering) {
			this.setState({
				answeringLightInterval: setInterval(this.progressAnsweringLights, 40),
			});
			
		}

		if (props.playerAnswering === "" && props.playerAnswering !== this.props.playerAnswering) {
			this.clearAnsweringLights();
		}
	}

	textCenterOffset = (text, font, size, width, style = "") => {
		var textWidth;
		var c=document.createElement("canvas");
		var cctx=c.getContext("2d");
		cctx.font = style + " " + size + "px " + font;
		if (text.indexOf("\n") === -1) {
			textWidth = cctx.measureText(text).width;
		} else {
			var lineLengths = text.split("\n").map((l) => { return cctx.measureText(l).width;});
			textWidth = Math.max(...lineLengths);
		}
		if (textWidth <= width) {
			return (width - textWidth)/2;
		} else {
			
			return 0;
		}
	}

	textRightOffset = (text, font, size, width, style = "") => {
		var textWidth;
		var c=document.createElement("canvas");
		var cctx=c.getContext("2d");
		cctx.font = style + " " + size + "px " + font;
		if (text.indexOf("\n") === -1) {
			textWidth = cctx.measureText(text).width;
		} else {
			var lineLengths = text.split("\n").map((l) => { return cctx.measureText(l).width;});
			textWidth = Math.max(...lineLengths);
		}
		if (textWidth <= width) {
			return (width - textWidth);
		} else {
			
			return 0;
		}
	}

	textScale = (text, font, size, width, style = "") => {
		var textWidth;
		var c=document.createElement("canvas");
		var cctx=c.getContext("2d");
		cctx.font = style + " " + size + "px " + font;
		if (text.indexOf("\n") === -1) {
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

		const { players, playerAnswering } = this.props;

		
		var nameFont = "Times New Roman";
		var scoreFont = "EggCrate";
		const topMarginHeight = 0.1 * height;
		const bottomMarginHeight = 0.1 * height;
		const marginWidth = 0.1 * width;
		const pHeight = 0.4 * height;
		const topY = height - bottomMarginHeight - pHeight;
		const pWidth = Math.min((width - 2*marginWidth) / players.length, 0.2 * width);

		

		const totalPWidth = (pWidth * players.length);
		const firstX = (width - totalPWidth) / 2;

		const nameBoxHeight = 0.1 * pHeight;
		const nameBoxWidth = (2/3) * pWidth;
		const nameBoxOffsetX = (pWidth - nameBoxWidth)/2;
		const nameBoxOffsetY = 0;

		const namePlateHeight = (5/8) * nameBoxHeight;
		const namePlateWidth = 0.6 * nameBoxWidth;
		const namePlateOffsetX = nameBoxOffsetX + (nameBoxWidth - namePlateWidth)/2;
		const namePlateOffsetY = nameBoxOffsetY + (nameBoxHeight - namePlateHeight)/2;

		
		const nameTextHeight = Math.floor(0.8 * namePlateHeight);
		const nameTextGapHeight = (namePlateHeight - nameTextHeight)/2;
		const nameTextGapWidth = 0.1 * namePlateWidth;
		const nameTextWidth = namePlateWidth - (2*nameTextGapWidth);


		const scoreBlockHeight = 0.2 * pHeight;
		const scoreBlockWidth = pWidth;
		const scoreBlockOffsetX = 0;
		const scoreBlockOffsetY = nameBoxHeight;

		const scorePlateHeight = 0.75 * scoreBlockHeight;
		const scorePlateWidth = 0.5 * scoreBlockWidth;
		const scorePlateOffsetX = scoreBlockOffsetX + (scoreBlockWidth - scorePlateWidth)/2;
		const scorePlateOffsetY = scoreBlockOffsetY + (scoreBlockHeight - scorePlateHeight)/2;

		const scoreTextHeight = Math.floor(0.8 * scorePlateHeight);
		const scoreTextGapHeight = (scorePlateHeight - scoreTextHeight)/2;
		const scoreTextGapWidth = 0.1 * scorePlateWidth;
		const scoreTextWidth = scorePlateWidth - (2*scoreTextGapWidth);

		const lightBlockHeight = 0.6 * pHeight;
		const lightBlockGapWidth = 0;
		const lightBlockWidth = pWidth - 2 * lightBlockGapWidth;
		const lightBlockOffsetY = nameBoxHeight + scoreBlockHeight;

		const lightBlockSingleHeight = (lightBlockHeight / lightBlockCount);

		const podiumBaseOffsetY = nameBoxHeight + scoreBlockHeight + lightBlockHeight;
		const podiumBaseGapWidth = 20;
		
		const podiumBaseHeight = pHeight - podiumBaseOffsetY;
		const podiumBaseWidth = pWidth - 2 * podiumBaseGapWidth;

		const clockNumberAspectRatio = (16/15);
		const clockHeight = 0.2 * height;
		const clockBottomOffset = 0.075 * height;
		const clockNumberWidth = clockNumberAspectRatio * clockHeight;
		const clockTotalWidth = clockNumberWidth * this.props.clockDisplay.length;
		const clockMargin = (width - clockTotalWidth)/2;


		


		
		const playerDetails = players.map(p => {
			return {
				screenName: p.screenName.toUpperCase(),
				score: p.score,
				podiumLit: playerAnswering === p.screenName,
			};
		});

		const podiums = playerDetails.map((player, index) => (
			<Group key={index} x={firstX + pWidth * index} y={topY}>
				<Rect x={nameBoxOffsetX} y={nameBoxOffsetY}
					height={nameBoxHeight} width={nameBoxWidth}
					fill={player.podiumLit ? "white" : "lightgrey"}/>

				<Rect x={namePlateOffsetX} y={namePlateOffsetY}
					height={namePlateHeight} width={namePlateWidth}
					fill={player.podiumLit ? "blue" : "navy"}/>



				<Rect x={scoreBlockOffsetX} y={scoreBlockOffsetY}
					height={scoreBlockHeight} width={scoreBlockWidth}
					fill="tan"/>

				<Rect x={scorePlateOffsetX} y={scorePlateOffsetY}
					height={scorePlateHeight} width={scorePlateWidth}
					fill="black"/>

				{[...Array(lightBlockCount).keys()].map((i) => (
					<Rect key={i} x={lightBlockGapWidth} y={lightBlockOffsetY + lightBlockHeight - ((i + 1) * lightBlockSingleHeight)}
						height={lightBlockSingleHeight} width={lightBlockWidth}
						fill={player.podiumLit && this.state.answeringLightProgress >= i/lightBlockCount ? "gold" : "brown"} stroke="grey" strokeWidth={1}/>
				))}

				<Rect x={podiumBaseGapWidth} y={podiumBaseOffsetY}
					height={podiumBaseHeight} width={podiumBaseWidth}
					fill="navy"/>

				


				<Text
					x={namePlateOffsetX + nameTextGapWidth + this.textCenterOffset(player.screenName, nameFont, nameTextHeight, nameTextWidth, "bold")}
					y={namePlateOffsetY + nameTextGapHeight}
					height={nameTextHeight}
					scaleX={this.textScale(player.screenName, nameFont, nameTextHeight, nameTextWidth, "bold")}
					fontSize={nameTextHeight} fontFamily={nameFont} fontStyle="bold"
					fill={player.podiumLit ? "white" : "lightgrey"} align="center" text={player.screenName}/>
				<Text
					x={scorePlateOffsetX + scoreTextGapWidth + this.textRightOffset(player.score.toString(), scoreFont, scoreTextHeight, scoreTextWidth)}
					y={scorePlateOffsetY + scoreTextGapHeight}
					height={scoreTextHeight} wrap="none"
					fontSize={scoreTextHeight} fontFamily={scoreFont}
					fill="white"
					scaleX={this.textScale(player.score.toString(), scoreFont, scoreTextHeight, scoreTextWidth)}
					text={player.score.toString()}/>
			</Group>
		));
		
		return (
			<Layer>
				{podiums}
				<Rect
					x={0} y={height - bottomMarginHeight}
					height={bottomMarginHeight} width={width}
					fill="grey"/>
				<Group x={clockMargin} y={height - (clockHeight + clockBottomOffset)} height={clockHeight} width={clockTotalWidth}>
					{this.props.clockDisplay.split("").map((c,i) => (
						<Rect key={i} x={i * clockNumberWidth} y={0} height={clockHeight} width={clockNumberWidth}
							fillPatternImage={this.state["clock" + c]}
							fillPatternScaleX={clockHeight/this.state.clockNatHeight} fillPatternScaleY={clockNumberWidth/this.state.clockNatWidth}/>
					))}
				</Group>
			</Layer>
		);
	}
}

ContestantPanel.propTypes = {
	players: PropTypes.array,
	playerAnswering: PropTypes.string,
};