const fileinclude = require('gulp-file-include');

const { src, dest, parallel, series, watch } = require('gulp'),
    browserSync = require('browser-sync').create(),
    sass = require('gulp-sass')(require('sass')),
    cleanCSS = require('gulp-clean-css'),
    webpCss = require('gulp-webpcss'),
    ttf2woff2 = require('gulp-ttf2woff2'),
    ttf2woff = require('gulp-ttf2woff'),
    webp = require('gulp-webp'),
    webpHtml = require('gulp-webp-html');
    fileInclude = require('gulp-file-include');
    imagemin = require('gulp-imagemin'),
    minify = require('gulp-minify'),
    babel = require('gulp-babel'),
    fonts2css = require('gulp-fonts2css'),
    fs = require('fs-extra');

/*---Tasks----------------------------------------------------------------------------------------------------*/

async function clean() {
    await fs.emptyDir('dist');
}

function browsersync() {
    browserSync.init({
        server: { baseDir: 'dist/' },
        notify: false,
        online: true
    })
}

function html() {
    return src(['./**/*.html', '!node_modules/**', '!dist/**'])
        .pipe(fileInclude())
        .pipe(webpHtml())
        .pipe(dest('dist/'))
        .pipe(browserSync.stream())
}

function css() {
    return src(['scss/**/*.scss', '!dist/**'])
        .pipe(sass().on('error', sass.logError))
        .pipe(webpCss({webpClass: '.webp', noWebpClass: '.no-webp'}))
        .pipe(cleanCSS())
        .pipe(dest('dist/css/'))
        .pipe(browserSync.stream())
}

function js() {
    return src(['js/**/*.js', '!node_modules/**', '!dist/**'])
        .pipe(fileinclude())
        .pipe(babel({
            presets: ['@babel/env']
        }))
        .pipe(minify({
            ext: {
                src: '.js',
                min: '.js'
            },
            noSource: true
        }))
        .pipe(dest('dist/js/'))
        .pipe(browserSync.stream())
}

function img() {
    return src('img/**')
        .pipe(
            webp({
                quality: 70
            })
        )
        .pipe(dest('dist/img/'))
        .pipe(src('img/**'))
        .pipe(
            imagemin({
                progressive: true,
                svgoPlugins: [{ removeViewBox: false }],
                interplaced: true,
                optimizationLevel: 3
            })
        )
        .pipe(dest('dist/img/'))
        .pipe(browserSync.stream())
}

function fonts(params) {
    src('fonts/**')
    .pipe(ttf2woff())
    .pipe(dest('dist/fonts/'))
    return src('fonts/**')
    .pipe(ttf2woff2())
    .pipe(dest('dist/fonts/'))
    .pipe(browserSync.stream())
}

function startWatch() {
    watch('js/**/*.js', js);
    watch('scss/**/*.scss', css);
    watch(['./**/*.html', '!dist/**'], html);
    watch('fonts/**', fonts);
    watch('img/**', img);
}

/*---Exporting------------------------------------------------------------------------------------------------*/

exports.browsersync = browsersync;
exports.html = html;
exports.css = css;
exports.js = js;
exports.img = img;
exports.fonts = fonts;
exports.clean = clean;

exports.default = series(clean, parallel(html, css, js, fonts, img), parallel(browsersync, startWatch));