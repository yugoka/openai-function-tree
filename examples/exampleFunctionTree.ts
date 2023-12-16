import { FunctionTreeCategory } from "../src/types/functionTreeCategory";

export const exampleFunctionTree: FunctionTreeCategory = {
  type: "category",
  name: "root",
  description: "root",
  modelName: "gpt-4-1106-preview",
  children: [
    {
      type: "category",
      name: "control",
      description:
        "電子機器やWebサービス(ストリーミングサービス, 外部サービス等)を操作する。物理操作も可能。",
      children: [
        {
          type: "category",
          name: "control-iot-device",
          description: "IoTデバイスを操作する。",
          children: [
            {
              type: "tool",
              tool: {
                type: "function",
                function: {
                  name: "1st-floor-cooler-control",
                  description: "１階のクーラーをオン・オフする",

                  // 仮置き
                  parameters: {
                    type: "object",
                    properties: {
                      device_name: {
                        type: "string",
                        description: "デバイス名",
                      },
                      status: {
                        type: "boolean",
                        description: "オンならtrue, オフならfalse",
                      },
                    },
                    required: ["device_name", "status"],
                  },
                },
              },
              function: (args) =>
                `１階のクーラーをオンにしました: deviceName: ${args.device_name}`,
            },
            {
              type: "tool",
              tool: {
                type: "function",
                function: {
                  name: "1st-floor-cooler-temp-control",
                  description: "１階のクーラーの設定温度を変える",

                  // 仮置き
                  parameters: {
                    type: "object",
                    properties: {
                      temperature: {
                        type: "number",
                        description: "設定温度",
                      },
                      device_name: {
                        type: "string",
                        description: "デバイス名",
                      },
                    },
                  },
                },
              },
              function: (args) =>
                `１階のクーラーの温度を ${args.temperature} に設定しました`,
            },
          ],
        },
        {
          type: "category",
          name: "control-web-service",
          description: "Webサービスを操作する。",
          children: [
            {
              type: "tool",
              tool: {
                type: "function",
                function: {
                  name: "post-slack",
                  description: "Slackのメモチャンネルにメッセージを送信する",

                  // 仮置き
                  parameters: {
                    type: "object",
                    properties: {
                      message: {
                        type: "string",
                        description: "送りたいメッセージ",
                      },
                    },
                  },
                },
              },
              function: (args) => `Slackに ${args.message} と投稿しました`,
            },
          ],
        },
      ],
    },
    {
      type: "category",
      name: "web-information",
      description:
        "Google等で調べ物をしたり、Web上の情報をAPIから収集したりする。",
      children: [
        {
          type: "tool",
          tool: {
            type: "function",
            function: {
              name: "google-search",
              description:
                "Googleで情報を検索する。専用のツールがない場合はこれを利用して下さい。",

              // 仮置き
              parameters: {
                type: "object",
                properties: {
                  search_word: {
                    type: "string",
                    description: "Googleでの検索内容",
                  },
                },
              },
            },
          },
          function: (args) =>
            `${args.search_word} で検索しました。
            神奈川県藤沢市は晴れで、現在の気温は15℃です。
            `,
        },
        {
          type: "tool",
          tool: {
            type: "function",
            function: {
              name: "weather-information",
              description: "天気情報を収集する",

              // 仮置き
              parameters: {
                type: "object",
                properties: {
                  place: {
                    type: "string",
                    description: "場所",
                  },
                },
              },
            },
          },
          function: (args) =>
            `${args.place} で検索しました。
            神奈川県藤沢市は晴れで、現在の気温は15℃です。`,
        },
      ],
    },
    {
      type: "category",
      name: "sensor",
      description:
        "自宅やオフィスのIoTデバイス等から得られるセンサリング情報を取得する。",
      children: [],
    },
    {
      type: "category",
      name: "memory",
      description: "会話から記録を保存したり、過去の記録を読み込んだりする。",
      children: [],
    },
    {
      type: "tool",
      tool: {
        type: "function",
        function: {
          name: "current_datetime",
          description:
            "今の日時や時間を取得する。過去や未来に対応していない点に注意が必要です。",

          // 仮置き
          parameters: {
            type: "object",
            properties: {
              timezone: {
                type: "string",
                description: "タイムゾーン。例: 'Africa/Johannesburg'",
              },
            },
            required: ["timezone"],
          },
        },
      },
      function: (args) => {
        process.env.TZ = args.timezone;
        console.log(args.timezone);
        return new Date().toString();
      },
    },
  ],
};
