# Extend map visuals

A plugin showcasing how to change base map visuals given a condition. In this case, pipes installed before the date introduced in the panel are shown in orange.

![](../../img/2.png)

## Running the plugin

Start the development server
```bash
python3 -m venv venv
source venv/bin/activate
npm install
npm run dev
```

Open Qatium in developer mode to see your changes, to do so:
- Open the Qatium web app
- Open a network and wait for it to load
- Open your user menu clicking in your avatar, then open the developer mode settings and click the “Activate” toggle

You should see your new plugin in the right side panel.


## Running tests

Tests are written using @qatium/sdk-testing-library. You can run the tests using `npm run test` command. A test example is in the `src/engine/engine.test.ts` file.