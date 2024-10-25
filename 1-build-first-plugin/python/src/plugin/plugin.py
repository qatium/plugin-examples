from typing import Dict
from datetime import datetime, timedelta
from qatiumsdk import Plugin
from qatiumsdk import sdk
from qatiumsdk import AssetStatus

class MyPlugin(Plugin):
    def init(self):
        self.last_asset_id = ""

    def onNetworkChanged(self):
        if self.last_asset_id == "":
            return

        asset = sdk.network.get_asset(self.last_asset_id)

        if not asset or (asset.type not in ['Pipe', 'Pump']):
            return

        sdk.ui.send_message(asset.simulation.flow)

    def onMessage(self, message):
        asset = sdk.network.get_asset(message.assetId)

        if not asset or (asset.type not in ['Pipe', 'Pump']):
            return

        self.last_asset_id = asset.id

        if message.action == "create-scenario":
            sdk.network.set_status(asset.id, AssetStatus.CLOSED)
        
        sdk.ui.send_message(asset.simulation.flow)
