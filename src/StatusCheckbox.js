import React from 'react';

class StatusCheckbox extends React.Component {
    handleStatusChange(e){
        this.props.handleStatusChange(this.props.status);
    }
    render() {
        return (
            <React.Fragment>
                <label for={this.props.status.key + 'id'}>{this.props.status.short_text}</label>
                <input id={this.props.status.key + 'id'} type="checkbox" defaultChecked={this.props.status.visible} onChange={this.handleStatusChange.bind(this)}/>
            </React.Fragment>
        );
    }
}

export default StatusCheckbox;
