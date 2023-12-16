import { ChatCompletionTool } from "openai/resources";
import { FunctionTreeNode, FunctionTreeNodeWithTool } from "./functionTreeNode";

// カテゴリ(toolはfunctionとして自動生成)
export type FunctionTreeCategory = {
  type: "category";
  name: string;
  description?: string;
  children: FunctionTreeNode[];
  // このカテゴリ内を走査する時のプロンプト
  prompt?: string;
  modelName?: string;
};

// openai toolsを付加したもの(toolsは自動生成)
export type FunctionTreeCategoryWithTool = {
  type: "category";
  tool: ChatCompletionTool;
  children: FunctionTreeNodeWithTool[];
  // このカテゴリ内を走査する時のプロンプト
  prompt?: string;
  modelName?: string;
};

export type FunctionTreeCategoryToolArgs = {
  instruction: string;
};
