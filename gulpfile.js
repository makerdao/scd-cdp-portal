const exec     = require('child_process').exec,
      fs       = require('fs'),
      gulp     = require('gulp'),
      gulpsync = require('gulp-sync')(gulp),
      gutil    = require('gulp-util'),
      ghPages  = require('gulp-gh-pages'),
      surge    = require('gulp-surge');

// gh-pages
gulp.task('deploy-gh-pages', () => {
  require('fs').writeFileSync('./build/CNAME', 'cdp.makerdao.com');
  return gulp.src('./build/**/*').pipe(ghPages());
});

gulp.task('deploy-surge-kovan', () => {
  require('fs').createReadStream('./build/index.html').pipe(fs.createWriteStream('./build/200.html'));
  return surge({ project: './build', domain: 'https://cdp-portal.surge.sh' });
});

gulp.task('deploy-surge-main', () => {
  require('fs').createReadStream('./build/index.html').pipe(fs.createWriteStream('./build/200.html'));
  return surge({ project: './build', domain: 'https://cdp-portal-mainnet.surge.sh' });
});
