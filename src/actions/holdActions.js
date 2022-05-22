export const holdPressed = (reservationSid) => ({
  type: "HOLD_PRESSED",
  reservationSid,
});

export const unholdPressed = (reservationSid, holdTime) => ({
  type: "UNHOLD_PRESSED",
  reservationSid,
  holdTime,
});

export const taskWrapping = (reservationSid, handleTime) => ({
  type: "TASK_WRAPPING",
  reservationSid,
  handleTime,
});
