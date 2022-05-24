const holdTimeReducer = (state = { reservations: {} }, action) => {
  switch (action.type) {
    case "HOLD_PRESSED":
      const startTimestamp = Date.now();
      return Object.assign({}, state, {
        reservations: {
          [action.reservationSid]: {
            ...state.reservations[action.reservationSid],
            activeHold: true,
            holdStartTime: startTimestamp,
          },
        },
      });

    case "UNHOLD_PRESSED":
      const holdCounter = state.reservations[action.reservationSid].holdCounter
        ? state.reservations[action.reservationSid].holdCounter + 1
        : 1;
      const activeHold = (action.wrapup) ? true : false
      return Object.assign({}, state, {
        reservations: {
          [action.reservationSid]: {
            ...state.reservations[action.reservationSid],
            activeHold: activeHold,
            holdStartTime: null,
            holdTime: action.holdTime,
            holdCounter: holdCounter
          },
        },
      });
    default:
      return state;
  }
};

export default holdTimeReducer;
