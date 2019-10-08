import React from 'react';
class PAPopupList extends React.Component {
	
	render() {
		if (this.props.mouseEnterEventData === undefined) return null;
		let children = [];
		let left = this.props.mouseEnterEventData.point.x + 25 + 'px';
		let top = this.props.mouseEnterEventData.point.y - 25 + 'px';
		children = this.props.mouseEnterEventData.features.map((feature) => {
			return <tr className={'wdpaPopupListItem'} key={feature.properties.wdpaid} onMouseEnter={this.props.showPAPopup.bind(this, feature)}><td>{feature.properties.wdpaid}</td><td>{feature.properties.name} ({feature.properties.iucn_cat})</td></tr>;
		});
		children = <table><tbody>{children}</tbody></table>;
		return (
			<div style={{'left': left,'top':top}} id="popup">
				<div className={'paPopupListHeader'}>{this.props.mouseEnterEventData.features.length} overlapping sites:</div>
				{children}
			</div>
		);
	}
}

export default PAPopupList;