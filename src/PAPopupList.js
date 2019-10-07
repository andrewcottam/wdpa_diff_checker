import React from 'react';
const LAYER_NAME_FROM = "from";
const LAYER_NAME_FROM_DELETED = "from_deleted";
const LAYER_NAME_TO = "to";
const LAYER_NAME_TO_NEW = "to_new";
const LAYER_NAME_TO_CHANGED = "to_changed";

class PAPopupList extends React.Component {
	getPopup(feature){ //single feature under mouse
		//get the data for the feature under the mouse
		let pa_data = this.props.protected_areas_data && this.props.protected_areas_data.find(pa => pa.wdpaid === Number(feature.properties.wdpaid)); //wdpaid is BigDecimal in Geoserver by default and this gets parsed to a string type
		switch (feature.layer.id) {
			case LAYER_NAME_FROM:
				return <div className={'wdpaPopup'}><a href={"https://www.protectedplanet.net/" + feature.properties.wdpaid} target='_blank'  rel="noopener noreferrer" title='Click to open the protected area in the Protected Planet website'>{feature.properties.name}<span style={{paddingRight:'5px'}}/>({feature.properties.iucn_cat})</a></div>;
			case LAYER_NAME_FROM_DELETED:
				return <div className={'wdpaPopup'}><a href={"https://www.protectedplanet.net/" + feature.properties.wdpaid} target='_blank'  rel="noopener noreferrer" title='Click to open the protected area in the Protected Planet website'>{feature.properties.name}<span style={{paddingRight:'5px'}}/>({feature.properties.iucn_cat})</a></div>;
			case LAYER_NAME_TO:
				return <div className={'wdpaPopup'}><a href={"https://www.protectedplanet.net/" + feature.properties.wdpaid} target='_blank'  rel="noopener noreferrer" title='Click to open the protected area in the Protected Planet website'>{feature.properties.name}<span style={{paddingRight:'5px'}}/>({feature.properties.iucn_cat})</a></div>;
			case LAYER_NAME_TO_NEW:
				return <div className={'wdpaPopup'}><a href={"https://www.protectedplanet.net/" + feature.properties.wdpaid} target='_blank'  rel="noopener noreferrer" title='Click to open the protected area in the Protected Planet website'>{feature.properties.name}<span style={{paddingRight:'5px'}}/>({feature.properties.iucn_cat})</a></div>;
			case LAYER_NAME_TO_CHANGED:
				//get the previous version of the feature
				let previous_feature = this.props.map.querySourceFeatures("wdpa_from", {sourceLayer: "wdpa_aug_2019_polygons", filter: ["==", "wdpaid", feature.properties.wdpaid]})[0];
				let rows, attributeRows, geometryRows;
				//attribute changes
				if (pa_data.attribute_change && pa_data.attribute_change.length>0) {
					//attributes have changed - build a table of the differences
					attributeRows = pa_data.attribute_change.map((attribute) => {
						return <tr><td>{previous_feature.properties[attribute]}</td><td>{feature.properties[attribute]}</td></tr>;
					});
				}
				//geometry changes
				if (pa_data.geometry_change) {
					//geometry has changed
					geometryRows = (attributeRows) ? <tr><td colSpan='2'>The geometry has changed</td></tr> : <tr><td>The geometry has changed</td></tr>;
				}
				rows = <table>{attributeRows}{geometryRows}</table>;
				return <div className={'wdpaPopup'}>{rows}</div>;
			default:
				// code
		}
	}
	render() {
		if (this.props.mouseEnterEventData === undefined) return null;
		let children = [];
		let left = this.props.mouseEnterEventData.point.x + 25 + 'px';
		let top = this.props.mouseEnterEventData.point.y - 25 + 'px';
		let features = this.props.mouseEnterEventData.features;
		switch (features.length) {
			case 1:
				children = this.getPopup(features[0]);
				break;
			default: //multiple features under mouse
				children = features.map((feature)=>{
					return <div className={'wdpaPopup'} key={feature.properties.wdpaid}><a href={"https://www.protectedplanet.net/" + feature.properties.wdpaid} target='_blank'  rel="noopener noreferrer" title='Click to open the protected area in the Protected Planet website'>{feature.properties.name}<span style={{paddingRight:'5px'}}/>({feature.properties.iucn_cat})</a></div>;
				});
		}
		return (
			<div style={{'display': this.props.mouseEnterEventData.features && this.props.mouseEnterEventData.features.length > 0 ? 'block' : 'none', 'left': left,'top':top}} id="popup">
				{children}
			</div>
		);
	}
}

export default PAPopupList;