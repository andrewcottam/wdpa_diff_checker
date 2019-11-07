import React from 'react';
import 'rc-slider/assets/index.css';
import 'rc-tooltip/assets/bootstrap.css';
import Status from './Status.js';
import Slider from 'rc-slider';
import StatsBar from './StatsBar.js';
import SyncIcon from '@material-ui/icons/Sync';
import ZoomOutMap from '@material-ui/icons/Public';
import TimelineIcon from '@material-ui/icons/Timeline';

const createSliderWithTooltip = Slider.createSliderWithTooltip;
const Range = createSliderWithTooltip(Slider.Range);

class AppBar extends React.Component {
  zoomOutMap() {
    this.props.zoomOutMap();
  }
  showTrends(){
    this.props.showTrends();
  }
  onBeforeChange(values) {
    this.props.onBeforeChange(values);
  }
  onChange(values) {
    this.props.onChange(values, this.marks);
  }
  render() {
    if (this.props.versions === undefined) return null;
    //get the width of the slider depending on how many versions of the WDPA we have
    let divisions = this.props.versions.length; //an extra division at the end
    let width = (divisions * 60); //60px between each mark
    //get the marks for the slider
    this.marks = {};
    this.props.versions.forEach(version => {
      this.marks[version.id] = version.shortTitle;
    });
    return (
      <React.Fragment>
          <div className={'appBar'}>
              <div>
                  <div className={'appBarTitle noselect'}>WDPA Version Checker</div>
                  <div className={'appBarContent noselect'}>
                      <div className={"sliderContainer"}>
                          <div style={{ width: width, margin: 'auto' }}>
                           <Range 
                              max={divisions}
                              marks={this.marks} 
                              step={null}
                              count={2} 
                              value={this.props.values}
                              trackStyle={(this.props.shiftDown ? [{ backgroundColor: '#bbdbfa' }] : [{ backgroundColor: '#96dbfa' }])} 
                              handleStyle={[{ backgroundColor: '#96dbfa' }, { backgroundColor: 'white' }]}
                              onBeforeChange={this.onBeforeChange.bind(this)}
                              onChange={this.onChange.bind(this)}
                              //  activeDotStyle={{borderColor: 'red', boxShadow: '0 0 5px #57c5f7', cursor: 'grabbing'}}
                          />
                          </div>
                      </div>
                      <div className={'statsHolder'}>
                        <span className={'zoomOutHolder'}>
                          <ZoomOutMap titleAccess={"Return to full extent"} className={'ZoomOutMap'} onClick={this.zoomOutMap.bind(this)}/>
                        </span>
                        <span className={'countryName'} style={{display: ((this.props.view === 'global') && (this.props.gettingCountryStats === false)) ? "inline" : "none"}}>Global</span>
                        <span className={'vMiddle'} style={{display: ((this.props.values[0] === this.props.values[1]) && (this.props.view === 'global') && (this.props.gettingGlobalStats === false)) ? "inline" : "none"}}>
                          <span><Status status={'total'} amount={this.props.globalTotal}/></span>
                        </span>
                        <span className={'vMiddle'} style={{display: ((this.props.values[0] !== this.props.values[1]) && (this.props.view === 'global') && (this.props.gettingGlobalStats === false)) ? "inline" : "none"}}>
                          <StatsBar values={this.props.globalStats} showStatuses={this.props.showStatuses}/>
                        </span>
                        <span className={'countryName'} style={{display: ((this.props.view !== 'global') && (this.props.gettingCountryStats === false)) ? "inline" : "none"}}>{this.props.country && this.props.country.name}</span>
                        <span className={'vMiddle'} style={{display: ((this.props.values[0] === this.props.values[1]) && (this.props.view !== 'global') && (this.props.gettingCountryStats === false)) ? "inline" : "none"}}>
                          <Status status={'total'} amount={this.props.countryTotal}/>
                        </span>
                        <span className={'vMiddle'} style={{display: ((this.props.values[0] !== this.props.values[1]) && (this.props.view !== 'global') && (this.props.gettingCountryStats === false)) ? "inline" : "none"}}>
                          <StatsBar values={this.props.countryStats} showStatuses={this.props.showStatuses}/>
                        </span>
                        <span className={'vMiddle'}>
          	              <SyncIcon className={'spin'} style={{display: (((this.props.gettingGlobalStats)||(this.props.gettingCountryStats)) ? 'inline' : 'none'),color: 'rgb(255, 64, 129)', fontSize:'17px'}} key={"spinner"}/>
          	            </span>
                        <span className={'sparklineHolder'}>
                          <TimelineIcon titleAccess={"View change over time"} className={'ZoomOutMap'} onClick={this.showTrends.bind(this)} style={{display: (this.props.view === 'global') ? "inline" : "none"}}/>
                        </span>
                      </div>
                  </div>
              </div>
          </div>
      </React.Fragment>
    );
  }
}

export default AppBar;
