import React, { Component } from 'react';
import { Appp, Conf } from '../types';
import Bar from './bar';
import evs from '../evs';
import Tippy from '@tippyjs/react';
import Window from './window';

export default class App extends Component<{}, {windows: Appp[], conf: Conf}> {
  constructor(props: {}) {
    super(props)
    this.state = {windows: [
      {
        id: 0,
        app: 'welcome',
        fs: false,
        top: true,
        title: 'Welcome',
        fsable: true,
        min: false
      }
    ], conf: {wp: 'default'}}
  }

  componentDidMount() {
    evs.addEventListener('conf', (e: MessageEvent) => {
      this.setState({
        conf: JSON.parse(e.data)
      })
    })
  }

  num = 1;

  noOneIsAtTheTop = () => {
    var s = this.state.windows;
    s.forEach((_, i) => {
      s[i].top = false
    })
    this.setState({
      windows: s
    })
  }

  click = (app: string, t: string) => {
    console.log(this)
    var d = this.state.windows;
    d.push({
      app,
      id: this.num,
      fs: false,
      top: true,
      title: t,
      fsable: true,
      min: false
    });
    this.setState({
      windows: d
    })
    this.num+=1
  }

  toggleFull = (o: Number) => {
    var f = this.state.windows
    var d = f.findIndex(s => s.id == o);
    f[d].fs = !f[d].fs;
    this.setState({
      windows: f
    })
  }

  close = (o: Number) => {
    this.setState(prev => ({
      windows: prev.windows.filter(e => e.id !== o)
    }))
  }

  drag = (o: Number) => {
    this.noOneIsAtTheTop()
    var f = this.state.windows
    var d = f.findIndex(s => s.id == o);
    f[d].top = true;
    this.setState({
      windows: f
    })
  }

  top = (o: Number) => {
    this.noOneIsAtTheTop();
    var f = this.state.windows
    var d = f.findIndex(s => s.id == o);
    f[d].top = true;
    this.setState({
      windows: f
    })
  }

  min = (o: number, e: boolean) => {
    this.noOneIsAtTheTop();
    var f = this.state.windows
    var d = f.findIndex(s => s.id == o);
    f[d].min = e;
    this.setState({
      windows: f
    })
  }

  msg = ({data}: MessageEvent, i: Number) => {
    switch(data.do) {
      case 'title':
      var f = this.state.windows
      var d = f.findIndex(s => s.id == i);
      f[d].title = data.val;
      this.setState({
        windows: f
      });
      break;
      case 'close':
      this.close(i);
      break;
      case 'fsable':
      var f = this.state.windows
      var d = f.findIndex(s => s.id == i);
      f[d].fsable = data.val;
      this.setState({
        windows: f
      });
    }
  }

  render() {
    return (
      <><div className="desktop a-f" style={{backgroundImage: this.state.conf.wp != 'default' ? `url(/files/${encodeURIComponent(this.state.conf.wp)})` : 'linear-gradient(to right, #e4ff61, rgba(0, 255, 35, .25))'}}>
      {this.state.windows.map((e: Appp) => {return <Window app={e} min={this.min} key={e.id} full={this.toggleFull} drag={this.drag} close={this.close} msg={this.msg} />})}
      <Bar openthing={this.click} w={this.state.windows.map((e) => {
        return <Tippy content={e.title} arrow={false} delay={[300, 100]}><img onClick={() => { this.top(e.id); this.min(e.id, false); }} className="icon" src={`/apps/${e.app}/icon.svg`} /></Tippy>
      })}/></div></>
    )
  }
}
