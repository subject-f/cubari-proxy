export default async (url, options) => {
  return fetch(`https://cors.bridged.cc/${url}`, options);
};
