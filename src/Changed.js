import React from 'react';
import ReactTable from 'react-table';
import 'react-table/react-table.css';

class Changed extends React.Component {
	renderFrom(row){
		return <div title={row.original.previous}>{row.original.previous}</div>;        
	}
	renderTo(row){
		return <div title={row.original.current}>{row.original.current}</div>;        
	}
	render() {
		return (
		    (this.props.changedData && ((this.props.changedData.attributesData && this.props.changedData.attributesData.length>0) || (this.props.changedData.geometryData))) ?
		    <React.Fragment>
		    	{(this.props.changedData.attributesData && this.props.changedData.attributesData.length>0) ? 
		    	<React.Fragment>
	    		    <div className={'paPopupChangeType'}>The attributes have changed:</div>
	        		<ReactTable 
	                    className={'changeTable'}
	                    showPagination={false} 
	                    minRows={0}
	                    data={this.props.changedData.attributesData}
	                    columns={[{ Header: 'Attribute', accessor: 'attribute',headerStyle: { 'textAlign': 'left' }}, { Header: this.props.fromVersion.title, accessor: 'previous',headerStyle: { 'textAlign': 'left' }, Cell: this.renderFrom.bind(this)}, { Header: this.props.toVersion.title, accessor: 'current',headerStyle: { 'textAlign': 'left' }, Cell: this.renderTo.bind(this)}]}
	        		/> 
	        	</React.Fragment> : null}
	        	{(this.props.changedData.geometryData) ?
				<React.Fragment>
					<div className={'paPopupChangeType'}>The geometry has changed:</div>
					<div className={'geometryChangeDiv'}>{this.props.changedData.geometryData}</div>
				</React.Fragment> : null}
        	</React.Fragment>
    		: null
		);
	}
}

export default Changed;