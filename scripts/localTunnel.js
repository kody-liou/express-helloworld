const localtunnel = require("localtunnel");
const fs = require("fs");
const path = require("path");
const fetch = require('cross-fetch')
const readline = require("readline").createInterface({
  input: process.stdin,
  output: process.stdout,
});

readline.question(`What's your localhost port?`, async (port) => {
  await startLocalTunnel(parseInt(port));
  readline.close();
});

const startLocalTunnel = async (port) => {
  let tunnel
  try {
    tunnel = await localtunnel({
      port,
      host: "https://localtunnel-server-2q5geq2rcq-de.a.run.app",
    });
    console.log(`external url: ${tunnel.url} already in .vscode/launch.json`);
  } catch(err) {
    console.log(err)
  }

  fs.writeFileSync(
    path.resolve(__dirname, "../.vscode/launch.json"),
    JSON.stringify(launchJson(tunnel.url))
  );

    setInterval(async ()=>{
      const res = await fetch(tunnel.url);
      console.log(res);
    },5000)

  tunnel.on("close", () => {
    console.log("tunnels are closed");
  });
};

const launchJson = (tunnelUrl) => ({
  version: "0.2.0",
  configurations: [
    {
      name: "web",
      program: "lib/main.dart",
      request: "launch",
      deviceId: "chrome",
      type: "dart",
      args: [
        "--web-port",
        "8080",
        "--dart-define",
        "API_BASE_URL=http://localhost:7070",
      ],
    },
    {
      name: "android-emulator",
      program: "lib/main.dart",
      request: "launch",
      deviceId: "emulator-5554",
      type: "dart",
      args: ["--dart-define=API_BASE_URL=http://0.0.0.0:7070"],
    },
    {
      name: "android-device",
      program: "lib/main.dart",
      request: "launch",
      deviceId: "b6213db1",
      type: "dart",
      args: [`--dart-define=API_BASE_URL=${tunnelUrl}`],
    },
  ],
  compounds: [
    {
      name: "All Devices",
      configurations: ["web", "android-emulator", "android-device"],
    },
  ],
});
