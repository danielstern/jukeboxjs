// Generated on 2014-12-02 using
// generator-webapp 0.5.1
'use strict';

// # Globbing
// for performance reasons we're only matching one level down:
// 'test/spec/{,*/}*.js'
// If you want to recursively match all subfolders, use:
// 'test/spec/**/*.js'

module.exports = function (grunt) {

  // Load grunt tasks automatically
  require('load-grunt-tasks')(grunt);

  // Configurable paths
  var config = {
    app: 'app',
    dist: 'dist'
  };

  // Define the configuration for all the tasks
  grunt.initConfig({

    // Project settings
    config: config,

    // doesnt affect grunt built all
    // Watches files for changes and runs tasks based on the changed files
    watch: {
      bower: {
        files: ['bower.json'],
        tasks: ['wiredep']
      },
      js: {
        files: ['<%= config.app %>/scripts/{,*/}*.js'],
        tasks: ['jshint'],
        options: {
          livereload: true
        }
      },
      less: {
          files: ['<%= config.app %>/less/*.less'],
          tasks: ['less']
      },
      jstest: {
        files: ['test/spec/{,*/}*.js'],
        tasks: ['test:watch']
      },
      gruntfile: {
        files: ['Gruntfile.js']
      },
      styles: {
        files: ['<%= config.app %>/styles/{,*/}*.css'],
        tasks: ['newer:copy:styles', 'autoprefixer']
      },
      livereload: {
        options: {
          livereload: '<%= connect.options.livereload %>'
        },
        files: [
          '<%= config.app %>/{,*/}*.html',
          '.tmp/styles/{,*/}*.css',
          '<%= config.app %>/images/{,*/}*'
        ]
      }
    },

    // The actual grunt server settings
    connect: {
      options: {
        port: 9000,
        open: {
            target: 'http://localhost:9000' // target url to open
        },
        livereload: 35729,
        // Change this to '0.0.0.0' to access the server from outside
        hostname: '0.0.0.0'
      },
      livereload: {
        options: {
          middleware: function(connect) {
            return [
              connect.static('.tmp'),
              connect().use('/bower_components', connect.static('./bower_components')),
              connect.static(config.app)
            ];
          }
        }
      },
      // this makes somethign special when i call grunt serve:dist
      // it makes the base the dist directory. dist is defined here but where is the usual directory, app, defined?
      dist: {
        options: {
          base: '<%= config.dist %>',
          livereload: false
        }
      }
    },

    // Empties folders to start fresh
    clean: {
      dist: {
        files: [{
          dot: true,
          src: [
            '.tmp',
            '<%= config.dist %>/*',
            '!<%= config.dist %>/.git*'
          ]
        }]
      },
      server: '.tmp'
    },

    // Make sure code styles are up to par and there are no obvious mistakes
    jshint: {
      options: {
        jshintrc: '.jshintrc',
        reporter: require('jshint-stylish')
      },
      all: [
        // 'Gruntfile.js',
        '<%= config.app %>/scripts/Jukebox.js',
        '!<%= config.app %>/scripts/vendor/*',
        // 'test/spec/{,*/}*.js'
      ]
    },

    // Add vendor prefixed styles
    autoprefixer: {
      options: {
        browsers: ['> 1%', 'last 2 versions', 'Firefox ESR', 'Opera 12.1']
      },
      dist: {
        files: [{
          expand: true,
          cwd: '.tmp/styles/',
          src: '{,*/}*.css',
          dest: '.tmp/styles/'
        }]
      }
    },

    // turns less files into css files
    less: {
        dev: {
            options: {
                compress: false,
                sourceMap: true,
                sourceMapFilename: '.tmp/styles/main.css.map', // where file is generated and located
                sourceMapURL: '/styles/main.css.map', // the complete url and filename put in the compiled css file
                sourceMapBasepath: 'app', // Sets sourcemap base path, defaults to current working directory.
                sourceMapRootpath: '/', // adds this path onto the sourcemap filename and less file paths
            },
            files: {
                '.tmp/styles/main.css': 'app/less/*.less',
            }
        }
    },

    // Automatically inject Bower components into the HTML file
    wiredep: {
      app: {
        ignorePath: /^\/|\.\.\//,
        src: ['<%= config.app %>/index.html']
      }
    },

    // i don't really understand what this does
    // Renames files for browser caching purposes
    rev: {
      dist: {
        files: {
          src: [
            '<%= config.dist %>/scripts/{,*/}*.js',
            '<%= config.dist %>/styles/{,*/}*.css',
            '<%= config.dist %>/images/{,*/}*.*',
            '<%= config.dist %>/styles/fonts/{,*/}*.*',
            '<%= config.dist %>/*.{ico,png}'
          ]
        }
      }
    },

    // this function does the useminifying. it seems pretty key.
    // Reads HTML for usemin blocks to enable smart builds that automatically
    // concat, minify and revision files. Creates configurations in memory so
    // additional tasks can operate on them
    useminPrepare: {
      options: {
        dest: '<%= config.dist %>'
      },
      html: '<%= config.app %>/index.html'
    },

    // usemin part2
    // Performs rewrites based on rev and the useminPrepare configuration
    usemin: {
      options: {
        assetsDirs: [
          '<%= config.dist %>',
          '<%= config.dist %>/images',
          '<%= config.dist %>/styles',
        ]
      },
      html: ['<%= config.dist %>/{,*/}*.html'],
      css: ['<%= config.dist %>/styles/{,*/}*.css']
    },

    // The following *-min tasks produce minified files in the dist folder
    imagemin: {
      dist: {
        files: [{
          expand: true,
          cwd: '<%= config.app %>/images',
          src: '{,*/}*.{gif,jpeg,jpg,png}',
          dest: '<%= config.dist %>/images'
        }]
      }
    },

    svgmin: {
      dist: {
        files: [{
          expand: true,
          cwd: '<%= config.app %>/images',
          src: '{,*/}*.svg',
          dest: '<%= config.dist %>/images'
        }]
      }
    },

    // html min. wwe don't want to minify the html for this project.
    // htmlmin: {
    //   dist: {
    //     options: {
    //       collapseBooleanAttributes: false,
    //       collapseWhitespace: false,
    //       conservativeCollapse: true,
    //       removeAttributeQuotes: true,
    //       removeCommentsFromCDATA: true,
    //       removeEmptyAttributes: false,
    //       removeOptionalTags: false,
    //       removeRedundantAttributes: true,
    //       useShortDoctype: false
    //     },
    //     files: [{
    //       expand: true,
    //       cwd: '<%= config.dist %>',
    //       src: '{,*/}*.html',
    //       dest: '<%= config.dist %>'
    //     }]
    //   }
    // },

    // i don't understand what this does or its relationship with the usemin blocks
    // By default, your `index.html`'s <!-- Usemin block --> will take care
    // of minification. These next options are pre-configured if you do not
    // wish to use the Usemin blocks.
    // cssmin: {
    //   dist: {
    //     files: {
    //       '<%= config.dist %>/styles/main.css': [
    //         '.tmp/styles/{,*/}*.css',
    //         '<%= config.app %>/styles/{,*/}*.css'
    //       ]
    //     }
    //   }
    // },
    // uglify: {
    //   dist: {
    //     options: {
    //       mangle: false,
    //       compress: false,
    //       removeWhiteSpace: false,
    //       // beautify: true,
    //       banner: "/*beep boop beep badooz*/"
    //     },
    //     files: {
    //       '<%= config.dist %>/scripts/jukebox.js': [
    //         '<%= config.app %>/scripts/jukebox.js'
    //       ]
    //     }
    //   }
    // },
    // concat: {
    //   dist: {}
    // },

    // auto pushes to gh pages for pure jokes
    buildcontrol: {
      options: {
        dir: 'dist',
        commit: true,
        push: true,
        message: 'Built %sourceName% from commit %sourceCommit% on branch %sourceBranch%'
      },
      pages: {
        options: {
          remote: 'git@github.com:danielstern/jukeboxjs.git',
          branch: 'gh-pages'
        }
      },
      // heroku: {
      //   options: {
      //     remote: 'git@heroku.com:example-heroku-webapp-1988.git',
      //     branch: 'master',
      //     tag: pkg.version
      //   }
      // },
      // local: {
      //   options: {
      //     remote: '../',
      //     branch: 'build'
      //   }
      // }
    },

    // copies files. it's easy to understand, but its relationship to the other tasks,
    // their folders, and the order in which they come is confusing and important
    // Copies remaining files to places other tasks can use
    copy: {
      dist: {
        files: [{
          expand: true,
          dot: true,
          cwd: '<%= config.app %>',
          dest: '<%= config.dist %>',
          src: [
            '*.{ico,png,txt}',
            'images/{,*/}*.webp',
            // 'scripts',
            'fonts/*.*',
            // 'scripts/{,*/}*.js',
            '{,*/}*.html',
            'styles/fonts/{,*/}*.*'
          ]
        },{
          expand: true,
          dot: true,
          cwd: '.tmp/concat',
          dest: '<%= config.dist %>',
          src: [
            'scripts/{,*/}*.js',
            'styles/{,*/}*.css',
            // 'styles/fonts/{,*/}*.*'
          ]
        },{
          src: 'node_modules/apache-server-configs/dist/.htaccess',
          dest: '<%= config.dist %>/.htaccess'
        }]
      },
      styles: {
        expand: true,
        dot: true,
        cwd: '<%= config.app %>/styles',
        dest: '.tmp/styles/',
        src: '{,*/}*.css'
      },
      prod: {
        expand: true,
        dot: true,
        cwd: '.tmp/concat/scripts',
        dest: '',
        src: [
          'jukebox.js',
        ]
      }
    },

    // dont really understand this. this makes the build process faster but thats not necessary
    // Run some tasks in parallel to speed up build process
    concurrent: {
      server: [
        'copy:styles'
      ],
      test: [
        'copy:styles'
      ],
      dist: [
        'copy:styles',
        'imagemin',
        'svgmin'
      ]
    }
  });


  grunt.registerTask('serve', 'start the server and preview your app, --allow-remote for remote access', function (target) {
    if (grunt.option('allow-remote')) {
      grunt.config.set('connect.options.hostname', '0.0.0.0');
    }
    if (target === 'dist') {
      return grunt.task.run(['build', 'connect:dist:keepalive']);
    }

    grunt.task.run([
      // empty server directory. // clean servr empties tmp
      'clean:server',
      // inject index-html
      'wiredep',
      // runs concurrent server? concurrent server copies styles.
      'concurrent:server',
      // takes less files in less folder and turns them into tmp style folder
      'less',
      // adds prefixes. useless before running less. thats why my prefixes werent working!
      'autoprefixer',
      // starts a server in ??? location. opens chrome and live reloads it and 
      // brings it to that server. a crtical step.
      'connect:livereload',
      // watches for future changes
      'watch'
    ]);
  });

  // i never use server tasks no ways
  // grunt.registerTask('server', function (target) {
  //   grunt.log.warn('The `server` task has been deprecated. Use `grunt serve` to start a server.');
  //   grunt.task.run([target ? ('serve:' + target) : 'serve']);
  // });

  // this is a convoluted block and i don't understand or like it
  // tests my app apparently, unfortunately html5 web audio api is hella hard to test
  // grunt.registerTask('test', function (target) {
  //   if (target !== 'watch') {
  //     grunt.task.run([
  //       'clean:server',
  //       'concurrent:test',
  //       'autoprefixer'
  //     ]);
  //   }

  //   grunt.task.run([
  //     'connect:test',
  //     'mocha'
  //   ]);
  // });

  grunt.registerTask('build', [
    // delete dist folder
    'clean:dist',
    // insert dependcines in index.htmk
    'wiredep',
    // creates mysterious configurations used by rev, concat and usemin and others
    'useminPrepare',
    // copies styles and image mins
    // takes less files in less folder and turns them into tmp style folder
    'less',
    // minifies styles and svg
    'concurrent:dist',
    // adds prefixes, comes after less.
    'autoprefixer',
    // there's no indication of what this does anywhere.
    'concat',
    // minifies css. approved
    'cssmin',
    // mangles js files but also copies them. not needed for this project
    // use copy instead of uglify. no need for uglify.
    // 'uglify',
    //
    // copies lots of things. dist is the only copy command. a general place to put your build stuff.
    'copy:dist',
    // adds confusion revision info to your files to mess with you and others
    // 'rev',
    // related to usemin prepare. has some thing to do with use min blocks
    'usemin',
    'copy:prod',
    // minifies html. we are not using this because want html to be legible.
    // 'htmlmin'
  ]);

  // default task. useless.
  grunt.registerTask('default', [
    'build',
    'deploy'
  ]);

  grunt.registerTask('deploy', [
    'buildcontrol'
  ]);
};
