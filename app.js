const listSelect = document.getElementById("list-select");
const itemList = document.getElementById("item-list");
const itemForm = document.getElementById("item-form");
const itemInput = document.getElementById("item-input");

const toggleNewListBtn = document.getElementById("toggle-new-list");
const newListForm = document.getElementById("new-list-form");
const newListInput = document.getElementById("new-list-input");

const deleteListBtn = document.getElementById("delete-list");
const shareListBtn = document.getElementById("share-list");
const clearItemsBtn = document.getElementById("clear-items");

let data = JSON.parse(localStorage.getItem("shoppingData")) || {
  Supermarkt: []
};

let currentList = Object.keys(data)[0];
let dragIndex = null;

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
}

function renderItems() {
  itemList.innerHTML = "";
  const items = data[currentList];

  items.forEach((item, index) => {
    const li = document.createElement("li");
    li.textContent = item.text;
    li.draggable = true;

    if (item.done) li.classList.add("done");

    /* CLICK = abhaken */
    li.onclick = () => {
      item.done = !item.done;
      save();
    };

    /* DOPPELTIPP = bearbeiten */
    li.ondblclick = () => {
      const txt = prompt("Artikel bearbeiten", item.text);
      if (txt) item.text = txt;
      save();
    };

    /* SWIPE */
    let startX = 0;
    li.addEventListener("touchstart", e => {
      startX = e.touches[0].clientX;
    });

    li.addEventListener("touchend", e => {
      const diff = e.changedTouches[0].clientX - startX;
      if (diff > 80) {
        item.done = !item.done;
        save();
      }
      if (diff < -80) {
        items.splice(index, 1);
        save();
      }
    });

    /* DRAG & DROP */
    li.ondragstart = () => dragIndex = index;
    li.ondragover = e => e.preventDefault();
    li.ondrop = () => {
      const dragged = items.splice(dragIndex, 1)[0];
      items.splice(index, 0, dragged);
      save();
    };

    itemList.appendChild(li);
  });
}

/* EVENTS */

itemForm.addEventListener("submit", e => {
  e.preventDefault();
  const value = itemInput.value.trim();
  if (!value) return;

  data[currentList].push({ text: value, done: false });
  itemInput.value = "";
  save();
});

listSelect.onchange = e => {
  currentList = e.target.value;
  renderItems();
};

toggleNewListBtn.onclick = () => {
  newListForm.classList.toggle("hidden");
  newListInput.focus();
};

newListForm.onsubmit = e => {
  e.preventDefault();
  const name = newListInput.value.trim();
  if (!name || data[name]) return;

  data[name] = [];
  currentList = name;
  newListInput.value = "";
  newListForm.classList.add("hidden");
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

clearItemsBtn.onclick = () => {
  if (data[currentList].length === 0) return;

  const ok = confirm("Willst du wirklich alle Artikel dieser Liste löschen?");
  if (!ok) return;

  data[currentList] = [];
  save();
};

shareListBtn.onclick = () => {
  let text = `${currentList}\n\n`;
  data[currentList].forEach(i => text += `- ${i.text}\n`);

  navigator.share
    ? navigator.share({ title: currentList, text })
    : alert(text);
};

renderLists();
renderItems();
