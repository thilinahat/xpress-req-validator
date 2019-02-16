const gulp = require('gulp');
const sourcemaps = require('gulp-sourcemaps');
const babel = require('gulp-babel');

const release_build = () =>
    gulp.src('lib/**/*.js')
        .pipe(sourcemaps.init())
        .pipe(babel({
            presets: ['@babel/env']
        }))
        .pipe(sourcemaps.write('.'))
        .pipe(gulp.dest('dist/lib'));

gulp.task('release-build', release_build);

gulp.task('dev-build', function () {
    gulp.watch('lib/**/*.js', release_build);
});

gulp.task('default', release_build);

