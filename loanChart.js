function LoanChart(parentPage){
	this.parentPage = parentPage;
	
	this.svg = d3.select(".loanChart"),
	this.marginSlope = {top: 30, right: 10, bottom: 10, left: 10},
    this.widthSlope = +this.svg.attr("width") - this.marginSlope.left - this.marginSlope.right,
    this.heightSlope = +this.svg.attr("height") - this.marginSlope.top * 3 - this.marginSlope.bottom;

	this.xSlope = d3.scale.ordinal().rangePoints([50, 500],1),
		
    this.ySlope = {};

	this.ySlopeScale = d3.scale.linear()
		.range([this.heightSlope, 0])
		.domain([0,100]);
}

LoanChart.prototype.updateChart = function(selectedCollege) {
	var _self = this;
	
	d3.select(".parallelCo").remove(); 
	
	var colorSlope = d3.scale.category10();
	var c_value = function(d) { return d.names;};
	var ySlopeAxis = d3.svg.axis()
                  .scale(this.ySlopeScale);

		
	var line = d3.svg.line(),
		axis = d3.svg.axis().orient("left"),
    background,
    foreground;
	
	var svgParallel = this.svg.append("g")
		.attr("transform", "translate(" + this.marginSlope.left + "," + this.marginSlope.top * 2 + ")")
		.attr("class","parallelCo");
		
	var data =[];
	var noDataAvailable = [];
	
	this.parentPage.data.collegeData.forEach(function(d) {
		for(var i=0; i<selectedCollege.length; i++)
		{
			if(d.INSTNM == selectedCollege[i])
			{
				if(d.PCTPELL != "NULL" && d.PCTFLOAN != "NULL"){
					var temp = {names: d.INSTNM};
					var name = temp;
					eval(name).names = d.INSTNM;
					eval(name).pell = (100 * d.PCTPELL);
					eval(name).federal = (100 * d.PCTFLOAN);
					data.push(name);
				}else{
					noDataAvailable.push(selectedCollege[i]);
				}
			}
		}
	});
	
	this.noData(noDataAvailable);
	if(data.length != 0){
  // Extract the list of dimensions and create a scale for each.
	this.xSlope.domain(dimensions = d3.keys(data[0]).filter(function(d) {
		return d != "names" &&(_self.ySlope[d] = d3.scale.linear()
		.domain([0,100])
		.range([_self.heightSlope, 0]));
	}));
  
	// Add grey background lines for context.
	background = svgParallel.append("g")
							.attr("class", "background")
							.selectAll("path")
							.data(data)
							.enter().append("path")
							.attr("d", path);
	  

	// Add blue foreground lines for focus.
	foreground = svgParallel.append("g")
							.attr("class", "foreground")
							.selectAll("path")
							.data(data)
							.enter().append("path")
							.attr("d", path)	  
							.attr("stroke", function(d) { return colorSlope(c_value(d));});
 
 
	// Add a group element for each dimension.
	var g = svgParallel.selectAll(".dimension")
					.data(dimensions)
					.enter().append("g")
					.attr("class", "dimension")
					.attr("transform", function(d) { return "translate(" + _self.xSlope(d) + ")"; });

	// Add an axis and title.
	g.append("g")
	.attr("class", "axis")
	.each(function(d) { d3.select(this).call(axis.scale(_self.ySlope[d])); })
	.append("text")
	.style("text-anchor", "middle")
	.attr("y", -9)
	.attr("fill", "black")
	.text(function(d) { return d; });
	
	// legend
	var legend = svgParallel.selectAll(".slopelegend")
				.data(colorSlope.domain())
				.enter().append("g")
				.attr("class", "slopelegend")
				.attr("transform", function(d, i) { return "translate(0," + i * 20 + ")"; });

	// legend colored rectangles
	legend.append("rect")
		.attr("x", this.widthSlope-18)
		.attr("width", 18)
		.attr("height", 18)
		.style("fill", colorSlope);

	// legend text
	legend.append("text")
		.attr("x", this.widthSlope - 24)
		.attr("y", 9)
		.attr("dy", ".35em")
		.style("text-anchor", "end")
		.text(function(d) { return d;})

	// Returns the path for a given data point.
	function path(d) {
		return line(dimensions.map(function(p) { 
		return [_self.xSlope(p), _self.ySlope[p](d[p])]; }));
	}
	}
}	

LoanChart.prototype.noData = function(noDataAvailable) {
	var htmlContent = "* Loan grant data currently not available for ";
	for(var i = 0; i < noDataAvailable.length; i++){
		htmlContent += noDataAvailable[i];
		
		if(i == noDataAvailable.length - 2 && noDataAvailable.length > 1){
			htmlContent += " and "
		}else if(i == noDataAvailable.length - 1){
			htmlContent += ".";
		}else {
			htmlContent += ", ";
		}
	}
	
	if(noDataAvailable.length != 0){
		$(".noDataLoan").html(htmlContent);
	}else{
		$(".noDataLoan").html("");
	}
}