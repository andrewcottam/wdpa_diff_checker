import React from 'react';
import Status from './Status.js';
class StatsBar extends React.Component {
	render() {
		return (
		    <div className={'statsBar'}>
                <div style={{display:'inline'}}><Status status={'total'} amount={this.props.values.total}/></div>
                <div style={{display: ((this.props.showStatuses.indexOf('added') !==-1)&&this.props.values.added) ? 'inline' : 'none'}}><Status status={'added'} amount={this.props.values.added}/></div>
                <div style={{display: ((this.props.showStatuses.indexOf('removed') !==-1)&&this.props.values.removed) ? 'inline' : 'none'}}><Status status={'removed'} amount={this.props.values.removed}/></div>
                <div style={{display: ((this.props.showStatuses.indexOf('changed') !==-1)&&this.props.values.changed) ? 'inline' : 'none'}}><Status status={'changed'} amount={this.props.values.changed}/></div>
                {/*<div style={{display: ((this.props.showStatuses.indexOf('no_change') !==-1)&&this.props.values.no_change) ? 'inline' : 'none'}}><Status status={'no_change'} amount={this.props.values.no_change}/></div>*/}
            </div>
		);
	}
}

export default StatsBar;