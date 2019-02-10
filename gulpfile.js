const gulp = require('gulp');
const sourcemaps = require('gulp-sourcemaps');
const babel = require('gulp-babel');
const watch = require('gulp-watch');

const release_build = () =>
    gulp.src('lib/**/*.js')
        .pipe(sourcemaps.init())
        .pipe(babel({
            presets: ['@babel/env']
        }))
        .pipe(sourcemaps.write('.'))
        .pipe(gulp.dest('dist/lib'));

gulp.task('release-build', release_build);

gulp.task('default', () => {
    return watch('index.js', { ignoreInitial: false }, () => {
        gulp.src('index.js')
            .pipe(sourcemaps.init())
            .pipe(babel({
                presets: ['@babel/env']
            }))
            .pipe(sourcemaps.write('.'))
            .pipe(gulp.dest('dist'));
    })
});

