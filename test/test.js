//yes testing ruby code with js
const chai = require('chai')
const {expect} = chai;
const chaiHttp = require('chai-http');

chai.use(chaiHttp)

const e = chai.request.agent('http://localhost:3000')

describe('adding users', () => {
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
