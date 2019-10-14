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
	        default:
	            // code
	    }
		return (
		    <span className={classname}>{text}</span>
		);
	}
}

export default Status;