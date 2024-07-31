var o = Object.defineProperty;
var a = (s, t, e) => t in s ? o(s, t, { enumerable: !0, configurable: !0, writable: !0, value: e }) : s[t] = e;
var l = (s, t, e) => a(s, typeof t != "symbol" ? t + "" : t, e);
const n = "0.0.29", r = {
  "@qatium/sdk": n
}, c = (s) => {
  _registerPlugin(s, r);
};
class m {
  constructor() {
    l(this, "limitYear", 1980);
    l(this, "color", "#FFAC1C");
  }
  run() {
    const t = sdk.network.getPipes(
      (i) => i.installationDate ? i.installationDate.getFullYear() < this.limitYear : !1
    ), e = Object.fromEntries(
      t.map((i) => [i.id, { elementColor: this.color }])
    );
    sdk.map.addStyles(e);
  }
  onMessage(t) {
    this.limitYear = t.year, this.color = t.color, this.run();
  }
}
c(new m());
