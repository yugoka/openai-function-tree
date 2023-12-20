import { ChatCompletionTool } from "openai/resources";
import { FunctionTreeActionExecutable } from "./actionExecutable";

// スキルツリーの末端になるアクション
export type FunctionTreeTool = {
  type: "tool";
  tool: ChatCompletionTool;
  function?: FunctionTreeActionExecutable;
  api?: {
    url: string;
    method:
      | "GET"
      | "HEAD"
      | "POST"
      | "PUT"
      | "DELETE"
      | "CONNECT"
      | "OPTIONS"
      | "TRACE"
      | "PATCH";
  };
};
