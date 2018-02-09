import React from "react";
import PropTypes from "prop-types";

import { format } from "d3-format";
import { timeFormat } from "d3-time-format";

import {
	curveStepAfter,
} from "d3-shape";

import { ChartCanvas, Chart } from "react-stockcharts";
import {
	LineSeries,
} from "react-stockcharts/lib/series";
import { XAxis, YAxis } from "react-stockcharts/lib/axes";
import {
	CrossHairCursor,
	MouseCoordinateX,
	MouseCoordinateY,
} from "react-stockcharts/lib/coordinates";

import { discontinuousTimeScaleProvider } from "react-stockcharts/lib/scale";
import {
	OHLCTooltip,
} from "react-stockcharts/lib/tooltip";
import { fitWidth } from "react-stockcharts/lib/helper";
import { last } from "react-stockcharts/lib/utils";

class CupChart extends React.Component {
	render() {
	const { type, width, ratio } = this.props;

  const interpolation = curveStepAfter;
  
  const initialData = this.props.prices;
	const margin = { left: 40, right: 30, top: -10, bottom: 30 };

	const height = 400;
	// const gridHeight = height - margin.top - margin.bottom;
	const gridWidth = width - margin.left - margin.right;

	const yGrid = { innerTickSize: -1 * gridWidth, tickStrokeOpacity: 0.2 };
	// const xGrid = { innerTickSize: -1 * gridHeight };

	const xScaleProvider = discontinuousTimeScaleProvider.inputDateAccessor(d => d.date);
	const {
		data,
		xScale,
		xAccessor,
		displayXAccessor,
	} = xScaleProvider(initialData);

	const start = xAccessor(last(data));
	const end = xAccessor(data[Math.max(0, data.length - 150)]);
	const xExtents = [start, end];

	return (
    <ChartCanvas height={height}
			ratio={ratio}
			width={width}
			margin={margin}
			type={type}
			seriesName="MSFT"
			data={data}
			xScale={xScale}
			xAccessor={xAccessor}
			displayXAccessor={displayXAccessor}
      xExtents={xExtents}
      panEvent={false}
      zoomEvent={false}
		>
			<Chart id={1}
        yExtents={[0, this.props.highestValue]}
			>
				<XAxis
					axisAt="bottom"
          orient="bottom"
          stroke="#313D47"
          tickStroke="#9AA3AD"
					// {...xGrid}
				/>
				<YAxis
					axisAt="left"
					orient="left"
					ticks={6}
          {...yGrid}
          stroke="#202930"
          tickStroke="#9AA3AD"
				/>
				<MouseCoordinateX
					at="bottom"
					orient="bottom"
					displayFormat={timeFormat("%Y-%m-%d")} />
				<MouseCoordinateY
					at="left"
					orient="right"
					displayFormat={format(".2f")} />
				<LineSeries
					yAccessor={d => d.collateral}
					interpolation={interpolation}
          stroke="#FFF"
          strokeWidth={2}
				/>
        <LineSeries
					yAccessor={d => d.debt}
					interpolation={interpolation}
          stroke="#3498DB"
          strokeWidth={2}
				/>
        <LineSeries
					yAccessor={d => d.risk}
					interpolation={interpolation}
          stroke="#E74C3C"
          strokeWidth={2}
				/>
				<OHLCTooltip forChart={1} origin={[-40, 0]}/>
			</Chart>
			<CrossHairCursor />
		</ChartCanvas>
		);
	}
}

CupChart.propTypes = {
	// data: PropTypes.array.isRequired,
	width: PropTypes.number.isRequired,
	ratio: PropTypes.number.isRequired,
  type: PropTypes.oneOf(["svg", "hybrid"]).isRequired,
};

CupChart.defaultProps = {
  type: "hybrid",
  disableMouseMoveEvent: true,
  disablePanEvent: true,
  disableZoomEvent: true,
};
CupChart = fitWidth(CupChart);

export default CupChart;
