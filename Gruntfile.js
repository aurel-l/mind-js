'use strict';
var LIVERELOAD_PORT = 35729;
var lrSnippet = require('connect-livereload')({port: LIVERELOAD_PORT});
var mountFolder = function (connect, dir) {
  return connect.static(require('path').resolve(dir));
};

// # Globbing
// for performance reasons we're only matching one level down:
// 'test/spec/{,*/}*.js'
// use this if you want to match all subfolders:
// 'test/spec/**/*.js'

module.exports = function (grunt) {
  // show elapsed time at the end
  require('time-grunt')(grunt);
  // load all grunt tasks
  require('load-grunt-tasks')(grunt);

  var browsers = grunt.file.readJSON('browsers.json');

  grunt.initConfig({
    watch: {
      options: {
        nospawn: true,
        livereload: { liveCSS: false }
      },
      livereload: {
        options: {
          livereload: true
        },
        files: [
          'src/**/*.html',
          '{.tmp,src}/**/*.css',
          '{.tmp,src}/**/*.js',
          'src/images/**/*.{png,jpg,jpeg,gif,webp}'
        ]
      },
      css: {
        files: ['src/**/*.css'],
        tasks: ['csslint', 'autoprefixer']
      },
      hmtl: {
        files: ['src/**/*.html'],
        tasks: ['htmlhint']
      },
      js: {
        files: ['src/**/*.js'],
        tasks: ['jshint', '6to5']
      }
    },
    '6to5': {
      options: {
        sourceMap: true,
        experimental: true
      },
      default: {
        files: [{
          expand: true,
          cwd: 'src',
          src: [
            '**/*.js',
            '!bower_components/**/*'
          ],
          dest: '.tmp'
        }]
      }
    },
    autoprefixer: {
      options: {
        browsers: ['last 2 versions']
      },
      dev: {
        files: [{
          expand: true,
          cwd: 'src',
          src: [
            '**/*.css',
            '!bower_components/**/*'
          ],
          dest: '.tmp'
        }]
      },
      dist: {
        files: [{
          expand: true,
          cwd: 'dist',
          src: [
            '**/*.css',
            '!bower_components/**/*'
          ],
          dest: 'dist'
        }]
      }
    },
    connect: {
      options: {
        port: 9000,
        // change this to '0.0.0.0' to access the server from outside
        hostname: 'localhost'
      },
      livereload: {
        options: {
          middleware: function (connect) {
            return [
              lrSnippet,
              mountFolder(connect, '.tmp'),
              mountFolder(connect, 'src')
            ];
          }
        }
      },
      test: {
        options: {
          open: {
            target: 'http://localhost:<%= connect.options.port %>/test'
          },
          middleware: function (connect) {
            return [
              mountFolder(connect, 'src')
            ];
          },
          keepalive: true
        }
      },
      dist: {
        options: {
          middleware: function (connect) {
            return [
              mountFolder(connect, 'dist')
            ];
          }
        }
      }
    },
    open: browsers.filter(function (b) {
      return b.use;
    }).map(function(b) {
      return {
        path: 'http://localhost:<%= connect.options.port %>',
        app: b.cmd
      };
    }),
    clean: {
      dist: ['.tmp', 'dist/*'],
      server: '.tmp'
    },
    jshint: {
      options: {
        jshintrc: true
      },
      all: [
        'src/**/*.js',
        '!src/bower_components/**/*'
      ]
    },
    htmlhint: {
      options: {
        htmlhintrc: '.htmlhintrc'
      },
      all: [
        'src/**/*.html',
        '!src/bower_components/**/*'
      ]
    },
    csslint: {
      options: {
        csslintrc: '.csslintrc'
      },
      all: [
        'src/**/*.css',
        '!src/bower_components/**/*'
      ]
    },
    useminPrepare: {
      html: 'src/index.html',
      options: {
        dest: 'dist'
      }
    },
    usemin: {
      html: ['dist/{,*/}*.html'],
      css: ['dist/styles/{,*/}*.css'],
      options: {
        dirs: ['dist'],
        blockReplacements: {
          vulcanized: function (block) {
            return '<link rel="import" href="' + block.dest + '">';
          }
        }
      }
    },
    vulcanize: {
      default: {
        options: {
          strip: true
        },
        files: {
          'dist/elements/elements.vulcanized.html': [
            'dist/elements/elements.html'
          ]
        }
      }
    },
    imagemin: {
      dist: {
        files: [{
          expand: true,
          cwd: 'src/images',
          src: '{,*/}*.{png,jpg,jpeg}',
          dest: 'dist/images'
        }]
      }
    },
    cssmin: {
      main: {
        files: {
          'dist/styles/main.css': [
            '.tmp/concat/styles/{,*/}*.css'
          ]
        }
      },
      elements: {
        files: [{
          expand: true,
          cwd: '.tmp/elements',
          src: '{,*/}*.css',
          dest: 'dist/elements'
        }]
      }
    },
    minifyHtml: {
      options: {
        quotes: true,
        empty: true
      },
      app: {
        files: [{
          expand: true,
          cwd: 'dist',
          src: '*.html',
          dest: 'dist'
        }]
      }
    },
    uglify: {
      all: {
        files: [{
          expand: true,
          cwd: '.tmp',
          src: [
            '**/*.js',
            '!bower_components/**/*'
          ],
          dest: 'dist'
        }]
      }
    },
    copy: {
      dist: {
        files: [{
          expand: true,
          dot: true,
          cwd: 'src',
          dest: 'dist',
          src: [
            '*.{ico,txt}',
            '*.html',
            'elements/**',
            '!elements/**/*.css',
            'images/{,*/}*.{webp,gif}',
            'bower_components/**'
          ]
        }]
      }
    }
  });

  grunt.registerTask('dev', [
    'clean:server',
    'htmlhint',
    'jshint',
    'csslint',
    'autoprefixer',
    '6to5',
    'connect:livereload',
    'open',
    'watch'
  ]);

  grunt.registerTask('test', [
    'clean:server',
    'connect:test'
  ]);

  grunt.registerTask('build', [
    'clean:dist',
    'htmlhint',
    'jshint',
    'csslint',
    'autoprefixer',
    'useminPrepare',
    'imagemin',
    '6to5',
    'uglify',
    'cssmin',
    'vulcanize',
    'usemin',
    'minifyHtml'
  ]);

  grunt.registerTask('default', ['dev']);
};
