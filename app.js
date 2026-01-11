const listSelect = document.getElementById("list-select");
const categorySelect = document.getElementById("category-select");
const itemList = document.getElementById("item-list");

const itemForm = document.getElementById("item-form");
const itemInput = document.getElementById("item-input");

const newListForm = document.getElementById("new-list-form");
const newListInput = document.getElementById("new-list-input");
const deleteListBtn = document.getElementById("delete-list");
const shareListBtn = document.getElementById("share-list");

const newCategoryForm = document.getElementById("new-category-form");
const newCategoryInput = document.getElementById("new-category-input");
const editCategoryBtn = document.getElementById("edit-category");
const deleteCategoryBtn = document.getElementById("delete-category");

let data = JSON.parse(localStorage.getItem("shoppingData")) || {
  supermarkt: { categories: { Allgemein: [] } }
};

let currentList = Object.keys(data)[0];
let currentCategory = Object.keys(data[currentList].categories)[0];

function save() {
  localStorage.setItem("shoppingData", JSON.stringify(data));
  renderItems();
}

function renderLists() {
  listSelect.innerHTML = "";
  Object.keys(data).forEach(name => {
    listSelect.innerHTML += `<option value="${name}">${name}</option>`;
  });
  listSelect.value = currentList;
  renderCategories();
}

function renderCategories() {
  categorySelect.innerHTML = "";
  Object.keys(data[currentList].categories).forEach(cat => {
    categorySelect.innerHTML += `<option value="${cat}">${cat}</option>`;
  });
  currentCategory = categorySelect.value;
  renderItems();
}

function renderItems() {
  itemList.innerHTML = "";
  const items = data[currentList].categories[currentCategory];

  const sorted = [
    ...items.filter(i => !i.done),
    ...items.filter(i => i.done)
  ];

  sorted.forEach(item => {
    const li = document.createElement("li");
    li.draggable = true;
    li.textContent = item.text;
    if (item.done) li.classList.add("done");

    li.onclick = () => { item.done = !item.done; save(); };

    li.ondblclick = () => {
      const txt = prompt("Artikel bearbeiten", item.text);
      if (txt) item.text = txt;
      save();
    };

    const del = document.createElement("button");
    del.textContent = "❌";
    del.onclick = e => {
      e.stopPropagation();
      items.splice(items.indexOf(item), 1);
      save();
    };

    li.appendChild(del);
    itemList.appendChild(li);
  });
}

/* EVENTS */

itemForm.onsubmit = e => {
  e.preventDefault();
  data[currentList].categories[currentCategory].push({ text: itemInput.value, done: false });
  itemInput.value = "";
  save();
};

newListForm.onsubmit = e => {
  e.preventDefault();
  const name = newListInput.value.trim();
  if (!name || data[name]) return;
  data[name] = { categories: { Allgemein: [] } };
  currentList = name;
  newListInput.value = "";
  save();
  renderLists();
};

deleteListBtn.onclick = () => {
  if (Object.keys(data).length <= 1) return;
  delete data[currentList];
  currentList = Object.keys(data)[0];
  save();
  renderLists();
};

listSelect.onchange = e => {
  currentList = e.target.value;
  renderCategories();
};

newCategoryForm.onsubmit = e => {
  e.preventDefault();
  const name = newCategoryInput.value.trim();
  if (!name) return;
  data[currentList].categories[name] = [];
  newCategoryInput.value = "";
  save();
  renderCategories();
};

editCategoryBtn.onclick = () => {
  const newName = prompt("Kategorie umbenennen", currentCategory);
  if (!newName) return;
  data[currentList].categories[newName] =
    data[currentList].categories[currentCategory];
  delete data[currentList].categories[currentCategory];
  currentCategory = newName;
  save();
  renderCategories();
};

deleteCategoryBtn.onclick = () => {
  if (Object.keys(data[currentList].categories).length <= 1) return;
  delete data[currentList].categories[currentCategory];
  currentCategory = Object.keys(data[currentList].categories)[0];
  save();
  renderCategories();
};

shareListBtn.onclick = () => {
  let text = `${currentList}\n\n`;
  Object.entries(data[currentList].categories).forEach(([cat, items]) => {
    text += `${cat}:\n`;
    items.forEach(i => text += `- ${i.text}\n`);
    text += "\n";
  });

  navigator.share
    ? navigator.share({ title: currentList, text })
    : alert(text);
};

renderLists();
