import { FunctionTreeCategory, FunctionTreeCategoryWithTool } from "./functionTreeCategory";
import { FunctionTreeTool } from "./functionTreeTool";
export type FunctionTreeNode = FunctionTreeCategory | FunctionTreeTool;
export type FunctionTreeNodeWithTool = FunctionTreeCategoryWithTool | FunctionTreeTool;
