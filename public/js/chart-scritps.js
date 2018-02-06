
/*
funcion outputs the hight for the graph based on the current screensize
*/
function getHeightforChart() {
	var minimumHeight = 300;
	var currentViewportHeight = Math.max(document.documentElement.clientHeight, window.innerHeight || 0);
	if (currentViewportHeight*0.5 < 300 ) return minimumHeight;
	else return currentViewportHeight*0.4;
}


/*
Set Data vor Chart
*/
let data = {
	labels: ["Jan 4", "Jan 5", "Jan 6", "Jan 7", "Jan 8", "Jan 9"],

	datasets: [
		{
			title: "Collateral",
			values: [212, 245, 120, 342, 252, 298]
      },
		{
			title: "Liquidation price",
			values: [180, 224, 80, 312, 236, 242]
      },
		{
			title: "High risc",
			values: [150, 198, 45, 286, 202, 218]
      },
		{
			title: "Loan",
			values: [86, 101, 23, 212, 104, 120]
      }
    ]
};

/*
Create chart with https://frappe.github.io/charts/
*/

var chart = new Chart({
	parent: "#chart", // or a DOM element
	title: "",
	data: data,
	type: 'line',
	height: getHeightforChart(),
	colors: ['#fff', '#e74c3c', '#e74c3c',  '#3498db'],
	format_tooltip_x: d => d,
	format_tooltip_y: d => d + ' <span class="typo-light">&#36;</span>'
});

