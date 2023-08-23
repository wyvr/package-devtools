export function get_parent_node(target, condition) {
    if (typeof condition != 'function') {
        return undefined;
    }
    while (!condition(target)) {
        if (target == document.body) {
            return undefined;
        }
        target = target.parentNode;
    }
    return target;
}
export function search(node, name) {
    if (!node || typeof node != 'object') {
        return [];
    }
    if (node.file == name) {
        return [node];
    }
    if (Array.isArray(node.components) && node.components.length > 0) {
        return node.components
            .map((entry) => search(entry, name))
            .filter((x) => x)
            .flat();
    }
    return [];
}