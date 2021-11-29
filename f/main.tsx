import React, { Component } from 'react';
import ReactDOM from 'react-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faAngleUp, faAngleDown, faTimes, faExpandAlt } from '@fortawesome/free-solid-svg-icons'
import Draggable from 'react-draggable';
import { Win, Apps, Appp } from './types';

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
    onStart={() => drag(app.id)}
    >
    <div className={app.fs ? 'window full' : 'window'} data-at-the-top={app.top.toString()}><div className="windowhandle"><span className="windowbtn"><button><FontAwesomeIcon icon={faTimes} /></button><button onClick={() => full(app.id)}><FontAwesomeIcon icon={faExpandAlt} /></button></span>{app.id}</div><iframe src={"/apps/"+app.app} /></div>
    </Draggable>
  }
}

class Bar extends Component<{openthing: Function}, {open: Boolean, apps: {}}> {
  //favorites [apps]?
  //TODO: connected/disconnected status?

  constructor(props: {openthing: Function}) {
    super(props)
    this.state = {
      open: false,
      apps: {}
    }
  }

  openApp() {
    this.setState({
      open: false
    })
    this.props.openthing()
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
      <div onClick={() => this.toggle()} className="bar">Apps <FontAwesomeIcon icon={this.state.open ? faAngleDown : faAngleUp} /></div>
      {(() => {
        if(this.state.open) return (
          <div className="apps fs with-padding">
          <h1>Another Nothing</h1>
          <div className="applist">
          {Object.values(this.state.apps).map((v: Apps) => <span onClick={() => this.openApp()}>{v.name}</span>)}
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

  click = () => {
    console.log(this)
    var d = this.state.windows;
    d.push({
      app: 'Welcome',
      id: this.num,
      fs: false,
      top: true
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

  msg = (e: Event, o: Number) => {
    //TODO: things?
  }

  render() {
    return (
      <><div className="desktop">
      {this.state.windows.map((e: Appp) => {return <Window app={e} key={e.id} full={this.toggleFull} drag={this.drag} close={this.close} />})}
      <Bar openthing={this.click} />
      </div></>
    )
  }
}

ReactDOM.render(<App />, document.querySelector('#app'))
