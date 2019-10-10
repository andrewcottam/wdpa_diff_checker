import React from 'react';
import { Popup } from 'react-mapbox-gl';
import Status from './Status.js';

class CountryPopup extends React.Component {
    clickCountryPopup(){
      this.props.clickCountryPopup(this.props.country);
    }
    render() {
        return (
            <Popup coordinates={this.props.country.centroid} className={'countryPopup'}>
              <div title={"View details for " + this.props.country.name} onClick={this.clickCountryPopup.bind(this)}>
                <div className={'name'}>{(this.props.country.name.length > 40) ? (this.props.country.name.substr(0,30) + '...') : this.props.country.name}</div>
                <div className={'stats'}>
                  <div className={''} style={{display: ((this.props.showStatuses.indexOf('new') !==-1)&&this.props.country.new) ? 'inline' : 'none'}} title={this.props.country.new + ' new protected areas'}>{this.props.country.new}<Status status={'new'}/></div>
                  <div className={''} style={{display: ((this.props.showStatuses.indexOf('deleted') !==-1)&&this.props.country.deleted) ? 'inline' : 'none'}} title={this.props.country.deleted + ' deleted protected areas'}>{this.props.country.deleted}<Status status={'deleted'}/></div>
                  <div className={''} style={{display: ((this.props.showStatuses.indexOf('changed') !==-1)&&this.props.country.changed) ? 'inline' : 'none'}} title={this.props.country.changed + ' changed protected areas'}>{this.props.country.changed}<Status status={'changed'}/></div>
                </div>
              </div>
            </Popup>
        );
    }
}

export default CountryPopup;
