export const isMap = (val: unknown): val is Map<any, any> =>
    toTypeString(val) === '[object Map]'

export const isSet = (val: unknown): val is Set<any> =>
    toTypeString(val) === '[object Set]'

export const isDate = (val: unknown): val is Date => val instanceof Date

export const isFunction = (val: unknown): val is Function =>
    typeof val === 'function'

export const isString = (val: unknown): val is string => typeof val === 'string'

export const isSymbol = (val: unknown): val is symbol => typeof val === 'symbol'

export const isObject = (val: unknown): val is Record<any, any> =>
    val !== null && typeof val === 'object'

export const isArray = Array.isArray

export const isIntegerKey = (key: unknown) =>
    isString(key) &&
    key !== 'NaN' &&
    key[0] !== '-' &&
    '' + parseInt(key, 10) === key

export const hasChanged = (value: any, oldValue: any): boolean =>
    !Object.is(value, oldValue)

const hasOwnProperty = Object.prototype.hasOwnProperty
export const hasOwn = (
    val: object,
    key: string | symbol
): key is keyof typeof val => hasOwnProperty.call(val, key)

export const objectToString = Object.prototype.toString

export const toTypeString = (value: unknown): string =>
    objectToString.call(value)

export const toRawType = (value: unknown): string => {
    // extract "RawType" from strings like "[object RawType]"
    return toTypeString(value).slice(8, -1)
}

export const getFromPath = (obj: any, strPath: string) => {
    return strPath.split('.').reduce((_, key) => {
        return _[key]
    }, obj)
}

export const setByPath = (obj: any, path: string | string[], value: any) => {
    if (Object(obj) !== obj) return obj // When obj is not an object
    // If not yet an array, get the keys from the string-path
    if (!Array.isArray(path)) path = path.toString().match(/[^.[\]]+/g) || []
    path.slice(0, -1).reduce(
        (
            a,
            c,
            i // Iterate all of them except the last one
        ) =>
            Object(a[c]) === a[c] // Does the key exist and is its value an object?
                ? // Yes: then follow that path
                  a[c]
                : // No: create the key. Is the next key a potential array-index?
                  (a[c] =
                      Math.abs(Number.parseInt(path[i + 1])) >> 0 ===
                      +path[i + 1]
                          ? [] // Yes: assign a new array object
                          : {}), // No: assign a new plain object
        obj
    )[path[path.length - 1]] = value // Finally assign the value to the last key
    return obj // Return the top-level object to allow chaining
}
