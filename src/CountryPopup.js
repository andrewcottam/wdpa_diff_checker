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
                  <div className={''} style={{display: ((this.props.showStatuses.indexOf('added') !==-1)&&this.props.country.added) ? 'inline' : 'none'}} title={this.props.country.added + ' protected areas added'}>{this.props.country.added}<Status status={'added'}/></div>
                  <div className={''} style={{display: ((this.props.showStatuses.indexOf('removed') !==-1)&&this.props.country.removed) ? 'inline' : 'none'}} title={this.props.country.removed + ' protected areas removed'}>{this.props.country.removed}<Status status={'removed'}/></div>
                  <div className={''} style={{display: ((this.props.showStatuses.indexOf('changed') !==-1)&&this.props.country.changed) ? 'inline' : 'none'}} title={this.props.country.changed + ' changed protected areas'}>{this.props.country.changed}<Status status={'changed'}/></div>
                </div>
              </div>
            </div>
        );
    }
}

export default CountryPopup;
