/**
 * gvt.js
 * Root namespace module for GVTCharts
 **/
/* global window, d3 */

'use strict';
(function(){

    data.forEach(function(d,i){
        d.assists       = +d.assists;
        d.dgvt          = +d.dgvt;
        d.games_played  = +d.games_played;
        d.goals         = +d.goals;
        d.gvt           = +d.gvt;
        d.ogvt          = +d.ogvt;
        d.plus_minus    = +d.plus_minus;
        d.points        = +d.points;
        d.rank          = +d.rank;
        d.sgvt          = +d.sgvt;

        var teams = d.team.split(",");
        d.team          = (teams[teams.length - 1]).trim();
    });

    /* START cross filter configuration */
        var
        cf = crossfilter(data)

        , names_dimension = cf.dimension(function(d){ return d.last_name; })
        , names_group = names_dimension.group(function(d){ return d; })

        , gvt_step = 0.5
        , gvt_dimension = cf.dimension(function(d){ return Math.floor(d.gvt / gvt_step) * gvt_step; })
        , gvt_group = gvt_dimension.group(function(d){ return d; })

        , goals_dimension = cf.dimension(function(d){ return d.goals; })
        , goals_group = goals_dimension.group(function(d){ return d; })

        , table_dimension = cf.dimension(function(d){ return d; })

        , teams_dimension = cf.dimension(function(d){ return d.team; })
        , teams_group = teams_dimension.group(function(d){ return d; })
        ;

    /* END cross filter configuration */

    /* START Global config options */
    var
          width = 250
        , height = 250
        , margins = { top: 40, left: 60, right: 10, bottom: 50 }
        , quadrant_height = height - margins.top - margins.bottom
        , quadrant_width = width - margins.left - margins.right
    ;

    /* END Global config options */

    /* START bar chart - gvt raw configuration */
        var
          key = "player"
        , value = "gvt"
        , bc_names_fields = ["player", "rank", "position", "team", "gvt", "goals", "assists", "points", "plus_minus"]
        , bc_names_spec = {
              height    : height
            , width     : width * 2
            , margins   : margins
            , dimension : names_dimension
            , group     : names_group
            , xScale    : d3.scale
                            .ordinal()
                            .rangeRoundBands([0, width * 2 - margins.left - margins.right], 0.1)
            , yScale    : d3.scale
                            .linear()
                            .domain([ Math.floor(d3.min(data, function(d, i){ return d.value })) - 0.5,
                                Math.ceil(d3.max(data, function(d, i){ return d.value }))
                            ])
                            .rangeRound([quadrant_height, 0])
            , key: key
            , value: value
            , fields: bc_names_fields
        }
        , bc_names_container = d3.select( '#bar-chart-long' )
        , bc_names_chart = jacob.BarChart_XO(bc_names_container, bc_names_spec)
        ;

        bc_names_chart.sortKey("last_name");
        bc_names_chart.xAxis().tickValues([]);
        bc_names_chart.yAxis().ticks(5);
        bc_names_chart.xLabel("Player");
        bc_names_chart.yLabel("Goals vs Threshold");
        bc_names_chart.limit(50);


    /* END bar chart - gvt raw configuration */

    /* START bar chart - goals configuration */
        var
        bc_goals_spec = {
              height    : height
            , width     : width
            , margins   : margins
            , dimension : goals_dimension
            , group     : goals_group
            , xScale    : d3.scale
                .linear()
                .domain([ -0.5, d3.max( goals_group.all().map(function(d, i){ return d.key; })) + 1 ])
                .rangeRound([0, quadrant_width])
            , yScale    : d3.scale
                .linear()
                .domain([0, goals_group.top(1)[0].value])
                .rangeRound([quadrant_height, 0])
            , step      : 1
            , padding   : 0.15
        }

        , bc_goals_container = d3.select( '#bar-chart' )
        , bc_goals_chart = jacob.BarChart(bc_goals_container, bc_goals_spec)
        ;
        bc_goals_chart.xAxis().ticks(10);
        bc_goals_chart.yAxis().ticks(5);
        bc_goals_chart.xLabel("Goals");
        bc_goals_chart.yLabel("Count");
    /* END bar chart - goals configuration */


    /* START bar chart - gvt configuration */
        var
        bc_spec = {
              height    : height
            , width     : width
            , margins   : margins
            , dimension : gvt_dimension
            , group     : gvt_group
            , xScale    : d3.scale
                .linear()
                .domain([ d3.min( gvt_group.all().map(function(d,i){ return d.key; })) - gvt_step,
                        d3.max( gvt_group.all().map(function(d,i){ return d.key; })) + 2 * gvt_step
                ])
                .rangeRound([0, quadrant_width])
            , yScale    : d3.scale
                .linear()
                .domain([0, gvt_group.top(1)[0].value])
                .rangeRound([quadrant_height, 0])
            , step      : gvt_step
            , padding   : 0.15
        }
        , bc_container = d3.select( '#bar-chart' )
        , bc_chart = jacob.BarChart(bc_container, bc_spec)
        ;

        bc_chart.xAxis().ticks(10);
        bc_chart.yAxis().ticks(5);
        bc_chart.xLabel("Goals vs Threshold");
        bc_chart.yLabel("Count");
    /* END bar chart - gvt configuration */


    /* START ToggleFilter configuration */
        var
          f_width = 2 * width
        , f_height = 460
        , f_rows = 5
        , f_padding = 0.1
        , f_margins = { top: 10, left: 20, right: 0, bottom: 0 }
        , f_spec = {
              height    : f_height
            , width     : f_width
            , rows      : f_rows
            , padding   : f_padding
            , margins   : f_margins
            , dimension : teams_dimension
            , group     : teams_group
        }
        , f_container = d3.select( '#toggle-filter' )
        , filter = jacob.ToggleFilter( f_container, f_spec );

        filter.formatter(function(d, i){
            var names = d.split(" ");
            return names.length ? names[names.length - 1] : d;
        });

        filter.endpoint("/static/jeffreyvwong/images/hp/logos/");
//        filter.endpoint("logos/");


    /* END ToggleFilter configuration */

    /* START table chart configuration */
        var
        tc_fields = [
            "last_name", "first_name", "team", "position",
            "goals", "assists", "points", "plus_minus", "gvt", "games_played"
        ]

        , tc_field_names = [
            "Last name", "First", "Team", "Pos",
            "G", "A", "P", "+/-", "GVT", "GP"
        ]

        , tc_spec = {
              dimension   : table_dimension
            , fields      : tc_fields
            , field_names : tc_field_names
        }
        , tc_container
        , tc_chart
        ;

        tc_container = d3.select( '#table-chart' );
        tc_chart = jacob.TableChart(tc_container, tc_spec);
        tc_chart.limit(Infinity);
        tc_chart.sortKey("gvt");
        tc_chart.dataKey("player");

    /* END table  chart configuration */

    /* START CONTROLLER */
        var charts, lists, filters;
        charts = [bc_names_chart, bc_chart, bc_goals_chart];
        lists = [tc_chart];
        filters = [filter];

        //register listeners on the brushable graphs
        charts.forEach( function(chart){
            if( chart.hasOwnProperty("brush") ){
                chart.on("brush", renderAll).on("brushend", renderAll);
            }
        });

        // Renders the specified chart or list.
        function render(graphic) {
            try{
                graphic.render();
            } catch(e){
                console.error("%s: %s", e.name, e.message);
            }
        }

        // Whenever the brush moves, re-rendering everything.
        function renderAll() {
            charts.forEach(render);
            lists.forEach(render);
            filters.forEach(render);
        }

        renderAll();

        d3.select('.tf-body').on('click', renderAll);
    /* END CONTROLLER */


}());