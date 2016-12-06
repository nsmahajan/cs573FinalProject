function TreeMap(parentPage){
		this.parentPage = parentPage;
}

TreeMap.prototype.updateChart = function(selectedCollege){
	var _self = this;

	var headers=["PCIP01", "PCIP03", "PCIP04", "PCIP05", "PCIP09", "PCIP10", "PCIP11", "PCIP12", "PCIP13", "PCIP14", "PCIP15", "PCIP16", 
			"PCIP19", "PCIP22", "PCIP23", "PCIP24", "PCIP25", "PCIP26", "PCIP27", "PCIP29", "PCIP30", "PCIP31", "PCIP38", "PCIP39", 
			"PCIP40", "PCIP41", "PCIP42", "PCIP43", "PCIP44", "PCIP45", "PCIP46", "PCIP47", "PCIP48", "PCIP49", "PCIP50", "PCIP51",
			"PCIP52", "PCIP54"];
		
	var filteredData = [];
	var courses = this.parentPage.data.courses;
	var dat = this.parentPage.data.collegeData;
	var result = [];
	var noDataAvailable = [];
	var students = [];
	
	d3.select('.grandparent').remove();
	d3.select('.grandRect').remove();
	d3.select('.treemapGroup').remove();
	d3.select('.title').remove();
	d3.select('.parent').remove();	
	d3.select('.child').remove();	

	if(selectedCollege.length > 0)
	{
	dat.forEach(function(d) {
					for(var i=0; i<selectedCollege.length; i++)
					{
						if(d.INSTNM == selectedCollege[i])
						{
							filteredData.push(d);
						}
					}
				});
				
	  var lines=filteredData;
	  for(var i=0;i<lines.length;i++){
		  var obj = {},
			stud_obj = {};
		  var tempResult = [];
		  var dataAllNull = true;
		  var currentline=lines[i];
		  for(var j=0;j<headers.length;j++)
		  {
			for(var key in currentline)
			{
				for(var course in courses)
				{
				if((key == headers[j]) && (currentline.hasOwnProperty(key)) && (courses[course].code == key) )
				{
					if(currentline[key] != "0" && currentline[key] != "NULL"){
						dataAllNull = false;
						obj={};
						stud_obj={};
						obj["key"] = courses[course].course;
						obj["college"]=currentline.INSTNM;
						obj["value"]= +currentline[key];//+((+currentline[key] * 100).toFixed(2));
						//result.push(obj);
						stud_obj["key"] = courses[course].course;
						stud_obj["college"] = currentline.INSTNM;
						stud_obj["value"] = currentline.UGDS;
						tempResult.push(obj);
						students.push(stud_obj);
					}
				}
				}
			}
		  }
		  
		  console.log(tempResult);
		  if(dataAllNull == true){
			noDataAvailable.push(currentline.INSTNM);
		  }else{
			  for(var k = 0;k < tempResult.length; k++)
				 result.push(tempResult[k]); 
		  }
	  }
	
	this.noData(noDataAvailable);
	
	var svg = d3.select('.rankChart')
	var margin = {top: 40, right: 0, bottom: 0, left: 0};
	var width = +svg.attr("width") - margin.left - margin.right;
	var height = +svg.attr("height") - margin.top - margin.bottom - 36 + 16;
	var transitioning;
  
	var tooltipCourse = d3.select('body').append('div')
				.attr('class', 'tooltipCourse hidden');
	
	var color = d3.scale.ordinal()
				.domain(function(d) { return d.college;})
				.range(["#a6cee3","#1f78b4","#b2df8a","#33a02c","#fb9a99","#e31a1c","#fdbf6f","#ff7f00","#cab2d6","#6a3d9a"]);
		
	var x = d3.scale.linear()
			.domain([0, width])
			.range([0, width]);
  
	var y = d3.scale.linear()
			.domain([0, height])
			.range([0, height]);
  
	var treemap = d3.layout.treemap()
					.children(function(d, depth) { return depth ? null : d._children; })
					.sort(function(a, b) { return a.value - b.value; })
					.ratio(height / width * 0.5 * (1 + Math.sqrt(5)))
					.round(false);
  
  var gouter = svg.append("g")
      .attr("transform", "translate(" + margin.left + "," + margin.top + ")")
      .style("shape-rendering", "crispEdges")
	  .attr("class", "treemapGroup");
	  
  var grandparent = gouter.append("g")
      .attr("class", "grandparent");
  
  grandparent.append("rect")
	  .attr("class","grandRect")
      .attr("y", -margin.top)
      .attr("width", width)
      .attr("height", margin.top);
  
  grandparent.append("text")
      .attr("x", 6)
      .attr("y", 6 - margin.top)
      .attr("dy", ".75em")
	  .attr("font-family","sans-serif")
	  .attr("font-size","1em");
    
var data = d3.nest().key(function(d) { return d.college; }).key(function(d) { return d.key; }).entries(result);
var root = {key: "College", values: data};
var formatNumber = d3.format(",d");

  initialize(root);
  accumulate(root);
  layout(root);
  display(root);

  function initialize(root) {
    root.x = root.y = 0;
    root.dx = width;
    root.dy = height;
    root.depth = 0;
  }

  // Aggregate the values for internal nodes. This is normally done by the
  // treemap layout, but not here because of our custom implementation.
  // We also take a snapshot of the original children (_children) to avoid
  // the children being overwritten when when layout is computed.
  function accumulate(d) {
    return (d._children = d.values)
        ? d.value = d.values.reduce(function(p, v) { return p + accumulate(v); }, 0)
        : d.value;
  }

  // Compute the treemap layout recursively such that each group of siblings
  // uses the same size (1×1) rather than the dimensions of the parent cell.
  // This optimizes the layout for the current zoom state. Note that a wrapper
  // object is created for the parent node for each group of siblings so that
  // the parent’s dimensions are not discarded as we recurse. Since each group
  // of sibling was laid out in 1×1, we must rescale to fit using absolute
  // coordinates. This lets us use a viewport to zoom.
  function layout(d) {
    if (d._children) {
      treemap.nodes({_children: d._children});
      d._children.forEach(function(c) {
        c.x = d.x + c.x * d.dx;
        c.y = d.y + c.y * d.dy;
        c.dx *= d.dx;
        c.dy *= d.dy;
        c.parent = d;
        layout(c);
      });
    }
  }

  function display(d) {
	  if(selectedCollege.length != 0)
	  {
		grandparent.datum(d.parent)
					.on("click", transition)
					.select("text")
					.text(name(d));

    var g1 = gouter.insert("g", ".grandparent")
        .datum(d)
        .attr("class", "depth");

    var g = g1.selectAll("g")
        .data(d._children)
      .enter().append("g");

    g.filter(function(d) { return d._children; })
        .classed("children", true)
        .on("click", transition)
		.on('mousemove', function(d) {
			  // this variable will be used in a loop to store the current node being inspected
			  var currentNode = d;
			  // this array will hold the names of each subsequent parent node
			  var nameList = [currentNode.name];
			  // as long as the current node has a parent...
			  while (typeof currentNode.parent === 'Object') {
				// go up a level in the hierarchy
				currentNode = currentNode.parent;
				// add the name to the beginning of the list
				nameList.unshift(currentNode.key);
			  }
			  // now nameList should look like ['flare','animate','interpolate']
			  //  join the array with slashes (as you have in your example)
			  nameList = nameList.join('/');
			  // now nameList should look like 'flare/animate/interpolate'
			  //  use this to set the tooltip text
			  var temp =0;
			  for(var i=0; i<students.length; i++)
			  {
				  if((students[i].college == currentNode.key) || (students[i].college == currentNode.parent.key))
				  {
					  temp = students[i].value;
				  }
			  }
			  var mouse = d3.mouse(svg.node()).map(function(d) {
				return parseInt(d);
				});
				tooltipCourse.classed('hidden', false)
				.attr('style', 'left:' + (mouse[0] + 150) +
						'px; top:' + (mouse[1] +90) + 'px')
				.html("Students: " + Math.round(currentNode.value * temp));
		
			  //$('#tooltip').text('Mouse hovering ' + nameList + '. Cell size = ' + d.area);
			})
			.on('mouseout', function() {
			tooltipCourse.classed('hidden', true);
		});

    var children = g.selectAll(".child")
        .data(function(d) { return d._children || [d]; })
      .enter().append("g");

    children.append("rect")
        .attr("class", "child")
        .call(rect)
      .append("title")
        .text(function(d) { return d.key; });
    children.append("text")
        .attr("class", "ctext")
        .text(function(d) { return d.key; })
		.attr("font-family","sans-serif")
		.attr("font-size","0.9em");
        
    g.append("rect")
        .attr("class", "parent")
        .call(rect);

/* Adding a foreign object instead of a text object, allows for text wrapping */
		g.append("foreignObject")
			.call(rect)
			.attr("class","foreignobj")
			.append("xhtml:div") 
			.attr("dy", ".35em")
			.html(function(d) {
				if(d._children == undefined)
					{
						 var temp =0;
						  for(var i=0; i<students.length; i++)
						  {
							  if((students[i].college == d.college) || (students[i].college == d.parent.key))
							  {
								  temp = students[i].value;
							  }
						  }
						return '<div>' + d.key + '<br>' + Math.round(d.value * temp)+'</div>';
					}
					else
						return '<div>' + d.key +'</div>';
				})
			.attr("class","textdiv"); //textdiv class allows us to style the text easily with CSS

    g.selectAll("rect")
        .style("fill", function(d) { return color(d.college); });

    function transition(d) {
      if (transitioning || !d) return;
      transitioning = true;

      var g2 = display(d),
          t1 = g1.transition().duration(750),
          t2 = g2.transition().duration(750);

      // Update the domain only after entering new elements.
      x.domain([d.x, d.x + d.dx]);
      y.domain([d.y, d.y + d.dy]);

      // Enable anti-aliasing during the transition.
      gouter.style("shape-rendering", null);

      // Draw child nodes on top of parent nodes.
      gouter.selectAll(".depth").sort(function(a, b) { return a.depth - b.depth; });

      // Fade-in entering text.
      g2.selectAll("text").style("fill-opacity", 0);

      // Transition to the new view.
      t1.selectAll(".ptext").call(text).style("fill-opacity", 0);
      t2.selectAll(".ptext").call(text).style("fill-opacity", 1);
      t1.selectAll("rect").call(rect);
      t2.selectAll("rect").call(rect);

	  t1.selectAll(".textdiv").style("display", "none"); /* added */
	  t1.selectAll(".foreignobj").call(foreign); /* added */
	  t2.selectAll(".textdiv").style("display", "block"); /* added */
	  t2.selectAll(".foreignobj").call(foreign); /* added */ 			


      // Remove the old node when the transition is finished.
      t1.remove().each("end", function() {
        gouter.style("shape-rendering", "crispEdges");
        transitioning = false;
      });
    }

    return g;
	  }
  }

  function text(text) {
    text.attr("x", function(d) { return x(d.x) + 6; })
        .attr("y", function(d) { return y(d.y) + 6; });
  }

  function text2(text) {
    text.attr("x", function(d) { return x(d.x + d.dx) - this.getComputedTextLength() - 6; })
        .attr("y", function(d) { return y(d.y + d.dy) - 6; })
        .style("opacity", function(d) { return this.getComputedTextLength() < x(d.x + d.dx) - x(d.x) ? 1 : 0; });
  }

  function rect(rect) {
    rect.attr("x", function(d) { return x(d.x); })
        .attr("y", function(d) { return y(d.y); })
        .attr("width", function(d) { return x(d.x + d.dx) - x(d.x); })
        .attr("height", function(d) { return y(d.y + d.dy) - y(d.y); });
  }
 function foreign(foreign){ /* added */
			foreign.attr("x", function(d) { return x(d.x); })
			.attr("y", function(d) { return y(d.y); })
			.attr("width", function(d) { return x(d.x + d.dx) - x(d.x); })
			.attr("height", function(d) { return y(d.y + d.dy) - y(d.y); });
		}
 
  function name(d) {
    return d.parent
        ? name(d.parent) + " / " + d.key: d.key;
  }
}
}

TreeMap.prototype.noData = function(noDataAvailable) {
	var htmlContent = "* Courses data currently not available for ";
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
		$(".noDataCourses").html(htmlContent);
	}else{
		$(".noDataCourses").html("");
	}

}