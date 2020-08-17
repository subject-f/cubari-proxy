const HISTORY_KEY = "history";
export const HISTORY_EVENT_KEY = "history-changed";
const MAX_VALUES = 20;
const HISTORY_EVENT = new Event(HISTORY_EVENT_KEY);

export const insert = (identifier, title, url, coverUrl) => {
  let historicValues = localStorage.getItem(HISTORY_KEY);
  if (historicValues) {
    historicValues = JSON.parse(historicValues).filter(
      (e) => e.identifier !== identifier
    );
    if (historicValues.length >= MAX_VALUES) {
      historicValues.pop();
    }
    historicValues = [{ identifier, title, url, coverUrl }, ...historicValues];
  } else {
    historicValues = [{ identifier, title, url, coverUrl }];
  }
  window.dispatchEvent(HISTORY_EVENT);
  localStorage.setItem(HISTORY_KEY, JSON.stringify(historicValues));
};

export const remove = (identifier) => {
  let historicValues = localStorage.getItem(HISTORY_KEY);
  if (historicValues) {
    historicValues = JSON.parse(historicValues);
    historicValues = historicValues.filter((e) => e.identifier !== identifier);
    window.dispatchEvent(HISTORY_EVENT);
    localStorage.setItem(HISTORY_KEY, JSON.stringify(historicValues));
  }
};

export const getAll = () => {
  return JSON.parse(localStorage.getItem(HISTORY_KEY) || "[]");
};
