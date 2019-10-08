import React from 'react';
import ReactTable from 'react-table';
import 'react-table/react-table.css';

class Changed extends React.Component {
	render() {
		
		return (
		    (this.props.changedData && ((this.props.changedData.attributesData && this.props.changedData.attributesData.length>0) || (this.props.changedData.geometryData))) ?
		    <React.Fragment>
		    	{(this.props.changedData.attributesData && this.props.changedData.attributesData.length>0) ? 
		    	<div>
	    		    <div className={'paPopupChangeType'}>The attributes have changed:</div>
	        		<ReactTable 
	                    className={'changeTable'}
	                    showPagination={false} 
	                    minRows={0}
	                    data={this.props.changedData.attributesData}
	                    columns={[{ Header: 'Attribute', accessor: 'attribute'}, { Header: this.props.fromVersion, accessor: 'previous'}, { Header: this.props.toVersion, accessor: 'current'}]}
	        		/> 
	        	</div> : null}
				<div style={{display: (this.props.changedData.geometryData) ? 'block' : 'none'}}>
					<div className={'paPopupChangeType'}>The geometry has changed:</div>
					<div className={'geometryChangeDiv'}>{this.props.changedData.geometryData}</div>
				</div>
        	</React.Fragment>
    		: null
		);
	}
}

export default Changed;