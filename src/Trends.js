import React from 'react';
import { LineChart, Line,XAxis, YAxis } from 'recharts';

class Trends extends React.Component {
    renderCustomAxisTick(e) {
      return (
        <span>{this.props.global_trends[e.index].from}</span>
      );
    }
    
    render() {
    const renderLineChart = (
      <LineChart width={400} height={300} data={this.props.global_trends}>
        <Line type="monotone" dataKey="sum" stroke="#8884d8" />
        <XAxis dataKey="version" tick={this.renderCustomAxisTick.bind(this)}/>
        <YAxis />
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
