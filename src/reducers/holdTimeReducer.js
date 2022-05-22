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
      let holdCounter = state.reservations[action.reservationSid].holdCounter
        ? state.reservations[action.reservationSid].holdCounter + 1
        : 1;
      return Object.assign({}, state, {
        reservations: {
          [action.reservationSid]: {
            ...state.reservations[action.reservationSid],
            activeHold: false,
            holdStartTime: null,
            holdTime: action.holdTime,
            holdCounter: holdCounter
          },
        },
      });

    case "TASK_WRAPPING":
      return Object.assign({}, state, {
        reservations: {
          [action.taskSid]: {
            active: false,
            handleTime: action.handleTime,
          },
        },
      });
    default:
      return state;
  }
};

export default holdTimeReducer;
