import React, { Component } from 'react';
import ReactDOM from 'react-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faAngleUp, faTimes, faExpandAlt } from '@fortawesome/free-solid-svg-icons'
import Draggable from 'react-draggable';

class Bar extends Component {
  //favorites [apps]?
  //TODO: connected/disconnected status?

  render() {
    return <div className="bar">Apps <FontAwesomeIcon icon={faAngleUp} /></div>
  }
}

class App extends Component {
  constructor(props) {
    super(props)
    this.state = {windows: [{app: 'Welcome', id: 0}], num: 1}
  }

  click() {
    var d = this.state.windows;
    d.push({
      app: 'welcome',
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
      <Bar />
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
