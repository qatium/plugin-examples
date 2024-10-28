from qatiumsdk import Plugin
from qatiumsdk import sdk

class MyPlugin(Plugin):
    def init(self):
        self.limit_year = 1980
        self.color = "#FFAC1C"

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