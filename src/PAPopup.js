import React from 'react';
import Changed from './Changed.js';
import Status from './Status.js';

const TITLE_LINK = "Click to open the protected area in the Protected Planet website";
const URL_PP = "https://www.protectedplanet.net/";

class PAPopup extends React.Component {
	getChangedData(feature){ //single feature under mouse
		let attributesData =[];
		let props = feature.properties;
		//check that the diff data has loaded
		if (this.props.country_pa_diffs.length === 0) return;
		//get the data for the feature under the mouse
		let pa_data = this.props.country_pa_diffs.find(pa => pa.wdpaid === Number(props.wdpaid)); //wdpaid is BigDecimal in Geoserver by default and this gets parsed to a string type
		//get the previous version of the feature either from the points layer of the polygons layer
		let previous_feature;
		if (pa_data.geometry_change && pa_data.geometry_change === "point to polygon"){
			previous_feature = this.props.map.querySourceFeatures(window.SRC_FROM_POINTS, {sourceLayer: "wdpa_aug_2019_points", filter: ["==", "wdpaid", props.wdpaid]})[0];
		}else{
			previous_feature = this.props.map.querySourceFeatures(window.SRC_FROM_POLYGONS, {sourceLayer: "wdpa_aug_2019_polygons", filter: ["==", "wdpaid", props.wdpaid]})[0];
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
		if (this.props.dataForPopup === undefined) return null;
		let left = this.props.dataForPopup.point.x + 35 + 'px';
		let top = this.props.dataForPopup.point.y - 25 + 'px';
		let feature = this.props.dataForPopup.features[0];
		let children, status="", link;
		link = <span className={"ppLink underline"}><a href={URL_PP + feature.properties.wdpaid} target='_blank'  rel="noopener noreferrer" title={TITLE_LINK}>{feature.properties.wdpaid}</a></span>;
		switch (feature.layer.id) {
			case window.LYR_TO_CHANGED_ATTRIBUTE:
			case window.LYR_TO_GEOMETRY_POINT_TO_POLYGON:
			case window.LYR_TO_GEOMETRY_POINT_COUNT_CHANGED_POLYGON:
			case window.LYR_TO_GEOMETRY_SHIFTED_POLYGON:
				let changedData = this.getChangedData(feature);
				children = <Changed statuses={this.props.statuses} changedData={changedData} fromVersion={this.props.fromVersion.abbreviated} toVersion={this.props.toVersion.abbreviated}/>;
				status = "changed";
				break;
			case window.LYR_TO_NEW_POLYGON:
			case window.LYR_TO_NEW_POINT:
				children = <div className={'paPopupChangeType'}>Added in {this.props.toVersion.title}</div>;
				status = "added";
				break;
			case window.LYR_FROM_DELETED_POLYGON:
			case window.LYR_FROM_DELETED_POINT:
				children = <div className={'paPopupChangeType'}>Removed in {this.props.toVersion.title}</div>;
				link = <span className={"ppLink"}></span>;
				status = "removed";
				break;
			case window.LYR_TO_POLYGON:
			case window.LYR_TO_POINT:
				children = <div className={'paPopupChangeType'}>No change</div>;
				status = "no change";
				break;
			default:
				//code
		}
		return (
			<div style={{'left': left,'top':top}} id="popup" onMouseEnter={this.props.onMouseEnterPAPopup} onMouseLeave={this.props.onMouseLeavePAPopup}>
				<div className={'wdpaPopup'}>
					<div className="paPopupName"><Status status={status}/><span className={"paPopupNameLeft"}>{feature.properties.name}</span>{link}</div>
					<div className={'paPopupContent'}>
						{children}
					</div>
				</div>
			</div>
		);
	}
}

export default PAPopup;