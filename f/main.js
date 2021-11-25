import React, { useState, Component } from 'react';
import ReactDOM from 'react-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faAngleUp } from '@fortawesome/free-solid-svg-icons'

class App extends Component {
  constructor(props) {
    super(props)
    this.state = {windows: ['Welcome']}
  }

  click() {
    var d = s;
    d.push('welcome');
    setS(d)
  }

  render() {
    return (
      <><div className="desktop">
      {this.state.windows.map(() => {return <Window app="Welcome" />})}
      <Bar />
      </div></>
    )
  }
}

function Bar() {
  //favorites [apps]?
  //TODO: connected/disconnected status?
  return <div className="bar">Apps <FontAwesomeIcon icon={faAngleUp} /></div>
}

function Window({app}) {
  return <div className="window"><iframe src={"/apps/"+app} /></div>
}

ReactDOM.render(<App />, document.querySelector('#app'))
