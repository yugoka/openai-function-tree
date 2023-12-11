import { ChatCompletionTool } from "openai/resources";
import { FunctionTreeActionExecutable } from "./actionExecutable";

// スキルツリーの末端になるアクション
export type FunctionTreeTool = {
  type: "tool";
  tool: ChatCompletionTool;
  function: FunctionTreeActionExecutable;
};
