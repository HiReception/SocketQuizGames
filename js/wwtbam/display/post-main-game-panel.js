import React, { Component } from "react";
import PropTypes from "prop-types";
import {Layer, Stage, Rect, Text} from "react-konva";
import Lozenge from "../common/lozenge";


export default class PostMainGamePanel extends Component {
	constructor(props) {
		super(props);
		this.state = {
			height: 0,
			width: 0,
			backgroundImage: null,
			boxImage: null,
		};
	}

	textWidth = (text, font, size) => {
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

	updateDimensions = () => {
		this.setState({width: window.innerWidth, height: window.innerHeight});
	}

	componentWillMount = () => {
		this.updateDimensions();
		const bgImage = new window.Image();
		const boxImage = new window.Image();
		bgImage.src = "images/set-pink.png";
		boxImage.src = "images/background.png";
		bgImage.onload = () => {
			this.setState({
				backgroundImage: bgImage,
				backgroundNatHeight: bgImage.naturalHeight,
				backgroundNatWidth: bgImage.naturalWidth,
			});
		};

		boxImage.onload = () => {
			this.setState({
				boxImage: boxImage,
				boxNatHeight: boxImage.naturalHeight,
				boxNatWidth: boxImage.naturalWidth,
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

		const { winningsString } = this.props;

		const screenRatio = width / height;
		const backgroundRatio = this.state.backgroundNatWidth / this.state.backgroundNatHeight;
		const boxImageRatio = this.state.boxNatWidth / this.state.boxNatHeight;

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

		





		const canvas = document.createElement("canvas");
		const ctx = canvas.getContext("2d");
		var gradient = ctx.createLinearGradient(0,0,width,0);
		gradient.addColorStop(0,"#4286f4");
		gradient.addColorStop(0.5,"skyblue");
		gradient.addColorStop(1,"#4286f4");
		
		var fontFamily = "Copperplate Gothic";


		var lineWidth = 0.005 * width;
		var sideWidth = 0.1 * width;
		var qHeight = 0.1 * width;
		var qTextHeight = 0.8 * qHeight;
		var qWidth = width - (2 * sideWidth);
		var qTextWidth = 0.875 * qWidth;
		var qTextGapWidth = (qWidth - qTextWidth)/2;
		var qTextGapHeight = (qHeight - qTextHeight)/2;
		
		var gapHeight = 0.2 * qHeight;
		var bottomMargin = 0.1 * height;

		var row1Start = height - (bottomMargin + gapHeight + qHeight);

		var boxStart = height * 0.6;
		var boxHeight = height * 0.4 - bottomMargin;
		var boxTitleHeight = boxHeight - gapHeight - qHeight;
		var boxTitleWidth = width;
		var boxTitleFontSize = boxTitleHeight / 2;
		var boxTitleGapHeight = (boxTitleHeight - boxTitleFontSize)/2;
		

		var boxScale = 0;
		var boxOffsetX = 0, boxOffsetY = 0;
		var boxRatio = width / boxHeight;
		if (this.state.boxNatHeight) {
			if (boxRatio > boxImageRatio) {
				boxScale = width / this.state.boxNatWidth;
				boxOffsetY = (this.state.boxNatHeight - boxHeight/boxScale)/2;
			} else {
				boxScale = boxHeight / this.state.boxNatHeight;
				boxOffsetX = (this.state.boxNatWidth - width/boxScale)/2;
			}
			boxScale = boxRatio > boxImageRatio ? width / this.state.boxNatWidth : boxHeight/this.state.boxNatHeight;
		}


		return (
			<Stage width={width} height={height}>
				<Layer>
					<Rect x={0} y={0} height={height} width={width} fillPatternImage={this.state.backgroundImage}
						fillPatternScaleX={backgroundScale} fillPatternScaleY={backgroundScale}
						fillPatternOffsetX={backgroundOffsetX} fillPatternOffsetY={backgroundOffsetY}/>
				</Layer>
				<Layer>
					<Rect x={0} y={boxStart} height={boxHeight} width={width} fillPatternImage={this.state.boxImage}
						fillPatternScaleX={boxScale} fillPatternScaleY={boxScale}
						fillPatternOffsetX={boxOffsetX} fillPatternOffsetY={boxOffsetY}/>
					<Text x={this.textHorizontalSpacing("TOTAL PRIZE MONEY", "Copperplate Gothic", boxTitleFontSize, boxTitleWidth)}
						y={boxStart + boxTitleGapHeight}
						height={boxTitleFontSize} wrap="none"
						fontSize={boxTitleFontSize} fontFamily="Copperplate Gothic"
						fill='white' align="center"
						text="TOTAL PRIZE MONEY"/>
					<Lozenge xStart={0} yStart={row1Start} height={qHeight} width={qWidth} leftSideWidth={sideWidth} rightSideWidth={sideWidth}
						fillStyle="black" strokeStyle={gradient} lineWidth={lineWidth}/>


					<Text x={sideWidth + qTextGapWidth + this.textHorizontalSpacing(winningsString, fontFamily, qTextHeight, qTextWidth)}
						y={row1Start}
						height={qTextHeight} wrap="none"
						fontSize={qTextHeight} fontFamily={fontFamily}
						fill='orange' align="center"
						scaleX={this.textScale(winningsString, fontFamily, qTextHeight/2, qTextWidth)}
						text={winningsString}/>
					
					<Rect
						x={sideWidth+(qHeight*(2/5))} y={row1Start+qHeight/2}
						width={qHeight/5} height={qHeight/5}
						fill="white" rotation="-45"/>
					
					<Rect
						x={width - sideWidth - (qHeight*(3/5))} y={row1Start+qHeight/2}
						width={qHeight/5} height={qHeight/5}
						fill="white" rotation="-45"/>
				</Layer>
			</Stage>
		);
	}
}

PostMainGamePanel.propTypes = {
	winningsString: PropTypes.string,
};