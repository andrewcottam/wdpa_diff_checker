import React from 'react';
import Changed from './Changed.js';

const TITLE_LINK = "Click to open the protected area in the Protected Planet website";
const URL_PP = "https://www.protectedplanet.net/";
const SOURCE_NAME_FROM = "wdpa_from";
const SOURCE_NAME_FROM_POINTS = "wdpa_from_points";
const LAYER_NAME_FROM_DELETED = "from_deleted";
const LAYER_NAME_TO_NEW = "to_new";
const LAYER_NAME_TO_CHANGED = "to_changed";

class PAPopupList extends React.Component {
	getChangedData(feature){ //single feature under mouse
		let attributesData =[];
		let props = feature.properties;
		//get the data for the feature under the mouse
		let pa_data = this.props.country_pa_diffs.find(pa => pa.wdpaid === Number(props.wdpaid)); //wdpaid is BigDecimal in Geoserver by default and this gets parsed to a string type
		//get the previous version of the feature either from the points layer of the polygons layer
		let previous_feature;
		if (pa_data.geometry_change && pa_data.geometry_change === "point to polygon"){
			previous_feature = this.props.map.querySourceFeatures(SOURCE_NAME_FROM_POINTS, {sourceLayer: "wdpa_aug_2019_points", filter: ["==", "wdpaid", props.wdpaid]})[0];
		}else{
			previous_feature = this.props.map.querySourceFeatures(SOURCE_NAME_FROM, {sourceLayer: "wdpa_aug_2019_polygons", filter: ["==", "wdpaid", props.wdpaid]})[0];
		}
		//attributes have changed - make an array of the data
		if (pa_data.attribute_change){
			pa_data.attribute_change.forEach((attribute) => {
				if (previous_feature){
					attributesData.push({attribute: attribute, previous: previous_feature.properties[attribute], current: props[attribute]});
				}else{
					attributesData.push({attribute: attribute, previous: 'unable to find feature', current: props[attribute]});
				}
			});
		}
		return {attributesData: attributesData, geometryData: pa_data.geometry_change};
	}
	render() {
		if (this.props.mouseEnterEventData === undefined) return null;
		let left = this.props.mouseEnterEventData.point.x + 25 + 'px';
		let top = this.props.mouseEnterEventData.point.y - 25 + 'px';
		let feature = this.props.mouseEnterEventData.features[0];
		let children;
		switch (feature.layer.id) {
			case LAYER_NAME_TO_CHANGED:
				let changedData = this.getChangedData(feature);
				children = <Changed changedData={changedData} fromVersion={this.props.fromVersion} toVersion={this.props.toVersion}/>;
				break;
			case LAYER_NAME_TO_NEW:
				children = <div className={'paPopupChangeType'}>This protected area was added in {this.props.toVersion}</div>;
				break;
			case LAYER_NAME_FROM_DELETED:
				children = <div className={'paPopupChangeType'}>This protected area was removed in {this.props.toVersion}</div>;
				break;
			default:
				//code
		}
		return (
			<div style={{'left': left,'top':top}} id="popup">
				<div className={'wdpaPopup'}>
					<div className="paPopupName"><span className={"paPopupNameLeft"}>{feature.properties.name}</span><span className={"paPopupNameRight"}><a href={URL_PP + feature.properties.wdpaid} target='_blank'  rel="noopener noreferrer" title={TITLE_LINK}>{feature.properties.wdpaid}</a></span></div>
					{children}
				</div>
			</div>
		);
	}
}

export default PAPopupList;