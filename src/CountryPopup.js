import React from 'react';
import Status from './Status.js';

class CountryPopup extends React.Component {
    clickCountryPopup(){
      this.props.clickCountryPopup(this.props.country);
    }
    render() {
        return (
            <div  className={'countryPopup'}>
              <div title={"View details for " + this.props.country.name} onClick={this.clickCountryPopup.bind(this)}>
                <div className={'name'}>{(this.props.country.name.length > 40) ? (this.props.country.name.substr(0,30) + '...') : this.props.country.name}</div>
                <div className={'stats'}>
                  <div style={{display:'inline'}} title={this.props.country.total + ' protected areas'}><Status status={'total'}/>{this.props.country.total}</div>
                  <div style={{display: ((this.props.showStatuses.indexOf('added') !==-1)&&this.props.country.added) ? 'inline' : 'none'}} title={this.props.country.added + ' protected areas added'}><Status status={'added'}/>{this.props.country.added}</div>
                  <div style={{display: ((this.props.showStatuses.indexOf('removed') !==-1)&&this.props.country.removed) ? 'inline' : 'none'}} title={this.props.country.removed + ' protected areas removed'}><Status status={'removed'}/>{this.props.country.removed}</div>
                  <div style={{display: ((this.props.showStatuses.indexOf('changed') !==-1)&&this.props.country.changed) ? 'inline' : 'none'}} title={this.props.country.changed + ' changed protected areas'}><Status status={'changed'}/>{this.props.country.changed}</div>
                  <div style={{display: ((this.props.showStatuses.indexOf('no_change') !==-1)&&this.props.country.no_change) ? 'inline' : 'none'}} title={this.props.country.no_change + ' unchanged protected areas'}><Status status={'no_change'}/>{this.props.country.no_change}</div>
                </div>
              </div>
            </div>
        );
    }
}

export default CountryPopup;
