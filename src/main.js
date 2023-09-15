// @ts-check

// setup - add autocomplete elements to DOM
const autocompContainer = document.createElement('div');
autocompContainer.classList.add('_autocomp-container');

const autocompList = document.createElement('ul');
autocompList.classList.add('_autocomp-list');

// i want typescript :(
const searchWrapper = /** @type {HTMLDivElement} */ (
  document.querySelector('#header > div.header-search.js-only')
);

searchWrapper.appendChild(autocompContainer);
autocompContainer.appendChild(autocompList);

// couldn't get truncation to work in css because of dynamic width from flexbox
// so i'm setting a set width of the autocompContainer to match the searchWrapper
// there are better solutions to this, but i don't want to change any base site styles to fix this garbage
function setWidthOfContainer() {
  let width = searchWrapper.offsetWidth;
  autocompContainer.style.width = `${width}px`;

  // hide search bar because resizing causes a weird issue when it is open
  autocompContainer.style.display = 'none';
}

setWidthOfContainer();
window.addEventListener('resize', setWidthOfContainer);

/**
 * @param {string} text
 * @returns {Promise<string[]>}
 */
async function getItems(text) {
  // const baseUrl = `http://localhost:3000`;
  const baseUrl = `https://api.dalksnis.lv`;
  const url = `${baseUrl}/tezaurs/autocomp?text=${text}`;

  /** @type {string[]} */
  let data;

  try {
    const req = await fetch(url);
    data = (await req.json()).data;
  } catch (e) {
    return [];
  }

  return data;
}

// get the main input field element
const inputElement = /** @type {HTMLInputElement} */ (
  document.querySelector('#searchField')
);

let currentInputValue = '';

inputElement.addEventListener('input', async event => {
  // @ts-ignore typescript complains here for no reason, so ignore :^)
  currentInputValue = event.target?.value.trim();

  if (!currentInputValue) {
    autocompContainer.style.display = 'none';
    return;
  }

  // store the current input value into a temp const
  const tempInputValue = currentInputValue;

  const items = await getItems(currentInputValue);
  if (!items.length) return;

  // prevents a race condition
  // if the current value has changed, don't update the list with old values
  if (tempInputValue !== currentInputValue) return;

  autocompList.replaceChildren(
    ...items.map(word => {
      const listItemElement = document.createElement('li');
      listItemElement.classList.add('_autocomp-list-item');
      const linkElement = document.createElement('a');
      listItemElement.appendChild(linkElement);
      linkElement.innerText = word;
      linkElement.href = `/${word}`;
      return listItemElement;
    })
  );

  autocompContainer.style.display = 'block';
});

// close autocomp menu if clicked outside of it
document.addEventListener('click', event => {
  if (!searchWrapper.contains(event.target)) {
    autocompContainer.style.display = 'none';
  }
});

// show autocomp menu if input is focused
inputElement.addEventListener('focus', () => {
  if (!currentInputValue.length) return;
  autocompContainer.style.display = 'block';
});

document.addEventListener('keydown', event => {
  // close autocomp menu and blur input when Esc is pressed
  if (event.code === 'Escape') {
    // inputElement.blur();
    autocompContainer.style.display = 'none';
  }
});
