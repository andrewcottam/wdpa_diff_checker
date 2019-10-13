import React from 'react';

class AppBar extends React.Component {
    render() {
        return (
            <React.Fragment>
                <div className={'appBar'}>
                    <div>
                        <div className={'appBarTitle'}>World Database on Protected Areas | Diff Checker</div>
                        <div className={'appBarContent'}>
                            <div className={'fromVersion'}>{this.props.fromVersion&&this.props.fromVersion.title}</div>
                            <div className={'toVersion'}>{this.props.toVersion&&this.props.toVersion.title}</div>
                        </div>
                    </div>
                </div>
            </React.Fragment>
        );
    }
}

export default AppBar;
