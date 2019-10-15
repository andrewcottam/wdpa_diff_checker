import React from 'react';
import Slider from '@material-ui/core/Slider';


class AppBar extends React.Component {
    constructor(props){
        super(props);
        this.state = {value: 1}; //sep 2019 - the first month with change data
    }
    handleChange(event, newValue) {
        this.setState({value: newValue});
        this.props.setVersion(newValue);
    }
    render() {
        let marks = this.props.versions.map(version =>{
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
                            <Slider
                                min={marks[0].id}
                                max={marks.length-1}
                                value={this.state.value}
                                onChangeCommitted={this.handleChange.bind(this)}
                                valueLabelDisplay="off"
                                marks={marks}
                            />
                        </div>
                    </div>
                </div>
            </React.Fragment>
        );
    }
}

export default AppBar;
