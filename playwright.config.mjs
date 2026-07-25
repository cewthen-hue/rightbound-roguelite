import fs from "node:fs";
import { defineConfig } from "@playwright/test";

const matrix = JSON.parse(fs.readFileSync(new URL("./tests/menu-v3-visual-profiles.json", import.meta.url), "utf8"));

export default defineConfig({
  testDir:"./tests/visual",
  testMatch:/menu-v3\.visual\.spec\.mjs/,
  timeout:45_000,
  expect:{ timeout:10_000 },
  fullyParallel:false,
  workers:1,
  retries:process.env.CI ? 1 : 0,
  reporter:[
    ["line"],
    ["html", { outputFolder:"artifacts/menu-v3-visual/html-report", open:"never" }]
  ],
  outputDir:"artifacts/menu-v3-visual/test-results",
  use:{
    baseURL:matrix.baseUrl,
    serviceWorkers:"block",
    reducedMotion:"reduce",
    screenshot:"only-on-failure",
    trace:"retain-on-failure",
    video:"off"
  },
  webServer:{
    command:"python3 -m http.server 4173 --bind 127.0.0.1",
    url:`${matrix.baseUrl}/index.html`,
    reuseExistingServer:!process.env.CI,
    timeout:120_000
  },
  projects:matrix.profiles.map((profile) => ({
    name:profile.id,
    use:{
      viewport:{ width:profile.width, height:profile.height },
      screen:{ width:profile.width, height:profile.height },
      deviceScaleFactor:profile.deviceScaleFactor,
      isMobile:true,
      hasTouch:true,
      userAgent:profile.userAgent
    }
  }))
});
