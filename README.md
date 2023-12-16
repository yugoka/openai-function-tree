# openai-function-tree
Function Callingでプロンプトを大幅節約だ！😎

## Overview
`openai-function-tree` is a library designed for OpenAI Assistant Tools, specifically for Function Calling. It categorizes tools in a tree structure, enabling recursive searching. This approach helps save token length in tool descriptions and other related texts. Initially created for personal use, it is now available for everyone. Please note, this is a Work in Progress.

## Installation

To install the package, run the following command:

```bash
npm install openai-function-tree
```

## Usage

### Defining a Function Tree Category

Start by defining your `FunctionTreeCategory`. Here's an example:

```typescript
import { FunctionTreeCategory } from "../src/types/functionTreeCategory";

export const exampleFunctionTree: FunctionTreeCategory = {
  type: "category",
  name: "root",
  description: "root",
  modelName: "gpt-4-1106-preview",
  prompt: "Please choose a tool",
  children: [
    {
      type: "category",
      name: "control",
      description: "Operate electronic devices and web services",
      children: [
        {
          type: "category",
          name: "control-iot-device",
          description: "Operate electronic device",
          children: [
            {
              type: "tool",
              tool: {
                // Based on OpenAI assistant tools
                // Include tool descriptions, parameters, etc.
                // See https://platform.openai.com/docs/assistants/tools
              },
              // This args is based on the parameters defined above.
              function: (args) =>
                `First floor air conditioner turned on. deviceName: ${args.device_name}`,
            },
          ],
        },
        // Further nested categories and tools...
      ],
    },
    // Additional categories and tools...
  ],
};

```

### Initializing and Running FunctionTreeAgent

Initialize and run `FunctionTreeAgent` as follows:

```typescript
import { FunctionTreeAgent } from 'openai-function-tree';

const functionTreeAgent = new FunctionTreeAgent({
  apiKey: process.env.OPENAI_API_KEY,
  functionTree: exampleFunctionTree,
  options: { verbose: true }
});

const result = await functionTreeAgent.run([
  {
    role: "user",
    content: "Turn on the air conditioner on the first floor.",
  },
]);

console.log(result); 
```

Additionally, `ResponderTreeAgent` can be used as a wrapper that recursively executes `FunctionTreeAgent` until the user's command is fully accomplished. 
```typescript
import { ResponderAgent } from 'openai-function-tree';

const agent = new ResponderAgent({
  apiKey: process.env.OPENAI_API_KEY,
  functionTree: exampleFunctionTree,
  functionTreeAgentOptions: {
    verbose: true,
  },
  options: {
    maxSteps: 3,
    enableFallbackMessage: true,
  },
});

// Use the agent as needed
const result = await agent.run([
  {
    role: "user",
    content: `Check the temperature in Fujisawa City and set the air conditioner to the same temperature.`,
  },
]);
```

## Contributing

Contributions are welcome! Please feel free to submit pull requests, report issues, or suggest enhancements.

## License

This project is licensed under MIT License, see the LICENSE file for details.
