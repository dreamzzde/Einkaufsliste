const listSelect = document.getElementById("list-select");
const itemList = document.getElementById("item-list");
const itemForm = document.getElementById("item-form");
const itemInput = document.getElementById("item-input");

const addListBtn = document.getElementById("add-list");
const newListForm = document.getElementById("new-list-form");
const newListInput = document.getElementById("new-list-input");
const deleteListBtn = document.getElementById("delete-list");
const clearItemsBtn = document.getElementById("clear-items");

let data = JSON.parse(localStorage.getItem("shoppingData")) || { Supermarkt: [] };
let currentList = Object.keys(data)[0];
let draggingEl = null;
let placeholder = null;
let undoBuffer = null;
let undoTimeout = null;

/* ------------------ FUNKTIONEN ------------------ */
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

  items.forEach((item) => {
    const li = document.createElement("li");
    li.textContent = item.text;
    if (item.done) li.classList.add("done");

    /* Abhaken */
    li.onclick = () => { item.done = !item.done; save(); };

    /* Bearbeiten */
    li.ondblclick = () => {
      const txt = prompt("Artikel bearbeiten", item.text);
      if (txt) item.text = txt;
      save();
    };

    /* Swipe */
    let startX = 0;
    li.addEventListener("touchstart", e => startX = e.touches[0].clientX);
    li.addEventListener("touchend", e => {
      const diff = e.changedTouches[0].clientX - startX;
      if (diff > 80) { item.done = !item.done; save(); }
      if (diff < -80) { data[currentList].splice(items.indexOf(item), 1); save(); }
    });

    /* Drag & Drop */
    li.draggable = true;

    li.addEventListener("dragstart", e => {
      draggingEl = li;
      placeholder = document.createElement("li");
      placeholder.classList.add("placeholder");
      li.classList.add("dragging");
      itemList.insertBefore(placeholder, li.nextSibling);
      e.dataTransfer.effectAllowed = "move";
      e.dataTransfer.setData("text/plain", "");
    });

    li.addEventListener("dragend", () => {
      li.classList.remove("dragging");
      if (placeholder) placeholder.remove();
      draggingEl = null;
      placeholder = null;
      save();
    });

    li.addEventListener("dragover", e => {
      e.preventDefault();
      if (!draggingEl) return;
      const target = e.target;
      if (target && target !== draggingEl && target.tagName === "LI") {
        const rect = target.getBoundingClientRect();
        const next = (e.clientY - rect.top) > rect.height / 2;
        itemList.insertBefore(placeholder, next ? target.nextSibling : target);
      }
    });

    li.addEventListener("drop", e => {
      e.preventDefault();
      if (!draggingEl || !placeholder) return;
      const itemsArray = data[currentList];
      const oldIndex = itemsArray.findIndex(i => i.text === draggingEl.textContent);
      itemsArray.splice(oldIndex, 1);
      const newIndex = Array.from(itemList.children).indexOf(placeholder);
      itemsArray.splice(newIndex, 0, { text: draggingEl.textContent, done: draggingEl.classList.contains("done") });
      save();
    });

    itemList.appendChild(li);
  });
}

/* ------------------ EVENTS ------------------ */

/* Kategorie wechseln */
listSelect.onchange = e => { currentList = e.target.value; renderItems(); };

/* Neue Liste erstellen */
addListBtn.onclick = () => {
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

/* Liste löschen */
deleteListBtn.onclick = () => {
  if (Object.keys(data).length <= 1) return;
  delete data[currentList];
  currentList = Object.keys(data)[0];
  save();
  renderLists();
};

/* Artikel hinzufügen */
itemForm.onsubmit = e => {
  e.preventDefault();
  const val = itemInput.value.trim();
  if (!val) return;
  data[currentList].push({ text: val, done: false });
  itemInput.value = "";
  save();
};

/* Alle Artikel löschen */
clearItemsBtn.onclick = () => {
  const items = data[currentList];
  if (!items.length) return;
  if (!confirm("Alle Artikel löschen?")) return;
  undoBuffer = [...items];
  data[currentList] = [];
  save();
  clearTimeout(undoTimeout);
  undoTimeout = setTimeout(() => undoBuffer = null, 5000);
  if (confirm("Artikel wiederherstellen?") && undoBuffer) {
    data[currentList] = undoBuffer;
    undoBuffer = null;
    save();
  }
};

/* ------------------ INIT ------------------ */
renderLists();
renderItems();
