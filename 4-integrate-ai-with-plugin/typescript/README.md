# Integrate AI assistant

Works exactly like the number 2 plugin (Extend map visuals), but showcases how to add AI integration to use the plugin from Q assistant.

![](../../img/4.png)

## Running the plugin

Start the development server
```bash
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