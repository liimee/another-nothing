import React, { Component } from 'react';
import ReactDOM from 'react-dom';

var e;
window.addEventListener('message', (v) => {
  e = v.ports[0]
  e.postMessage({
    do: 'title',
    val: `${title[0]} − ${part[0]} − CHEINSTTROARLY`
  })
});

var book = [
  'Believed to be the start of all time<br />There is a person who once existed. He created -1. And -1 was the world. -1 is the world. -1 is all. Soon afterwards, these two, Petrichor and -1, grew bored of there being only two people. So -1 created something. Something small. Something puny. He created mortals. These mortals lacked the omnipotence of their creator, and of their creator\'s creator. -1 provided for them all they needed. Even a computer. However, this computer had small memory. The first Apple computer had just one byte. Then everything crashed. Soon, the creators slept for many thousands of years.',
  'Believed to be the mortal discovery of the book of CHEINSTTROARLY<br />But first, Petrichor chose to drop a book down to the world that is his creation. -1 blessed the book with a beautiful jungle around it, and the mortals saw this. The mortals came to the jungle and found the book of CHEINSTTROARLY. However, English would not be invented for thousands of years so they buried it in a ditch.',
  'Believed to define rules of prophecies.<br />Curiously, it is the only set of rules.<br />The prophecies in this book may not be altered in any way by either -1 or Petrichor.<br />The exact meaning of said prophecies cannot be disclosed by either -1 or Petrichor<br />-1 and Petrichor cannot use their knowledge of these prophecies to force them to come true<br />And Object in motion stays in motion.<br />These laws are laws of nature, that not even -1 or Petrichor can change.',
  'Believed to be about sacred animals to Petrichor and -1<br />The following animals are sacred to Petrichor and -1:<br />The ant<br />The ant is a messenger to and from the great Petrichor.<br />The goldfish<br />The goldfish is a fish of great beauty and majesty, to be seen as the ants\' link to the water<br />The goat<br />The goat will play a crucial role in the sixth age; they are to be considered sacred<br />The bear<br />The bear was created by -1 to strike down bad people<br />The mosquito<br />The mosquito was created by -1 to strike down bad people',
  'Believed to explain the prophecies. Curiously, there is a lot of conflicting information here.<br />The world will last 4096 ages, each lasting 8192 years, or 2048 years. Each age has prophecies. The prophecies may or may not exist for any given age. Each age will last 1024 pages.',
  'Believed to be numbers<br />1 2 3 4 5 6 7 8 9<br />Believed not to be numbers<br />A B C L • - # ( ͡° ͜ʖ ͡°)',
  'Believed to be about mans discovery of counting<br />One day, mortals will find out that they can have more than one of things. Since mortals like things, they will want a way to see who has the most things. So they can steal their things, and get more things for themselves. Mortals will devise a way of adding things to other things, to get a list of things. This list of things will become different, and soon all lists of things will be the same, varying only for how many things are on the list of things',
  'Oddly like s commercial break.<br />One will be equal to Jeffery himself',
  'Believed to be about mortals stealing other mortals\' things<br />After learning to count things, mortals wanted to have more things, so they counted other mortals\' things and decided to steal them. Soon, everyone\'s things were being stolen, even stolen things were being stolen. The best thieves with the best hiding spots got the most things. Soon, these mortals became bad people. -1 will create a storm to strike them down.',
  'One day mortals will find rocks. They will hit things with rocks. They will make new things. They will use new things to hit rocks. Things will break.',
  'Believed to be the construction of a building at Point Time<br />Where January first is all, Petrichor will create a place for bad people. Then -1 will strike down the bad people.',
  'Believed to be about bad people<br />Bad people will be forced to work on the building or be struck down by -1'
]

var title = [
  'Chapter 1 of the book of CHEINSTTROARLY beginning',
  'Chapter 1 of the book of CHEINSTTROARLY beginning',
  'Chapter 1 of the book of CHEINSTTROARLY the first set of prophetic rules',
  'Chapter 1 of the book of CHEINSTTROARLY sacred animals',
  'Chapter 1 of the book of CHEINSTTROARLY the ages',
  'Chapter 1 of the book of CHEINSTTROARLY data',
  'Chapter 2 of the book of CHEINSTTROARLY the first prophecy of the first age',
  'Chapter 14 of the book of CHEINSTTROARLY the first prophecy of child',
  'Chapter 2 of the book of CHEINSTTROARLY the first prophecy of the first age',
  'Chapter 2 of the book of CHEINSTTROARLY the second prophecy of the first age',
  'Chapter 13 of the book of CHEINSTTROARLY the first prophecy of the sixth age',
  'Chapter 13 of the book of CHEINSTTROARLY the first prophecy of the sixth age'
]

var part = [
  'Part 1',
  'Part 2',
  'part 1',
  'Part 1',
  'Part 1',
  'Part 16',
  'Part 1',
  'Part 14',
  'Part 2',
  'The final first age prophecy',
  'Part 1',
  'Part 2'
]

class App extends Component {
  constructor() {
    super()
    this.state = {
      page: 0
    }
  }

  componentDidUpdate() {
    e.postMessage({
      do: 'title',
      val: `${title[this.state.page]} − ${part[this.state.page]} − CHEINSTTROARLY`
    })
  }

  render() {
    return <><h2>{title[this.state.page]}</h2><h4>{part[this.state.page]}</h4><div style={{textAlign: 'justify'}} dangerouslySetInnerHTML={{__html: book[this.state.page]}} /><button disabled={this.state.page == 0} onClick={() => this.setState({ page: this.state.page-1 })}>Prev</button><button disabled={this.state.page == book.length-1} onClick={() => this.setState({ page: this.state.page+1 })}>Next</button></>
  }
}

ReactDOM.render(<App />, document.querySelector('#app'))
