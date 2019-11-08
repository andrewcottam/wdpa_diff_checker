import React from 'react';
import { LineChart, Line,XAxis, YAxis,Tooltip  } from 'recharts';

class Trends extends React.Component {
  tickFormatter(value){
    return value.toLocaleString();
  }
  render() {
    const renderLineChart = (
      <LineChart width={300} height={200} data={this.props.global_trends}>
        <Line type="monotone" dataKey="sum" stroke="#8884d8" />
        <XAxis dataKey="shortTitle" label={{ value: "Version",  angle: 0,   dy: 15}}/>
        <YAxis type="number" domain={['auto', 'auto']} tickFormatter={this.tickFormatter.bind(this)} label={{ value: "Count", angle: -90,   dx: -30}}/>
        <Tooltip />
      </LineChart>
    );    
    return (
      <React.Fragment>
          <div className={'trends'} style={{display:(this.props.showTrends) ? "block" : "none"}}>{renderLineChart}
          </div>
      </React.Fragment>
    );
  }
}

export default Trends;
