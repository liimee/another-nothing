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

describe('upload', () => {
  it('should fail', done => {
    e.post('/upload')
    .set('Referer', 'http://localhost:3000/apps/files/build/index.html')
    .attach('e', Buffer.from('test test test', 'utf8'))
    .end((_, v) => {
      expect(v).to.have.status(403)
      expect(v.text).to.equal('you don\'t have permission')
      done()
    })
  })
})
