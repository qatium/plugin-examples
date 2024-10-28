from qatiumsdk import Plugin
from qatiumsdk import sdk

class MyPlugin(Plugin):
    def init(self):
        self.limit_year = 1980
        self.color = "#FFAC1C"
        self.expose_commands()

    def run(self):
        pipes = sdk.network.get_pipes(
            lambda pipe: pipe.installationDate and pipe.installationDate.getFullYear() < self.limit_year
        )

        styles = {pipe.id: {'elementColor': self.color} for pipe in pipes}

        sdk.map.add_styles(styles)

    def onMessage(self, message):
        self.limit_year = message.year
        self.color = message.color
        self.run()

    async def highlight_pipes_command(self, args):
        self.limit_year = float(args.year)
        self.color = args.color;
        self.run();

        sdk.ui.send_message({
            "year": self.limit_year,
            "color": self.color
        })

        return {
            "data": {},
            "openPanel": True,
            "turnOnVisuals": True
        }


    def expose_commands(self):
        command_description = {
            "name": "highlight-pipes",
            "aliases": ["highligh pipes older than", "highlight pipes"],
            "description": "Highlight pipes installed older than a certain year",
            "arguments": {
                "year": "installation year to highlight the pipes",
                "color": "color to highlight the pipes converted in HTML color notation"
            },
            "returnType": {}
        }
        sdk.commands.add_command(command_description, self.highlight_pipes_command)