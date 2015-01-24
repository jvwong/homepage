/**
 * jacob.js
 * Root namespace module for GVTCharts
 **/
/* global window, d3 */

'use strict';

var jacob = (function() {

    var
          BarChart, BarChart_XO
        , TableChart
        , ToggleFilter
        , utils
        ;

    utils = {
        validators: (function() {

            /**
             *
             * @param {}
             */
            function validate_positive_number( val ){
                if( typeof val === 'object' ){
                    for ( var key in val ){
                        if( val.hasOwnProperty(key) ){
                            if ( isNaN(val[key]) || typeof val[key] !== 'number' ||  val[key] < 0 ){
                                throw new SpecException("invalid width", obj[key]);
                            }
                        }
                    }
                } else {
                    if ( isNaN( val ) || typeof val !== 'number' ||  val < 0 ){
                        throw new SpecException("invalid width", val);
                    }
                }
                return val;
            }

            /**
             *
             * @param {}
             */
            function validate_fractional_number( val ){
                if ( isNaN( val ) || typeof val !== 'number' ||  val < 0 ||  val > 1){
                    throw new SpecException("invalid entry; not number in [0, 1]", val);
                }
                return val;
            }

            /**
             *
             * @param {}
             */
            function validate_object( val ){
                if ( typeof val !== 'object' ){
                    throw new SpecException("invalid object", val);
                }
                return val;
            }

            /**
             *
             * @param {}
             */
            function validate_function( val ){
                if ( typeof val !== 'function' ){
                    throw new SpecException("invalid function", val);
                }
                return val;
            }


            /**
             *
             * @param {}
             */
            function validate_text( val ){
                if ( typeof val !== 'string' ){
                    throw new SpecException("invalid string", val);
                }
                return val;
            }

            /**
             * validate_fields - validates fields against those available in the crossfilter dimension
             * @param {array} val - array of strings
             * @param {object} dimension - crossfilter dimension
             * @return {array} val - the original input
             * @throws {SpecException} Argument val be an array of strings that dimensions
             */
            function validate_fields( val, dimension ){
                if ( !Array.isArray(val) ){
                    throw new SpecException("invalid array", val);
                }
                if (dimension){
                    var valid_fields = Object.keys(dimension.top(1)[0]);
                    val.forEach(function(field, i){
                        if (valid_fields.indexOf(field) < 0){
                            throw new SpecException("invalid field", field);
                        }
                    });
                }
                return val;
            }

            /**
             * validate_field - test if string is a valid key in crossfilter dimension
             * @param {string} val - string
             * @param {object} dimension - crossfilter dimension
             * @return {string} val - the original input
             * @throws {SpecException} Argument val must be a string in dimension
             */
            function validate_field( val, dimension ){
                if ( typeof val !== "string" ){
                    throw new SpecException("invalid type input", val);
                }
                if (dimension){
                    var valid_fields = Object.keys(dimension.top(1)[0]);
                    if (valid_fields.indexOf(val) < 0){
                        throw new SpecException("invalid field", field);
                    }
                }
                return val;
            }

            /**
             * validate_field_names validates if the argument is an array of strings that
             * corresponds to the length and order of "fields" attribute.
             * @param {array} val - an array of field names that will be printed out
             * @return {array} val - the original input
             * @throws {SpecException} Argument val must be an array of strings
             */
            function validate_field_names( val ){
                if ( !Array.isArray(val) ){
                    throw new SpecException("invalid match in field", val);
                }
                val.forEach(function(field_name, i){
                    if (typeof field_name !== 'string'){
                        throw new SpecException("invalid field type", field_name);
                    }
                });
                return val;
            }


            return {
                validate_positive_number    : validate_positive_number,
                validate_fractional_number  : validate_fractional_number,
                validate_object             : validate_object,
                validate_function           : validate_function,
                validate_text               : validate_text,
                validate_fields             : validate_fields,
                validate_field              : validate_field,
                validate_field_names        : validate_field_names
            };

        }()),


        comparators: (function(){

            function stringCompare(a, b) {
                a = a.toLowerCase();
                b = b.toLowerCase();
                return a > b ? 1 : a == b ? 0 : -1;
            }

            function numberCompare(a, b) {
                return a > b ? -1 : a == b ? 0 : 1;
            }

            return {
                stringCompare   : stringCompare,
                numberCompare   : numberCompare
            };
        }()),

        exceptions: (function(){
            function SpecException( message, val ) {
                var detail = String();
                if(val){
                    detail += ": " + val;
                }
                this.message = message + detail;
                this.name = "SpecException";
            };

            return {
                SpecException   : SpecException
            };
        }())
    };

    function SpecException( message, val ) {
        var detail = String();
        if(val){
            detail += ": " + val;
        }
        this.message = message + detail;
        this.name = "SpecException";
    }


    /**
     * ToggleFilter
     * @constructor container d3-selection to insert into
     * @param container { object } d3 selection
     * @param spec { object } map of initial config options
     */
    ToggleFilter = function( container, spec ) {

        /* START variable declarations  */
        if (!ToggleFilter.id){ ToggleFilter.id = 0; }
        var
            id = ToggleFilter.id++
            , filter = {}

            , _width, _height, _margins, _quadrantWidth, _quadrantHeight
            , _group, _dimension
            , _parent = container
            , _svg, _body, _filter, _filter_enter
            , _wpad, _iwidth
            , _rpad, _radius
            , _rows, _padding, _per_row
            , _formatter = function(d, i){ return d;}
            , _render_image, _render_fallback
            , _filters
            , _endpoint

            , SpecException
            , configure
            ;
        /* END variable declarations  */

        /* START helpers */
        /* END helpers */

        /* START chart render_fallback */
        _render_fallback = function(){

            if(!_svg){

                /* render the svg element */
                _svg = _parent.append("svg")
                    .attr({
                        class       : "tf-svg"
                        , height    : _height
                        , width     : _width
                    })
                ;

                /* render a group element to append the contents */
                _body = _svg.append("g")
                    .attr({
                          class: "tf-body"
                        , transform: "translate(" + _margins.left + "," + _margins.top + ")"
                    })
                ;

                /* render circles for each filter */
                _filter = _body.selectAll("g").data(
                    _filters.sort(function (a, b) {
                        return a == null || b == null ? 0 : utils.comparators.stringCompare (a.split(" ").pop(), b.split(" ").pop());
                    })
                );


                _filter_enter = _filter.enter()
                                       .append("g")
                                       .attr({
                                            transform: function(d, i){
                                             return "translate(" + (_margins.left + _rpad * (i % _per_row) + (2 * (i % _per_row) + 1)  * _radius) + ","
                                                 + (_margins.top + _rpad * Math.floor( i / _per_row)  + ( 2 * Math.floor( i / _per_row) + 1) * _radius) + ")";
                                            }
                                        })
                ;





                var gradient_on = _filter_enter.append("svg:defs")
                    .append("svg:linearGradient")
                    .attr("id", "gradient_on")
                    .attr("x1", "0%")
                    .attr("y1", "0%")
                    .attr("x2", "100%")
                    .attr("y2", "100%")
                    .attr("spreadMethod", "pad");

                    gradient_on.append("svg:stop")
                        .attr("offset", "0%")
                        .attr("stop-color", "#A30000")
                        .attr("stop-opacity", 1);

                    gradient_on.append("svg:stop")
                        .attr("offset", "100%")
                        .attr("stop-color", "#FFFFFF")
                        .attr("stop-opacity", 1);

                var gradient_off = _filter_enter.append("svg:defs")
                    .append("svg:linearGradient")
                    .attr("id", "gradient_off")
                    .attr("x1", "0%")
                    .attr("y1", "0%")
                    .attr("x2", "100%")
                    .attr("y2", "100%")
                    .attr("spreadMethod", "pad");

                gradient_off.append("svg:stop")
                    .attr("offset", "0%")
                    .attr("stop-color", "#4682b4")
                    .attr("stop-opacity", 1);

                gradient_off.append("svg:stop")
                    .attr("offset", "100%")
                    .attr("stop-color", "#FFFFFF")
                    .attr("stop-opacity", 1);


                _filter_enter.append("circle")
                            .attr({
                                class: "filter",
                                r   : _radius,
                                "stroke": "none",
                                "fill": "url(#gradient_off)"
                            })
                ;

                _filter_enter.append("text")
                        .attr("x", function(d, i) { return 0; })
                        .attr("y", function(d, i) { return 0; })
                        .attr("class", "tf-text")
                        .text(_formatter)
                        .style("text-anchor", "middle");

                _filter_enter.on('click', function(k){
                    var t = d3.select(this).select("circle"),
                        fill = t.attr("fill");

                    _filter_enter.each(function(d,i){
                        d3.select(this).select("circle").attr("fill", "url(#gradient_off)");
                    });

                    if(fill === "url(#gradient_off)"){
                        _dimension.filterExact(k);
                        t.attr("fill", "url(#gradient_on)")
                    } else {
                        _dimension.filter(null);
                        t.attr("fill", "url(#gradient_off)")
                    }
                });


            }
        };

        _render_image = function(){

            if(!_svg){

                /* render the svg element */
                _svg = _parent.append("svg")
                    .attr({
                        class       : "tf-svg"
                        , height    : _height
                        , width     : _width
                    })
                ;

                /* render a group element to append the contents */
                _body = _svg.append("g")
                    .attr({
                        class: "tf-body"
                        , transform: "translate(" + _margins.left + "," + _margins.top + ")"
                    })
                ;

                /* render circles for each filter */
                _filter = _body.selectAll("g").data(
                    _filters.sort(function (a, b) {
                        return a == null || b == null ? 0 : utils.comparators.stringCompare (a.split(" ").pop(), b.split(" ").pop());
                    })
                );

                _filter_enter = _filter.enter()
                                       .append("g")
                                       .attr({
                                            transform: function(d, i){
                                             return "translate(" + (_margins.left + (i % _per_row)  * _iwidth) + ","
                                                 + (_margins.top + Math.floor( i / _per_row) * _iwidth) + ")";
                                            }
                                        })
                ;

                _filter_enter.append("svg:image")
                    .attr("xlink:href", function(d,i){
                        var value = d.toLowerCase().split(" ").pop();

                        if(value){
                            return _endpoint + value + ".gif";
                        }
                        return _endpoint + "default.gif";
                    })
                    .attr({
                      class: "active",
                      width: 70,
                      height: 50
                    })
                ;

                _filter_enter.on('click', function(k){


                    var logo = d3.select(this).select("image"),
                        logos = _filter_enter.select("image");

                    if( logo.classed("active") ){
                        _dimension.filterExact(k);

                        //clear active class
                        logos.classed("active", false);

                        //declare selected element
                        logo.classed("selected", true);

                    } else if ( logo.classed("selected") ) {

                        _dimension.filter(null);

                        //declare all logos as unselected
                        logo.classed("selected", false);
                        logos.classed("active", true);

                    } else {
                        _dimension.filterExact(k);

                        //clear active class
                        logos.classed("active", false);
                        logos.classed("selected", false);
                        logo.classed("selected", true);
                    }
                });


            }
        };


        filter.render = function(){
            _render_image();
//            _render_fallback();
        };

        /* END chart render */


        /* START getters & setters */
        filter.id = function(){
            return id;
        };

        filter.margins = function(_){
            if(!arguments.length) return _margins;
            _margins = utils.validators.validate_positive_number(_);
            return filter;
        };

        filter.group = function(_){
            if(!arguments.length) return _group;
            _group = utils.validators.validate_object(_);
            return filter;
        };

        filter.dimension = function(_) {
            if (!arguments.length) return _dimension;
            _dimension = utils.validators.validate_object(_);
            return filter;
        };

        /* width */
        filter.width = function(_){
            if(!arguments.length) return _width;
            _width = utils.validators.validate_positive_number(_);
            return filter;
        };

        filter.rows = function(_){
            if(!arguments.length) return _rows;
            _rows = utils.validators.validate_positive_number(_);
            return filter;
        };

        filter.padding = function(_){
            if(!arguments.length) return _padding;
            _padding = utils.validators.validate_fractional_number(_);
            return filter;
        };

        /* height */
        filter.height = function(_){
            if(!arguments.length) return _height;
            _height = utils.validators.validate_positive_number(_);
            return filter;
        };

        filter.formatter = function(_) {
            if (!arguments.length) return _formatter;
            _formatter = utils.validators.validate_function(_);
            return filter;
        };

        filter.endpoint = function(_) {
            if (!arguments.length) return _endpoint;
            _endpoint = utils.validators.validate_text(_);
            return filter;
        };

        /* END getters & setters */

        /* START initialization */
        configure = function( spec ){

            var required = [
                "width",
                "height",
                "margins",
                "rows",
                "padding",
                "dimension",
                "group"
            ];

            required.forEach(function(key, i){
                if ( !spec.hasOwnProperty(key) || spec[key] === undefined ){
                    throw new SpecException("missing spec", key);
                }
            });

            try{

                filter.width( spec.width );
                filter.height( spec.height );
                filter.rows( spec.rows );
                filter.padding( spec.padding );
                filter.margins( spec.margins );
                filter.group( spec.group );
                filter.dimension( spec.dimension );

            } catch(e) {
                //something went wrong
                console.error( "spec exception: ", e );

            } finally {}

            _quadrantWidth = _width - _margins.left - _margins.right;
            _quadrantHeight = _height - _margins.top - _margins.bottom;

            /* determine image grid dimensions -- images first */
            _per_row = Math.ceil(_group.size()/_rows);
            var width_full = Math.floor( _quadrantWidth / _per_row );
            _wpad = width_full * _padding;
            _iwidth = Math.floor(width_full - _wpad / 2);

            /* fallback to circles */
            var radius_full = Math.floor( _quadrantWidth * 0.90 / (2 * _per_row) );
            _rpad = radius_full * _padding;
            _radius = radius_full - _rpad / 2;

            _filters = _group.all().map(function(d, i){
               return d.key;
            });

        };
        configure( spec );

        Object.preventExtensions(filter);
        return filter;
    };


    /**
     * TableChart
     * @constructor container d3-selection to insert into
     * @param container { object } d3 selection
     * @param spec { object } map of initial config options
     */
    TableChart = function( container, spec ) {

        /* START variable declarations  */
        if (!TableChart.id){ TableChart.id = 0; }
        var
            id = TableChart.id++
            , chart = {}

            , _fields = []
            , _field_names = []

            , _dimension
            , _parent = container
            , _body
            , _table, _theader, _tbody, _row, _row_enter
            , _data = []
            , _num_records = 0
            , _limit = Infinity
            , _sortKey
            , _dataKey
            , SpecException
            , configure
            ;

        /* END variable declarations  */

        /* START helpers */
        /* END helpers */

        /* START chart render */
        chart.render = function(){

            if(!_body){

                /* render a group element to append chart */
                _body = _parent.append("div")
                    .attr({
                        class: "tc-body"
                    })
                ;

                /* render a <table> element */
                _table = _body.append("table")
                    .attr({
                        class: "tc-table"
                    })
                ;

                /* render a <tr> rows header */
                _theader = _table.append("thead").append("tr").attr("class", "tc-header");
                _theader.selectAll(".tc-header")
                    .data(_field_names)
                    .enter()
                    .append("th")
                    .attr( "class", function(d, i) {
                        return "tc-header-element column-" + i;
                    })
                    .text(function(d){
                        return d;
                    })
                ;


                /* render the body <tbody> */
                _tbody = _table.append("tbody");
            }

            /* update the x axis -- bar width*/
            _data = _dimension.top(Infinity)
                .sort(function(a, b){
                    if (typeof a[_sortKey] === 'number' && typeof b[_sortKey] === 'number'){
                        return a == null || b == null ? 0 : utils.comparators.numberCompare(a[_sortKey], b[_sortKey]);

                    } else if (typeof a[_sortKey] === 'string' && typeof b[_sortKey] === 'string'){
                        return a == null || b == null ? 0 : utils.comparators.stringCompare(a[_sortKey], b[_sortKey]);
                    }
                })
            ;

            _num_records = _data.length;
            _data = _data.slice(0, Math.min(_limit, _num_records));

            /* bind the data, use dataKey as the value to associate each row with */
            _row = _tbody.selectAll("tr")
                         .data(_data, function(d, i){ return d[_dataKey]; });

            _theader.selectAll(".tc-header-element").data(_fields).on('click', function(k, i){
                _row.sort(function (a, b) {
                    if (typeof a[k] === 'number' && typeof b[k] === 'number'){
                        return a == null || b == null ? 0 : utils.comparators.numberCompare(a[k], b[k]);

                    } else if (typeof a[k] === 'string' && typeof b[k] === 'string'){
                        return a == null || b == null ? 0 : utils.comparators.stringCompare (a[k], b[k]);
                    }
                });
            });

            /* render <tr> rows and append data */
            _row_enter = _row.enter()
                            .append("tr")
                            .attr({
                                class: "tc-row"
                            })
            ;

            /* Loop over _fields elements and add <td> */
            _fields.forEach(function(field){
                _row_enter.append("td")
                    .attr({
                        class: "tc-element"
                    })
                    .text(function(d) { return d[field]; })
                ;
            });

            _row.exit().remove();

        };
        /* END chart render */

        /* START Exceptions */
        SpecException = function( message, val ) {
            var detail = String();
            if(val){
                detail += ": " + val;
            }
            this.message = message + detail;
            this.name = "SpecException";
        };
        /* END Exceptions */

        /* START getters & setters */
        chart.id = function(){
            return id;
        };

        chart.dimension = function(_) {
            if (!arguments.length) return _dimension;
            _dimension = utils.validators.validate_object(_);
            return chart;
        };

        chart.fields = function(_){
            if(!arguments.length) return _fields;
            _fields = utils.validators.validate_fields(_, chart.dimension());
            return chart;
        };

        chart.field_names = function(_){
            if(!arguments.length) return _field_names;
            _field_names = utils.validators.validate_field_names(_);
            return chart;
        };

        chart.limit = function(_){
            if(!arguments.length) return _limit;
            _limit = utils.validators.validate_positive_number(_);
            return chart;
        };

        chart.sortKey = function(_){
            if(!arguments.length) return _sortKey;
            _sortKey = utils.validators.validate_field(_, chart.dimension());
            return chart;
        };

        chart.dataKey = function(_){
            if(!arguments.length) return _dataKey;
            _dataKey = utils.validators.validate_field(_, chart.dimension());
            return chart;
        };
        /* END getters & setters */

        /* START initialization */
        configure = function( spec ) {

            var required = [
                "dimension",
                "fields",
                "field_names"
            ];

            required.forEach(function (key, i) {
                if (!spec.hasOwnProperty(key) || spec[key] === undefined) {
                    throw new SpecException("missing spec", key);
                }
            });


            try {
                chart.dimension(spec.dimension);
                chart.fields(spec.fields);
                chart.field_names(spec.field_names);

                /* set default sortKey and dataKey*/
                chart.sortKey(chart.fields()[0]);
                chart.dataKey(chart.fields()[0]);

            } catch (e) {
                //something went wrong
                console.error("spec exception: ", e);

            } finally {
            }
        };

        configure( spec );

        Object.preventExtensions(chart);
        return chart;
    };

    /**
    * BarChart
    * @constructor container d3-selection to insert into
    * @param container { object } d3 selection
    * @param spec { object } map of initial config options
    */
    BarChart = function( container, spec ) {

        /* START variable declarations  */
        if (!BarChart.id){ BarChart.id = 0; }
        var
          id = BarChart.id++
        , chart = {}

        , _width, _height, _margins, _quadrantWidth, _quadrantHeight
        , _group, _dimension
        , _parent = container, _svg, _body, _g_brush
        , _brush = d3.svg.brush()
        , _xScale, _yScale
        , _xAxis = d3.svg.axis()
        , _yAxis = d3.svg.axis()
        , _x_axis, _y_axis
        , _x_label = String()
        , _y_label = String()
        , _step, _padding, _bar_width
        , barPath, resizePath, get_bar_width
        , init_brush_handlers
        , SpecException
        , configure
        ;
        /* END variable declarations  */

        /* START helpers */
        get_bar_width = function( xScale, step, padding ){
            var   domain
                , nSteps
                , bar_width
                ;

            domain = xScale.domain();
            nSteps = (domain[1] - domain[0]) / step;
            bar_width = Math.floor( (xScale(domain[1]) - xScale(domain[0])) / nSteps );

            //drop by a fraction of the 'full' width calculated
            return Math.max(0, bar_width - padding * bar_width);
        };

        /* brush events */
        /*
         * dispatch.on(type[, listener])
         * Adds or removes an event listener for the specified type.
         * The type is a string event type name, such as "start" or "end".
         * The specified listener is invoked with the context and arguments
         * determined by the caller; see dispatch.
         *
         * If an event listener was already registered for the same type,
         * the existing listener is removed before the new listener is added.
         * To register multiple listeners for the same event type, the type may
         * be followed by an optional namespace, such as "click.foo" and
         * "click.bar". Likewise, you can remove all registered listeners for
         * a given namespace by saying dispatch.on(".foo", null).
         */
        init_brush_handlers = function( brush, xScale, dimension ){
            brush.on("brushstart.chart", function() {
                var div = d3.select(this.parentNode.parentNode.parentNode);
                div.select(".title a").style("display", null);
            });

            brush.on("brush.chart", function() {
                var body = d3.select(this.parentNode), //body
                    extent = brush.extent();

//                console.log(extent);
//                console.log(xScale.domain());
//                console.log(xScale(extent[0]));

                body.select("#clip-" + id + " rect")
                    .attr("x", xScale(extent[0]))
                    .attr("width", xScale(extent[1]) - xScale(extent[0]));
                dimension.filterRange(extent);
            });

            brush.on("brushend.chart", function() {
                if (brush.empty()) {
                    var div = d3.select(this.parentNode.parentNode.parentNode);
                    div.select(".title a").style("display", "none");
                    div.select("#clip-" + id + " rect").attr("x", null).attr("width", "100%");
                    dimension.filterAll();
                }
            });
        };

        /*
        * selection.attr(name[, value])
         If value is specified, sets the attribute with the specified name to the specified value
         on all selected elements. If value is a constant, then all elements are given the
         same attribute value; otherwise, if value is a function, then the function is
         evaluated for each selected element (in order), being passed the current datum d and
         the current index i, with the this context as the current DOM element. The function's
         return value is then used to set each element's attribute. A null value will remove the
         specified attribute.
         If value is not specified, returns the value of the specified attribute for the first
         non-null element in the selection. This is generally useful only if you know that the
         selection contains exactly one element.
         The specified name may have a namespace prefix, such as xlink:href, to specify an
         "href" attribute in the XLink namespace. By default, D3 supports svg, xhtml,
         xlink, xml, and xmlns namespaces. Additional namespaces can be registered by
         adding them to d3.ns.prefix using dot notation.
         name can also be an Object of name and value attributes.
        */
        barPath = function( groups, index, xScale, yScale, bar_width, quadrantHeight ) {
            var path = [],
                i = -1,
                n = groups.length,
                d;

            while (++i < n) {
                d = groups[i];

                path.push("M",
                    xScale(d.key) - bar_width / 2, ",", quadrantHeight, //start
                    "V",                                 //up
                    yScale(d.value),                       //dy
                    "h",                                 //across
                    String(bar_width),                     //dx
                    "V",                                 //down
                    quadrantHeight);                        //dy
            }
            return path.join("");
        };

        resizePath = function(d, i, quadrantHeight) {
            var e = +(d == "e"),
                x = e ? 1 : -1,
                y = quadrantHeight / 3;

            return "M" + (.5 * x) + "," + y
                + "A6,6 0 0 " + e + " " + (6.5 * x) + "," + (y + 6)
                + "V" + (2 * y - 6)
                + "A6,6 0 0 " + e + " " + (.5 * x) + "," + (2 * y)
                + "Z"
                + "M" + (2.5 * x) + "," + (y + 8)
                + "V" + (2 * y - 8)
                + "M" + (4.5 * x) + "," + (y + 8)
                + "V" + (2 * y - 8);
        };
        /* END helpers */

        /* START chart render */
        chart.render = function(){

            if(!_svg){

                /* render the svg element */
                _svg = _parent.append("svg")
                    .attr({
                        class       : "bc-svg"
                        , height    : _height
                        , width     : _width
                    })
                ;

                /* render a group element to append chart */
                _body = _svg.append("g")
                    .attr({
                        class: "bc-body"
                        , transform: "translate(" + _margins.left + "," + _margins.top + ")"
                    })
                ;

                /* render the clipPath (foreground mask)*/
                _body.append("clipPath")
                    .attr({
                        id: "clip-" + id
                    })
                    .append('rect')
                    .attr({
                        width: _quadrantWidth
                        , height: _quadrantHeight
                    })
                ;

                /* render the x-axis at the bottom */
                _x_axis = _body.append("g")
                    .attr({
                        class: "bc x axis"
                        , transform: "translate(0," + _quadrantHeight + ")"
                    })
                    .call(_xAxis)
                ;

                _x_axis.append("text")
                    .attr({
                        class : "bc x label",
                        x : ( ( _quadrantWidth + _margins.left ) / 2 ),
                        y : 40
                    })
                    .style("text-anchor", "end")
                    .text(_x_label)
                ;

                /* render the y-axis to the left */
                _y_axis = _body.append("g")
                    .attr({
                        class: "bc y axis"
                        , transform: "translate(0,0)"
                    })
                    .call(_yAxis)
                ;

                _y_axis.append("text")
                    .attr({
                        class : "bc y label",
                        transform : "rotate(-90)",
                        x : -( (_quadrantHeight - _margins.bottom ) / 2 ),
                        y : - 45
                    })
                    .style("text-anchor", "end")
                    .text(_y_label)
                ;

                _body.selectAll(".bar")
                    .data(["background", "foreground"]) //order matters
                    .enter()
                    .append('path')
                    .attr("class", function(d){ return d + " bar"; })
                ;

                _body.selectAll(".foreground.bar")
                    .attr("clip-path", "url(#clip-" + id + ")")
                ;

                /* render the brush */
                _g_brush = _body.append("g")
                    .attr({
                        class: "brush"
                    })
                    .call(_brush)
                ;
                _g_brush.selectAll("rect")
                    .attr({
                        height: _quadrantHeight
                    })
                ;
                _g_brush.selectAll(".resize")
                    .append("path")
                    .attr({
                        d: function(d, i){ return resizePath(d, i, _quadrantHeight); }
                    })
                ;


            }

            /* update the y axis */
            _yScale.domain([0, _group.top(1)[0].value]);
            _y_axis.transition().duration(250).call(_yAxis);

            /* render the (foreground, background) paths */
            _body.selectAll(".bar").datum(_group.all());

            /* render the bars as a path*/
            _body.selectAll(".bar").transition().duration(250).attr("d", function(groups, index){
                return barPath(groups, index, _xScale, _yScale, _bar_width, _quadrantHeight);
            })
            ;

        };
        /* END chart render */


        /* START Exceptions */
        SpecException = function( message, val ) {
            var detail = String();
            if(val){
                detail += ": " + val;
            }
            this.message = message + detail;
            this.name = "SpecException";
        };
        /* END Exceptions */

        /* START getters & setters */
        chart.id = function(){
            return id;
        };

        chart.xAxis = function(_){
            if(!arguments.length) return _xAxis;
            _xAxis = _;
            return chart;
        };

        chart.yAxis = function(_){
            if(!arguments.length) return _yAxis;
            _yAxis = _;
            return chart;
        };

        chart.xLabel = function(_){
            if(!arguments.length) return _x_label;
            _x_label = utils.validators.validate_text(_);
            return chart;
        };

        chart.yLabel = function(_){
            if(!arguments.length) return _y_label;
            _y_label = utils.validators.validate_text(_);
            return chart;
        };

        chart.xScale = function(_){
            if(!arguments.length) return _xScale;
            _xScale = utils.validators.validate_function(_);
            _xAxis.scale(_xScale);
            _brush.x(_xScale);
            return chart;
        };

        chart.yScale = function(_){
            if(!arguments.length) return _yScale;
            _yScale = utils.validators.validate_function(_);
            _yAxis.scale(_yScale);
            return chart;
        };

        chart.margins = function(_){
            if(!arguments.length) return _margins;
            _margins = utils.validators.validate_positive_number(_);
            return chart;
        };

        chart.group = function(_){
            if(!arguments.length) return _group;
            _group = utils.validators.validate_object(_);
            return chart;
        };

        chart.dimension = function(_) {
            if (!arguments.length) return _dimension;
            _dimension = utils.validators.validate_object(_);
            return chart;
        };

        /* width */
        chart.width = function(_){
            if(!arguments.length) return _width;
            _width = utils.validators.validate_positive_number(_);
            return chart;
        };

        /* height */
        chart.height = function(_){
            if(!arguments.length) return _height;
            _height = utils.validators.validate_positive_number(_);
            return chart;
        };

        chart.bar_width = function(_){
            if(!arguments.length) return _bar_width;
            _bar_width = utils.validators.validate_positive_number(_);
            return chart;
        };

        chart.brush = function(_){
            return _brush;
        };

        chart.step = function(_){
            if(!arguments.length) return _step;
            _step = utils.validators.validate_positive_number(_);
            return chart;
        };

        chart.padding = function(_){
            if(!arguments.length) return _padding;
            _padding = utils.validators.validate_fractional_number(_);
            return chart;
        };
        /* END getters & setters */

        /* START initialization */
        configure = function( spec ){

            var required = [
                "width",
                "height",
                "margins",
                "group",
                "dimension",
                "xScale",
                "yScale",
                "padding",
                "step"
            ];

            required.forEach(function(key, i){
                if ( !spec.hasOwnProperty(key) || spec[key] === undefined ){
                    throw new SpecException("missing spec", key);
                }
            });


            try{
                chart.width(spec.width);
                chart.height(spec.height);
                chart.margins(spec.margins);
                chart.group(spec.group);
                chart.dimension(spec.dimension);
                chart.xScale(spec.xScale);
                chart.yScale(spec.yScale);
                chart.padding(spec.padding);
                chart.step(spec.step);

            } catch(e) {
                //something went wrong
                console.error( "spec exception: ", e );

            } finally {}

            _quadrantWidth = _width - _margins.left - _margins.right;
            _quadrantHeight =_height - _margins.top - _margins.bottom;
            _xAxis.scale(_xScale).orient("bottom");
            _yAxis.scale(_yScale).orient("left");
            _brush.x(_xScale);
            _bar_width = get_bar_width( _xScale, _step, _padding );
            init_brush_handlers( _brush, _xScale, _dimension );
        };
        configure( spec );


        /* d3.rebind(target, source, name_i), i = 1, 2, 3, ....
        * Copies the source.name_i from source to target, and
        * returns target. Calling one of the named methods on the target object
        * invokes the same-named method on the source object, passing any
        * arguments passed to the target method, and using the source object
        * as the 'this' context. If the source method returns the source object,
        * the target method returns the target object (“setter” method);
        * otherwise, the target method returns the return value of the source
        * method (“getter” mode). The rebind operator allows inherited methods
        * (mix-ins) to be rebound to a subclass on a different object.
        */
        d3.rebind(chart, _brush, "on");
        Object.preventExtensions(chart);

        return chart;
        //permits call to "chart.on('brushstart' || 'brush' || 'brushend [, listener])'".
    };


    /**
     * BarChart_XO
     * @constructor container d3-selection to insert into
     * @param container { object } d3 selection
     * @param spec { object } map of initial config options
     */
    BarChart_XO = function( container, spec ) {

        /* START variable declarations  */
        if (!BarChart_XO.id){ BarChart_XO.id = 0; }
        var
            id = BarChart_XO.id++
            , chart = {}

            , _width, _height, _margins, _quadrantWidth, _quadrantHeight
            , _group, _dimension
            , _num_records = 0
            , _order, _tooltip
            , _parent = container, _svg, _body, _bar
            , _xScale, _yScale
            , _xAxis = d3.svg.axis()
            , _yAxis = d3.svg.axis()
            , _x_axis, _y_axis
            , _x_label = String()
            , _y_label = String()
            , _bar_width
            , _key, _value, _sortKey
            , _fields
            , _data = []
            , _limit = Infinity

            , SpecException, ConfigurationException
            , configure
            ;
        /* END variable declarations  */

        /* START helpers */
        /* END helpers */

        /* START order */
        var order = function(sort){

            var x0, transition, delay, value;

            if(sort === "_key"){

                value = _sortKey;


            }else if(sort === "_value"){

                value = _value;

            }else{
                return;
            }

            // Copy-on-write since tweens are evaluated after a delay.

            x0 = _xScale.domain(
                    _data.sort(function (a, b) {
                        if (typeof a[value] === 'number' && typeof b[value] === 'number'){
                            return a == null || b == null ? 0 : utils.comparators.numberCompare(a[value], b[value]);

                        } else if (typeof a[value] === 'string' && typeof b[value] === 'string'){
                            return a == null || b == null ? 0 : utils.comparators.stringCompare(a[value], b[value]);
                        }
                    })
                    .map(function(d) { return d[_key]; })
                )
                .copy();




            transition = _svg.transition().duration(750);
            delay = function(d, i) { return i * 50; };

            transition.selectAll("rect")
                .delay(delay)
                .attr("x", function(d) { return x0(d[_key]); });

            transition.select(".x.axis")
                .call(_xAxis)
                .selectAll("g")
                .delay(delay);
        };


        /* START chart render */
        chart.render = function(){

            if(!_svg){

                _tooltip = _parent.append("div")
                                .attr({
                                    class : "tooltip"
                                })
                                .style("opacity", 0)
                ;

                _order = _parent.append("div")
                    .attr({
                        class : "sort"
                    })
                ;


                _order.append("span")
                    .attr({
                        class : "key"
                    })
                    .text("Sort: ")
                ;

                _order.append("a")
                    .attr({
                        class : "order",
                        href: "#_value"
                    })
                    .text("Value ")
                ;

                _order.append("a")
                    .attr({
                        class : "order",
                        href: "#_key"
                    })
                    .text("Name ")
                ;

                d3.selectAll(".order").each(function(d, i){
                    var self = d3.select(this);
                    self.on("click", function(){
                        order(d3.select(this).attr("href").split("#")[1]);
                    });
                });


                /* render the svg element */
                _svg = _parent.append("svg")
                    .attr({
                        class       : "bc-svg"
                        , height    : _height
                        , width     : _width
                    })
                ;

                /* render a group element to append chart */
                _body = _svg.append("g")
                    .attr({
                        class: "bc-body"
                        , transform: "translate(" + _margins.left + "," + _margins.top + ")"
                    })
                ;

                /* render the x-axis at the bottom */
                _x_axis = _body.append("g")
                    .attr({
                        class: "bc x axis"
                        , transform: "translate(0," + _quadrantHeight + ")"
                    })
                    .call(_xAxis)
                ;

                _x_axis.append("text")
                    .attr({
                        class : "bc x label",
                        x : ( ( _quadrantWidth + _margins.left - _x_label.length ) / 2 ),
                        y : 40
                    })
                    .style("text-anchor", "end")
                    .text(_x_label)
                ;

                /* render the y-axis to the left */
                _y_axis = _body.append("g")
                    .attr({
                        class: "bc y axis"
                        , transform: "translate(0,0)"
                    })
                    .call(_yAxis)
                ;

                _y_axis.append("text")
                    .attr({
                        class : "bc y label",
                        transform : "rotate(-90)",
                        x : -( (_quadrantHeight - _margins.bottom - _y_label.length * 2 ) / 2 ),
                        y : - 35
                    })
                    .style("text-anchor", "end")
                    .text(_y_label)
                ;
            }

            /* update the x axis -- bar width*/
            _data = _dimension.top(Infinity)
                .sort(function(a, b){
                    if (typeof a[_value] === 'number' && typeof b[_value] === 'number'){
                        return a == null || b == null ? 0 : utils.comparators.numberCompare(a[_value], b[_value]);

                    } else if (typeof a[value] === 'string' && typeof b[value] === 'string'){
                        return a == null || b == null ? 0 : utils.comparators.stringCompare(a[_value], b[_value]);
                    }
                })
            ;
            _num_records = _data.length;
            _data = _data.slice(0, Math.min(_limit, _num_records));

            _xScale.domain(_data.map(function(d, i){ return d[_key]; }));

            _bar_width = _xScale.rangeBand();
            if(_bar_width < 0.1){
                throw new ConfigurationException("bar_width below threshold", _bar_width);
            }

            /* update the y axis */
            _yScale.domain([ Math.min(0, Math.floor(d3.min(_data, function(d, i){ return d[_value]; }))) - 0.5,
                Math.ceil(d3.max(_data, function(d, i){ return d[_value]; }))
            ]);
            _y_axis.transition().duration(250).call(_yAxis);

            /* render the bars */
            _bar = _body.selectAll(".bar").data(_data, function(d, i){ return d[_key]; });

            _bar.transition().duration(750)
                .attr({
                    class: "bar",
                    x: function(d, i){
                        return _xScale(d[_key]);
                    },
                    y: function(d, i){
                        return _yScale(d[_value]);
                    },
                    width: _bar_width,
                    height: function(d, i){
                        return _quadrantHeight - _yScale(d[_value]);
                    }
                });

            _bar.enter()
                .append("rect")
                .attr({
                    class: "bar",
                    x: function(d, i){
                        return _xScale(d[_key]);
                    },
                    y: function(d, i){
                        return _yScale(d[_value]);
                    },
                    width: _bar_width,
                    height: function(d, i){
                        return _quadrantHeight - _yScale(d[_value]);
                    }
                })
                .on("mouseover", function(d) {
                    _tooltip.transition()
                        .duration(200)
                        .style("opacity", .9);
                    _tooltip.html(function(){
                        var base = ["<ul>"];
                        _fields.map(function(field, i){
                            base.push( "<li><b>" + field + "</b>: " + String(d[field]) + "</li>");
                        });
                        base.push("</ul>");
                        return base.join("");
                    })
                        .style("left", (d3.event.pageX - 70) + "px")
                        .style("top", (d3.event.pageY + 50) + "px");
                })
                .on("mouseout", function(d) {
                    _tooltip.transition()
                        .duration(500)
                        .style("opacity", 0);
                });




            _bar.exit().remove();

        };
        /* END chart render */


        /* START Exceptions */
        SpecException = function( message, val ) {
            var detail = String();
            if(val){
                detail += ": " + val;
            }
            this.message = message + detail;
            this.name = "SpecException";
        };

        ConfigurationException = function( message, val ) {
            var detail = String();
            if(val){
                detail += ": " + val;
            }
            this.message = message + detail;
            this.name = "ConfigurationException";
        };
        /* END Exceptions */

        /* START getters & setters */
        chart.id = function(){
            return id;
        };

        chart.xAxis = function(_){
            if(!arguments.length) return _xAxis;
            _xAxis = _;
            return chart;
        };

        chart.yAxis = function(_){
            if(!arguments.length) return _yAxis;
            _yAxis = _;
            return chart;
        };

        chart.xLabel = function(_){
            if(!arguments.length) return _x_label;
            _x_label = utils.validators.validate_text(_);
            return chart;
        };

        chart.yLabel = function(_){
            if(!arguments.length) return _y_label;
            _y_label = utils.validators.validate_text(_);
            return chart;
        };

        chart.xScale = function(_){
            if(!arguments.length) return _xScale;
            _xScale = utils.validators.validate_function(_);
            _xAxis.scale(_xScale);
            return chart;
        };

        chart.yScale = function(_){
            if(!arguments.length) return _yScale;
            _yScale = utils.validators.validate_function(_);
            _yAxis.scale(_yScale);
            return chart;
        };

        chart.margins = function(_){
            if(!arguments.length) return _margins;
            _margins = utils.validators.validate_positive_number(_);
            return chart;
        };

        chart.group = function(_){
            if(!arguments.length) return _group;
            _group = utils.validators.validate_object(_);
            return chart;
        };

        chart.dimension = function(_) {
            if (!arguments.length) return _dimension;
            _dimension = utils.validators.validate_object(_);
            _num_records = _dimension.top(Infinity).length;
            return chart;
        };

        /* width */
        chart.width = function(_){
            if(!arguments.length) return _width;
            _width = utils.validators.validate_positive_number(_);
            return chart;
        };

        /* height */
        chart.height = function(_){
            if(!arguments.length) return _height;
            _height = utils.validators.validate_positive_number(_);
            return chart;
        };

        chart.bar_width = function(_){
            if(!arguments.length) return _bar_width;
            _bar_width = utils.validators.validate_positive_number(_);
            return chart;
        };

        chart.key = function(_){
            if(!arguments.length) return _key;
            _key = utils.validators.validate_text(_);
            return chart;
        };

        chart.value = function(_){
            if(!arguments.length) return _value;
            _value = utils.validators.validate_text(_);
            return chart;
        };

        chart.fields = function(_, dimension){
            if(!arguments.length) return _fields;
            _fields = utils.validators.validate_fields(_, dimension);
            return chart;
        };

        chart.limit = function(_){
            if(!arguments.length) return _limit;
            _limit = utils.validators.validate_positive_number(_);
            return chart;
        };

        chart.sortKey = function(_){
            if(!arguments.length) return _sortKey;
            _sortKey = utils.validators.validate_text(_);
            return chart;
        };



        /* END getters & setters */

        /* START initialization */
        configure = function( spec ){

            var required = [
                "width",
                "height",
                "margins",
                "group",
                "dimension",
                "xScale",
                "yScale",
                "key",
                "value",
                "fields"
            ];

            required.forEach(function(key, i){
                if ( !spec.hasOwnProperty(key) || spec[key] === undefined ){
                    throw new SpecException("missing spec", key);
                }
            });


            try{
                chart.width(spec.width);
                chart.height(spec.height);
                chart.margins(spec.margins);
                chart.group(spec.group);
                chart.dimension(spec.dimension);
                chart.xScale(spec.xScale);
                chart.yScale(spec.yScale);
                chart.key(spec.key);
                chart.sortKey(spec.key);
                chart.value(spec.value);
                chart.fields(spec.fields, _dimension);

            } catch(e) {
                //something went wrong
                console.error( "spec exception: ", e );

            } finally {}

            _quadrantWidth = _width - _margins.left - _margins.right;
            _quadrantHeight = _height - _margins.top - _margins.bottom;
            _xAxis.scale(_xScale).orient("bottom");
            _yAxis.scale(_yScale).orient("left");
            _xScale.domain(_dimension.top(_limit).map(function(d, i){ return d[_key]; }));
            _bar_width = _xScale.rangeBand();

        };
        configure( spec );
        Object.preventExtensions(chart);

        return chart;
    };

    return {
          BarChart      : BarChart
        , TableChart    : TableChart
        , ToggleFilter  : ToggleFilter
        , BarChart_XO   : BarChart_XO
    }

}());
