import { Plugin } from "@qatium/sdk/plugin";

export class MyPlugin implements Plugin {
  limitYear = 1980;
  color = "#FFAC1C";

  run() {
    const pipes = sdk.network.getPipes(
      (pipe) => pipe.installationDate ?
        pipe.installationDate.getFullYear() < this.limitYear :
        false
    )

    const styles = Object.fromEntries(pipes.map((pipe) =>
      [pipe.id,{ elementColor: this.color }])
    )

    sdk.map.addStyles(styles)
  }

  onMessage(message: {year: number; color: string}) {
    this.limitYear = message.year;
    this.color = message.color;
    this.run();
  }
}