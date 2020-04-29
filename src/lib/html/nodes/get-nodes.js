const { parseDOM } = require('htmlparser2');

const getNodes = ({ html }) => parseDOM(html);

module.exports = getNodes;
