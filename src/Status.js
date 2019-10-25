import React from 'react';

class Status extends React.Component {
	render() {
	    let classname = "stat " + this.props.status;
	    let text="";
	    switch (this.props.status) {
	        case 'added':
	            text = "++";
	            break;
	        case 'removed':
	            text = "--";
	            break;
	        case 'changed':
	            text = ""; //≠
	            break;
	        case 'total':
	            text = "Σ"; //
	            break;
	        default:
	            // code
	    }
		return (
		    <span className={classname} style={{display: (this.props.hide) ? "none" : "inline"}}>{text}</span>
		);
	}
}

export default Status;