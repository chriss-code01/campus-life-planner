

const ITEMS_KEY = "campusflow_items";
const SETTINGS_KEY = "campusflow_settings";


let items = [];

let settings = {
  weeklyTarget: 15,
  weeklyCap: 40,
  name: "",
  theme: "dark"
};

let currentFilter = "all";     
let sortDescending = false;    
let confirmAction = null;     


const sidebar = document.getElementById("sidebar");
const overlay = document.getElementById("overlay");
const menuButton = document.getElementById("menu-button");
const searchInput = document.getElementById("search-input");
const regexCheckbox = document.getElementById("regex-checkbox");
const tagSelect = document.getElementById("tag-select");
const sortSelect = document.getElementById("sort-select");
const directionButton = document.getElementById("direction-button");
const itemsBody = document.getElementById("items-body");
const itemForm = document.getElementById("item-form");
const modal = document.getElementById("modal");



function loadData() {
  try {
    const savedItems = localStorage.getItem(ITEMS_KEY);
    if (savedItems) {
      items = JSON.parse(savedItems);
    }
    const savedSettings = localStorage.getItem(SETTINGS_KEY);
    if (savedSettings) {
      settings = Object.assign(settings, JSON.parse(savedSettings));
    }
  } catch (error) {
    items = [];
  }
}

function saveItems() {
  localStorage.setItem(ITEMS_KEY, JSON.stringify(items));
}

function saveSettings() {
  localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
}


//  helper functions


function Ids() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
}


function escape(text) {
  const div = document.createElement("div");
  div.textContent = text;
  return div.innerHTML.replace(/"/g, "&quot;");
}


function Dateformat(isoDate) {
  if (!isoDate) {
    return "—";
  }
  const date = new Date(isoDate);
  return date.toLocaleString(undefined, {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit"
  });
}


function formatDuration(minutes) {
  if (!minutes) {
    return "—";
  }
  const hours = Math.floor(minutes / 60);
  const rest = minutes % 60;
  let text = "";
  if (hours > 0) {
    text += hours + "h ";
  }
  if (rest > 0) {
    text += rest + "m";
  }
  return text.trim();
}

function priorityName(priority) {
  if (priority === 1) return "Low";
  if (priority === 3) return "High";
  return "Medium";
}


function isOverdue(item) {
  return item.type === "task" && !item.done && item.date && new Date(item.date) < new Date();
}


function getStartOfWeek() {
  const today = new Date();
  const monday = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  const daysSinceMonday = (monday.getDay() + 6) % 7;
  monday.setDate(monday.getDate() - daysSinceMonday);
  return monday;
}


function toInputValue(isoDate) {
  const date = new Date(isoDate);
  const offset = date.getTimezoneOffset() * 60000;
  return new Date(date.getTime() - offset).toISOString().slice(0, 16);
}

function findItem(id) {
  for (let i = 0; i < items.length; i++) {
    if (items[i].id === id) {
      return items[i];
    }
  }
  return null;
}