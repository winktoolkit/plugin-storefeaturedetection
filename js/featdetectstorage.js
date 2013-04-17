/*--------------------------------------------------------
 * Copyright (c) 2011, The Dojo Foundation
 * This software is distributed under the "Simplified BSD license",
 * the text of which is available at http://www.winktoolkit.org/licence.txt
 * or see the "license.txt" file for more details.
 *--------------------------------------------------------*/

/**
 * @fileOverview The feature detection storage plugin
 * 
 * @author Sylvain Lalande
 */
define(['../../../_amd/core', '../../../_base/json/js/json.extended', '../../../plugins/simplestorage/js/simplestorage'], function(wink) {
	/**
	 * @class The feature detection storage plugin. It allows to store all detected features in order to speed up this detection phase.
	 * This object is a singleton.
	 * 
	 * @example
	 * 
	 * new wink.plugins.FeatDetectStorage().store();
	 * new wink.plugins.FeatDetectStorage().remove();
	 * 
	 * @compatibility Iphone OS3, Iphone OS4, Android 2.1, Android 2.2, Android 2.3, Android 3.0, Android 3.1, BlackBerry 6, BlackBerry 7, BB10, Bada 1.0, Windows Phone 8
	 * 
	 * @winkVersion 1.4
	 * 
	 */
	wink.plugins.FeatDetectStorage = function()
	{
		if (wink.isUndefined(wink.plugins.FeatDetectStorage.singleton))
		{
			/**
			 * Unique identifier
			 * 
			 * @property uId
			 * @type integer
			 */
			this.uId = wink.getUId();
			
			this._init();
			
			wink.plugins.FeatDetectStorage.singleton = this;
		} 
		else 
		{
			return wink.plugins.FeatDetectStorage.singleton;
		}
	};
	
	/**
	 * @ignore
	 */
	var _storage,
		_set,
		_setKeyName = "FeatDetectStorage";
	
	wink.plugins.FeatDetectStorage.prototype =
	{
		/**
		 * Stores all features and properties identified
		 */
		store: function()
		{
			var features = wink.has.getFeatures();
			for (var p in features) {
				var v = features[p];
				
				if (wink.isUndefined(_set.features[p]) && wink.isBoolean(v)) {
					_set.features[p] = v;
				}
			}
			var props = wink.has.getProperties();
			for (var p in props) {
				var v = props[p];
				
				if (wink.isUndefined(_set.props[p]) && wink.isString(v)) {
					_set.props[p] = v;
				}
			}
			if (wink.has.prefix) {
				_set.prefix = wink.has.prefix;
			}
			
			_storage.set(_setKeyName, wink.json.stringify(_set));
		},
		/**
		 * Removes all stored informations
		 */
		remove: function()
		{
			this._resetSet();
			_storage.remove(_setKeyName);
		},
		/**
		 * Reset the local set
		 */
		_resetSet: function()
		{
			_set = {
				features: {},
				props: {},
				prefix: ""
			};
		},
		/**
		 * Initialize the feature detection storage
		 */
		_init: function()
		{
			_storage = new wink.plugins.SimpleStorage();
			
			var _winkhas = wink.has;
			
			this._resetSet();
			
			// pre-processing for has to retrieve feature in memory
			wink.has = function(feature) {
				var features = _set.features,
					hf = features[feature];
				
				if (wink.isUndefined(hf)) {
					hf = _winkhas(feature);

					if (wink.isBoolean(hf)) {
						features[feature] = hf;
					}
				}
				return hf;
			};
			for (f in _winkhas) {
				wink.has[f] = _winkhas[f];
			}
			
			// pre-processing for has.prop to retrieve prop in memory
			wink.has.prop = function(key) {
				var props = _set.props,
					hp = props[key];
				
				if (wink.isUndefined(hp)) {
					hp = _winkhas.prop(key);
					
					if (wink.isString(hp)) {
						props[key] = hp;
					}
				}
				return hp;
			};

			// initializing all previously detected features stored
			var set = _storage.get(_setKeyName);
			if (set) {
				var tmp = _set.features;
				_set = wink.json.parse(set);
				var features = _set.features;
				features = wink.json.concat(features, tmp);
				
				for (var f in features) {
					_winkhas.inquire(f, features[f], false);
				}
				
				if (_set.prefix) {
					wink.has.prefix = _set.prefix;
				} else {
					wink.has.prefix = null;
					_set.prefix = "";
				}
			}
		}
	};
	
	return wink.plugins.FeatDetectStorage;
});
new wink.plugins.FeatDetectStorage();