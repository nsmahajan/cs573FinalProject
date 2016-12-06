function LoanChart(parentPage){
	this.parentPage = parentPage;
	
	this.svg = d3.select(".loanChart"),
	this.marginSlope = {top: 30, right: 10, bottom: 10, left: 10},
    this.widthSlope = +this.svg.attr("width") - this.marginSlope.left - this.marginSlope.right,
    this.heightSlope = +this.svg.attr("height") - this.marginSlope.top * 3 - this.marginSlope.bottom;
	

	this.xSlope = d3.scale.ordinal().rangePoints([50, 500],1),
		
    this.ySlope = {};

	this.ySlopeScale = d3.scale.linear()
		.range([(this.heightSlope-20), 0])
		.domain([0,100]);
}

LoanChart.prototype.updateChart = function(selectedCollege) {
	var _self = this;
	
	d3.select(".parallelCo").remove(); 
	d3.select(".tooltiploan").remove();
	
		var colorSlope = d3.scale.ordinal()
				.range(["#a6cee3","#1f78b4","#b2df8a","#33a02c","#fb9a99","#e31a1c","#fdbf6f","#ff7f00","#cab2d6","#6a3d9a"]);

	var ySlopeAxis = d3.svg.axis()
                  .scale(this.ySlopeScale);

				  
	
		
	var line = d3.svg.line(),
		axis = d3.svg.axis().orient("left"),
    background,
    foreground,
	title;
	
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
					eval(name).PELL = (100 * d.PCTPELL);
					eval(name).Federal = (100 * d.PCTFLOAN);
					eval(name).UGDS = d.UGDS;
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
		return d != "names" && d!= "UGDS" &&(_self.ySlope[d] = d3.scale.linear()
		.domain([0,100])
		.range([_self.heightSlope, 0]));
	}));
	
	/*var tip = d3.tip()
				  .attr('class', 'd3-tip')
				  .offset([-10, 0])
				  .html(function(d) {
					return d.names +"<br>Total: " + d.UGDS+" "+ "students"+"<br> Pell Grant: " + Math.round((d.PELL/100) * d.UGDS)+" "+"students"+ "<br>Federal Grant:" + Math.round((d.Federal/100) * d.UGDS)+" "+"students";
				  });
				
	svgParallel.call(tip);	*/

	var tooltip = d3.select('body').append('div')
				.attr('class', 'hidden tooltip');
				
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
							.attr("stroke", function(d) { return colorSlope((d.names));})
							.attr("stroke-width", "1.5px")
							.on('mousemove', function(d) {
								var mouse = d3.mouse(svg.node()).map(function(d) {
									return parseInt(d);
								});
								tooltip.classed('hidden', false)
									.attr('style', 'left:' + (mouse[0] + 120) +
											'px; top:' + (mouse[1] - 5) + 'px')
									.html(d.names +"<br>Total: " + d.UGDS+" "+ "students"+"<br> Pell Grant: " + Math.round((d.PELL/100) * d.UGDS)+" "+"students"+ "<br>Federal Grant:" + Math.round((d.Federal/100) * d.UGDS)+" "+"students");
							})
							.on('mouseout', function() {
								tooltip.classed('hidden', true);
							});
							//.on("mouseover", tip.show)
							//.on("mouseout", tip.hide);

 
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
	.attr("stroke-width","1.5px")
	.attr("y", -15)
	.attr("fill", "black")
	.style("font-size","0.9em")
	.text(function(d) { return d+" Grant"; });
	
	// title
   title = this.svg.append("g")
	  .attr("class", "title")
	  .attr("transform", "translate(" +0 + "," + 0+ ")")
	  .append("text")
	  .attr("x", 85)
	  .attr("y", 20)
	  .style("font-size", "0.9em")
	  .style("font-family", "sans-serif")
	  .text("Percentage(%) of Students who received PELL/Federal Funding");

	// legend
	var legend = svgParallel.selectAll(".slopelegend")
				.data(colorSlope.domain())
				.enter().append("g")
				.attr("class", "slopelegend")
				.attr("transform", function(d, i) { return "translate(0," + i * 20 + ")"; });

	// legend colored rectangles
	legend.append("rect")
		.attr("x", this.widthSlope-350)
		.attr("width", 18)
		.attr("height", 18)
		.style("fill", colorSlope);

	// legend text
	legend.append("text")
		.attr("x", this.widthSlope - 320)
		.attr("y", 9)
		.attr("dy", ".35em")
		.style("text-align", "left")
		.style("font-size","0.9em")
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