import React from 'react';
import Slider from '@material-ui/core/Slider';


class AppBar extends React.Component {
    constructor(props){
        super(props);
        //get the selected version
        let selectedVersion = props.versions.find(version => version.hasOwnProperty("selected")).id;
        this.state = {value: selectedVersion}; 
    }
    handleChange(event, newValue) {
        this.setState({value: newValue});
        this.props.setVersion(newValue);
    }
    handleShowChangesChange(event) {
        this.props.setShowChanges(!this.props.showChanges);
    }
    render() {
        let marks = this.props.versions.map((version, index) =>{
            return {value: version.id, label: version.shortTitle};
        });
        return (
            <React.Fragment>
                <div className={'appBar'}>
                    <div>
                        <div className={'appBarTitle'}>World Database on Protected Areas | Diff Checker</div>
                        <div className={'appBarContent'}>
                            {/*<div className={'fromVersion'}>{this.props.fromVersion&&this.props.fromVersion.title}</div>
                            <div className={'toVersion'}>{this.props.toVersion&&this.props.toVersion.title}</div>*/}
                            <div className={"sliderContainer"}>
                                <Slider
                                    min={marks[0].id}
                                    max={marks.length-1}
                                    value={this.state.value}
                                    onChangeCommitted={this.handleChange.bind(this)}
                                    valueLabelDisplay="off"
                                    marks={marks}
                                />
                            </div>
                            <div className={'showChangesDiv'}>
                                <input className={'showChangesCheckbox'} id={"showChangesCheckbox"} type="checkbox" onChange={this.handleShowChangesChange.bind(this)} checked={this.props.showChanges} disabled={this.state.value === 0}/>
                                <label for={"showChangesCheckbox"}>Show changes</label>
                            </div>
                        </div>
                    </div>
                </div>
            </React.Fragment>
        );
    }
}

export default AppBar;
