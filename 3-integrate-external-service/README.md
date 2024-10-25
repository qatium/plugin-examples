This plugin consumes fake work order data from a stubbed API. It showcases how to access an external service and apply model and map changes given the data received from the external API

In this case, the status of a network operator van is tracked in the map, and accessible through a popover. When a valve becomes closed due to the operator action, it gets closed in the model too

The fake API rotates the response in order every few seconds, from the ones in the `data.json` file

![](../../img/3.png)

After enabling developer mode in Qatium, run with
```
npm build
npm run dev
```

Run the fake API with
```
node api.js
```
