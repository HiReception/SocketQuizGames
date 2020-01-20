import React, { Component } from "react";
import PropTypes from "prop-types";
import {Layer, Stage, Rect, Text} from "react-konva";
import Lozenge from "../common/lozenge";


export default class WinSash extends Component {
	constructor(props) {
		super(props);
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
		
		var gapHeight = 0.2 * qHeight;
		var bottomMargin = 0.1 * height;

		var row1Start = height - (bottomMargin + gapHeight + qHeight);

		


		return (
			<Layer>
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
		);
	}
}

WinSash.propTypes = {
	winningsString: PropTypes.string,
};