/**
 * Build the entire library as a single bundle to use with e.g.:
 * <script src="media-stream-player.min.js" />
 */
module.exports = {
  target: 'web',
  entry: './lib/index',
  mode: 'production',
  output: {
    library: 'mediaStreamPlayer',
    libraryTarget: 'umd',
    path: __dirname,
    filename: 'dist/media-stream-player.min.js',
  },
  resolve: {
    extensions: ['.js', '.jsx', '.ts', '.tsx'],
  },
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        use: {
          loader: 'babel-loader',
        },
      },
    ],
  },
}
