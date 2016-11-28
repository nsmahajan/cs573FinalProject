function LandingPage(data, parentPage){
	this.parentPage = parentPage;
	this.data = data;
	$('.compareButton').on('click', {key: this}, this.showChartPage);
}

LandingPage.prototype.showChartPage = function(event) {
	event.data.key.parentPage.loadChartPage();
}	
var valueCount = [];

LandingPage.prototype.show = function() {
	var _self = this;
    var svg = d3.select(".usmap");
	//.domain([0,100,200,300,400,600,800]);
	var legendText = [">600", "401-600", "301-400", "201-300","101-200", "0-100"];

	var width = +svg.attr("width");
	var height = +svg.attr("height");
	
	var projection = d3.geo.albersUsa()
					.scale([1000]);
        
	var path = d3.geo.path()
				.projection(projection);

	var color = d3.scale.linear()
				//.range(["#f7fcfd","#e5f5f9","#ccece6","#99d8c9", "#66c2a4", "#41ae76", "#238b45", "#006d2c", "#00441b"])
				.range(["#ffffcc","#addd8e","#78c679","#41ab5d","#238443","#006837"])
				.domain([0,200,300,400,600,800]);
	
	var data1 = d3.nest()
				  .key(function(d) {
					return d.STABBR;
				})
				  .rollup(function(d) { 
				   return d3.sum(d, function(g) {return 1; });
				  }).entries(this.data.collegeData);
	
	//var color = ["#ffffcc","#d9f0a3","#addd8e","#78c679","#41ab5d","#238443","#006837"];

	
	var tooltip = d3.select('body').append('div')
				.attr('class', 'hidden tooltip');
				
	
	
	var quantize = d3.scale.quantize()
					.domain([d3.min(data1, function(d) { return d.values; }), d3.max(data1, function(d) { return d.values; })])
					.range(d3.range(9).map(function(i) { return i; }));		

	var legend = svg.selectAll(".mapLegend")
      			.attr("class", "maplegend")
   				.data(color.domain().slice().reverse())
   				.enter()
   				.append("g")
     			.attr("transform", function(d, i) { return "translate(0," + i * 20 + ")"; });

  	legend.append("rect")
		  .attr("x",0)
		  .attr("y",25)
   		  .attr("width", 18)
   		  .attr("height", 18)
   		  .style("fill", color);

  	legend.append("text")
  		  .data(legendText)
      	  .attr("x", 24)
      	  .attr("y", 34)
      	  .attr("dy", ".25em")
      	  .text(function(d) { return d; });
	
	svg.selectAll("path")
		.data(topojson.feature(this.data.us, this.data.us.objects.states).features)
		.enter()
		.append("path")
		.attr("d", path)
		.style("stroke", "#000")
		.style("stroke-width", "1")
		.style("fill", function(d) {
			return color((_self.getStateCount(d, data1)));
		})
		.on('mousemove', function(d) {
			var mouse = d3.mouse(svg.node()).map(function(d) {
				return parseInt(d);
			});
			tooltip.classed('hidden', false)
				.attr('style', 'left:' + (mouse[0] + 150) +
						'px; top:' + (mouse[1] - 25) + 'px')
				.html(_self.getSchoolTypeCount(d));
		})
		.on('mouseout', function() {
			tooltip.classed('hidden', true);
		});
};

LandingPage.prototype.getStateCount = function(d, data1) {
	var stateName = "";
	var value = 0;
	
	for(var i = 0; i < this.data.usStates.length; i++){
		if(d.id == this.data.usStates[i].id){
			stateName = this.data.usStates[i].code;
			break;
		}
	}
	
	for(var j= 0; j < data1.length; j++){
		if(data1[j].key == stateName){
			value = data1[j].values;
			break;
		}
	}
	valueCount.push(value);
	
	return value;
}

LandingPage.prototype.getSchoolTypeCount = function(d) {
	var publicCount = 0;
	var privateProfitCount = 0;
	var privateNonProfitCount = 0;
	
	var stateName = "";
	var value = "";
	
	for(var i = 0; i < this.data.usStates.length; i++){
		if(d.id == this.data.usStates[i].id){
			stateName = this.data.usStates[i].code;
			break;
		}
	}

	for(var j = 0; j < this.data.collegeData.length; j++){
		if(this.data.collegeData[j].STABBR == stateName){
			switch(this.data.collegeData[j].CONTROL){
				case "1":
					publicCount++;
				break;
				
				case "2":
					privateProfitCount++;
				break;
				
				case "3":
					privateNonProfitCount++;
				break;
			}
		}
	}
	
	value = "Total : " + (publicCount+privateNonProfitCount+privateProfitCount) +"<br>Public : " + publicCount + "<br> Private ( Profit ) : " + privateProfitCount + "<br> Private ( Non-Profit ) : " + privateNonProfitCount;
	return value;
}