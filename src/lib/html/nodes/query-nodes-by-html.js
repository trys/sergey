const getNodes = require('./get-nodes');
const queryNodes = require('./query-nodes');

const queryNodesByHTML = ({ html, selector }) => {
  const rootNodes = getNodes({ html });
  const nodes = queryNodes({ nodes: rootNodes, selector });

  return {
    rootNodes,
    nodes,
  };
};

module.exports = queryNodesByHTML;
