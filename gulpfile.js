const gulp = require('gulp');
const g = require('gulp-load-plugins')();
const browserSync = require('browser-sync');
const chalk = require('chalk');
const postcssPresetEnv = require('postcss-preset-env');
const autoprefixer = require('autoprefixer');
const postcssImport = require('postcss-import');
const postcssNested = require('postcss-nested');
const postcssColorFunction = require('postcss-color-function');
const postcssCustomProperties = require('postcss-custom-properties');

const errorHandler = function errorHandler(error) { console.log(chalk.red(error.message)); this.emit('end'); };

gulp.task('browser-sync', () => {
	browserSync({
		online: false,
		proxy: 'localhost:8080',
	});
});

gulp.task('reload', () => browserSync.reload({ stream: true }));

gulp.task('scripts', () => gulp.src('front/scripts/main.js')
	.pipe(g.babel({
		presets: ['@babel/preset-env', 'minify'],
	}))
	.pipe(g.rename({ suffix: '.min' }))
	.pipe(gulp.dest('public/js'))
	.pipe(browserSync.reload({ stream: true })));

gulp.task('images', () => gulp.src('front/assets/**/*')
	.pipe(g.imagemin({
		progressive: true,
		svgoPlugins: [{ removeViewBox: false }],
		optimizationLevel: 4,
		multipass: true,
		interlaced: true,
	}))
	.pipe(gulp.dest('public/assets'))
	.pipe(browserSync.reload({ stream: true })));

gulp.task('style', () => {
	const plugins = [
		postcssImport(),
		postcssPresetEnv(),
		postcssNested(),
		postcssCustomProperties(),
		postcssColorFunction(),
		autoprefixer(),
	];

	return gulp.src('front/style/main.css')
		.pipe(g.plumber({ errorHandler }))
		.pipe(g.postcss(plugins))
		.pipe(g.rename({ suffix: '.min' }))
		.pipe(gulp.dest('public/css'))
		.pipe(browserSync.reload({ stream: true }));
});

gulp.task('build', gulp.parallel('style', 'images', 'scripts'));

gulp.task('watch', () => {
	gulp.watch('front/style/**/*.css', gulp.series('style'));
	gulp.watch('front/scripts/**/*.js', gulp.series('scripts'));
	gulp.watch('front/assets/**/*', gulp.series('images'));
	gulp.watch(['app/views/**/*.pug'], gulp.series('reload'));
});

gulp.task('default', gulp.series('build', gulp.parallel('browser-sync', 'watch')));
