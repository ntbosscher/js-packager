/*
* @Author: Nate Bosscher (c) 2015
* @Date:   2016-09-05 08:47:11
* @Last Modified by:   Nate Bosscher
* @Last Modified time: 2016-09-05 10:21:40
*/

var arrayContainsUniqueValues = require("./array-unique");

/**
 * 
 * compile_dir_spec => { dir => obj.name}
 * 
 */
var CompilerDir = function(compile_dir_spec){

	this.children = [];
	this.dir = compile_dir_spec.dir;
	this.obj_map = null;

	this.setObjMap = function(obj){
		this.obj_map = obj;
		this.children = this.obj_map.getChildrenOf(this.dir);
	};

	/**
	 * circular_spec => { max_depth: int, path: [obj.name], map: ObjMapManager }
	 *
	 * basically the same as compiler-file except uses children as dependancies
	 * 
	 * @param  {[type]} circular_spec [description]
	 * @return {[type]}               [description]
	 */
	this.checkForCircularRefs = function(circular_spec){
		if(circular_spec.max_depth == 0)
			throw "Circular reference check failed to resolve (max-depth reached) for path " + circular_spec.path.join("\n\t-> ");

		for(var i = 0; i < this.children.length; i++){
			circular_spec.path.push(this.children[i]);

			if(!arrayContainsUniqueValues(circular_spec.path)){
				throw "Circular reference for path \n\t-> " + circular_spec.path.join("\n\t-> ");
			}

			var fileOrDir = circular_spec.map.lookup(this.children[i]);
			fileOrDir.checkForCircularRefs({
				max_depth: circular_spec.max_depth -1,
				path: circular_spec.path,
				map: circular_spec.map
			});

			circular_spec.path.pop(); // remove sub-item from path 
		}
	};

	// name => obj.name
	// same as compiler-file except uses children as dependancies
	this.dependsOn = function(name){
		if(this.children.indexOf(name) != -1){
			return true;
		}

		for(var i = 0; i < this.children.length; i++){
			if(this.obj_map.lookup(this.children[i]).dependsOn(name)){
				return true;
			}
		}

		return false;
	};
};

module.exports = CompilerDir;