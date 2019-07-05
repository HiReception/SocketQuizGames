import React, { Component } from "react";
import PropTypes from "prop-types";
import { Shape } from "react-konva";

export default class Lozenge extends Component {
	constructor(props) {
		super(props);
	}

	render = () => {
		const { xStart, yStart, height, width, leftSideWidth,
			rightSideWidth, fillStyle, strokeStyle, lineWidth } = this.props;
	
		return (
			<Shape fill={fillStyle} draggable
				strokeWidth={lineWidth}
				stroke={strokeStyle}
				draggable={false}
				sceneFunc={function (ctx) {
					var angle = 45.0;


					var angleRads = angle*Math.PI/180;
					var angleChord = (height/2) * Math.sin(angleRads/2);
					var curveEndY = angleChord * Math.sin(angleRads/2);
					var curveEndX = angleChord * Math.cos(angleRads/2);

					var diagonalHeight = height/2 - 2*curveEndY;
					var diagonalWidth = Math.tan(Math.PI/2 - angleRads) * diagonalHeight;
					var straightWidth = width - 2*diagonalWidth-4*curveEndX;
					var totalWidth = leftSideWidth+rightSideWidth+width;
					ctx.beginPath();
					ctx.moveTo(xStart,yStart+height/2);

					ctx.lineTo(xStart+leftSideWidth,yStart+height/2);
					// first corner
					ctx.arc(xStart+leftSideWidth, yStart+height/4,
									height/4, Math.PI/2, Math.PI/2-angleRads, true);
					ctx.lineTo(xStart+leftSideWidth+curveEndX+diagonalWidth, 
										yStart+height/2-curveEndY-diagonalHeight);
					ctx.arc(xStart+leftSideWidth+2*curveEndX+diagonalWidth, yStart+height/4,
									height/4, Math.PI*3/2-angleRads, Math.PI*3/2, false);

					ctx.lineTo(xStart+leftSideWidth+2*curveEndX+diagonalWidth+straightWidth,yStart);

					// second corner
					ctx.arc(xStart+totalWidth-rightSideWidth-2*curveEndX-diagonalWidth, yStart+height/4,
									height/4, Math.PI*3/2, Math.PI*3/2+angleRads, false);
					ctx.lineTo(xStart+totalWidth-rightSideWidth-curveEndX,yStart+height/2-curveEndY);
					ctx.arc(xStart+totalWidth-rightSideWidth, yStart+height/4,
									height/4, Math.PI/2+angleRads, Math.PI/2, true);


					ctx.lineTo(xStart+totalWidth,yStart+height/2);
					ctx.moveTo(xStart+totalWidth - rightSideWidth,yStart+height/2);

					// third corner
					ctx.arc(xStart+totalWidth-rightSideWidth, yStart+height*3/4,
									height/4, Math.PI*3/2, Math.PI*3/2-angleRads, true);
					ctx.lineTo(xStart+totalWidth-rightSideWidth-curveEndX-diagonalWidth, 
										yStart+height/2+curveEndY+diagonalHeight);
					ctx.arc(xStart+totalWidth-rightSideWidth-2*curveEndX-diagonalWidth, yStart+height*3/4,
									height/4, Math.PI/2-angleRads, Math.PI/2, false);


					ctx.lineTo(xStart+leftSideWidth+2*curveEndX+diagonalWidth,yStart+height);

					// fourth corner
					ctx.arc(xStart+leftSideWidth+2*curveEndX+diagonalWidth, yStart+height*3/4,
									height/4, Math.PI/2, Math.PI/2+angleRads, false);
					ctx.lineTo(xStart+leftSideWidth+curveEndX,yStart+height/2+curveEndY);
					ctx.arc(xStart+leftSideWidth, yStart+height*3/4,
									height/4, Math.PI*3/2+angleRads, Math.PI*3/2, true);



					// Konva specific method
					ctx.fillStrokeShape(this);
				}}
			/>
		);
	}
}

Lozenge.propTypes = {
	xStart: PropTypes.number,
	yStart: PropTypes.number,
	height: PropTypes.number,
	width: PropTypes.number,
	leftSideWidth: PropTypes.number,
	rightSideWidth: PropTypes.number,
	fillStyle: PropTypes.oneOfType([PropTypes.string, PropTypes.object]),
	strokeStyle: PropTypes.oneOfType([PropTypes.string, PropTypes.object]),
	lineWidth: PropTypes.number
};