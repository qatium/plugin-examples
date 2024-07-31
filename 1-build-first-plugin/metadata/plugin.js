var P = Object.defineProperty;
var a = (e, s, t) => s in e ? P(e, s, { enumerable: !0, configurable: !0, writable: !0, value: t }) : e[s] = t;
var i = (e, s, t) => a(e, typeof s != "symbol" ? s + "" : s, t);
const o = "0.0.29", d = {
  "@qatium/sdk": o
}, u = (e) => {
  _registerPlugin(e, d);
}, n = {
  PIPE: "Pipe",
  JUNCTION: "Junction",
  VALVE: "Valve",
  PUMP: "Pump",
  SUPPLY_SOURCE: "SupplySource",
  TANK: "Tank"
}, r = {
  OPEN: "OPEN",
  ACTIVE: "ACTIVE",
  CLOSED: "CLOSED",
  ON: "OPEN",
  OFF: "CLOSED"
};
class E {
  constructor() {
    i(this, "lastAssetId", "");
  }
  onNetworkChanged() {
    if (this.lastAssetId === "") return;
    const s = sdk.network.getAsset(this.lastAssetId);
    !s || s.type !== n.PIPE && s.type !== n.PUMP || sdk.ui.sendMessage(s.simulation.flow);
  }
  onMessage(s) {
    const t = sdk.network.getAsset(s.assetId);
    !t || t.type !== n.PIPE && t.type !== n.PUMP || (this.lastAssetId = t.id, s.action === "create-scenario" && sdk.network.setStatus(t.id, r.CLOSED), sdk.ui.sendMessage(t.simulation.flow));
  }
}
u(new E());
