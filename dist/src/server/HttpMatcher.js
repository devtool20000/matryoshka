import { StructureConditionMatcher } from "./ConditionMatcher";
export function Header(name, value) {
    if (typeof name === "string") {
        name = {
            [name.toLowerCase()]: value
        };
    }
    const config = name;
    for (let key of Object.keys(config)) {
        const value = config[key];
        delete config[key];
        config[key.toLowerCase()] = value;
    }
    return new StructureConditionMatcher((req, res) => req.headers, name);
}
export function Query(name, value) {
    if (typeof name === "string") {
        name = {
            [name]: value
        };
    }
    const config = name;
    return new StructureConditionMatcher((req, res) => req.query, name, (value) => (x) => String(value) === x);
}
export function Body(name, value) {
    if (typeof name === "string") {
        name = {
            [name]: value
        };
    }
    const config = name;
    return new StructureConditionMatcher((req, res) => req.body, name);
}
export function ResponseHeader(name, value) {
    if (typeof name === "string") {
        name = {
            [name.toLowerCase()]: value
        };
    }
    const config = name;
    for (let key of Object.keys(config)) {
        const value = config[key];
        delete config[key];
        config[key.toLowerCase()] = value;
    }
    return new StructureConditionMatcher((req, res) => {
        return res.response.headers;
    }, name);
}
export function Response(name, value) {
    if (typeof name === "string") {
        name = {
            [name]: value
        };
    }
    const config = name;
    return new StructureConditionMatcher((req, res) => res.response.data, name);
}
export const NotExist = (x) => !x;
export const Exist = (x) => x;
export function LessThan(value) {
    return (x) => x < value;
}
export function LessEqual(value) {
    return (x) => x <= value;
}
export function LargeEqual(value) {
    return (x) => x >= value;
}
export function LargeThan(value) {
    return (x) => x > value;
}
//# sourceMappingURL=HttpMatcher.js.map