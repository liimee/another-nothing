import React, { Component } from 'react';
import ReactDOM from 'react-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faAngleUp, faAngleDown, faTimes, faExpandAlt, faCompressAlt, faWifi } from '@fortawesome/free-solid-svg-icons'
import Draggable from 'react-draggable';
import { Win, Appp } from './types';

var evs = new EventSource('/things');

class Window extends Component<Win, {}> {
  constructor(props: Win) {
    super(props)
  }

  lo = (e) => {
    let channel = new MessageChannel();
    let port1 = channel.port1;
    e.target.contentWindow.postMessage({ name: 'init' }, '*', [channel.port2]);
    port1.onmessage = (e) => {
      console.log(e)
      if(e.data == 'close') {
        this.props.close(this.props.app.id)
      }
    };
  }

  render() {
    const app = this.props.app;
    const drag = this.props.drag;
    const full = this.props.full;

    return <Draggable
    handle=".windowhandle"
    disabled={app.fs}
    bounds=".desktop"
    onStart={() => drag(app.id)}
    >
    <div className={app.fs ? 'window full' : 'window'} data-at-the-top={app.top.toString()}><div className="windowhandle"><span className="windowbtn"><button onClick={() => this.props.close(app.id)}><FontAwesomeIcon icon={faTimes} /></button><button onClick={() => full(app.id)}><FontAwesomeIcon icon={app.fs ? faCompressAlt : faExpandAlt} /></button></span><span className="windowtitle">{app.title}</span></div><iframe onLoad={this.lo} src={"/apps/"+app.app+"/build/index.html"} /></div>
    </Draggable>
  }
}

class Bar extends Component<{openthing: Function, w: JSX.Element[]}, {open: Boolean, apps: {}, c: Boolean}> {
  //favorites [apps]?
  //TODO: connected/disconnected status?

  constructor(props: {openthing: Function, w: JSX.Element[]}) {
    super(props)
    this.state = {
      open: false,
      apps: {},
      c: false
    }
  }

  componentDidMount() {
    evs.addEventListener('apps', (f: MessageEvent) => {
      this.setState({
        apps: JSON.parse(f.data)
      })
    });

    evs.addEventListener('open', () => {
      this.setState({
        c: true
      })
    })

    evs.addEventListener('error', () => {
      this.setState({
        c: false
      })
    })
  }

  openApp(a: String, b: String) {
    this.setState({
      open: false
    })
    this.props.openthing(a, b)
  }

  toggle() {
    this.setState({
      open: !this.state.open
    })
  }

  render() {
    return (
      <>
      <div className="bar"><span title={this.state.c ? 'Server-sent events should be received properly' : 'Server-sent events may not be received'} style={{display: 'inline-block', backgroundColor: this.state.c ? 'var(--color4)' : 'var(--color2)', padding: '1em', color: '#fff', borderBottomLeftRadius: '8px', borderTopLeftRadius: '8px'}}><FontAwesomeIcon icon={faWifi} /></span><span>{this.props.w}</span><span onClick={() => this.toggle()} style={{display: 'inline-block', padding: '1em'}}>Apps <FontAwesomeIcon icon={this.state.open ? faAngleDown : faAngleUp} /></span></div>
      {(() => {
        if(this.state.open) return (
          <div className="apps fs with-padding">
          <h1>Another Nothing</h1>
          <div className="applist">
          {Object.keys(this.state.apps).map((v) => <span onClick={() => this.openApp(v, this.state.apps[v].name)}><img className="icon" src={`/apps/${v}/icon.svg`} alt={`${this.state.apps[v].name} icon`} /> {this.state.apps[v].name}</span>)}
          </div>
          </div>
        )
      })()}
      </>
    )
  }
}

class App extends Component<{}, {windows: Appp[]}> {
  constructor(props: {}) {
    super(props)
    this.state = {windows: [
      {
        id: 0,
        app: 'welcome',
        fs: false,
        top: true,
        title: 'Welcome'
      }
    ]}
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

  click = (app: String, t: String) => {
    console.log(this)
    var d = this.state.windows;
    d.push({
      app,
      id: this.num,
      fs: false,
      top: true,
      title: t
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

  render() {
    return (
      <><div className="desktop">
      {this.state.windows.map((e: Appp) => {return <Window app={e} key={e.id} full={this.toggleFull} drag={this.drag} close={this.close} />})}
      <Bar openthing={this.click} w={this.state.windows.map((e) => {
        return <img onClick={() => this.top(e.id)} className="icon" src={`/apps/${e.app}/icon.svg`} />
      })}/>
      </div></>
    )
  }
}

ReactDOM.render(<App />, document.querySelector('#app'))
