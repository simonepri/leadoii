function getObjectAttribute(object, key) {
  let value = object;
  for (let attribute of key.split('.')) {
    value = value[attribute];
  }
  return value;
}

function universalObjectComparator(key, isDesc = false) {
  const multiplier = isDesc ? -1 : 1;
  function comparator(a, b) {
    a = getObjectAttribute(a, key)
    b = getObjectAttribute(b, key)

    if (a === b) {
      return 0
    } else if (a === null || a === undefined || Number.isNaN(a)) {
      // a is last
      return 1
    } else if (b === null || b === undefined || Number.isNaN(b)) {
      // b is last
      return -1
    } else if (typeof a === 'number' && typeof b === 'number') {
      // numerical compare, negate if descending
      return (a - b) * multiplier
    }
    // locale compare, negate if descending
    return String(a).localeCompare(String(b)) * multiplier
  }
  return comparator;
}

function parseQueryArray(query) {
  if (Array.isArray(query)) {
    return [...new Set(query)];
  } else if (typeof query === "string") {
    return [query];
  }
  return [];
}

export default {
  universalObjectComparator,
  parseQueryArray,
}
