import React from 'react';
import ReactMapboxGl, { Layer, Source, MapContext  } from 'react-mapbox-gl';

const Map = ReactMapboxGl({
  accessToken: "pk.eyJ1IjoiYmxpc2h0ZW4iLCJhIjoiMEZrNzFqRSJ9.0QBRA2HxTb8YHErUFRMPZg"
});

const MAP_STYLE_DEFAULT = "mapbox://styles/mapbox/light-v9";
// const INITIAL_CENTER = [-175.15, -21.15]; 
const INITIAL_CENTER = [0, 0];
const INITIAL_ZOOM = [2];
const TILES_BASE_URL = "https://geospatial.jrc.ec.europa.eu/geoserver/gwc/service/wmts?layer=marxan:";
const SOURCE_NAME_FROM = "wdpa_from";
const SOURCE_NAME_TO = "wdpa_to";
const LAYER_NAME_FROM = "from";
const LAYER_NAME_FROM_DELETED = "from_deleted";
const LAYER_NAME_TO = "to";
const LAYER_NAME_TO_NEW = "to_new";
const LAYER_NAME_TO_CHANGED = "to_changed";
const LAYER_NAME_TO_LABEL = "to_label";
const PAINT_WDPA_DEFAULT = { "fill-color": { "type": "categorical", "property": "marine", "stops": [["0", "rgba(99,148,69,0.4)"],["1", "rgba(63,127,191,0.4)"],["2", "rgba(63,127,191,0.4)"]] }, "fill-outline-color": { "type": "categorical", "property": "marine", "stops": [["0", "rgb(99,148,69)"],["1", "rgb(63,127,191)"],["2", "rgb(63,127,191)"]] }, "fill-opacity": 0.3 };
const PAINT_WDPA_CHANGED = { "fill-color": "rgb(255,0,255)", "fill-outline-color": "rgb(255,0,255)", "fill-opacity": 0.6};
const PAINT_WDPA_DELETED = { "fill-color": "rgb(255,0,0)", "fill-outline-color": "rgb(255,0,0)"};
const PAINT_WDPA_NEW = { "fill-color": "rgb(0,255,0)", "fill-outline-color": "rgb(0,255,0)", "fill-opacity": 0.6};

class MyMap extends React.Component {
    shouldComponentUpdate(nextProps) {
        return JSON.stringify(this.props) !== JSON.stringify(nextProps); //this is a crude hack to compare properties
    }	
    render() {
	    return (
	        // eslint-disable-next-line
            <Map style={MAP_STYLE_DEFAULT} containerStyle={{height: '100vh',width: '100vw'}} center={INITIAL_CENTER} zoom={INITIAL_ZOOM} onMoveStart={this.props.hideCountryPopups.bind(this)} onMoveEnd={this.props.showCountryPopups.bind(this)} fitBounds={this.props.bounds} fitBoundsOptions={{ padding: { top: 10, bottom: 10, left: 10, right: 10 }, easing: (num) => { return 1 }}}>
              <MapContext.Consumer>
                {(map) => {
                  this.props.setMap(map);
                }}
              </MapContext.Consumer>
              <Source id={SOURCE_NAME_FROM} tileJsonSource={{type: "vector", attribution: "wdpa", tiles: [ TILES_BASE_URL + "wdpa_" + this.props.fromVersion + "_polygons&tilematrixset=EPSG:900913&Service=WMTS&Request=GetTile&Version=1.0.0&Format=application/x-protobuf;type=mapbox-vector&TileMatrix=EPSG:900913:{z}&TileCol={x}&TileRow={y}"]}}/>
              <Source id={SOURCE_NAME_TO} tileJsonSource={{type: "vector", attribution: "wdpa", tiles: [ TILES_BASE_URL + "wdpa_" + this.props.toVersion + "_polygons&tilematrixset=EPSG:900913&Service=WMTS&Request=GetTile&Version=1.0.0&Format=application/x-protobuf;type=mapbox-vector&TileMatrix=EPSG:900913:{z}&TileCol={x}&TileRow={y}"]}}/>
              <Layer id={LAYER_NAME_FROM} sourceId={SOURCE_NAME_FROM} type="fill" sourceLayer={"wdpa_" + this.props.fromVersion + "_polygons"} layout={{visibility: "none"}} paint={PAINT_WDPA_DEFAULT}/>
              <Layer id={LAYER_NAME_TO} sourceId={SOURCE_NAME_TO} type="fill" sourceLayer={"wdpa_" + this.props.toVersion + "_polygons"} layout={{visibility: "visible"}} paint={PAINT_WDPA_DEFAULT} filter={this.props.toFilter} onMouseEnter={this.props.onMouseEnter.bind(this)}/>
              <Layer id={LAYER_NAME_TO_CHANGED} sourceId={SOURCE_NAME_TO} type="fill" sourceLayer={"wdpa_" + this.props.toVersion + "_polygons"} layout={{visibility: "visible"}} paint={PAINT_WDPA_CHANGED} filter={this.props.changedFilter} onMouseEnter={this.props.onMouseEnter.bind(this)}/>
              <Layer id={LAYER_NAME_FROM_DELETED} sourceId={SOURCE_NAME_FROM} type="fill" sourceLayer={"wdpa_" + this.props.fromVersion + "_polygons"} layout={{visibility: "visible"}} paint={PAINT_WDPA_DELETED} filter={this.props.deletedFilter} onMouseEnter={this.props.onMouseEnter.bind(this)}/>
              <Layer id={LAYER_NAME_TO_NEW} sourceId={SOURCE_NAME_TO} type="fill" sourceLayer={"wdpa_" + this.props.toVersion + "_polygons"} layout={{visibility: "visible"}} paint={PAINT_WDPA_NEW} filter={this.props.newFilter} onMouseEnter={this.props.onMouseEnter.bind(this)}/>
              <Layer id={LAYER_NAME_TO_LABEL} sourceId={SOURCE_NAME_TO} type="symbol" sourceLayer={"wdpa_" + this.props.toVersion + "_polygons"} layout={{"visibility": (this.props.view === 'global') ? 'none' : 'visible', "text-field": "{wdpaid}", "text-size": 9}}/>
              {this.props.countryPopups}
            </Map>
        );
	}
}

export default MyMap;