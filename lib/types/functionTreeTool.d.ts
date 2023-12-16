import { ChatCompletionTool } from "openai/resources";
import { FunctionTreeActionExecutable } from "./actionExecutable";
export type FunctionTreeTool = {
    type: "tool";
    tool: ChatCompletionTool;
    function: FunctionTreeActionExecutable;
};
