import { FlexPlugin } from "@twilio/flex-plugin";

import { logHoldPress, logUnholdPress, handleOnDisconnectVoiceClient } from "./helpers/logHoldTime";

import holdTimeReducer from "./reducers/holdTimeReducer";

const PLUGIN_NAME = "FlexHoldTimePlugin";

export default class FlexHoldTimePlugin extends FlexPlugin {
  constructor() {
    super(PLUGIN_NAME);
  }

  /**
   * This code is run when your plugin is being started
   * Use this to modify any UI components or attach to the actions framework
   *
   * @param flex { typeof import('@twilio/flex-ui') }
   * @param manager { import('@twilio/flex-ui').Manager }
   */
  async init(flex, manager) {
    flex.Actions.addListener("beforeHoldCall", async (payload) => {
      await logHoldPress(payload, manager.store);
    });

    flex.Actions.addListener("beforeUnholdCall", async (payload) => {
      await logUnholdPress(payload, manager.store);
    });

    flex.Manager.getInstance().voiceClient.on("disconnect", (payload) =>
      handleOnDisconnectVoiceClient(payload, manager.store)
    );

    manager.store.addReducer("holdTimeTracker", holdTimeReducer);
  }
}
