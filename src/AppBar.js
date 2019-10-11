import React from 'react';
import Paper from '@material-ui/core/Paper';
import Checkbox from '@material-ui/core/Checkbox';
import FormControlLabel from '@material-ui/core/FormControlLabel';

class AppBar extends React.Component {
    constructor(props) {
        super(props);
        this.state = { showChanges: true , showChangesNew:true, showChangesDeleted: true, showChangesChanged: false};
    }
    handleChange(event) {
        this.setState({ showChanges: event.target.checked });
        this.props.showAllNoChanges(event.target.checked);
    }
    handleChangeNew(event) {
        this.setState({ showChangesNew: event.target.checked });
        this.props.showChangesNew(event.target.checked);
    }
    handleChangeDeleted(event) {
        this.setState({ showChangesDeleted: event.target.checked });
        this.props.showChangesDeleted(event.target.checked);
    }
    handleChangeChanged(event) {
        this.setState({ showChangesChanged: event.target.checked });
        this.props.showChangesChanged(event.target.checked);
    }
    render() {
        return (
            <React.Fragment>
        <div className={'appBar'}>
          <Paper className={'appBarPaper'}>
            <div className={'appBarTitle'}>World Database on Protected Areas | Diff Checker</div>
            <div className={'appBarContent'}>
                <div className={'fromVersion'}>{this.props.fromVersion&&this.props.fromVersion.title}</div>
                <div className={'toVersion'}>{this.props.toVersion&&this.props.toVersion.title}</div>
                <FormControlLabel control={<Checkbox checked={this.state.showChanges} onChange={this.handleChange.bind(this)}/>} label="Show changes"/>
                <div style={{display: (this.state.showChanges) ? 'block' : 'hide'}}>
                    <FormControlLabel control={<Checkbox checked={this.state.showChangesNew} onChange={this.handleChangeNew.bind(this)}/>} label="New"/>
                    <FormControlLabel control={<Checkbox checked={this.state.showChangesDeleted} onChange={this.handleChangeDeleted.bind(this)}/>} label="Deleted"/>
                    <FormControlLabel control={<Checkbox checked={this.state.showChangesChanged} onChange={this.handleChangeChanged.bind(this)}/>} label="Changed"/>
                </div>
            </div>
          </Paper>
        </div>
      </React.Fragment>
        );
    }
}

export default AppBar;
