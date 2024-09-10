import { Plugin } from "@qatium/sdk/plugin";

export class MyPlugin implements Plugin {
  limitYear = 1980;
  color = "#FFAC1C";

  init() {
    this.exposeCommands();
  }

  run() {
    const pipes = sdk.network.getPipes((pipe) =>
      pipe.installationDate
        ? pipe.installationDate.getFullYear() < this.limitYear
        : false
    );

    const styles = Object.fromEntries(
      pipes.map((pipe) => [pipe.id, { elementColor: this.color }])
    );

    sdk.map.addStyles(styles);
  }

  exposeCommands() {
    sdk.commands.addCommand(
      {
        name: "highlight-pipes",
        aliases: ["highligh pipes older than", "highlight pipes"],
        description: "Highlight pipes installed older than a certain year",
        arguments: {
          year: "installation year to highlight the pipes",
          color: "color to highlight the pipes converted in HTML color notation"
        },
        returnType: {}
      },
      async (args) => {
        this.limitYear = Number(args.year);
        this.color = args.color;
        this.run();

        sdk.ui.sendMessage({ year: this.limitYear, color: this.color });

        return { data: {}, openPanel: true, turnOnVisuals: true };
      }
    );
  }

  onMessage(message: { year: number; color: string }) {
    this.limitYear = message.year;
    this.color = message.color;
    this.run();
  }
}
