// Return the first class in an array that is the closest to the current date and time.
export const getNextClass = (eventArr: { start: { dateTime: string }, location: string, summary: string }[]) => {
  // In here we check all the events for today, and based on the current time we find the next class.
  const currentDate = new Date();
  
  console.log("got:", eventArr);
  
  // First we filter only the next upcoming event
  const nextClass = eventArr.find(event => {
    const startTime = new Date(event.start.dateTime);
    return (
      startTime > currentDate &&
      event.location &&
      startTime.getDate() === currentDate.getDate() &&
      startTime.getMonth() === currentDate.getMonth() &&
      startTime.getFullYear() === currentDate.getFullYear()
    );
  });
  if (!nextClass) {
    return null;
  }
  
  return nextClass;
}