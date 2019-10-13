import React from 'react';
import ReactMapboxGl, { Layer, Source, MapContext  } from 'react-mapbox-gl';
import CountryPopup from './CountryPopup.js';

const Map = ReactMapboxGl({
  accessToken: "pk.eyJ1IjoiYmxpc2h0ZW4iLCJhIjoiMEZrNzFqRSJ9.0QBRA2HxTb8YHErUFRMPZg"
});

// const INITIAL_CENTER = [-175.15, -21.15]; 
const INITIAL_CENTER = [0, 0];
const INITIAL_ZOOM = [2];
const TILES_PREFIX = "https://geospatial.jrc.ec.europa.eu/geoserver/gwc/service/wmts?layer=marxan:";
const TILES_SUFFIX = "&tilematrixset=EPSG:900913&Service=WMTS&Request=GetTile&Version=1.0.0&Format=application/x-protobuf;type=mapbox-vector&TileMatrix=EPSG:900913:{z}&TileCol={x}&TileRow={y}";
//paint properties
const P_FROM_GEOMETRY_SHIFTED_LINE = { "line-color": "rgb(99,148,69)", "line-width": 1, "line-opacity": 0.6, "line-dasharray": [3,3]};
const P_FROM_GEOMETRY_POINT_COUNT_CHANGED_LINE = { "line-color": "rgb(99,148,69)", "line-width": 1, "line-opacity": 0.6, "line-dasharray": [3,3]};
const P_FROM_GEOMETRY_POINT_TO_POLYGON = {"circle-radius": 5, "circle-color": "rgba(99,148,69,0.6)"};
const P_FROM_DELETED_POLYGON = { "fill-color": "rgba(255,0,0, 0.2)", "fill-outline-color": "rgba(255,0,0,0.5)"};
const P_FROM_DELETED_POINT = {"circle-radius": 5, "circle-color": "rgb(255,0,0)", "circle-opacity": 0.6};
const P_TO_CHANGED_ATTRIBUTE = { "fill-color": "rgba(99,148,69,0.4)", "fill-outline-color": "rgba(99,148,69,0.8)"};
const P_TO_CHANGED_GEOMETRY = { "fill-color": "rgba(99,148,69,0.2)", "fill-outline-color": "rgba(0,0,0,0)"};
const P_TO_CHANGED_GEOMETRY_LINE = { "line-color": "rgb(99,148,69)", "line-width": 2, "line-opacity": 0.6, "line-dasharray": [3,3]};
const P_TO_NEW_POLYGON = { "fill-color": "rgba(63,127,191,0.2)", "fill-outline-color": "rgba(63,127,191,0.6)"};
const P_TO_NEW_POINT = {"circle-radius": 10, "circle-color": "rgb(63,127,191)", "circle-opacity": 0.6};
const P_TO_POLYGON = { "fill-color": "rgba(99,148,69,0.2)", "fill-outline-color": "rgba(99,148,69,0.3)"};
const P_TO_POINT = {"circle-radius": 5, "circle-color": "rgb(99,148,69)", "circle-opacity": 0};
const P_SELECTED_POINT = {"circle-radius": 5, "circle-color": "rgb(255,0,0)", "circle-opacity": 1};
const P_SELECTED_LINE = { "line-color": "rgb(255,0,0)", "line-width": 2, "line-opacity": 0};
const P_SELECTED_POLYGON = { "fill-color": "rgba(255,0,0,0)", "fill-outline-color": "rgba(255,0,0,0)"};

class MyMap extends React.Component {
  constructor(props){
    super(props);
    this.state = {
    };
  }
  shouldComponentUpdate(nextProps, nextState) {
    //this is a crude hack to compare properties -TODO SORT THIS OUT
    return (JSON.stringify(this.props) !== JSON.stringify(nextProps))||(JSON.stringify(this.state) !== JSON.stringify(nextState)); 
  }	
  clickCountryPopup(country){
    //set the currently selected country
    this.country = country;
    this.props.clickCountryPopup(country);
  }
  render() {
    if ((this.props.toVersion === undefined)||(this.props.fromVersion === undefined)) return null;
    //get the from and to versions in abbreviated form to get the vector tiles
    let _from = this.props.fromVersion.abbreviated;
    let _to = this.props.toVersion.abbreviated;
    let countryPopups, toFilter, toPointsFilter = [], newPAs=[], deletedPAs=[], changedPAs=[], geometryShiftedPAs=[], geometryPointCountChangedPAs= [], geometryPointToPolygonPAs = [], geometryChangedPAs =[];
    switch (this.props.view) {
      case 'global':
        //get the country popups
        let iso3s = [];
        countryPopups = this.props.global_summary.map(country => {
          iso3s.push(country.iso3);
          return <CountryPopup country={country} key={country.iso3} showStatuses={this.props.showStatuses} clickCountryPopup={this.clickCountryPopup.bind(this)}/>;
        });
        //filter the toLayer  to only the countries that are being shown
        toFilter = ['in', 'iso3'].concat(iso3s);
        //filter out all points at the global scale view
        toPointsFilter = ['in', 'iso3',''];
        break;
      case 'country':
        //get the layers to show
        let visibleLayers = this.props.statuses.map(status => {return (status.visible) ? status.key : null});
        //get the stats data for the country
        this.props.country_summary.forEach(record => {
          switch (record.status) {
            case 'new':
              if (visibleLayers.indexOf("new") !== -1) newPAs = record.wdpaids;
              break;
            case 'deleted':
              if (visibleLayers.indexOf("deleted") !== -1) deletedPAs = record.wdpaids;
              break;
            case 'changed':
              if (visibleLayers.indexOf("changed") !== -1) changedPAs = record.wdpaids;
              break;
            case 'geometry shifted':
              if (visibleLayers.indexOf("changed") !== -1) geometryShiftedPAs = record.wdpaids;
              break;
            case 'point count':
              if (visibleLayers.indexOf("changed") !== -1) geometryPointCountChangedPAs = record.wdpaids;
              break;
            case 'point to polygon':
              if (visibleLayers.indexOf("changed") !== -1) geometryPointToPolygonPAs = record.wdpaids;
              break;
            default:
              // code
            }
        });
        //get the array of all protected areas that have changed geometries
        geometryChangedPAs = geometryShiftedPAs.concat(geometryPointCountChangedPAs).concat(geometryPointToPolygonPAs);
        //the toLayer should exclude all of the other protected areas that are changed, new or have their geometry shifted
        toFilter = ['all', ['!in', 'wdpaid'].concat(changedPAs).concat(newPAs).concat(geometryChangedPAs),['in', 'iso3', this.country.iso3]];
        //the toPoints layer should exclude all new point PAs (which will be shown in blue)
        toPointsFilter = ['all', ['!in', 'wdpaid'].concat(newPAs),['in', 'iso3', this.country.iso3]];        
        //the changed layer should exclude all of the other protected areas that have had their geometry changed - these will be rendered with dashed outlines
        changedPAs = changedPAs.filter(item => !geometryChangedPAs.includes(item));
        break;
      default:
        // code
    }
    return (
      //get the to and from names
      // eslint-disable-next-line
      <Map style={window.MAP_STYLE_DEFAULT} containerStyle={{height: '100vh',width: '100vw'}} center={INITIAL_CENTER} zoom={INITIAL_ZOOM} onMoveStart={this.props.hideCountryPopups} onMoveEnd={this.props.showCountryPopups}>
        <MapContext.Consumer>
          {(map) => {
            this.props.setMap(map);
          }}
        </MapContext.Consumer>
        {/*sources for vector tiles*/}
        <Source id={window.SRC_FROM_POLYGONS} tileJsonSource={{type: "vector", attribution: this.props.attribution, tiles: [ TILES_PREFIX + "wdpa_" + _from + "_polygons" + TILES_SUFFIX]}}/>
        <Source id={window.SRC_FROM_POINTS} tileJsonSource={{type: "vector", tiles: [ TILES_PREFIX + "wdpa_" + _from + "_points" + TILES_SUFFIX]}}/>
        <Source id={window.SRC_TO_POLYGONS} tileJsonSource={{type: "vector", tiles: [ TILES_PREFIX + "wdpa_" + _to + "_polygons" + TILES_SUFFIX]}}/>
        <Source id={window.SRC_TO_POINTS} tileJsonSource={{type: "vector", tiles: [ TILES_PREFIX + "wdpa_" + _to + "_points" + TILES_SUFFIX]}}/> 
        {/*deleted layers*/}
        <Layer sourceId={window.SRC_FROM_POLYGONS} id={window.LYR_FROM_DELETED_POLYGON} type="fill" sourceLayer={"wdpa_" + _from + "_polygons"} layout={{visibility: "visible"}} paint={P_FROM_DELETED_POLYGON} filter={['in', 'wdpaid'].concat(deletedPAs)} onMouseEnter={this.props.onMouseEnter} onMouseLeave={this.props.onMouseLeave}/>
        <Layer sourceId={window.SRC_FROM_POINTS} id={window.LYR_FROM_DELETED_POINT} type="circle" sourceLayer={"wdpa_" + _from + "_points"} layout={{visibility: "visible"}} filter={['in', 'wdpaid'].concat(deletedPAs)} paint={P_FROM_DELETED_POINT} onMouseEnter={this.props.onMouseEnter} onMouseLeave={this.props.onMouseLeave}/>
        {/*no change layers*/}
        <Layer sourceId={window.SRC_TO_POLYGONS} id={window.LYR_TO_POLYGON} type="fill" sourceLayer={"wdpa_" + _to + "_polygons"} layout={{visibility: "visible"}} paint={P_TO_POLYGON} filter={toFilter} onMouseEnter={this.props.onMouseEnter} onMouseLeave={this.props.onMouseLeave}/>
        <Layer sourceId={window.SRC_TO_POINTS} id={window.LYR_TO_POINT} type="circle" sourceLayer={"wdpa_" + _to + "_points"} layout={{visibility: "visible"}} paint={P_TO_POINT} filter={toPointsFilter} onMouseEnter={this.props.onMouseEnter} onMouseLeave={this.props.onMouseLeave}/>
        {/*attribute change layers*/}
        <Layer sourceId={window.SRC_TO_POLYGONS} id={window.LYR_TO_CHANGED_ATTRIBUTE} type="fill" sourceLayer={"wdpa_" + _to + "_polygons"} layout={{visibility: "visible"}} paint={P_TO_CHANGED_ATTRIBUTE} filter={['in', 'wdpaid'].concat(changedPAs)} onMouseEnter={this.props.onMouseEnter} onMouseLeave={this.props.onMouseLeave}/>
        {/*geometry change layers - from*/}
        <Layer sourceId={window.SRC_FROM_POINTS} id={window.LYR_FROM_GEOMETRY_POINT_TO_POLYGON} type="circle" sourceLayer={"wdpa_" + _from + "_points"} layout={{visibility: "visible"}} filter={['in', 'wdpaid'].concat(geometryPointToPolygonPAs)} paint={P_FROM_GEOMETRY_POINT_TO_POLYGON}/>
        <Layer sourceId={window.SRC_FROM_POLYGONS} id={window.LYR_FROM_GEOMETRY_POINT_COUNT_CHANGED_LINE} type="line" sourceLayer={"wdpa_" + _from + "_polygons"} layout={{visibility: "visible"}} filter={['in', 'wdpaid'].concat(geometryPointCountChangedPAs)} paint={P_FROM_GEOMETRY_POINT_COUNT_CHANGED_LINE}/>
        <Layer sourceId={window.SRC_FROM_POLYGONS} id={window.LYR_FROM_GEOMETRY_SHIFTED_LINE} type="line" sourceLayer={"wdpa_" + _from + "_polygons"} layout={{visibility: "visible"}} filter={['in', 'wdpaid'].concat(geometryShiftedPAs)} paint={P_FROM_GEOMETRY_SHIFTED_LINE}/>
        {/*geometry change layers - to*/}
        <Layer sourceId={window.SRC_TO_POLYGONS} id={window.LYR_TO_GEOMETRY_POINT_TO_POLYGON} type="fill" sourceLayer={"wdpa_" + _to + "_polygons"} layout={{visibility: "visible"}} paint={P_TO_CHANGED_GEOMETRY} filter={['in', 'wdpaid'].concat(geometryPointToPolygonPAs)} onMouseEnter={this.props.onMouseEnter} onMouseLeave={this.props.onMouseLeave}/>
        <Layer sourceId={window.SRC_TO_POLYGONS} id={window.LYR_TO_GEOMETRY_POINT_TO_POLYGON_LINE} type="line" sourceLayer={"wdpa_" + _to + "_polygons"} layout={{visibility: "visible"}} paint={P_TO_CHANGED_GEOMETRY_LINE} filter={['in', 'wdpaid'].concat(geometryPointToPolygonPAs)}/>
        <Layer sourceId={window.SRC_TO_POLYGONS} id={window.LYR_TO_GEOMETRY_POINT_COUNT_CHANGED_POLYGON} type="fill" sourceLayer={"wdpa_" + _to + "_polygons"} layout={{visibility: "visible"}} paint={P_TO_CHANGED_GEOMETRY} filter={['in', 'wdpaid'].concat(geometryPointCountChangedPAs)} onMouseEnter={this.props.onMouseEnter} onMouseLeave={this.props.onMouseLeave}/>
        <Layer sourceId={window.SRC_TO_POLYGONS} id={window.LYR_TO_GEOMETRY_POINT_COUNT_CHANGED_POLYGON_LINE} type="line" sourceLayer={"wdpa_" + _to + "_polygons"} layout={{visibility: "visible"}} paint={P_TO_CHANGED_GEOMETRY_LINE} filter={['in', 'wdpaid'].concat(geometryPointCountChangedPAs)}/>
        <Layer sourceId={window.SRC_TO_POLYGONS} id={window.LYR_TO_GEOMETRY_SHIFTED_POLYGON} type="fill" sourceLayer={"wdpa_" + _to + "_polygons"} layout={{visibility: "visible"}} paint={P_TO_CHANGED_GEOMETRY} filter={['in', 'wdpaid'].concat(geometryShiftedPAs)} onMouseEnter={this.props.onMouseEnter} onMouseLeave={this.props.onMouseLeave}/>
        <Layer sourceId={window.SRC_TO_POLYGONS} id={window.LYR_TO_GEOMETRY_SHIFTED_POLYGON_LINE} type="line" sourceLayer={"wdpa_" + _to + "_polygons"} layout={{visibility: "visible"}} paint={P_TO_CHANGED_GEOMETRY_LINE} filter={['in', 'wdpaid'].concat(geometryShiftedPAs)}/>
        {/*new layers*/}
        <Layer sourceId={window.SRC_TO_POLYGONS} id={window.LYR_TO_NEW_POLYGON} type="fill" sourceLayer={"wdpa_" + _to + "_polygons"} layout={{visibility: "visible"}} paint={P_TO_NEW_POLYGON} filter={['in', 'wdpaid'].concat(newPAs)} onMouseEnter={this.props.onMouseEnter} onMouseLeave={this.props.onMouseLeave}/>
        <Layer sourceId={window.SRC_TO_POINTS} id={window.LYR_TO_NEW_POINT} type="circle" sourceLayer={"wdpa_" + _to + "_points"} layout={{visibility: "visible"}} paint={P_TO_NEW_POINT} filter={['in', 'wdpaid'].concat(newPAs)} onMouseEnter={this.props.onMouseEnter} onMouseLeave={this.props.onMouseLeave}/>
        {/*selection layers*/}
        <Layer sourceId={window.SRC_FROM_POINTS} id={window.LYR_FROM_SELECTED_POINT} type="circle" sourceLayer={"wdpa_" + _from + "_points"} layout={{visibility: "visible"}} filter={['==', 'wdpaid','-1']} paint={P_SELECTED_POINT}/>
        <Layer sourceId={window.SRC_FROM_POLYGONS} id={window.LYR_FROM_SELECTED_LINE} type="line" sourceLayer={"wdpa_" + _from + "_polygons"} layout={{visibility: "visible"}} filter={['==','wdpaid','-1']} paint={P_SELECTED_LINE}/>
        <Layer sourceId={window.SRC_FROM_POLYGONS} id={window.LYR_FROM_SELECTED_POLYGON} type="fill" sourceLayer={"wdpa_" + _from + "_polygons"} layout={{visibility: "visible"}} filter={['==','wdpaid','-1']} paint={P_SELECTED_POLYGON}/>
        <Layer sourceId={window.SRC_TO_POINTS} id={window.LYR_TO_SELECTED_POINT} type="circle" sourceLayer={"wdpa_" + _to + "_points"} layout={{visibility: "visible"}} filter={['==', 'wdpaid','-1']} paint={P_SELECTED_POINT}/>
        <Layer sourceId={window.SRC_TO_POLYGONS} id={window.LYR_TO_SELECTED_LINE} type="line" sourceLayer={"wdpa_" + _to + "_polygons"} layout={{visibility: "visible"}} paint={P_SELECTED_LINE} filter={['==', 'wdpaid','-1']}/>
        <Layer sourceId={window.SRC_TO_POLYGONS} id={window.LYR_TO_SELECTED_POLYGON} type="fill" sourceLayer={"wdpa_" + _to + "_polygons"} layout={{visibility: "visible"}} paint={P_SELECTED_POLYGON} filter={['==', 'wdpaid','-1']}/>
        {countryPopups}
      </Map>
    );
  }
}

export default MyMap;