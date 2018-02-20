const gf = {
	textWidth(text, font, size, style = "") {
		var textWidth;
		var c=document.createElement("canvas");
		var cctx=c.getContext("2d");
		cctx.font = size + "px " + font + " " + style;
		if (!text.includes("\n")) {
			return cctx.measureText(text).width;
		} else {
			var lineLengths = text.split("\n").map((l) => {
				return cctx.measureText(l).width;
			});
			return Math.max(...lineLengths);
		}
	},

	textScale(text, font, size, width, style = "") {
		const textWidth = gf.textWidth(text, font, size, style);
		if (textWidth <= width) {
			return 1;
		} else {
			return width / textWidth;
		}
	},

	splitLongString(string, font, size, width, style = "") {
		if (gf.textScale(string, font, size, width, style) < 1) {
			if (string.includes(" ")) {
				const spaces = string.split("").map((c,i) => c === " " ? i : null).filter(x => x);
				const halfwayMark = Math.ceil(string.length/2);
				const splitPoint = spaces.reduce((min, cur) => {
					if (Math.abs(cur - halfwayMark) < Math.abs(min - halfwayMark)) {
						return cur;
					} else {
						return min;
					}
				}, spaces[0])
				return string.substr(0, splitPoint) + "\n" + string.substr(splitPoint + 1);
			}
		}
		return string;
	},


	textVerticalSpacing(text, height) {
		if (text.includes("\n")) {
			return 0;
		} else {
			return height/2;
		}
	},

	textHorizontalSpacing(text, font, size, width, style = "") {
		const textWidth = gf.textWidth(text, font, size, style);
		if (textWidth >= width) {
			return 0;
		} else {
			return (width - textWidth)/2;
		}
	},

	splitClue(string, font, height, width) {
		var lines = [];
		var currentLineNo = 0;
		lines[currentLineNo] = "";
		const words = string.split(" ");
		words.forEach((w) => {
			const nextWord = ` ${w}`;
			if (gf.textWidth(lines[currentLineNo].concat(nextWord), font, height) > width) {
				currentLineNo++;
				lines[currentLineNo] = w;
			} else {
				lines[currentLineNo] = lines[currentLineNo].concat(`${lines[currentLineNo] === "" ? "" : " "}${w}`);
			}
		});
		return lines.join("\n");
	},
	numLines(string, font, height, width) {
		var currentLine = "";
		var numLines = 0;
		const words = string.split(" ");
		words.forEach((w) => {
			const nextWord = ` ${w}`;
			if (gf.textWidth(currentLine.concat(nextWord), font, height) > width) {
				numLines++;
				currentLine = w;
			} else {
				currentLine = currentLine.concat(`${currentLine === "" ? "" : " "}${w}`);
			}
		});
		return numLines + 1;
	}
};



export default gf