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

gulp.task('deploy-surge', function () {
  require('fs').createReadStream('./build/index.html').pipe(fs.createWriteStream('./build/200.html'));
  return surge({
    project: './build',                           // Path to your static build directory
    domain: 'https://cdp-portal.surge.sh'  // Your domain or Surge subdomain
  })
});
