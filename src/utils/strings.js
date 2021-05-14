export const capitalizeFirstLetters = (sentence) => {
  return sentence
    .split(" ")
    .filter(Boolean)
    .map((str) => str.charAt(0).toUpperCase() + str.toLowerCase().slice(1))
    .join(" ");
};

export const trimSentence = (sentence, length) => {
  if (sentence) {
    return sentence.slice(0, length) + (sentence.length > length ? "..." : "");
  } else {
    return "";
  }
};

export const classNames = (...classes) => {
  return classes.filter(Boolean).join(" ");
};
