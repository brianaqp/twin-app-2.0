function createAHashMap(rawData, category) {
  // [ ] create a good error manager
  let map = {};
  const yAxis = "tonnage";

  for (let item of rawData) {
    let xV = item[category];
    let yV = item[yAxis];

    if (!xV || !yV) {
      continue;
    }

    if (!map[xV]) map[xV] = 0;

    map[xV] += yV;
  }

  return map;
}

function createAMonthHashMap(rawData, category) {
  let map = {};
  const yAxis = "tonnage";
  const months = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ];

  let sortedArr = rawData.sort((a, b) => b.tonnage - a.tonnage);
  console.log(sortedArr);

  for (let item of sortedArr) {
    let xV = item[category];
    let yV = item[yAxis];
    const date = new Date(item["date"]);

    const month = date.toLocaleDateString("en-US", { month: "short" });

    if (!xV || !yV) {
      continue;
    }

    if (!map[xV]) {
      map[xV] = {};
      for (let m of months) {
        map[xV][m] = 0;
      }
    }

    map[xV][month] += yV;
  }

  return map;
}

export { createAHashMap, createAMonthHashMap };
