var exec     = require('child_process').exec
var fs       = require('fs');

var gulp     = require('gulp');
var gulpsync = require('gulp-sync')(gulp)
var gutil    = require('gulp-util');
var ghPages  = require('gulp-gh-pages')
var surge    = require('gulp-surge')

// gh-pages
gulp.task('deploy-gh-pages', function () {
  require('fs').writeFileSync('./build/CNAME', 'simple-dai-portal.makerdao.com');
  return gulp.src('./build/**/*')
    .pipe(ghPages())
});

gulp.task('deploy-surge-kovan', function () {
  require('fs').createReadStream('./build/index.html').pipe(fs.createWriteStream('./build/200.html'));
  return surge({ project: './build', domain: 'https://cdp-portal-kovan.surge.sh' })
});

gulp.task('deploy-surge-main', function () {
  require('fs').createReadStream('./build/index.html').pipe(fs.createWriteStream('./build/200.html'));
  return surge({ project: './build', domain: 'https://cdp-portal-mainnet.surge.sh' })
});
