import React, {Component} from 'react';
import {Win} from '../types';
import Draggable from 'react-draggable';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faMinus, faTimes, faExpandAlt, faCompressAlt } from '@fortawesome/free-solid-svg-icons'

export default class Window extends Component<Win, {}> {
  constructor(props: Win) {
    super(props)
  }

  lo = (e) => {
    let channel = new MessageChannel();
    let port1 = channel.port1;
    e.target.contentWindow.postMessage({ do: 'init' }, '*', [channel.port2]);
    port1.onmessage = (e) => {
      console.log(e)
      this.props.msg(e, this.props.app.id)
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
    <div style={{display: app.min ? 'none' : 'block'}} className={app.fs ? 'window full' : 'window'} data-at-the-top={app.top.toString()}><div className="windowhandle"><span className="windowbtn"><button onClick={() => this.props.close(app.id)}><FontAwesomeIcon icon={faTimes} /></button><button disabled={!app.fsable} onClick={() => full(app.id)}><FontAwesomeIcon icon={app.fs ? faCompressAlt : faExpandAlt} /></button><button onClick={() => this.props.min(app.id, true)}><FontAwesomeIcon icon={faMinus} /></button></span><span className="windowtitle">{app.title.length < 1 ? <i style={{color: 'grey'}}>(no title)</i> : app.title}</span></div><iframe onLoad={this.lo} src={"/apps/"+app.app+"/build/index.html"} /></div>
    </Draggable>
  }
}
