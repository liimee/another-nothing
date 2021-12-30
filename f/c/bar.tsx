import React, {Component} from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import Tippy from '@tippyjs/react';
import evs from '../evs';
import { faArrowUp, faSignOutAlt, faWifi, faCogs } from '@fortawesome/free-solid-svg-icons';

export default class Bar extends Component<{openthing: Function, w: JSX.Element[]}, {apps: {}, c: Boolean}> {
  //favorites [apps]?

  constructor(props: {openthing: Function, w: JSX.Element[]}) {
    super(props)
    this.state = {
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
    this.props.openthing(a, b)
  }

  render() {
    return (
      <>
      <div className="bar a-f"><Tippy placement='top-start' content={this.state.c ? 'Server-sent events should be received properly' : 'Server-sent events may not be received'}><span style={{display: 'inline-block', backgroundColor: this.state.c ? 'var(--color4)' : 'var(--color2)', padding: '1em', color: '#fff', borderBottomLeftRadius: '6px', borderTopLeftRadius: '6px'}}><FontAwesomeIcon icon={faWifi} /></span></Tippy><span>{this.props.w}</span><Tippy content={
        <><div><b>another nothing <span style={{float: 'right'}}><Tippy content='settings'><a href='/settings' target="_blank"><FontAwesomeIcon icon={faCogs} /></a></Tippy> <Tippy placement='top-end' content='sign out'><a href='/logout'><FontAwesomeIcon icon={faSignOutAlt} /></a></Tippy></span></b></div><h2 style={{marginTop: 0.5}}>apps</h2> {Object.keys(this.state.apps).map((v) => <span className="api" onClick={() => this.openApp(v, this.state.apps[v].name)}><img className="icon" src={`/apps/${v}/icon.svg`} alt={`${this.state.apps[v].name} icon`} /> {this.state.apps[v].name}</span>)}</>
      } arrow={false} theme="light" interactive={true}><span style={{display: 'inline-block', padding: '1em'}}><FontAwesomeIcon icon={faArrowUp} /></span></Tippy></div>
      </>
    )
  }
}
