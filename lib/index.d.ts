import { ResponderAgent } from "./agent/responderAgent";
import { FunctionTreeAgent } from "./agent/functionTreeAgent";
declare const OpenAIFunctionTreeModule: {
    FunctionTreeAgent: typeof FunctionTreeAgent;
    ResponderAgent: typeof ResponderAgent;
};
export default OpenAIFunctionTreeModule;
