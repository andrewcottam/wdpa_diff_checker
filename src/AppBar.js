import React from 'react';
import 'rc-slider/assets/index.css';
import 'rc-tooltip/assets/bootstrap.css';
import ZoomOutMap from '@material-ui/icons/ZoomOutMap';
import Status from './Status.js';
import Slider from 'rc-slider';
import Tooltip from 'rc-tooltip';
import fuzzy from './fuzzy.png';

const createSliderWithTooltip = Slider.createSliderWithTooltip;
const Range = createSliderWithTooltip(Slider.Range);
const Handle = Slider.Handle;

const handle = (props) => {
  const { value, dragging, index, ...restProps } = props;
  return (
    <Tooltip
      prefixCls="rc-slider-tooltip"
      overlay={value}
      visible={dragging}
      placement="top"
      key={index}
    >
      <Handle value={value} {...restProps} />
    </Tooltip>
  );
};
class AppBar extends React.Component {
  zoomOutMap() {
    this.props.zoomOutMap();
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
                  <div className={'appBarTitle'}>World Database on Protected Areas | Diff Checker</div>
                  <div className={'appBarContent'}>
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
                      {/*<div className={'ZoomOutMapContainer'}>
                          <ZoomOutMap titleAccess={"Return to full extent"} className={'ZoomOutMap'} onClick={this.zoomOutMap.bind(this)}/>
                      </div>*/}
                      <div className={'statsHolder'}>
                        <div className={'globalStats'} style={{display: ((this.props.values[0] === this.props.values[1]) && (this.props.view === 'global') && (this.props.gettingGlobalStats === false)) ? "inline" : "none"}}>
                          <div><Status status={'total'}/> {this.props.globalTotal}</div>
                        </div>
                        <div className={'globalDiffStats'} style={{display: ((this.props.values[0] !== this.props.values[1]) && (this.props.view === 'global') && (this.props.gettingGlobalStats === false)) ? "inline" : "none"}}>
                          <Status status={'added'}/>{this.props.globalDiff&&this.props.globalDiff.added.toLocaleString()}
                          <Status status={'removed'}/>{this.props.globalDiff&&this.props.globalDiff.removed.toLocaleString()}
                          <Status status={'changed'}/>{this.props.globalDiff&&this.props.globalDiff.changed.toLocaleString()}
                        </div>
                        <div className={'countryStats'} style={{display: ((this.props.values[0] === this.props.values[1]) && (this.props.view !== 'global') && (this.props.gettingGlobalStats === false)) ? "inline" : "none"}}>
                          <span>{this.props.country && this.props.country.name}</span>
                          <Status status={'total'}/> {this.props.country && this.props.country.total}
                        </div>
                        <div className={'countryDiffStats'} style={{display: ((this.props.values[0] !== this.props.values[1]) && (this.props.view !== 'global') && (this.props.gettingGlobalStats === false)) ? "inline" : "none"}}>
                          <span>{this.props.country && this.props.country.name}</span>
                          <Status status={'added'}/>{this.props.country&&this.props.country.added.toLocaleString()}
                          <Status status={'removed'}/>{this.props.country&&this.props.country.removed.toLocaleString()}
                          <Status status={'changed'}/>{this.props.country&&this.props.country.changed.toLocaleString()}
                        </div>
          	            <img src={fuzzy} alt="Loading" title={"Loading"} style={{display: (this.props.gettingGlobalStats ? 'inline' : 'none')}}/>
                      </div>
                  </div>
              </div>
          </div>
      </React.Fragment>
    );
  }
}

export default AppBar;
