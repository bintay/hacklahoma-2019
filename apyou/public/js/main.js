

function type (element, list) {
   let listIndex = 0;
   let wordIndex = 0;
   let typing = 1;

   setInterval(() => {
      let word = list[listIndex];
      if (typing == 1 && wordIndex == word.length) {
         typing = 0;
         setTimeout(() => { typing = -1 }, 2000);
      } else if (typing == -1 && wordIndex == 0) {
         typing = 0;
         listIndex = (listIndex + 1) % list.length;
         setTimeout(() => { typing =  1}, 200);
      } else {
         wordIndex += typing;
      }
      element.innerText = list[listIndex].substring(0, wordIndex);
   }, 40);
}

type(document.getElementById('needs'), ['The weather?', 'A JavaScript console?', 'A cute picture?', 'A song recommendation?']);
type(document.getElementById('examples'), ['What\'s the weather in Tulsa?', 'JavaScript Math.random() * 3', 'Tell me a fact about cats']);
