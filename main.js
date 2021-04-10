//Form Validation
//performCheck checks to ensure that both fields are filled out prior to execution
function performCheck(ticker, key) {
  if (ticker == "" || key == "") {
    alert("Please fill in both fields!");
    return false;
  } else {
    return true;
  }
}

//Feeds into performCheck to let the function receive data from the fields and to return blank value to validate if it was filled in
function returnVal(formId) {
  if (document.getElementById(formId).value == null) {
    return "";
  } else {
    return document.getElementById(formId).value.toUpperCase();
  }
}

//Makes API call using field data
function returnCallUrl(ticker, key) {
  return (
    "https://www.alphavantage.co/query?function=TIME_SERIES_DAILY&symbol=" +
    ticker +
    "&apikey=" +
    key
  );
}

async function loopData(data) {
  let seriesType = Object.keys(data)[1];
  destroyChildren(tableId);
  let dateArr = [];
  let openArr = [];
  let closeArr = [];
  let volumeArr = [];
  for (item in data[seriesType]) {
    //console.log(data[seriesType][date]);
    //console.log(date);
    let date = new Date(item + "T00:00:00");
    dateArr.push(date /*.formatMMDDYYYY()*/);
    let open = data[seriesType][item]["1. open"];
    openArr.push(parseFloat(open).toFixed(2));
    let close = data[seriesType][item]["4. close"];
    closeArr.push(parseFloat(close).toFixed(2));
    let volume = data[seriesType][item]["5. volume"];
    volumeArr.push(volume);
    appendTrRow(tableId, date, open, close, volume);
  }

  document.getElementById("tableDisplayButton").removeAttribute("hidden");
  return [
    dateArr.reverse(),
    openArr.reverse(),
    closeArr.reverse(),
    volumeArr.reverse(),
  ];
}

function createTableChild(date, open, close, volume) {
  let wrapper = document.createElement("tr");
  wrapper.appendChild(createTableCell(date.formatMMDDYYYY()));
  wrapper.appendChild(
    createTableCell(numberWithCommas(parseFloat(open).toFixed(2)))
  );
  wrapper.appendChild(
    createTableCell(numberWithCommas(parseFloat(close).toFixed(2)))
  );
  wrapper.appendChild(createTableCell(numberWithCommas(volume)));
  return wrapper;
}

function destroyChildren(elemId) {
  document.getElementById(elemId).innerHTML = "";
}

function createTableCell(cellData) {
  let cell = document.createElement("td");
  cell.innerHTML = cellData;
  return cell;
}

function appendTrRow(tableId, date, open, close, volume) {
  document
    .getElementById(tableId)
    .appendChild(createTableChild(date, open, close, volume));
}

function tableToggle() {
  let hiddenTable = document.getElementById("table");
  let toggleButton = document.getElementById("tableDisplayButton");
  if (hiddenTable.hasAttribute("hidden")) {
    hiddenTable.hidden = false;
    toggleButton.className = "btn btn-danger";
    toggleButton.innerHTML = "Hide Table";
    window.scrollTo(0, document.body.scrollHeight);
  } else {
    hiddenTable.hidden = true;
    toggleButton.className = "btn btn-primary";
    toggleButton.innerHTML = "Display Table";
  }
}

const days = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
];

Date.prototype.formatMMDDYYYY = function () {
  return this.getMonth() + 1 + "/" + this.getDate() + "/" + this.getFullYear();
};

function numberWithCommas(x) {
  return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

async function executePull() {
  const response = await fetch(returnCallUrl(returnVal(tickerId), devKey));
  const data = await response.json();
  //Not the best idea but I want to push the appropriate values into arrays from the loopData function, later on I will add in a better higher order array function/method
  let [dateArr, openArr, closeArr, volumeArr] = await loopData(data);
  console.log(data);
  console.log(dateArr);
  console.log(openArr);
  console.log(closeArr);
  console.log(volumeArr);

  chartIt(dateArr, closeArr);
}

function progressBarUpdate(elemId) {
  document.getElementById(tickerId).value = document
    .getElementById(tickerId)
    .value.toUpperCase();
  let hiddenTable = document.getElementById("table");
  let toggleButton = document.getElementById("tableDisplayButton");
  hiddenTable.hidden = true;
  toggleButton.hidden = true;
  toggleButton.className = "btn btn-primary";
  toggleButton.innerHTML = "Display Table";
  let bar = document.getElementById(elemId);
  let container = document.getElementById("progressToggle");
  let width = 25;
  bar.style.width = 100 + "%";
  container.hidden = false;
  bar.innerHTML = "&#128142;&#128080; Polishing diamond hands...";
  let id = setInterval(frame, 110);
  function frame() {
    if (width >= 100) {
      clearInterval(id);
      executePull();
      container.hidden = true;
    } else if (width >= 95) {
      bar.innerHTML = "&#128640;TO THE MOON!";
      width++;
    } else if (width >= 75) {
      bar.innerHTML = "&#128021;Mining Dogecoin...";
      width++;
    } else if (width >= 50) {
      bar.innerHTML = "&#128200;STONKS!!";
      width++;
    } else {
      width++;
    }
  }
}

//CHART STUFF
function chartIt(dates, prices) {
  let datesFormatted = dates.map((date) => date.formatMMDDYYYY());
  let colorSelect;
  let avgArr = prices.map(
    (currentVal, index, array) => array[index + 1] - currentVal
  );
  avgArr.pop(); //Removes not a number for last avg

  avgLossArr = avgArr.filter((item) => Number(item) < 0);
  avgGainArr = avgArr.filter((item) => Number(item) > 0);
  breakArr = avgArr.filter((item) => Number(item) == 0);

  const reducer = (accumulator, currentValue) => accumulator + currentValue;
  avgDaily = avgArr.reduce(reducer) / avgArr.length;
  if (breakArr.length != 0) {
    avgBreak = breakArr.reduce(reducer) / avgArr.length;
  } else {
    avgBreak = 0;
  }
  avgLoss = avgLossArr.reduce(reducer) / avgLossArr.length;
  avgGain = avgGainArr.reduce(reducer) / avgGainArr.length;

  breakPct = `${parseFloat((breakArr.length / avgArr.length) * 100).toFixed(
    2
  )}%`;
  lossPct = `${parseFloat((avgLossArr.length / avgArr.length) * 100).toFixed(
    2
  )}%`;
  gainPct = `${parseFloat((avgGainArr.length / avgArr.length) * 100).toFixed(
    2
  )}%`;
  totalPct = `${parseFloat((avgArr.length / avgArr.length) * 100).toFixed(2)}%`;

  document.getElementById("tickerSymbol").innerHTML = `${returnVal(
    tickerId
  )} - $${numberWithCommas(prices[prices.length - 1])}`;

  if (Number(prices[prices.length - 1]) > Number(prices[0])) {
    colorSelect = "rgba(0, 230, 64, 1)";
  } else {
    colorSelect = "red";
  }
  console.log(colorSelect);

  if (myChart == undefined) {
    let ctx = document.getElementById("lineChart").getContext("2d");
    myChart = new Chart(ctx, {
      type: "line",
      data: {
        labels: datesFormatted,
        datasets: [
          {
            label: "Closing Price",
            data: prices,
            borderColor: colorSelect,
            pointHitRadius: 100,
            pointRadius: 0,
            pointStyle: "line",
            pointRotation: 90,
            hoverRadius: 0,
            borderWidth: 2,
            lineTension: 0.1,
            fill: false,
          },
        ],
      },
      options: {
        interaction: {
          mode: "nearest",
          axis: "y",
        },
        layout: {
          padding: {
            left: 0,
            right: 0,
            top: 0,
            bottom: 0,
          },
        },
        title: {
          display: true,
          text: `Closing prices from ${datesFormatted[0]} - ${
            datesFormatted[datesFormatted.length - 1]
          }`, //Beginning of dates to end of dates
          fontFamily: "Quicksand",
        },
        scales: {
          xAxes: [
            {
              display: false,
              ticks: {
                beginAtZero: false,
              },
            },
          ],
          yAxes: [
            {
              ticks: {
                beginAtZero: false,
              },
            },
          ],
        },
      },
    });
  } else {
    myChart.data.labels = datesFormatted;
    myChart.options.title.text = `Closing prices from ${datesFormatted[0]} - ${
      datesFormatted[datesFormatted.length - 1]
    }`;
    myChart.data.datasets.forEach((dataset) => {
      dataset.data = prices;
      dataset.borderColor = colorSelect;
    });
  }
  myChart.update();
  document.getElementById("lineChart").hidden = false;
  document.getElementById("analysisDiv").hidden = false;
  document.getElementById("analysisTitle").hidden = false;
  document.getElementById("analysisTitle").innerHTML = "Technical Analysis";
  document.getElementById("startPrice").hidden = false;
  document.getElementById("startPrice").innerHTML = `Start: $${numberWithCommas(
    prices[0]
  )}`;
  document.getElementById("closePrice").hidden = false;
  document.getElementById("closePrice").innerHTML = `End:  $${numberWithCommas(
    prices[prices.length - 1]
  )}`;
  document.getElementById("avgPerDay").hidden = false;
  document.getElementById(
    "avgPerDay"
  ).innerHTML = `Average Daily: $${parseFloat(avgDaily).toFixed(2)}`;
  document.getElementById("avgBreak").hidden = false;
  document.getElementById("avgBreak").innerHTML = `Average Break: $${parseFloat(
    avgBreak
  ).toFixed(2)}`;
  document.getElementById("avgLoss").hidden = false;
  document.getElementById("avgLoss").innerHTML = `Average Loss: $${parseFloat(
    avgLoss
  ).toFixed(2)}`;
  document.getElementById("avgGain").hidden = false;
  document.getElementById("avgGain").innerHTML = `Average Gain: $${parseFloat(
    avgGain
  ).toFixed(2)}`;
  document.getElementById("breakPct").hidden = false;
  document.getElementById(
    "breakPct"
  ).innerHTML = `Break Percentage: ${breakPct} Breaks: ${breakArr.length}`;
  document.getElementById("lossPct").hidden = false;
  document.getElementById(
    "lossPct"
  ).innerHTML = `Loss Percentage: ${lossPct} Losses: ${avgLossArr.length}`;
  document.getElementById("gainPct").hidden = false;
  document.getElementById(
    "gainPct"
  ).innerHTML = `Gain Percentage: ${gainPct} Gains: ${avgGainArr.length}`;
  document.getElementById("totalPct").hidden = false;
  document.getElementById(
    "totalPct"
  ).innerHTML = `Total Percentage: ${totalPct} Total: ${avgArr.length}`;
  let percentChange =
    ((prices[prices.length - 1] - prices[0]) / prices[0]) * 100;
  let gainLoss = "Gain";
  if (percentChange < 0) {
    percentChange = percentChange * -1;
    gainLoss = "Loss";
  }
  document.getElementById("percentChange").hidden = false;
  document.getElementById(
    "percentChange"
  ).innerHTML = `${gainLoss}: ${parseFloat(percentChange).toFixed(2)}%`;
}

//ACTUAL EXECUTING SCRIPTS/BEGINNING POINTS
let tickerId = "tickerForm";
let keyId = "keyForm";
let tableId = "outputTable";
let progressId = "progressElement";

//Chart Variable initialized here to modify it post creation
let myChart;

let devMode = false;
let devTicker = "TSLA";
let devKey = "TPTUBB13566K7MHN";

function buttonSubmit() {
  document.getElementById("tickerSymbol").innerHTML = "";
  document.getElementById("lineChart").hidden = true;
  document.getElementById("analysisDiv").hidden = true;
  document.getElementById("analysisTitle").hidden = true;
  document.getElementById("startPrice").hidden = true;
  document.getElementById("closePrice").hidden = true;
  document.getElementById("percentChange").hidden = true;
  document.getElementById("avgPerDay").hidden = true;
  document.getElementById("avgBreak").hidden = true;
  document.getElementById("avgLoss").hidden = true;
  document.getElementById("avgGain").hidden = true;
  document.getElementById("breakPct").hidden = true;
  document.getElementById("lossPct").hidden = true;
  document.getElementById("gainPct").hidden = true;
  document.getElementById("totalPct").hidden = true;
  progressBarUpdate(progressId);
}

window.onload = () => {
  let tickerField = document.getElementById(tickerId);
  let keyField = document.getElementById(keyId);
  if (tickerField) {
    tickerField.addEventListener("keypress", function (e) {
      if (e.key === "Enter") {
        buttonSubmit();
      }
    });
  }
  if (devMode) {
    tickerField.value = devTicker;
  }
};
