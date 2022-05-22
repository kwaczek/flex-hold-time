import { holdPressed, unholdPressed } from "../actions/holdActions";

export const logHoldPress = (payload, store) => {
  const reservationSid = payload.sid;
  const state = store.getState();

  store.dispatch(holdPressed(reservationSid));
};

export const logUnholdPress = (payload, store) => {
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
    console.log("dispaching unhold", holdTime);
    store.dispatch(unholdPressed(reservationSid, holdTime));
  }

  console.log("state :>> ", state);
  console.log("reservationSid :>> ", reservationSid);
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
        updateTask(reservation, store);
        break;
      }
    }
  }
};

export const updateTask = (reservation, store) => {
  let state = store.getState();
  const taskSid = reservation.taskSid;
  const reservationSid = reservation.sid;
  let holdTime = 0;

  if (state.holdTimeTracker.reservations[reservationSid]) {
    // calulate hold time if call disconnected during hold
    const disconnectOnHold =
      state.holdTimeTracker.reservations[reservationSid].activeHold;
    const payload = { sid: reservationSid };

    if (disconnectOnHold) {
      console.log("running disconnect on hold");
      logUnholdPress(payload, store);
      state = store.getState();
    }

    holdTime =
      state.holdTimeTracker.reservations[reservationSid].holdTime == null
        ? 0
        : state.holdTimeTracker.reservations[reservationSid].holdTime;

    console.log("the calculated hold time is ", holdTime);

    let attributes = reservation.attributes;
    const onholdHangup = disconnectOnHold ? true : false;
    const holdCount =
      state.holdTimeTracker.reservations[reservationSid].holdCounter;

    if (typeof attributes.conversations !== "undefined") {
      attributes.conversations.hold_time = holdTime;
      attributes.conversations.conversation_attribute_9 = onholdHangup;
      attributes.conversations.conversation_measure_9 = holdCount;
    } else {
      attributes.conversations = {
        hold_time: handleTime,
        conversation_attribute_9: onholdHangup,
        conversation_measure_9: holdCount,
      };
    }
    reservation.setAttributes(attributes);
  }
};
