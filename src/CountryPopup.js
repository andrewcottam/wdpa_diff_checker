import React from 'react';
import { Popup } from 'react-mapbox-gl';

class CountryPopup extends React.Component {
    render() {
        return (
            <Popup coordinates={this.props.country.centroid} key={this.props.country.iso3}>
              <div>{this.props.country.name}</div>
              <div>New: {this.props.country.new}</div>
              <div>Deleted: {this.props.country.deleted}</div>
            </Popup>
        );
    }
}
export default CountryPopup;
