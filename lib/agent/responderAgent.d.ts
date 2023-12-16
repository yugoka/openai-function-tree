import { ChatCompletionMessageParam } from "openai/resources";
import { FunctionTreeCategory } from "../types/functionTreeCategory";
import { FunctionTreeAgentOptions } from "./functionTreeAgent";
type AgentOptions = {
    apiKey?: string;
    functionTree: FunctionTreeCategory;
    functionTreeAgentOptions?: FunctionTreeAgentOptions;
    options?: ResponderAgentOptions;
};
type ResponderAgentOptions = {
    maxSteps?: number;
    enableFallbackMessage?: boolean;
};
export declare class ResponderAgent {
    private functionTreeAgent;
    private maxSteps;
    private enableFallbackMessage;
    constructor({ apiKey, functionTree, functionTreeAgentOptions, options, }: AgentOptions);
    run(messages: ChatCompletionMessageParam[]): Promise<ChatCompletionMessageParam[]>;
    private next;
    private generateFallbackMessage;
}
export {};
