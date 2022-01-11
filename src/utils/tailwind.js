import preval from "preval.macro";

export const tailwindConfig = preval`
  const resolveConfig = require('tailwindcss/resolveConfig');
  const tailwindConfig = require('../../tailwind.config');
  module.exports = resolveConfig(tailwindConfig);
`;
