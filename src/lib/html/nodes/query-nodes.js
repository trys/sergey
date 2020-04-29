const { selectAll } = require('css-select');

const queryNodes = ({ nodes, selector }) => selectAll(selector, nodes);

module.exports = queryNodes;
