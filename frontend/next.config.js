const path = require('path');

/** @type {import('next').NextConfig} */
module.exports = {
  output: 'standalone',
  turbopack: {
    root: path.resolve(__dirname),
  },
};
