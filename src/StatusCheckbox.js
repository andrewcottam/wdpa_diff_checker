import React from 'react';

class StatusCheckbox extends React.Component {
    handleStatusChange(e){
        this.props.handleStatusChange(this.props.status);
    }
    render() {
        return (
            <div className={'statusCheckboxContainer'}>
                <input className={'statusCheckbox'} id={this.props.status.key + 'id'} type="checkbox" defaultChecked={this.props.status.visible} onChange={this.handleStatusChange.bind(this)}/>
                <label for={this.props.status.key + 'id'}>{this.props.status.short_text}</label>
            </div>
        );
    }
}

export default StatusCheckbox;
