// @ts-check

// setup - add autocomplete elements to DOM
const autocompContainer = document.createElement('div');
autocompContainer.classList.add('_autocomp-container');

const autocompList = document.createElement('ul');
autocompList.classList.add('_autocomp-list');

const searchWrapper = document.querySelector(
  '#header > div.header-search.js-only'
);

searchWrapper.appendChild(autocompContainer);
autocompContainer.appendChild(autocompList);

/**
 * @param {string} text
 * @returns {Promise<{ word: string, key: string }[]>}
 */
async function getItems(text) {
  // const baseUrl = `http://localhost:3000`;
  const baseUrl = `https://api.dalksnis.lv`;
  const url = `${baseUrl}/tezaurs/autocomp?text=${text}`;

  /**
   * @type {{ word: string, key: string }[]}
   */
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
const inputElement = document.querySelector('#searchField');

let inputValue = '';

inputElement.addEventListener('input', async event => {
  inputValue = event.target.value.trim();

  if (!inputValue) {
    autocompContainer.style.display = 'none';
    return;
  }

  const items = await getItems(inputValue);

  autocompList.replaceChildren(
    ...items.map(({ word }) => {
      const listItemElement = document.createElement('ul');
      listItemElement.classList.add('_autocomp-list-item');
      const linkElement = document.createElement('a');
      listItemElement.appendChild(linkElement);
      linkElement.innerText = word;
      linkElement.href = `/${word}`;
      return listItemElement;
    })
  );

  autocompContainer.style.display = 'block';

  console.log('Input field updated:', inputValue);
  console.log('items', items);
});

// inputElement.addEventListener('focus', () => {
//   if (!inputValue.length) return;
//   autocompContainer.style.display = 'block';
// });

// inputElement.addEventListener('blur', () => {
//   setTimeout(() => {
//     autocompContainer.style.display = 'none';
//   }, 100);
// });
