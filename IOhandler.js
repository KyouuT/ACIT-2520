/*
 * Project: Milestone 1
 * File Name: IOhandler.js
 * Description: Collection of functions for files input/output related operations
 *
 * Created Date:
 * Author:
 *
 */

// const unzipper = require("unzipper"),
const fs = require("fs"),
  PNG = require("pngjs").PNG,
  path = require("path"),
  yauzl = require("yauzl-promise"),
  {pipeline} = require('stream/promises');;

/**
 * Description: decompress file from given pathIn, write to given pathOut
 *
 * @param {string} pathIn
 * @param {string} pathOut
 * @return {promise}
 */
const unzip = async(pathIn, pathOut) => {
  const zip = await yauzl.open(pathIn);
  try {
    for await (const entry of zip) {
      if (entry.filename.endsWith('/')) {
        await fs.promises.mkdir(`${pathOut}/${entry.filename}`);
      } else {
        const readStream = await entry.openReadStream();
        const writeStream = fs.createWriteStream(
          `${pathOut}/${entry.filename}`
        );
        await pipeline(readStream, writeStream);
      }
    }
  } finally {
    await zip.close();
    console.log("Extraction operation completed");
}
};
//use yauzl-promise HERE!!!

/**
 * Description: read all the png files from given directory and return Promise containing array of each png file path
 *
 * @param {string} path
 * @return {promise}
 */
const readDir = (dir) => {
  return new Promise((resolve, reject) => {
    fs.readdir(dir, (err, files) => {
      if (err) {
        reject(err);
      }
      const pngFiles = files.filter((file) => {
        return path.extname(file) === ".png";
      });
      resolve(pngFiles);
    });
  });
};

/**
 * Description: Read in png file by given pathIn,
 * convert to grayscale and write to given pathOut
 *
 * @param {string} filePath
 * @param {string} pathProcessed
 * @return {promise}
 */
const grayScale = (pathIn, pathOut) => {
  fs.createReadStream(`./unzipped/${pathIn}`)
  .pipe(new PNG({filterType: 4,}))
  .on("parsed", function () {
    for (var y = 0; y < this.height; y++) {
      for (var x = 0; x < this.width; x++) {
        var idx = (this.width * y + x) << 2;
        var avg = (this.data[idx] + this.data[idx + 1] + this.data[idx + 2]) / 3;
        this.data[idx] = avg;
        this.data[idx + 1] = avg;
        this.data[idx + 2] = avg;
      }
    }

    this.pack().pipe(fs.createWriteStream(`${pathOut}/${pathIn}`));
  });
};

module.exports = {
  unzip,
  readDir,
  grayScale,
};
