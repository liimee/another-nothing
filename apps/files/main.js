import React, {Component} from 'react';
import ReactDOM from 'react-dom';
import './style.css';

class App extends Component {
  constructor(){
    super()
    this.state = {
      path: ''
    }
  }

  s = (e) => {
    this.setState({
      path: e
    })
  }

  render() {
    return <>
      <div className="path">{this.state.path||'/'}</div>
      <Files path={this.state.path} s={this.s} />
    </>
  }
}

class Files extends Component {
  constructor(props){
    super(props)
    this.f()
    this.state = {
      files: []
    }
  }

  f = () => {
    fetch('/files/'+this.props.path).then(e => {if(e.ok) {return e.json()} throw new Error()}).then(v => {
      this.setState({
        files: v.files
      })
    }).catch(() => {
      alert('Can\'t fetch files')
    })
  }

  componentDidUpdate(a){
    if(a.path != this.props.path) {
      this.f()
    }
  }

  render() {
    return <ul>
    {this.state.files.map(v =>
      <li className={v.dir ? "dir" : "file"}>{v.dir ? <a onClick={() => {this.props.s(this.props.path+'/'+v.name); }}>{v.name}</a> : <>{v.name}</>}</li>
    )}
    </ul>
  }
}

ReactDOM.render(<App />, document.querySelector('#app'))
