/* eslint-disable */
module.exports = function(content) {
  const jso = JSON.parse(content);
  if (!jso.options) jso.options = {};
  jso.options.base = process.env.publicPath;
  return JSON.stringify(jso);
};
