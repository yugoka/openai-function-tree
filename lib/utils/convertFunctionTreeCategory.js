"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.convertFunctionTreeCategory = void 0;
const defaultPrompts_1 = require("../prompts/default/defaultPrompts");
const addToolsToFunctionTreeNode = (node) => {
    if (node.type === "category") {
        // カテゴリ
        return (0, exports.convertFunctionTreeCategory)(node);
    }
    else {
        // アクション
        return node;
    }
};
// FunctionTreeCategoryを内部的に使えるように変換する
const convertFunctionTreeCategory = (functionTreeCategory) => {
    const result = {
        type: "category",
        tool: {
            type: "function",
            function: {
                name: functionTreeCategory.name,
                description: functionTreeCategory.description,
                parameters: {
                    type: "object",
                    properties: {
                        _instruction: {
                            type: "string",
                            description: defaultPrompts_1.funtionTreeInstructionDescription,
                        },
                    },
                },
            },
        },
        children: functionTreeCategory.children.map((child) => addToolsToFunctionTreeNode(child)),
        prompt: functionTreeCategory.prompt,
    };
    return result;
};
exports.convertFunctionTreeCategory = convertFunctionTreeCategory;
