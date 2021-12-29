import React, {Component} from 'react';
import ReactDOM from 'react-dom';
import './style.css';

class App extends Component {
  constructor(){
    super()
    this.state = {
      path: ['']
    }
  }

  s = (e) => {
    this.setState({
      path: e
    })
  }

  render() {
    console.log(this.state.path)
    return <>
      <div className="path">{this.state.path.map((v, i) => {
        return <><a onClick={() => {
          var x = this.state.path;
          x = x.slice(0, i+1)
          this.setState({path: x})
        }}>{v}/</a> </>
      })}</div>
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
    fetch('/files/'+(this.props.path||['/']).join('/')).then(e => {if(e.ok) {return e.json()} throw new Error()}).then(v => {
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

  upload = (e) => {
    var f = new FormData();
    Object.values(e.target.files).forEach(v => {
      console.log(v)
      f.append('e[]', v)
    })
    f.append('path', this.props.path.join('/'))

    fetch('/upload', {
      method: 'post',
      body: f
    }).then(e => {if(!e.ok) {throw new Error()}}).then(v => {
      alert('uploaded, i guess')
    }).catch(() => {
      alert('error when uploading file')
    })
  }

  render() {
    return <ul>
    {this.state.files.map(v =>
      <li className={v.dir ? "dir" : "file"}>{v.dir ? <a onClick={() => {this.props.s(this.props.path.concat([v.name]));}}>{v.name}</a> : <>{v.name}</>}</li>
    )}
    <li className="upload">Upload file(s) <input type="file" multiple onChange={this.upload} /></li>
    </ul>
  }
}

ReactDOM.render(<App />, document.querySelector('#app'))
