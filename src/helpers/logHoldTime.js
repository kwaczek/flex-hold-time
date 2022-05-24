import { holdPressed, unholdPressed } from "../actions/holdActions";

export const logHoldPress = (payload, store) => {
  const reservationSid = payload.sid;
  const state = store.getState();

  store.dispatch(holdPressed(reservationSid));
};

export const logUnholdPress = (payload, store, wrapup) => {
  const reservationSid = payload.sid;
  const state = store.getState();

  if (reservationSid in state.holdTimeTracker.reservations) {
    const holdStartTime = new Date(
      state.holdTimeTracker.reservations[reservationSid].holdStartTime
    );
    const holdEndTime = Date.now();

    const newHoldDuration = (holdEndTime - holdStartTime) / 1000;
    const currentHoldTime = state.holdTimeTracker.reservations[reservationSid]
      .holdTime
      ? state.holdTimeTracker.reservations[reservationSid].holdTime
      : 0;

    const holdTime = newHoldDuration + currentHoldTime;
    store.dispatch(unholdPressed(reservationSid, holdTime, wrapup));
  }
};

export const handleOnDisconnectVoiceClient = (payload, store) => {
  const call_sid = payload.parameters.CallSid;
  let flag = false;
  const reservations = store.getState().flex.worker.tasks;

  for (let [, reservation] of reservations) {
    if (reservation.conference && reservation.conference.participants) {
      for (let i = 0; i < reservation.conference.participants.length; i++) {
        let participantCallSid = reservation.conference.participants[i].callSid;
        if (participantCallSid === call_sid) {
          flag = true;
          break;
        }
      }
      if (flag) {
        wrapupTask(reservation, store);
        break;
      }
    }
  }
};

export const wrapupTask = (reservation, store) => {
  let state = store.getState();
  const reservationSid = reservation.sid;
  let holdTime = 0;

  if (state.holdTimeTracker.reservations[reservationSid]) {
    // calulate hold time if call disconnected during hold
    const disconnectOnHold =
      state.holdTimeTracker.reservations[reservationSid].activeHold;
    const payload = { sid: reservationSid };

    if (disconnectOnHold) {
      logUnholdPress(payload, store, true);
      state = store.getState();
    }

    holdTime =
      state.holdTimeTracker.reservations[reservationSid].holdTime == null
        ? 0
        : state.holdTimeTracker.reservations[reservationSid].holdTime;

    console.log("the calculated hold time is ", holdTime);
  }
};

export const handleOnBeforeCompleteTask = async (payload, store) => {
  console.log("payload after completed:>> ", payload);
  const channel = payload.task.channelType;
  console.log('channel :>> ', channel);

  if (channel === "voice") {
      console.log("inside if");
    let state = store.getState();

    const reservationSid = payload.sid;
    let holdCount = null
    let onholdHangup = null
    let holdTime = 0

    if (state.holdTimeTracker.reservations[reservationSid]) {
    holdCount =
      state.holdTimeTracker.reservations[reservationSid].holdCounter;
    onholdHangup = state.holdTimeTracker.reservations[reservationSid]
      .activeHold
      ? true
      : false;
    holdTime =
      state.holdTimeTracker.reservations[reservationSid].holdTime;
    } 

    let attributes = payload.task.attributes;

    if (typeof attributes.conversations !== "undefined") {
      attributes.conversations.hold_time = holdTime;
      attributes.conversations.conversation_attribute_9 = onholdHangup;
      attributes.conversations.conversation_measure_9 = holdCount;
    } else {
      attributes.conversations = {
        hold_time: holdTime,
        conversation_attribute_9: onholdHangup,
        conversation_measure_9: holdCount,
      };
    }
    const taskUpdate = await payload.task.setAttributes(attributes);
    console.log("Updated task:", taskUpdate);
  }
};
