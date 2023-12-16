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
  // カテゴリ
  if (node.type === "category") {
    return convertFunctionTreeCategory(node);
    // アクション
  } else {
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
            purpose: {
              type: "string",
              description:
                "One specific action you want to perform, such as 'search about milk production in USA', 'measure room temperature', or 'turn on the TV on the second floor'. Please provide clear and complete instructions.",
            },
          },
        },
      },
    },
    children: functionTreeCategory.children.map((child) =>
      addToolsToFunctionTreeNode(child)
    ),
  };
  return result;
};
