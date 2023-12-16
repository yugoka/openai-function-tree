import { ChatCompletionTool } from "openai/resources";
import { FunctionTreeNode, FunctionTreeNodeWithTool } from "./functionTreeNode";
export type FunctionTreeCategory = {
    type: "category";
    name: string;
    description?: string;
    children: FunctionTreeNode[];
    prompt?: string;
    modelName?: string;
};
export type FunctionTreeCategoryWithTool = {
    type: "category";
    tool: ChatCompletionTool;
    children: FunctionTreeNodeWithTool[];
    prompt?: string;
    modelName?: string;
};
export type FunctionTreeCategoryToolArgs = {
    _instruction: string;
};
