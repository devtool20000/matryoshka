const SPLIT_DOT_PATTERN = /[\.\[]/g


export function deepSet(obj: { [key: string]: any }, parts: string | (string | number)[], value: any) {
  // convert array access to parts
  if (!Array.isArray(parts)) {
    parts = parts.split(SPLIT_DOT_PATTERN).filter(part => part.length > 0).map((part) => {
      if (part.endsWith("]")) {
        return part.substring(0, part.length - 1)
      } else {
        return part
      }
    });
  }
  const arrayGenerationMeta = findFirstArrayGenerationMeta(parts as string[])
  const firstArrayIndex = arrayGenerationMeta.arrayPosition

  if (firstArrayIndex !== -1) {
    const prefix = parts.slice(0, firstArrayIndex)
    let array = deepGet(obj, prefix)
    if (!Array.isArray(array)) {
      array = []
      for (let i = 0; i < arrayGenerationMeta.meta.count; i++) {
        array.push({})
      }
      deepSet(obj, prefix, array)
    }

    const suffix = parts.slice(firstArrayIndex + 1)
    if (suffix.length > 0) {
      for (let item of array) {
        deepSet(item, suffix, value)
      }
    } else {
      for (let i = 0; i < array.length; i++) {
        deepSet(array, [i], value)
      }
    }

    return
  }


  let k = parts[0];
  if (parts.length > 1) {
    var partsLength = parts.length
    k = parts[partsLength - 1];

    for (var i = 0; i < partsLength - 1; i++) {
      let part = parts[i]

      if (!obj.hasOwnProperty(part)) {
        obj[part] = {};
      }
      obj = obj[part];
    }
  }
  if (typeof value !== 'undefined') {
    let realValue = value
    if (isGenerator(value)) {
      realValue = value.next().value
    }
    obj[k] = realValue;
  } else {
    delete obj[k];
  }
}

export function deepGet(obj: { [key: string]: any }, parts: string | (string | number)[], defaultValue: any = null): any | any[] {
  if (!Array.isArray(parts)) {
    parts = parts.split(SPLIT_DOT_PATTERN).filter(part => part.length > 0).map((part) => {
      if (part.endsWith("]")) {
        return part.substring(0, part.length - 1)
      } else {
        return part
      }
    });
  }
  const firstArrayIndex = parts.indexOf("")

  if (firstArrayIndex !== -1) {
    const prefix = parts.slice(0, firstArrayIndex)
    let array = deepGet(obj, prefix)
    if (!Array.isArray(array)) {
      throw new Error(`value at ${prefix}[] is not array`)
    }

    const suffix = parts.slice(firstArrayIndex + 1)
    const result = []
    if (suffix.length > 0) {
      for (let item of array) {
        result.push(deepGet(item, suffix))
      }
    } else {
      for (let i = 0; i < array.length; i++) {
        result.push(deepGet(array, [i]))
      }
    }

    return result.flat()
  }

  if (parts.length === 0) {
    return obj
  }
  var k = parts[0];
  if (parts.length > 1) {
    var partsLength = parts.length
    k = parts[partsLength - 1];

    for (var i = 0; i < partsLength - 1; i++) {
      var part = parts[i]
      if (!obj.hasOwnProperty(part)) {
        break
      }
      obj = obj[part];
    }
  }
  return obj ? (typeof obj[k] !== 'undefined' ? obj[k] : defaultValue) : defaultValue;
}


function isGenerator(value: any): boolean {
  return typeof value === "object" && typeof value.next == "function"
}

function findFirstArrayGenerationMeta(parts: string[]): { arrayPosition: number, meta: ArrayGenerationMeta } {
  for (let i = 0; i < parts.length; i++) {
    const part = parts[i]
    if (part === "") {
      return {
        arrayPosition: i,
        meta: {
          count: 0
        }
      }
    } else if (typeof part === "string") {
      if(part.startsWith("+")){
        const count = Number(part.substring(1))
        if(count === NaN){
          throw new Error(`array count in ${parts.slice(0,i+1)} should be number`)
        }
        if(count < 0){
          throw new Error(`array count in ${parts.slice(0,i+1)} should be >= 0`)
        }

        return {
          arrayPosition: i,
          meta:{
            count
          }
        }
      }
    }
  }

  return {
    arrayPosition: -1,
    meta: {
      count: 0
    }
  }
}

interface ArrayGenerationMeta {
  count: number
}
