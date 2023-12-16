import { FunctionTreeCategory } from "../types/functionTreeCategory";
import { ChatCompletionMessageParam, ChatCompletionMessageToolCall, ChatCompletionToolMessageParam } from "openai/resources";
type AgentOptions = {
    apiKey?: string;
    functionTree: FunctionTreeCategory;
    options?: FunctionTreeAgentOptions;
};
export type FunctionTreeAgentOptions = {
    verbose?: boolean;
};
type AgentRunOptions = {
    noTools?: boolean;
};
type AgentRunResult = {
    resultText: string;
    newMessage: ChatCompletionMessageParam;
    toolCallResults: ChatCompletionToolMessageParam[];
    finishReason: string;
};
export declare class FunctionTreeAgent {
    private openai;
    private functionTreeRoot;
    verbose: boolean;
    constructor({ apiKey, functionTree, options }: AgentOptions);
    run(messages: ChatCompletionMessageParam[], options?: AgentRunOptions): Promise<AgentRunResult>;
    private next;
    private callTools;
    private getMessagesForAgent;
    getToolCallResultMessage(toolCalls: ChatCompletionMessageToolCall[], results: string[]): string;
}
export {};
