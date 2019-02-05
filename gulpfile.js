const exec = require('child_process').exec;
const fs = require('fs');
const gulp = require('gulp');
const surge = require('gulp-surge');
const s3 = require('gulp-s3-upload')({ useIAM: false }, { maxRetries: 5 });
const cloudfront = require('gulp-cloudfront-invalidate');
const log = require('fancy-log');

if (process.env.DEPLOY_ENV && !process.env.AWS_ACCESS_KEY_ID) require('dotenv').config({ path: `.env.${process.env.DEPLOY_ENV}` });
else require('dotenv').config();

const s3FilesChanged = [];
const logChangedFiles = file => {
  s3FilesChanged.push(`/${file}`);
};

gulp.task('aws-s3-upload', () => {
  if (!process.env.DEPLOY_ENV) throw new Error('Missing DEPLOY_ENV in env variables');
  if (!process.env.AWS_ACCESS_KEY_ID || !process.env.AWS_SECRET_ACCESS_KEY) throw new Error('Missing AWS auth credentials in env variables');
  if (!process.env.AWS_DEPLOY_S3_BUCKET) throw new Error('No S3 bucket specified in env variable');
  log(`Uploading to S3 bucket ${process.env.AWS_DEPLOY_S3_BUCKET}...`);
  return gulp.src('./build-' + process.env.DEPLOY_ENV + '/**', '!**/.DS_Store').pipe(
    s3(
      {
        Bucket: process.env.AWS_DEPLOY_S3_BUCKET,
        ACL: 'public-read',
        onChange: keyname => logChangedFiles(keyname)
      },
      {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
      }
    )
  );
});

gulp.task('aws-cloudfront-invalidate', cb => {
  if (!process.env.AWS_ACCESS_KEY_ID || !process.env.AWS_SECRET_ACCESS_KEY) throw new Error('Missing AWS auth credentials in env variables');
  if (!process.env.AWS_DEPLOY_CLOUDFRONT_DISTRIBUTION_ID) throw new Error('No CloudFront distribution id specified in env variable');
  if (s3FilesChanged.length === 0) {
    log('Skipping CloudFront invalidation because no files have changed.');
    return cb();
  }
  log('Invalidating CloudFront cache for: ' + s3FilesChanged.join(', '));
  return gulp.src('*').pipe(
    cloudfront({
      distribution: process.env.AWS_DEPLOY_CLOUDFRONT_DISTRIBUTION_ID,
      paths: s3FilesChanged,
      wait: true,
      accessKeyId: process.env.AWS_ACCESS_KEY_ID,
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
    })
  );
});

gulp.task(
  'deploy-aws',
  gulp.series('aws-s3-upload', 'aws-cloudfront-invalidate')
);

gulp.task('deploy-surge-kovan', () => {
  require('fs')
    .createReadStream('./build/index.html')
    .pipe(fs.createWriteStream('./build/200.html'));
  return surge({ project: './build', domain: 'https://cdp-portal.surge.sh' });
});

gulp.task('deploy-surge-main', () => {
  require('fs')
    .createReadStream('./build/index.html')
    .pipe(fs.createWriteStream('./build/200.html'));
  return surge({
    project: './build',
    domain: 'https://cdp-portal-mainnet.surge.sh'
  });
});
