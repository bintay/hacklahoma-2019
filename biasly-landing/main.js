function typeQuote (quoteText) {
   const text = quoteText || `we enter a world that's just cluttered with spam, fake, digital friends, partisan media, ingenious identity thieves, world-class Ponzi schemers - a deception epidemic`;
   const quote = document.getElementsByClassName('quote')[0];
   let index = 0;
   const time = 3500; // in ms

   let interval;

   interval = setInterval(() => {
      if (index > text.length) {
         clearInterval(interval);
         return;
      }
      quote.innerHTML = text.substring(0, index) + `<span class='hide-text-quote'>${text.substring(index)}</span>`;
      ++index;
   }, time / text.length);
}

typeQuote();

let scrolled = false;
window.onscroll = function () {
   if (!scrolled) {
      setTimeout(() => {
         let columns = document.getElementsByClassName('columns-2');
         for (let i in columns) {
            if (!columns[i].classList) continue;
            setTimeout(() => columns[i].classList.add('fadeIn'), 500 * (i | 0));
         }
      }, 1000);
      scrolled = true;
   }
}