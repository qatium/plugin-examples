# Integrate AI assistant

Works exactly like the number 2 plugin (Extend map visuals), but showcases how to add AI integration to use the plugin from Q assistant.

![](../../img/4.png)

## Running the plugin

#### Required dependencies
```
- Node >= 20
- Python >= 3.7
```

### Notes:
- **macOS/Linux**: Ensure you have Python 3 installed. If you don’t, you can install it via [Homebrew](https://brew.sh) on macOS or your Linux distribution’s package manager.
- **Windows**: Make sure Python is added to your system's PATH during installation. You can check this by running `python --version` in the command prompt.

Follow the steps below to set up the project on different operating systems.

### 1. Set up a virtual environment and install dependencies

#### macOS / Linux
```bash
npm install
python3 -m venv ./venv && source ./venv/bin/activate && pip install -r requirements.txt
```

#### Windows
```shell
npm install
python -m venv .\venv
.\venv\Scripts\activate
pip install -r requirements.txt
```

### 2. Running the Project
After setting up the virtual environment and installing the required packages, you can now run the project:

```bash
npm run dev
```

Open Qatium in developer mode to see your changes, to do so:
- Open the Qatium web app
- Open a network and wait for it to load
- Open your user menu clicking in your avatar, then open the developer mode settings and click the “Activate” toggle

You should see your new plugin in the right side panel.
