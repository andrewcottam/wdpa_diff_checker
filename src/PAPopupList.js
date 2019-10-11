import React from 'react';
class PAPopupList extends React.Component {
	
	render() {
		if (this.props.dataForPopupList === undefined) return null;
		let children = [];
		let left = this.props.dataForPopupList.point.x + 25 + 'px';
		let top = this.props.dataForPopupList.point.y - 25 + 'px';
		children = this.props.dataForPopupList.features.map((feature) => {
			return <tr className={'wdpaPopupListItem'} key={feature.properties.wdpaid} onMouseEnter={this.props.showPAPopup.bind(this, feature)}><td>{feature.properties.wdpaid}</td><td>{feature.properties.name} ({feature.properties.iucn_cat})</td></tr>;
		});
		children = <table><tbody>{children}</tbody></table>;
		return (
			<div style={{'left': left,'top':top}} id="popup" onMouseEnter={this.props.onMouseEnterPAPopuplist} onMouseLeave={this.props.onMouseLeavePAPopuplist}>
				<div className={'wdpaPopup'}>
					<div className={'paPopupName'}>{this.props.dataForPopupList.features.length} overlapping sites:</div>
					<div className={'paPopupContent'}>{children}</div>
				</div>
			</div>
		);
	}
}

export default PAPopupList;