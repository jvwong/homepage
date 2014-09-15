$(document).ready(function() {

     //geoJSON data
     var data_url = "/blogosphere_json";
     var scatter_container, text_container, bound_text;
     var scaling = 1000;
     var xScale, yScale;
     var padding = 50;
     
     /* Width and height */
     var svgW = 750;
     var svgH = 650;
     var rad0 = 10;
     var rad1 = 30;
       
     d3.json(data_url, function(error, data){
                         if (error) {
                            
                              //console.log(error);
                         } else {
                           
                              //console.log(data);
                              
                              /* Scale data */
                              var scatterData = coordsScaled(data.coords_labels, scaling);                    
                              
                              /* Add scatter */
                              var containers = makeScatter(scatterData);
                              var svgContainer = containers[0];
                              scatter_container = containers[1];
                              scatter_container.attr("transform", "translate(-" + padding + ",0)");
                              
                              xScale = containers[2];
                              yScale = containers[3];
                              
                              /* Set text labels */
                              text_container = appendData(svgContainer, scatterData, "text");
                              bound_text = setTextProp(text_container, xScale, yScale, padding, rad0);                   
                              
                              /* Set toggle activity */
                              setToggle('#label-button', bound_text);
                          
                              
                         }            
               
     });
     
     function setTextProp(container, xs, ys, padding, rad) {
          var text = container.text(function(d){ return d[2]; })
                               .attr({ x: function(d, i){ return xs(d[0]) - padding*1.5 ; },
                                       y: function(d, i){ return ys(d[1]) - rad*1.5; },
                                       "font-family": "sans-serif",
                                       "font-size": "0px",
                                       "fill": "black"
                                     });
          return text;
     }

    
    
     function setToggle(id, bound_text) {
          $(id).toggle(
               function(){
                    bound_text
                         .transition()
                         .duration(500)
                         .attr({  "font-size": "10px" });
                              
               },
           
               function(){
                    bound_text.transition()
                         .attr({  "font-size": "0px" });
               }                                   
               
          );
     }
    
     /*Drawing */       
    function makeScatter(data){
                  
          var stroke0 = "#3f3c30";                                
          var fill0 = "#559f84";
          var fill1 = "#ddcf99";
          
          var svg = makeContainer("#shape-container", "svg", svgW, svgH);
          
          /* Set the x,y-scales */
          var xScale = getLinearScale(data , svgW, "xAxis", padding);
          var yScale = getLinearScale(data , svgH, "yAxis", padding);
          
          ///* Set the circles*/
          var bound_1 = appendData(svg, data, "circle");          
          var bound_2 = setShapeProp(bound_1, data , svgW, svgH, padding, xScale, yScale, rad0, stroke0, fill0);
          
          ///* Set mousover properties */
          setMouseover(bound_2, svgW, svgH, rad0, rad1, padding, fill0, fill1); 
          
          return [svg, bound_2, xScale, yScale];
     
    }

    
     function coordsScaled(dataSet, scalingFactor){
          
          datOut = [];
          for (var i = 0; i < dataSet.length; i++){
               datOut[i] = [ (parseFloat(dataSet[i][0]) + 0.5)*scalingFactor, (parseFloat(dataSet[i][1]) + 0.5)*scalingFactor, dataSet[i][2] ] 
          }
          return datOut;
     };

  
    
    
    function setShapeProp(bound, data, svgW, svgH, padding, xScale, yScale, rad, stroke, fill) {
        var shape = bound.attr({ cx: function(d, i){ return xScale(d[0]); },
                                 cy: function(d, i){ return yScale(d[1]); },
                                 r : function(d, i){ return rad },
                             stroke: function(d, i){ return stroke; },                                
                               fill: function(d, i){ return fill; },                                
                            });
        return shape;
    }
    
    
    
    function setMouseover(shapeContainer, w, h, rad0, rad1, padding, fill0, fill1)  {
 
        var bound = shapeContainer.on("mouseover", function(d){
                                        d3.select(this)
                                          .transition()
                                          .duration(200)
                                          .attr({ r : function(d, i){ return rad1; },
                                                fill: function(d, i){ return fill1; },
                                                });
                                          
                                        //Get this bar's x/y values, then augment for the tooltip
                                        var xPosition = parseFloat(d3.select(this).attr("cx")) - rad1*4;
                                        var yPosition = parseFloat(d3.select(this).attr("cy")) - rad1*2;
                                                                                
                                        //Update the tooltip position and value
                                        d3.select("#tooltip")
                                             .style("left", xPosition + "px")
                                             .style("top", yPosition + "px")
                                             .select("#value")
                                             .text(d[2]);
                                        
                                        //console.log(d);
                                        
                                        //Show the tooltip
                                        d3.select("#tooltip").classed("hidden", false);
                                        

                                   })
                                    .on("mouseout", function(d){
                                           d3.select(this)
                                             .transition()
                                             .duration(100)
                                             .attr({ r : function(d, i){ return rad0 },
                                                   fill: function(d, i){ return fill0; },                                
                                                  });
                                            
                                         //Hide the tooltip
                                         d3.select("#tooltip").classed("hidden", true);
                                   });
                               
        return bound;       
    }

    
  
    function getLinearScale(data, rangeMax, axis, padding){
        var scale = d3.scale.linear();
                      
        if (axis == "xAxis") {
            scale.domain([0, d3.max(data, function(d){ return d[0]; })])
                 .range([padding, rangeMax - padding]);
        
        } else if (axis == "yAxis"){
          
            scale.domain([0, d3.max(data, function(d){ return d[1]; })])
                 .range([rangeMax - padding, padding]);                 
        } else {
          
             scale.domain([0, d3.max(data, function(d){ return d[0]; })])
                 .range([padding, rangeMax - padding]);             
        }
                     
        return scale;
    }
    
       
    function makeContainer(selector, child, width, height) {
        
        //Create SVG element
        var svg = d3.select(selector)
                    .append(child)
                    .attr("width", width)
                    .attr("height", height);
                    
        return svg;
    
    }
    
    
    function appendData(container, data, type) {
        
        var bound = container.selectAll(type)
                            .data(data)
                            .enter()
                            .append(type);                          
                                 
        return bound; 
    }
    
     
});   