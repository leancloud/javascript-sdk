(function(root) {
  root.AV = root.AV || {};
  var AV = root.AV;
  var _ = AV._;

  /**
   * A builder to generate sort string for app searching.For example:
   * <pre><code>
   *   var builder = new AV.SearchSortBuilder();
   *   builder.ascending('key1').descending('key2','max');
   *   var query = new AV.SearchQuery('Player');
   *   query.sortBy(builder);
   *   query.find().then ...
   * </code></pre>
   * @class
   * @since 0.5.1
   */
  AV.SearchSortBuilder = function() {
    this._sortFields = [];
  };

  AV.SearchSortBuilder.prototype = {
    _addField: function(key, order, mode, missing) {
      var field = {};
      field[key] = {
        order: order || 'asc',
        mode: mode ||'avg',
        missing: '_' + (missing || 'last')
      };
      this._sortFields.push(field);
      return this;
    },


    /**
     * Sorts the results in ascending order by the given key and options.
     *
     * @param {String} key The key to order by.
     * @param {String} mode The sort mode, default is 'avg', you can choose
     *                  'max' or 'min' too.
     * @param {String} missing The missing key behaviour, default is 'last',
     *                  you can choose 'first' too.
     * @return {AV.SearchSortBuilder} Returns the builder, so you can chain this call.
     */
    ascending: function(key, mode, missing) {
      return this._addField(key, 'asc', mode, missing);
    },

    /**
     * Sorts the results in descending order by the given key and options.
     *
     * @param {String} key The key to order by.
     * @param {String} mode The sort mode, default is 'avg', you can choose
     *                  'max' or 'min' too.
     * @param {String} missing The missing key behaviour, default is 'last',
     *                  you can choose 'first' too.
     * @return {AV.SearchSortBuilder} Returns the builder, so you can chain this call.
     */
    descending: function(key, mode, missing) {
      return this._addField(key, 'desc', mode, missing);
    },

    /**
     * Add a proximity based constraint for finding objects with key point
     * values near the point given.
     * @param {String} key The key that the AV.GeoPoint is stored in.
     * @param {AV.GeoPoint} point The reference AV.GeoPoint that is used.
     * @param {Object} options The other options such as mode,order, unit etc.
     * @return {AV.SearchSortBuilder} Returns the builder, so you can chain this call.
     */
    whereNear: function(key, point, options) {
      options = options || {};
      var field = {};
      var geo = {
        lat: point.latitude,
        lon: point.longitude
      };
      var m = {
        order: options.order || 'asc',
        mode: options.mode || 'avg',
        unit: options.unit || 'km'
      };
      m[key] = geo;
      field['_geo_distance'] = m;

      this._sortFields.push(field);
      return this;
    },

    /**
     * Build a sort string by configuration.
     * @return {String} the sort string.
     */
    build: function() {
      return JSON.stringify(AV._encode(this._sortFields));
    }
  };

  /**
   * App searching query.Use just like AV.Query:
   * <pre><code>
   *   var query = new AV.SearchQuery('Player');
   *   query.queryString('*');
   *   query.find().then(function(results) {
   *     console.log('Found %d objects', query.hits());
   *     //Process results
   *   });
   *
   * </code></pre>
   * Visite <a href='https://leancloud.cn/docs/app_search_guide.html'>App Searching Guide</a>
   * for more details.
   * @class
   * @since 0.5.1
   *
   */
  AV.SearchQuery = AV.Query._extend(/** @lends AV.SearchQuery.prototype */{
     _sid: null,
     _hits:  0,
     _queryString: null,
     _highlights: null,
     _sortBuilder: null,
    _createRequest: function(params){
      return AV._request("search/select", null, null, "GET",
                                   params || this.toJSON());
    },

    /**
     * Sets the sid of app searching query.Default is null.
     * @param {String} sid  Scroll id for searching.
     * @return {AV.SearchQuery} Returns the query, so you can chain this call.
     */
    sid: function(sid) {
      this._sid = sid;
      return this;
    },

    /**
     * Sets the query string of app searching.
     * @param {String} q  The query string.
     * @return {AV.SearchQuery} Returns the query, so you can chain this call.
     */
    queryString: function(q) {
      this._queryString = q;
      return this;
    },


    /**
     * Sets the highlight fields. Such as
     * <pre><code>
     *   query.highlights('title');
     *   //or pass an array.
     *   query.highlights(['title', 'content'])
     * </code></pre>
     * @param {Array} highlights a list of fields.
     * @return {AV.SearchQuery} Returns the query, so you can chain this call.
     */
    highlights: function(highlights) {
      var objects;
      if (highlights && _.isString(highlights)) {
        objects = arguments;
      } else {
        objects = highlights;
      }
      this._highlights = objects;
      return this;
    },

    /**
     * Sets the sort builder for this query.
     * @see AV.SearchSortBuilder
     * @param { AV.SearchSortBuilder} builder The sort builder.
     * @return {AV.SearchQuery} Returns the query, so you can chain this call.
     *
     */
    sortBy: function(builder) {
      this._sortBuilder = builder;
      return this;
    },

    /**
     * Returns the number of objects that match this query.
     * @return {Number}
     */
    hits: function() {
       if (!this._hits) {
        this._hits = 0;
      }
      return this._hits;
    },

    _processResult: function(json){
       delete json['className'];
       delete json['_app_url'];
       delete json['_deeplink'];
       return json;
    },

    /**
     * Retrieves a list of AVObjects that satisfy this query.
     * Either options.success or options.error is called when the find
     * completes.
     *
     * @see AV.Query#find
     * @param {Object} options A Backbone-style options object.
     * @return {AV.Promise} A promise that is resolved with the results when
     * the query completes.
     */
    find: function(options) {
      var self = this;

      var request = this._createRequest();

      return request.then(function(response) {
        //update sid for next querying.
        if(response.sid) {
          self._oldSid = self._sid;
          self._sid = response.sid;
        }
        self._hits = response.hits || 0;

        return _.map(response.results, function(json) {
          if(json.className) {
            response.className = json.className;
          }
          var obj = self._newObject(response);
          obj.appURL = json['_app_url'];
          obj._finishFetch(self._processResult(json), true);
          return obj;
        });
      })._thenRunCallbacks(options);
    },

    toJSON: function(){
      var params = AV.SearchQuery.__super__.toJSON.call(this);
      delete params.where;
      if(this.className) {
        params.clazz = this.className;
      }
      if(this._sid) {
        params.sid = this._sid;
      }
      if(!this._queryString) {
        throw 'Please set query string.';
      } else {
        params.q = this._queryString;
      }
      if(this._highlights) {
        params.highlights = this._highlights.join(',');
      }
      if(this._sortBuilder && params.order) {
        throw 'sort and order can not be set at same time.';
      }
      if(this._sortBuilder) {
        params.sort = this._sortBuilder.build();
      }

      return params;
    }
  });
})(this);
