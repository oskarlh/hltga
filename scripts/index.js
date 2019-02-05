const sharp = require("sharp");
const fs = require("fs");
const process = require("process");


if(process.argv.length !== 4) {
	console.error("Wrong number of command line arguments. You need to specify an input file and an output file");
	throw new Error();
}
const inputPath = process.argv[2];
const outputPath = process.argv[3];

sharp(fs.readFileSync(inputPath)).raw().toBuffer({resolveWithObject: true}).then(({data, info}) => {
	const { channels, width, height } = info;
	const alpha = channels === 4;
	if(!alpha && channels !== 3) {
		console.error("Wrong number of channels. 3 or 4 needed");
		throw new Error();
	}

	const tgaBuffer = Buffer.alloc(18 + width*height*channels);
	tgaBuffer.writeUInt8(0, 0); // Length of the image ID field
	tgaBuffer.writeUInt8(0, 1); // Whether a color map is included
	tgaBuffer.writeUInt8(2, 2); // Compression and color types: 2 = uncompressed true-color image
	tgaBuffer.writeUInt16LE(0, 3); // Color map first entry index
	tgaBuffer.writeUInt16LE(0, 5); // Color map length
	tgaBuffer.writeUInt8(0, 7); // Color map entry size
	tgaBuffer.writeUInt16LE(0, 8); // X-origin
	tgaBuffer.writeUInt16LE(height, 10); // Y-origin
	tgaBuffer.writeUInt16LE(width, 12); // Width
	tgaBuffer.writeUInt16LE(height, 14); // Height
	tgaBuffer.writeUInt8(alpha ? 32 : 24, 16); // Bits per pixel
	tgaBuffer.writeUInt8(1<<5, 17); // Image descriptor: bit 5 sets direction (0=origin lower left, 1=origin upper left)
	let offset = 18;
	for(let y = 0; y != height; ++y) {
		for(let x = 0; x != width; ++x) {
			tgaBuffer.writeUInt8(data[(y*width + x) * channels + 2], offset++); // Blue
			tgaBuffer.writeUInt8(data[(y*width + x) * channels + 1], offset++); // Green
			tgaBuffer.writeUInt8(data[(y*width + x) * channels + 0], offset++); // Red
			if(alpha) {
				tgaBuffer.writeUInt8(data[(y*width + x) * channels + 3], offset++); // Alpha
			}
		}
	}
	fs.writeFileSync(outputPath, tgaBuffer);
});




