import React, { Component, useEffect } from 'react';
import ReactDOM from 'react-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faAngleUp, faAngleDown, faTimes, faExpandAlt } from '@fortawesome/free-solid-svg-icons'
import Draggable from 'react-draggable';

class Bar extends Component {
  //favorites [apps]?
  //TODO: connected/disconnected status?

  constructor(props) {
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
          <div class="applist">
          {Object.values(this.state.apps).map(v => <span onClick={() => this.openApp()}>{v.name}</span>)}
          </div>
          </div>
        )
      })()}
      </>
    )
  }
}

class App extends Component {
  constructor(props) {
    super(props)
    this.state = {windows: [{app: 'Welcome', id: 0}], num: 1}
  }

  click = () => {
    console.log(this)
    var d = this.state.windows;
    d.push({
      app: 'Welcome',
      id: this.state.num
    });
    this.setState({
      windows: d,
      num: this.state.num++
    })
  }

  render() {
    return (
      <><div className="desktop">
      {this.state.windows.map((e) => {return <Window app={e} />})}
      <Bar openthing={this.click} />
      </div></>
    )
  }
}

function Window({app}) {
  return <Draggable
    handle=".windowhandle"
  >
  <div className="window" data-app-id={app.id}><div className="windowhandle"><span className="windowbtn"><button><FontAwesomeIcon icon={faTimes} /></button><button><FontAwesomeIcon icon={faExpandAlt} /></button></span></div><iframe src={"/apps/"+app.app} /></div>
  </Draggable>
}

ReactDOM.render(<App />, document.querySelector('#app'))
