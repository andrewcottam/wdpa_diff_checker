import React from 'react';
import { Popup } from 'react-mapbox-gl';

class CountryPopup extends React.Component {
    clickCountryPopup(){
      this.props.clickCountryPopup(this.props.country);
    }
    render() {
        return (
            <Popup coordinates={this.props.country.centroid} className={'countryPopup'}>
              <div title={"View detail"} onClick={this.clickCountryPopup.bind(this)}>
                <div className={'name'}>{this.props.country.name}</div>
                <div className={'stats'}>
                  <div className={''} style={{display: (this.props.country.new) ? 'inline' : 'none'}} title={this.props.country.new + ' new protected areas'}>{this.props.country.new}<span className={'stat new'}>++</span></div>
                  <div className={''} style={{display: (this.props.country.deleted) ? 'inline' : 'none'}} title={this.props.country.deleted + ' deleted protected areas'}>{this.props.country.deleted}<span className={'stat deleted'}>--</span></div>
                </div>
              </div>
            </Popup>
        );
    }
}

export default CountryPopup;
