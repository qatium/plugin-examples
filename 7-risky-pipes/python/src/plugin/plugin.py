from qatiumsdk import Plugin, sdk
import time
import json
from datetime import datetime

DEFAULT_OLDER_YEARS = 35
DEFAULT_MAX_PRESSURE = 100
N_PIPES_UI = 20

def years_to_millis(years):
    return years * 365 * 24 * 60 * 60 * 1000

def get_width(zoom):
    def lerp(a, b, t):
        return a + t * (b - a)
    
    width_by_zoom = {
        24: 0.05,
        23: 0.05,
        22: 0.5,
        21: 0.5,
        20: 1,
        19: 1,
        18: 1,
        17: 2.5,
        16: 2,
        15: 5,
        14: 10,
        13: 10,
        12: 10,
        11: 10,
        10: 10,
        9: 10,
        8: 10,
        7: 12,
        6: 12,
        5: 12,
        4: 12,
        3: 12,
        2: 12,
        1: 12,
    }
    
    a = width_by_zoom.get(int(zoom), 12)
    b = width_by_zoom.get(int(zoom) + 1, 12)
    t = zoom - int(zoom)
    
    return lerp(a, b, t)

class RiskyPipes(Plugin):

    __older_than_years = DEFAULT_OLDER_YEARS
    __max_pressure = DEFAULT_MAX_PRESSURE
    __is_layer_visible = True
    __pipes_in_risk = []
    
    async def init(self):
        try:
            units = sdk.network.get_units()
            
            pressure_unit = ""
            if hasattr(units, 'parameters'):
                if hasattr(units.parameters, 'pressure'):
                    pressure_unit = units.parameters.pressure
                elif isinstance(units.parameters, dict) and 'pressure' in units.parameters:
                    pressure_unit = units.parameters['pressure']
            
            sdk.ui.send_message({
                "event": "pressure-unit",
                "pressureUnit": pressure_unit
            })
        except Exception as e:
            sdk.ui.send_message({
                "event": "pressure-unit",
                "pressureUnit": ""
            })
    
    async def onMessage(self, message):
        event = getattr(message, "event")
        
        if event == "request-risky-pipes":
            payload = getattr(message, "payload")
            self.__max_pressure = getattr(payload, "maxPressure")
            self.__older_than_years = getattr(payload, "olderThanYears")
            
            self.update_network()
            
        elif event == "fit-to":
            await sdk.map.fit_to([getattr(message, "assetId")], {
                "padding": {"top": 200, "left": 200, "right": 300, "bottom": 200},
                "flightDuration": 900,
                "maxZoom": 21
            })
            
        elif event == "highlight":
         sdk.map.set_highlights([getattr(message, "assetId")])
            
        elif event == "toggle-shutdown-layer":
            self.__is_layer_visible = getattr(message, "isLayerVisible")
            self.update_overlay(self.__pipes_in_risk)
                
            sdk.ui.send_message({
                "event": "update-layer-visibility",
                "isLayerVisible": self.__is_layer_visible
            })
    
    def onNetworkChanged(self):
        self.update_network()
        
    def onZoomChanged(self):
        self.update_overlay(self.__pipes_in_risk)

    def update_overlay(self, pipes):
        if self.__is_layer_visible and len(pipes) > 0:
            pipes_overlay = self.create_path_layer(pipes)
            sdk.map.add_overlay([pipes_overlay])
        else:
            sdk.map.hide_overlay()
    
    def update_network(self):
        pipes = self.get_pipes_in_risk({
            "olderThanYears": self.__older_than_years,
            "maxPressure": self.__max_pressure
        })
            
        self.__pipes_in_risk = pipes
        self.update_panel(pipes)
        self.update_overlay(pipes)
        
    def update_panel(self, pipes):
        pipes_dict = []
        for pipe in pipes:
            pipe_dict = {
                    "id": pipe.get("id"),
                    "maxPressure": pipe.get("maxPressure"),
                    "years": pipe.get("years"),
                    "geometry": pipe.get("geometry")
                }
            pipes_dict.append(pipe_dict)
        
        pipes_str = json.dumps(pipes_dict, default=str)
        pipes_json = json.loads(pipes_str)
        
        sdk.ui.send_message({
            "event": "pipes-in-risk",
            "pipes": pipes_json
        })
    
    def calculate_pipe_max_pressure(self, pipe):
        junctions_connected_to_pipe = [
            asset for asset in sdk.network.get_connected_assets([getattr(pipe, "id")], lambda asset: getattr(asset, "type") == "Junction")
            if getattr(asset, "type") == "Junction"
        ]
        
        max_pressure = float('-inf')
        for junction in junctions_connected_to_pipe:
            simulation = getattr(junction, "simulation", None)
            if simulation and getattr(simulation, "pressure", 0) > max_pressure:
                max_pressure = getattr(simulation, "pressure")
                
        return max_pressure
    
    def get_pipes_in_risk(self, params):
        older_than_years = params.get("olderThanYears")
        max_pressure = params.get("maxPressure")
       
        pipes_in_risk = []
        installation_date_threshold = self.calculate_installation_date_threshold(older_than_years)
        
        for pipe in sdk.network.get_pipes():
            if self.is_pipe_in_risk(pipe, installation_date_threshold, max_pressure):
                pipes_in_risk.append(self.format_pipe_in_risk(pipe))
        
        pipes_in_risk.sort(key=lambda x: (-x["maxPressure"], -int(x["years"]) if x["years"].isdigit() else 0))
        return pipes_in_risk[:N_PIPES_UI]
    
    def calculate_installation_date_threshold(self, years):
        return int(time.time() * 1000) - years_to_millis(years)
    
    def is_pipe_in_risk(self, pipe, installation_date_threshold, max_allowed_pressure):
        installation_date = getattr(pipe, "installationDate", None)
        if installation_date:
            get_time = getattr(installation_date, "getTime", lambda: float('inf'))
            installation_time = get_time()
        else:
            installation_time = float('inf')
            
        is_old = installation_time < installation_date_threshold
        
        max_pressure = self.calculate_pipe_max_pressure(pipe)
        is_pressure_exceeded = max_pressure > max_allowed_pressure
        
        return is_old and is_pressure_exceeded
    
    def format_pipe_in_risk(self, pipe):
        installation_date = getattr(pipe, "installationDate", None)
        if installation_date:
            get_full_year = getattr(installation_date, "getFullYear", lambda: "No date registered for this pipe")
            installation_year = str(get_full_year())
        else:
            installation_year = "No date registered for this pipe"
            
        return {
            "id": getattr(pipe, "id"),
            "maxPressure": self.calculate_pipe_max_pressure(pipe),
            "years": installation_year,
            "geometry": getattr(pipe, "geometry")
        }
    
    def create_path_layer(self, pipes):
        lines_data = []
        for p in pipes:
            color = [178, 87, 2, 128]  # "#B25702"
            lines_data.append({
                "id": str(p["id"]),
                "type": "Feature",
                "geometry": p["geometry"],
                "properties": {"color": color}
            })
        
        camera = sdk.map.get_camera()
        zoom = getattr(camera, "zoom", 10)
        
        return {
            "id": "risky-pipes",
            "data": lines_data,
            "type": "PathLayer",
            "visible": True,
            "getPath": lambda p, *args: getattr(getattr(p, "geometry"), "coordinates"),
            "getColor": lambda p, *args: getattr(getattr(p, "properties"), "color"),
            "getWidth": get_width(zoom)
        }


