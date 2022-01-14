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

describe('logging in', () => {
  const e = chai.request.agent('http://localhost:3000')
  it('should work', done => {
    e.post('/login?name=a&pass=a').end((_, v) => {
      expect(v.text.includes('<title>another nothing</title>')).to.equal(true);
      done()
    })
  }).timeout(10000)

  it('shouldn\'t work', done => {
    chai.request('http://localhost:3000').post('/login?name=a&pass=b').end((_, v) => {
      expect(v.text.includes('<title>sign in</title>')).to.equal(true);
      done()
    })
  })
})
