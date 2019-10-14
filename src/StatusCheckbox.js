import React from 'react';

class StatusCheckbox extends React.Component {
    handleStatusChange(e){
        this.props.handleStatusChange(this.props.status);
    }
    render() {
        return (
            <React.Fragment>
                <input id={this.props.status.key + 'id'} type="checkbox" defaultChecked={this.props.status.visible} onChange={this.handleStatusChange.bind(this)}/>
                <label for={this.props.status.key + 'id'}>{this.props.status.short_text}</label>
            </React.Fragment>
        );
    }
}

export default StatusCheckbox;
