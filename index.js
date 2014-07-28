var fs = require('fs');
var path = require('path');
var crypto = require('crypto');
var gutil = require('gulp-util');
var through = require('through2');

function md5(s) {
  return crypto.createHash('md5').update(s).digest('hex');
}

var allSeen = {};

function getSeen(manifest) {
  var seen = allSeen[manifest];
  if (seen) return seen;
  if (fs.existsSync(manifest)) {
    seen = JSON.parse(fs.readFileSync(manifest));
  } else {
    seen = {};
  }
  allSeen[manifest] = seen;
  return seen;
}

module.exports = {
  skip: function(manifest) {
    var seen = getSeen(manifest);

    return through.obj(function(file, enc, cb) {
      if (file.isStream()) {
        return cb(new gutil.PluginError('gulp-unseen', {
          message: 'Streams are not supported',
          fileName: file.path
        }));
      }

      var hash = md5(file.contents);
      var rel = path.relative(file.base, file.path);
      if (seen[rel] === hash) return cb();
      seen[rel] = hash;
      file.unseenHash = hash;
      this.push(file);
      cb();
    }, function(cb) {
      cb();
    });
  },

  manifest: function(manifest) {
    var seen = getSeen(manifest);

    var firstFile;

    return through.obj(function(file, enc, cb) {
      if (file.isStream()) {
        return cb(new gutil.PluginError('gulp-unseen', {
          message: 'Streams are not supported',
          fileName: file.path
        }));
      }
      firstFile = firstFile || file;

      var hash = file.unseenHash || md5(file.contents);
      var rel = path.relative(file.base, file.path);
      if (seen[rel] === hash) return cb();
      seen[rel] = hash;
      cb();
    }, function(cb) {
      if (!firstFile) return cb();
      this.push(new gutil.File({
        cwd: firstFile.cwd,
        base: firstFile.base,
				path: path.join(firstFile.base, manifest),
        contents: new Buffer(JSON.stringify(seen))
      }));
      cb();
    });
  }
};
