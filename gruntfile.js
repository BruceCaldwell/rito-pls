module.exports = function (grunt) {
	grunt.initConfig({
		pkg: grunt.file.readJSON('package.json'),
		concat: {
			dist: {
				src: ['src/utils.js', 'src/sql.js', 'src/riot.js', 'src/cache.js', 'src/get.js', 'src/rito-pls.js'],
				dest: 'build/<%= pkg.name %>.js'
			}
		},
		uglify: {
			options: {
				banner: '/*! ritopls v<%= pkg.version %> by Bruce Caldwell @link(https://github.com/BruceCaldwell/ritopls). Minified by Uglify on: <%= grunt.template.today("dd-mm-yyyy") %> */\n'
			},
			dist: {
				files: {
					'build/<%= pkg.name %>.min.js': ['<%= concat.dist.dest %>']
				}
			}
		},
		watch: {
			js: { files: ['src/*.js'], tasks: [ 'concat', 'uglify' ] }
		}
	});

// load plugins
	grunt.loadNpmTasks('grunt-contrib-watch');
	grunt.loadNpmTasks('grunt-contrib-uglify');
	grunt.loadNpmTasks('grunt-contrib-concat');

	grunt.registerTask('default', ['concat', 'uglify']);
};