import { FlexPlugin } from "@twilio/flex-plugin";

import {
  logHoldPress,
  logUnholdPress,
  handleOnDisconnectVoiceClient,
  handleOnBeforeCompleteTask,
} from "./helpers/logHoldTime";

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
    flex.Actions.addListener("beforeHoldCall", (payload) => {
      logHoldPress(payload, manager.store);
    });

    flex.Actions.addListener("beforeUnholdCall", (payload) => {
      logUnholdPress(payload, manager.store, false);
    });

    flex.Manager.getInstance().voiceClient.on("disconnect", (payload) =>
      handleOnDisconnectVoiceClient(payload, manager.store)
    );

    flex.Actions.addListener("beforeCompleteTask", async (payload) =>
      handleOnBeforeCompleteTask(payload, manager.store)
    );

    manager.store.addReducer("holdTimeTracker", holdTimeReducer);
  }
}
