// element tree结构中，获取选中的节点和父级节点构成的新树，并保持原数据结构不变--包括半选父级

import type { TreeKey } from "element-plus";

/**
 * @param data 原树形结构
 * @param keys 需要被筛选的节点
 * @param key 对应树形结构中的key ---tree中props的label
 * */
export const filterTree = (data: any[], keys: TreeKey[], nodeKey: string, children = 'children') => {
    const labelSet = new Set(keys);

    function traverse(nodes: any[]) {
        const filteredChildren: any[] = [];

        for (const node of nodes) {
            let childHasMatch = false;
            let newChildren: any[] = [];

            if (node[children]) {
                newChildren = traverse(node[children]);
                childHasMatch = newChildren.length > 0;
            }

            const currentMatch = labelSet.has(node[nodeKey]) || childHasMatch;

            if (currentMatch) {
                const newNode = { ...node };
                if (newChildren.length > 0) {
                    newNode[children] = newChildren;
                } else {
                    delete newNode[children];
                }
                filteredChildren.push(newNode);
            }
        }

        return filteredChildren;
    }

    return traverse(data);
};

/**
 * 构建选中的树形结构--不包括半选父级
 * checkedKeys为nodekey
 * */
export const buildSelectedTree = (
    tree: any[],
    checkedKeys: string[],
    nodeKey: string,
    children = 'children'
) => {
    // 创建一个扁平化的选中节点映射，便于快速查找
    const checkedMap: Record<string, any> = {};
    checkedKeys.forEach((key) => {
        checkedMap[key] = true;
    });

    // 递归查找选中节点的函数
    const findSelectedNodes = (nodes: any[]) => {
        const result: any[] = [];

        for (const node of nodes) {
            if (checkedMap[node[nodeKey]]) {
                // 如果节点被选中，直接添加到结果中
                result.push({ ...node });
            } else if (node[children] && node[children].length > 0) {
                // 如果节点未被选中但有子节点，递归查找子节点
                const selectedChildren = findSelectedNodes(node[children]);
                if (selectedChildren.length > 0) {
                    // 如果有子节点被选中，将这些子节点添加到结果中
                    result.push(...selectedChildren);
                }
            }
        }

        return result;
    };

    return findSelectedNodes(tree);
};

// 获取当前节点以及父级节点并变为数组平级数组--包含半选
export const findNodeAndBuildTree = (
    tree: any[],
    targetId: string,
    nodeKey: string,
    children = 'children'
) => {
    let arr = [];
    // 查找目标节点及其路径
    function findPath(node: Record<string, any>, path: any[] = []) {
        path.push(node);

        if (node[nodeKey] === targetId) {
            return path.slice(); // 返回路径的副本
        }

        if (node[children] && node[children].length > 0) {
            for (let child of node[children]) {
                const result: any = findPath(child, path);
                if (result) return result;
            }
        }

        path.pop(); // 回溯
        return null;
    }

    // 在整棵树中查找路径
    for (let rootNode of tree) {
        const path = findPath(rootNode, []);
        if (path) arr = path;
    }

    return arr; // 未找到目标节点
};

/**
 * 获取给定keys中的子节点
 * */
export const findLeafNodesOptimized = (flatArray: string[]) => {
    if (!Array.isArray(flatArray) || flatArray.length === 0) {
        return [];
    }

    const nodeSet = new Set<string>(flatArray);
    const parentNodes = new Set<string>();

    for (const nodeId of flatArray) {
        // 检查当前节点是否是其他节点的父节点
        for (const otherNode of nodeSet) {
            if (otherNode !== nodeId && otherNode.startsWith(nodeId + '.')) {
                parentNodes.add(nodeId);
                break; // 找到一个子节点就足够证明它是父节点
            }
        }
    }

    return flatArray.filter((nodeId) => !parentNodes.has(nodeId));
};

// 获取当前点击节点层级向上的层级构成的树
export const getTreePathByIdOptimized = (
    tree: any[],
    targetNodeKey: string,
    nodeKey = 'id',
    children = 'children'
) => {
    function findAndBuildPath(nodes: any[], targetNodeKey: string) {
        for (const node of nodes) {
            if (node[nodeKey] === targetNodeKey) {
                // 找到目标节点，返回该节点的完整拷贝
                return JSON.parse(JSON.stringify(node));
            }

            if (node[children] && node[children].length > 0) {
                const found: any = findAndBuildPath(node[children], targetNodeKey);
                if (found) {
                    // 构建路径上的父节点，只包含找到的子节点路径
                    return {
                        ...node,
                        [children]: [found]
                    };
                }
            }
        }
        return null;
    }

    return findAndBuildPath(tree, targetNodeKey);
};

// 获取给定的键中的叶子节点
export const filterLeafNodes = (tree: any, nodeKeys: string[], nodeKey: string) => {
    // 创建一个集合用于快速查找
    const idSet = new Set(nodeKeys);
    const leafNodes: any[] = [];

    // 递归遍历树结构
    function traverse(nodes: any) {
        for (const node of nodes) {
            // 如果当前节点在materialIds中且是叶子节点，则保留
            if (idSet.has(node.materialId)) {
                const isLeaf = !node.children || node.children.length === 0;
                if (isLeaf) {
                    leafNodes.push(node[nodeKey]);
                }
            }

            // 递归遍历子节点
            if (node.children && node.children.length > 0) {
                traverse(node.children);
            }
        }
    }

    traverse(tree);
    return leafNodes;
};
