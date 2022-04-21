

export function flattenHierarchy<MetaUnit>(meta: any): MetaUnit[] {
  const result: MetaUnit[] = []
  _recursiveFlattenHierarchy(meta, "", result)
  return result
}


export function _recursiveFlattenHierarchy(meta: any, root: string, result: any[]) {
  for (let key of Object.keys(meta)) {
    const path = root.length > 0 ? `${root}.${key}` : key
    if (typeof meta[key] === "object" && !Array.isArray(meta[key])) {
      _recursiveFlattenHierarchy(meta[key] , path, result)
    } else {
      result.push({
        path,
        value: meta[key]
      })
    }
  }
}
