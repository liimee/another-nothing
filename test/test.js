//yes testing ruby code with js
const chai = require('chai')
const {expect} = chai;
const chaiHttp = require('chai-http');

chai.use(chaiHttp)


describe('adding users', () => {
  const e = chai.request.agent('http://localhost:3000')

  it('should work', done => {
    e.post('/addus?name=a&pass=a&admin=on')
    .end((g, v) => {
      expect(g).to.be.null;
      expect(v).to.redirect;
      expect(e).to.have.cookie('login');
      done()
    })
  }).timeout(30000)

  it('should work 2', done => {
    e.post('/addus?name=b&pass=b')
    .end((g, v) => {
      expect(g).to.be.null;
      expect(v).to.redirect;
      expect(e).to.have.cookie('login');
      done()
    })
  }).timeout(30000)

  it('shouldn\'t work', done => {
    e.post('/addus?name=c&pass=c')
    .end((_, v) => {
      expect(v).to.have.status(403)
      done()
    })
  }).timeout(30000)
});

const e = chai.request.agent('http://localhost:3000')
describe('logging in', () => {
  it('should work', done => {
    e.post('/login?name=a&pass=a').end((_, v) => {
      expect(v).to.have.header('X-Is', 'Desktop')
      done()
    })
  }).timeout(10000)

  it('shouldn\'t work', done => {
    chai.request('http://localhost:3000').post('/login?name=a&pass=b').end((_, v) => {
      expect(v).to.have.header('X-Is', 'Login')
      done()
    })
  })
})

describe('upload, perm', () => {
  describe('before', () => {
    it('should fail (file)', done => {
      e.post('/upload')
      .set('Referer', 'http://localhost:3000/apps/files/build/index.html')
      .attach('e[]', Buffer.from('test test test', 'utf8'))
      .end((_, v) => {
        expect(v).to.have.status(403)
        expect(v.text).to.equal('you don\'t have permission')
        done()
      })
    })

    it('should fail (dir)', done => {
      e.post('/dir?p=e')
      .set('Referer', 'http://localhost:3000/apps/files/build/index.html')
      .end((_, v) => {
        expect(v).to.have.status(403)
        expect(v.text).to.equal('you don\'t have permission')
        done()
      })
    })
  })

  describe('change settings', () => {
    it('should work', done => {
      e.post('/settings?wp=default&users[]=a&users[]=b&app_files[]=app&app_files[]=upload&app_test[]=app&app_welcome[]=app&pass=a')
      .set('Referer', 'http://localhost:3000/settings')
      .end((_, v) => {
        expect(v).to.have.header('X-Is', 'Settings')
        done()
      })
    })
  })

  describe('after', () => {
    it('should work (file)', done => {
      e.post('/upload')
      .set('Referer', 'http://localhost:3000/apps/files/build/index.html')
      .attach('e[]', Buffer.from('test test test', 'utf8'), {
        filename: 'e.txt'
      })
      .end((_, v) => {
        expect(v).to.have.status(200)
        expect(v.text).to.equal('ok, i guess')
        done()
      })
    })

    it('should work (dir)', done => {
      e.post('/dir?p=e')
      .set('Referer', 'http://localhost:3000/apps/files/build/index.html')
      .end((_, v) => {
        expect(v).to.have.status(200)
        expect(v.text).to.equal('ok')
        done()
      })
    })
  })

  describe('check', () => {
    it('/e.txt should exist', () => {
      e.get('/files/e.txt').end((_, v) => expect(v.text).to.equal('test test test'))
    })

    it('/e/ should exist', () => {
      e.get('/files/e').end((_, v) => expect(JSON.parse(v.text)).to.deep.equal({
        files: []
      }))
    })
  })
})
