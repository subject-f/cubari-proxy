export const capitalizeFirstLetters = (sentence) => {
  return sentence
    .split(" ")
    .filter(Boolean)
    .map((str) => str.charAt(0).toUpperCase() + str.toLowerCase().slice(1))
    .join(" ");
};
