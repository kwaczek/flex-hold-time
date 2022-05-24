export const holdPressed = (reservationSid) => ({
  type: "HOLD_PRESSED",
  reservationSid,
});

export const unholdPressed = (reservationSid, holdTime, wrapup) => ({
  type: "UNHOLD_PRESSED",
  reservationSid,
  holdTime,
  wrapup,
});
