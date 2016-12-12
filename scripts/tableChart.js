function TableChart(parentPage){
    this.parentPage = parentPage;
}

TableChart.prototype.updateChart = function(state,school) {
	var _self = this;
	var mappedData = [];
	
	
	var ADMmax = d3.mean(this.parentPage.data.collegeData , function(d) { if (d.ADM_RATE != "NULL" ) return parseFloat(d.ADM_RATE * 100);});
	var TuitionInMax = d3.mean(this.parentPage.data.collegeData , function(d) { if (d.TUITIONFEE_IN != "NULL" ) return parseFloat(d.TUITIONFEE_IN);});
	var TuitionOutMax = d3.mean(this.parentPage.data.collegeData , function(d) { if (d.TUITIONFEE_OUT != "NULL" ) return parseFloat(d.TUITIONFEE_OUT);});
	var SalaryMax = d3.mean(this.parentPage.data.collegeData , function(d) { if (d.MN_EARN_WNE_P10 != "NULL" && d.MN_EARN_WNE_P10 != "PrivacySuppressed" ) return parseFloat(d.MN_EARN_WNE_P10);});	
	
	for(var i = 0; i < this.parentPage.data.collegeData.length; i++){
		var dataRow = this.parentPage.data.collegeData[i];
		var obj = new Object();
		var per = 0;
		for(var j=0; j<state.length; j++)
		{
			for(var k=0; k<school.length; k++)
			{

			if(state[j] == dataRow.STABBR && school[k] == dataRow.CONTROL)
			{
				if (dataRow.ADM_RATE != "NULL" )
				{
					//per = (((+dataRow.ADM_RATE * 100) / ADMmax)*100).toFixed(2);
					per = ((((+dataRow.ADM_RATE * 100) - ADMmax) * 100) / ADMmax).toFixed(2);
				}
				obj.admPer = per;
				
				per = 0;
				if (dataRow.TUITIONFEE_IN != "NULL" )
				{
					//per = (((+dataRow.TUITIONFEE_IN) / TuitionInMax)*100).toFixed(2);
					per = (((+dataRow.TUITIONFEE_IN - TuitionInMax) * 100) / TuitionInMax).toFixed(2);
				}
				obj.instatePer = per;
				
				per = 0;
				if (dataRow.TUITIONFEE_OUT != "NULL" )
				{
					//per = (((+dataRow.TUITIONFEE_OUT) / TuitionOutMax)*100).toFixed(2);
					per = (((+dataRow.TUITIONFEE_OUT - TuitionOutMax) * 100) / TuitionOutMax).toFixed(2);
				}
				obj.outstatePer = per;
				
				per = 0;
				if (dataRow.MN_EARN_WNE_P10 != "NULL" && dataRow.MN_EARN_WNE_P10 != "PrivacySuppressed" )
				{
					//per = (((+dataRow.MN_EARN_WNE_P10) / SalaryMax)*100).toFixed(2);
					per = (((+dataRow.MN_EARN_WNE_P10 - SalaryMax) * 100) / SalaryMax).toFixed(2);
					
				}
				obj.salaryPer = per;
				
				obj.name = dataRow.INSTNM;
				obj.state = dataRow.STABBR;
				
				if(dataRow.CONTROL == "1")
				{
					obj.type = "Public";
				}
				else if(dataRow.CONTROL == "2")
				{
					obj.type ="Private (Profit)";
				}
				else
				{
					obj.type = "Private (Non-Profit)";
				}
				obj.population = (dataRow.UGDS == "NULL") ? 0 : +dataRow.UGDS;
				obj.salary = ((dataRow.MN_EARN_WNE_P10 == "NULL" ) || ((dataRow.MN_EARN_WNE_P10 == "PrivacySuppressed" ))) ? 0 : +dataRow.MN_EARN_WNE_P10;
				obj.instate = ((dataRow.TUITIONFEE_IN == "NULL") || ((dataRow.TUITIONFEE_IN == "PrivacySuppressed" )))? 0 : +dataRow.TUITIONFEE_IN;
				obj.outstate = ((dataRow.TUITIONFEE_OUT == "NULL") || ((dataRow.TUITIONFEE_OUT == "PrivacySuppressed" )))? 0 : +dataRow.TUITIONFEE_OUT;

				mappedData.push(obj);	
			}
			}
		}			
	}
	
	var grid;
	var data = [];
 
	data = mappedData.map(function (d) {
        return {"name":d.name,"state":d.state,"type":d.type,"salary":d.salary, "instate":d.instate, "outstate": d.outstate
            ,"population":d.population,"admPer":d.admPer, "instatePer": d.instatePer,"outstatePer":d.outstatePer,"salaryPer": d.salaryPer}

    });

	function requiredFieldValidator(value) {
		if (value == null || value == undefined || !value.length) {
		  return {valid: false, msg: "This is a required field"};
		} else {
		  return {valid: true, msg: null};
		}
	}

	function waitingFormatter(value) {
		return "wait...";
	}

	function renderSparkline(cellNode, rowIdx, dataContext, colDef, cleanupBeforeRender) {
		// the final bool parameter, 'cleanupBeforeRender', indicates the the cell is being
		// re-rendered (ie. has already been rendered) and prior activity should be cleaned
		// up before rendering.
		// In this example we call .empty() regardless, so we can ignore this flag, but
		// if for example a jQueryUI element was being created, then the existing element's
		// .destroy() method should be called prior to creating the new element if this
		// flag is true.

		var vals = [
			dataContext["admPer"],
			dataContext["instatePer"],
			dataContext["outstatePer"],
			dataContext["salaryPer"]
		];
		
		// Sparkline 2's new ability to cache hidden nodes can cause memory leaks if not used
		// correctly. Slickgrid does not use it, so turn it off with 'disableHiddenCheck'.
		$(cellNode).empty().sparkline(vals,
										{
											width: "100%",
											height: 50,
											disableHiddenCheck: true,
											type: "bar",
											barWidth:15,
											chartRangeMin:-100,
											chartRangeMax:100,
											zeroColor: '#191919',
											zeroAxis: true,
											colorMap: ["#e7298a", "#66C2A5", "#FC8D62", "#8DA0CB"],
											tooltipFormat: '{{offset:offset}} {{value}}% {{value:levels}} national average',
											tooltipValueLookups: {
												'offset': {
													0: 'Admission Rate',
													1: 'Instate Tuition Fee',
													2: 'Outstate Tuition Fee',
													3: 'Salary'
												},
												levels: $.range_map({ ':0': 'less than', '0:': 'more than'})
											}
										}
									);

	}

	// this cleanup function must clean up resources and remove the node
	function cleanupSparkline(cellNode, rowIdx, colDef) {
		$(cellNode).remove();
	}

  
	var columns = [
		{id: "name", name: "Institution", field: "name", sortable: true, width: 150, cssClass: "cell-title"},
		{id: "state", name: "State", field: "state", sortable: true, maxWidth: 60},
		{id: "type", name: "School type", field: "type", sortable: true},
		{id: "population", name: "Population", field: "population", sortable: true, editor: Slick.Editors.Integers, width: 40, validator: requiredFieldValidator},
		{id: "salary", name: "Salary($)", field: "salary", sortable: true, editor: Slick.Editors.Integers, width: 40, validator: requiredFieldValidator},
		{id: "instate", name: "Instate Tuition($)", field: "instate", sortable: true, editor: Slick.Editors.Integers, width: 40, validator: requiredFieldValidator},
		{id: "outstate", name: "Outstate Tuition($)", field: "outstate", sortable: true, editor: Slick.Editors.Integers, width: 40, validator: requiredFieldValidator},
		{id: "chart", name: "Chart", sortable: false, width: 40, formatter: waitingFormatter, rerenderOnResize: true,
		asyncPostRender: renderSparkline, asyncPostRenderCleanup: cleanupSparkline}
	];

	var options = {
		multiColumnSort: true,
		editable: true,
		enableAddRow: false,
		enableCellNavigation: true,
		asyncEditorLoading: false,
		enableAsyncPostRender: true,
		enableAsyncPostRenderCleanup: true,
		enableColumnReorder: false,
		forceFitColumns: true,
		rowHeight: 60
	};

	/*data.sort(function(a, b) {
		return parseFloat(+a.salaryPer) - parseFloat(+b.salaryPer);
	});*/

    grid = new Slick.Grid("#myGrid", data, columns, options);
	
	grid.onDblClick.subscribe(function(e, args){
			var cell = grid.getCellFromEvent(e);
			var d = grid.getColumns()[cell.cell];
			_self.parentPage.collegeSelected(data[cell.row].name);
			$("#myGrid li").removeClass("Selected");
		});
		
	grid.onSort.subscribe(function (e, args) {
		var cols = args.sortCols;

		data.sort(function (dataRow1, dataRow2) {
			for (var i = 0, l = cols.length; i < l; i++) {
				var field = cols[i].sortCol.field;
				var sign = cols[i].sortAsc ? 1 : -1;
				var value1 = dataRow1[field], value2 = dataRow2[field];
				var result = (value1 == value2 ? 0 : (value1 > value2 ? 1 : -1)) * sign;
				if (result != 0) {
					return result;
				}
			}
			return 0;
		});
		
		grid.setSelectionModel(new Slick.RowSelectionModel());
		grid.onClick.subscribe(function (e) {
			var cell = grid.getCellFromEvent(e);
			grid.setSelectedRows(cell.row);
			e.stopPropagation();
		});
		grid.invalidate();
		grid.render();
	});
}
