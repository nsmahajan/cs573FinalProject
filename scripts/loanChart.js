function LoanChart(parentPage){
	this.parentPage = parentPage;
	
	this.svg = d3.select(".loanChart"),
	this.marginSlope = {top: 30, right: 10, bottom: 100, left: 10},
    this.widthSlope = +this.svg.attr("width") - this.marginSlope.left - this.marginSlope.right,
    this.heightSlope = +this.svg.attr("height") - this.marginSlope.top * 3 - this.marginSlope.bottom;
	

	this.xSlope = d3.scale.ordinal().rangePoints([50, 500],1),
		
    this.ySlope = {};

	this.ySlopeScale = d3.scale.linear()
		.range([(this.heightSlope-20), 0])
		.domain([0,100]);
}

LoanChart.prototype.updateChart = function(selectedCollege,state,school) {
	var _self = this;
	
	d3.select(".parallelCo").remove(); 
	d3.select(".tooltiploan").remove();
	d3.select(".title").remove();
	if(selectedCollege.length > 0)
	{
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
		.attr("transform", "translate(" + -100 + "," + this.marginSlope.top * 2 + ")")
		.attr("class","parallelCo");
		
	var data =[];
	var noDataAvailable = [];
	
	this.parentPage.data.collegeData.forEach(function(d) {
		for(var i=0; i<selectedCollege.length; i++)
		{
			for(var j=0; j<state.length; j++)
			{
				for(var k=0; k<school.length; k++)
				{
					if((d.INSTNM == selectedCollege[i]) && (d.STABBR == state[j]) && (d.CONTROL == school[k]))
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

	var tooltip = d3.select('body').append('div')
				.attr('class', 'hidden d3-tip');
				
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
							.attr("stroke-width", "4px")
							.on('mousemove', function(d) {
								var mouse = d3.mouse(this);
								tooltip.classed('hidden', false)
									.attr('style', 'left:' + (mouse[0] + 250) +
											'px; top:' + (mouse[1] + 400) + 'px')
									.html(d.names +"<br>Total: " + d.UGDS+" "+ "students"+"<br> Pell Grant: " + Math.round((d.PELL/100) * d.UGDS)+" "+"students"+ "<br>Federal Grant:" + Math.round((d.Federal/100) * d.UGDS)+" "+"students");
							})
							.on('mouseout', function() {
								tooltip.classed('hidden', true);
							});
 
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
	  .attr("transform", "translate(" + -80 + "," + 0+ ")")
	  .append("text")
	  .attr("x", 85)
	  .attr("y", 20)
	  .style("font-size", "0.9em")
	  .style("font-family", "sans-serif")
	  .text("Percentage(%) of Students who received PELL/Federal Funding");



	// Returns the path for a given data point.
	function path(d) {
		return line(dimensions.map(function(p) { 
		return [_self.xSlope(p), _self.ySlope[p](d[p])]; }));
	}
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

LoanChart.prototype.wrap = function(text, width) {
    text.each(function () {
        var text = d3.select(this),
            words = text["0"]["0"].__data__.split(/\s+/).reverse(),
            word,
            line = [],
            lineNumber = 0,
            lineHeight = 1.1, // ems
            x = text.attr("x"),
            y = text.attr("y"),
            dy = 0,
            tspan = text.text(null)
                        .append("tspan")
                        .attr("x", x)
                        .attr("y", y)
                        .attr("dy", dy + "em");
        while (word = words.pop()) {
            line.push(word);
            tspan.text(line.join(" "));
            if (tspan.node().getComputedTextLength() > width) {
                line.pop();
                tspan.text(line.join(" "));
                line = [word];
                tspan = text.append("tspan")
                            .attr("x", x)
                            .attr("y", y)
                            .attr("dy", ++lineNumber * lineHeight + dy + "em")
                            .text(word);
            }
        }
    });
}