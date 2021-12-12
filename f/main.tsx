import React, { Component } from 'react';
import ReactDOM from 'react-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faAngleUp, faAngleDown, faTimes, faExpandAlt, faCompressAlt } from '@fortawesome/free-solid-svg-icons'
import Draggable from 'react-draggable';
import { Win, Appp } from './types';

class Window extends Component<Win, {}> {
  constructor(props: Win) {
    super(props)
  }

  componentDidMount() {
    window.addEventListener('message', this.e)
  }

  e = (e: Event) => {
    this.props.msg(e, this.props.app.id)
  }

  componentWillUnmount() {
    window.removeEventListener('message', this.e)
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
    <div className={app.fs ? 'window full' : 'window'} data-at-the-top={app.top.toString()}><div className="windowhandle"><span className="windowbtn"><button onClick={() => this.props.close(app.id)}><FontAwesomeIcon icon={faTimes} /></button><button onClick={() => full(app.id)}><FontAwesomeIcon icon={app.fs ? faCompressAlt : faExpandAlt} /></button></span><span className="windowtitle">{app.title}</span></div><iframe src={"/apps/"+app.app+"/index.html"} /></div>
    </Draggable>
  }
}

class Bar extends Component<{openthing: Function, w: JSX.Element[]}, {open: Boolean, apps: {}}> {
  //favorites [apps]?
  //TODO: connected/disconnected status?

  constructor(props: {openthing: Function, w: JSX.Element[]}) {
    super(props)
    this.state = {
      open: false,
      apps: {}
    }
  }

  openApp(a: String, b: String) {
    this.setState({
      open: false
    })
    this.props.openthing(a, b)
  }

  componentDidMount() {
    //useEffect(() => {
    fetch('/apps')
    .then(r => {
      return r.json()
    }).then((d) => {
      this.setState({
        apps: d
      })
    })
    //})
  }

  toggle() {
    this.setState({
      open: !this.state.open
    })
  }

  render() {
    return (
      <>
      <div className="bar"><span>{this.props.w}</span> <span onClick={() => this.toggle()}>Apps <FontAwesomeIcon icon={this.state.open ? faAngleDown : faAngleUp} /></span></div>
      {(() => {
        if(this.state.open) return (
          <div className="apps fs with-padding">
          <h1>Another Nothing</h1>
          <div className="applist">
          {Object.keys(this.state.apps).map((v: String) => <span onClick={() => this.openApp(v, this.state.apps[v].name)}><img className="icon" src={`/apps/${v}/icon.svg`} alt={`${this.state.apps[v].name} icon`} /> {this.state.apps[v].name}</span>)}
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
    this.state = {windows: []}
  }

  num = 0;

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

  msg = (e: Event, o: Number) => {
    //TODO: things?
  }

  render() {
    return (
      <><div className="desktop">
      {this.state.windows.map((e: Appp) => {return <Window app={e} key={e.id} msg={this.msg} full={this.toggleFull} drag={this.drag} close={this.close} />})}
      <Bar openthing={this.click} w={this.state.windows.map((e) => {
        return <img onClick={() => this.top(e.id)} className="icon" src={`/apps/${e.app}/icon.svg`} />
      })}/>
      </div></>
    )
  }
}

ReactDOM.render(<App />, document.querySelector('#app'))
