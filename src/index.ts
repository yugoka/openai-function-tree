import { ResponderAgent } from "./agent/responderAgent";
import { FunctionTreeAgent } from "./agent/functionTreeAgent";

const OpenAIFunctionTreeModule = {
  FunctionTreeAgent: FunctionTreeAgent,
  ResponderAgent: ResponderAgent,
};

export default OpenAIFunctionTreeModule;
