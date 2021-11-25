import React, { Component } from 'react';
import ReactDOM from 'react-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faAngleUp } from '@fortawesome/free-solid-svg-icons'

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
    this.state = {windows: ['Welcome']}
  }

  click() {
    var d = this.state.windows;
    d.push('welcome');
    this.setState({
      windows: d
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
  return <div className="window"><iframe src={"/apps/"+app} /></div>
}

ReactDOM.render(<App />, document.querySelector('#app'))
