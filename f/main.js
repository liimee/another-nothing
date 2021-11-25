import React from 'react';
import ReactDOM from 'react-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faAngleUp } from '@fortawesome/free-solid-svg-icons'

ReactDOM.render(<App />, document.querySelector('#app'))

function App() {
  return <><div className="desktop"><Bar /></div></>
}

function Bar() {
  //favorites [apps]?
  //TODO: connected/disconnected status?
  return <div className="bar">Apps <FontAwesomeIcon icon={faAngleUp} /></div>
}
