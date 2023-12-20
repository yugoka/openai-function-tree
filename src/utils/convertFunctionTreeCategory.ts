import { funtionTreeInstructionDescription } from "../prompts/default/defaultPrompts";
import {
  FunctionTreeCategory,
  FunctionTreeCategoryWithTool,
} from "../types/functionTreeCategory";
import {
  FunctionTreeNode,
  FunctionTreeNodeWithTool,
} from "../types/functionTreeNode";

const addToolsToFunctionTreeNode = (
  node: FunctionTreeNode
): FunctionTreeNodeWithTool => {
  if (node.type === "category") {
    // カテゴリ
    return convertFunctionTreeCategory(node);
  } else {
    // アクション
    return node;
  }
};

// FunctionTreeCategoryを内部的に使えるように変換する
export const convertFunctionTreeCategory = (
  functionTreeCategory: FunctionTreeCategory
): FunctionTreeCategoryWithTool => {
  const result: FunctionTreeCategoryWithTool = {
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
              description: funtionTreeInstructionDescription,
            },
          },
        },
      },
    },
    children: functionTreeCategory.children.map((child) =>
      addToolsToFunctionTreeNode(child)
    ),
    prompt: functionTreeCategory.prompt,
    modelName: functionTreeCategory.modelName,
  };
  return result;
};
