$(window).load(function () {
	var mainPage = new MainPage();
	mainPage.loadData();
});

function MainPage(){
	this.landingPage = null;
	this.chartPage = null;
	this.data = null;
}
var _self
MainPage.prototype.loadData = function(){
	_self = this;
	
	queue()
	.defer(d3.csv, "/scripts/data/collegeData.csv")
	.defer(d3.tsv, "/scripts/data/us-state-names.tsv")
	.defer(d3.json, "/scripts/data/us.json")
	.defer(d3.csv, "/scripts/data/course.csv")
	.await(function(error, collegeData, stateNames, us, courses) {
		if (error) {
			console.error('Oh dear, something went wrong: ' + error);
		}
		else {
			_self.data = new Data(collegeData,stateNames,us, courses);
			_self.landingPage = new LandingPage(_self.data, _self);
			_self.landingPage.show();
			
			$('.landingPage').show();
		}
	}
);
}


MainPage.prototype.loadChartPage = function(){
	$('.landingPage').css('display', 'none');
	$('.chartPage').css('display', 'block');
	
	var _self = this;
	_self.chartPage = new ChartPage(_self.data, _self);
} 