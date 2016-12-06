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

	var legendText = [">600", "401-600", "301-400", "201-300","101-200", "0-100"];

	var width = +svg.attr("width");
	var height = +svg.attr("height");
	
	var projection = d3.geo.albersUsa()
					.scale([1000]);
        
	var path = d3.geo.path()
				.projection(projection);

	var color = d3.scale.linear()
				.range(["#ffffcc","#41ab5d","#006837"])
				.domain([2,400,800]);
	
	var data1 = d3.nest()
				  .key(function(d) {
					return d.STABBR;
				})
				  .rollup(function(d) { 
				   return d3.sum(d, function(g) {return 1; });
				  }).entries(this.data.collegeData);
	
	var tooltip = d3.select('body').append('div')
				.attr('class', 'hidden tooltip');
				
	
	
	var quantize = d3.scale.quantize()
					.domain([d3.min(data1, function(d) { return d.values; }), d3.max(data1, function(d) { return d.values; })])
					.range(d3.range(9).map(function(i) { return i; }));		
	
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
				.attr('style', 'left:' + (mouse[0] + 120) +
						'px; top:' + (mouse[1] - 5) + 'px')
				.html(_self.getSchoolTypeCount(d));
		})
		.on('mouseout', function() {
			tooltip.classed('hidden', true);
		});
		
	var w = 140, h = 400;

			var key = d3.select(".maplegend").append("svg")
						 .attr("width", w).attr("height", h);

			var legend = key.append("defs")
							.append("svg:linearGradient")
							.attr("id", "gradient")
							.attr("x1", "100%")
							.attr("y1", "0%")
							.attr("x2", "100%")
							.attr("y2", "100%")
							.attr("spreadMethod", "pad");

			legend.append("stop")
				  .attr("offset", "0%")
				  .attr("stop-color", "#006837")
				  .attr("stop-opacity", 1);

			legend.append("stop")
				  .attr("offset", "100%")
				  .attr("stop-color", "#ffffcc")
				  .attr("stop-opacity", 1);

			key.append("rect")
			   .attr("width", w - 100)
			   .attr("height", h - 100)
			   .style("fill", "url(#gradient)")
			   .attr("transform", "translate(0,10)");

			var y = d3.scale.linear().range([300, 0]).domain([2, 800]);

			var yAxis = d3.svg.axis().scale(y).orient("right");

			key.append("g")
			   .attr("class", "y axis")
			   .attr("transform", "translate(41,10)")
			   .call(yAxis).append("text")
			   .attr("transform", "rotate(-90)")
			   .attr("x", 0)
			   .attr("y", 38)
			   .attr("dy", ".71em")
			   .style("text-anchor", "end")
			   .text("(number of colleges)");
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
	var stateActualName = "";
	var value = "";
	
	for(var i = 0; i < this.data.usStates.length; i++){
		if(d.id == this.data.usStates[i].id){
			stateName = this.data.usStates[i].code;
			stateActualName = this.data.usStates[i].name;
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
	
	value = '<div style="text-align:center">'+ stateActualName + "</div>"+ "Total : " + (publicCount+privateNonProfitCount+privateProfitCount) +"<br>Public : " + publicCount + "<br> Private ( Profit ) : " + privateProfitCount + "<br> Private ( Non-Profit ) : " + privateNonProfitCount;
	return value;
}