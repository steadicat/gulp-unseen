gulp-unseen
===========

Only let through identical files once, and save state to a file.

Example:

~~~javascript
  return source
    .pipe($.unseen.skip('seen.json'))     // Skip files that we previously recorded in seen.json
    .pipe($.if('**/*.{js,css}', $.gzip()))
    .pipe($.if('**/*.{jpg,png}', $.imagemin()))
    .pipe($.s3(aws))
    .pipe($.unseen.manifest('seen.json')) // Generate new seen.json manifest
    .pipe(gulp.dest('.'))                 // Save manifest locally
    .pipe($.s3(aws, S3_TEXT_OPTIONS));    // Upload manifest to S3 for posterity
~~~
