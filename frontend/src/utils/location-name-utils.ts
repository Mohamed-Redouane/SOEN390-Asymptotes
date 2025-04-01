// This function will take the event name and return just the room number
// Example: "SOEN 343 - WW [C080]" will return "C080"
export const getRoomNumber = (eventName: string) => {
  const roomNumber = eventName.split("[")[1]?.split("]")[0]?.trim();
  return roomNumber;
}