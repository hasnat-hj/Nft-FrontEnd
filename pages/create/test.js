let duration = new Date()
duration=addOneDay(duration)
console.log(duration)
duration = duration.valueOf();
console.log(duration)
let endTime = parseInt(duration);
endTime = endTime + 100000000;


function addOneDay(date) {
    date.setDate(date.getDate() + 1);
    return date;
  };