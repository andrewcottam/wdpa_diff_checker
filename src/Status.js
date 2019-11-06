import React from 'react';

class Status extends React.Component {
	render() {
	    let classname = "stat " + this.props.status;
	    let text="", title="";
	    let amount = this.props.amount && this.props.amount.toLocaleString();
	    switch (this.props.status) {
	        case 'added':
	            text = "+";
	            title = amount + " protected areas added";
	            break;
	        case 'removed':
	            text = "-";
	            title = amount + " protected areas removed";
	            break;
	        case 'changed':
	            text = "Δ"; //≠Δ
	            title = amount + " protected areas changed";
	            break;
	        case 'no_change':
	            text = "="; //≠Δ
	            title = amount + " protected areas unchanged";
	            break;
	        case 'total':
	            text = "Σ"; //
	            title = amount + " protected areas in total";
	            break;
	        default:
	            // code
	    }
	    let amountSpan = (this.props.iconOnly) ? null : <span>{amount}</span>;
		return (
		    <div className={'statusDiv'} title={(this.props.amount === undefined) ? this.props.status : title} style={{display:((this.props.amount>0)||(this.props.amount === undefined && this.props.iconOnly)) ? "inline" : "none"}}><span className={classname} style={{display: (this.props.hide) ? "none" : "inline"}}>{text}</span>{amountSpan}</div>
		);
	}
}

export default Status;