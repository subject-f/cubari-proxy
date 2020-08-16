export default async (url, options) => {
  return fetch(`https://cors-anywhere.herokuapp.com/${url}`, options);
};
