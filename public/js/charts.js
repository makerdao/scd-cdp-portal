import LineChart from './charts/LineChart';

const chartTypes = {
	line: LineChart
};

function getChartByType(chartType = 'line', options) {
	if (!chartTypes[chartType]) {
		return new LineChart(options);
	}

	return new chartTypes[chartType](options);
}

export default class Chart {
	constructor(args) {
		return getChartByType(args.type, arguments[0]);
	}
}

