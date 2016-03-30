module.exports = function(grunt) {

  grunt.initConfig({
    nwjs: {
      options: {
        version: '0.12.0', // older version to fix extraction bug
        build_dir: './build',
          mac: false,
          win: false,
          linux32: false,
          linux64: true
        },
        src: [
          'src/index.html', 
          'src/app.js', 
          'src/script.js', 
          'package.json', 
          'node_modules/**/*', 
          'src/bower_components/**/*'
          ]
     },
     wiredep: {
       task: {

         // Point to the files that should be updated when
         // you run `grunt wiredep`
         src: [
           'src/index.html',   // .html support...
         ],

         options: {
           // See wiredep's configuration documentation for the options
           // you may pass:

           // https://github.com/taptapship/wiredep#configuration
         }
       }
     }
  })
grunt.loadNpmTasks('grunt-nw-builder');
grunt.loadNpmTasks('grunt-wiredep');
grunt.registerTask('build', ['nwjs']);
}